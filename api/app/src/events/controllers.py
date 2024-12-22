from datetime import datetime, timedelta
import json
from bson import ObjectId
from fastapi import HTTPException
from loguru import logger
from pymongo import MongoClient
from pymongo.results import InsertOneResult
from pymongo.synchronous.collection import Collection
from pymongo.synchronous.cursor import Cursor
from app.src.events.schemas import Event, EventCreate, EventUpdate
from redis import Redis


def get_events(mongo: MongoClient, redis: Redis) -> list[Event]:
    try:
        event_keys = redis.keys("event:*")
        if event_keys:
            events_data = [json.loads(redis.get(key)) for key in event_keys]
            events_data = [
                {
                    "event_id": str(event.get("event_id")),  # Use .get to avoid KeyError
                    "creator": str(event.get("creator")), # Convert creator to string
                    **event
                }
                for event in events_data
            ]
            return [Event(**event) for event in events_data]

        collection: Collection = mongo["events"]
        events: Cursor = collection.find()
        events_list: list[Event] = [Event(**event) for event in events]

        for event in events_list:
            event_key = f"event:{event.event_id}"
            redis.set(event_key, event.model_dump_json(), ex=3600)

        return events_list
    except Exception as e:
        logger.error(f"Error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error") from e



def get_event(event_id: str, mongo: MongoClient, redis: Redis) -> Event:
    """Get event by ID.

    Args:
        event_id (str): Event ID
        mongo (MongoClient): mongo client

    Returns:
        Event: pydantic model for event
    """
    try:
        # Check if event exists in Redis
        # event_data = redis.get(f"event:{event_id}")
        # if event_data:
        #     res = json.loads(event_data)
        #     res["event_id"] = str(res["event_id"])
        #     return Event(**res)

        collection: Collection = mongo["events"]
        event: dict | None = collection.find_one({"_id": ObjectId(event_id)})
        if not event:
            raise HTTPException(status_code=404, detail="Event not found")
        res = Event(**event)

        # event_key = f"event:{res.event_id}"  # Assuming Event has an id field
        # redis.set(event_key, res.model_dump_json(), ex=3600)  # Cache for 1 hour

        return res
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error") from e


def create_event(data: EventCreate, mongo: MongoClient, redis: Redis) -> Event:
    """Create a new event.

    Args:
        data (EventCreate): data to create event
        mongo (MongoClient): mongo client

    Returns:
        Event: pydantic model for event
    """
    try:
        # Validate creator and attendees
        if not ObjectId.is_valid(data.creator):
            raise HTTPException(status_code=400, detail="Invalid creator ID")

        for attendee in data.attendees:
            if not ObjectId.is_valid(attendee):
                raise HTTPException(status_code=400, detail="Invalid attendee ID")
        # Check if creator and attendees exist
        if mongo["users"].find_one({"_id": ObjectId(data.creator)}) is None:
            raise HTTPException(status_code=404, detail="Creator not found")
        if not all(
            mongo["users"].find_one({"_id": ObjectId(attendee)})
            for attendee in data.attendees
        ):
            raise HTTPException(status_code=404, detail="Attendee not found")
        # Insert event into database
        collection: Collection = mongo["events"]

        if data.creator not in data.attendees:
            data.attendees.append(data.creator)

        if collection.find_one({"title": data.title}):
            raise HTTPException(
                status_code=400, detail="Event with title already exists"
            )

        event: InsertOneResult = collection.insert_one(data.model_dump())

        res = Event(**collection.find_one({"_id": event.inserted_id}))

        for rem in res.reminders:
            reminder_time: datetime = res.start_time - timedelta(
                minutes=rem.reminder_time
            )
            if reminder_time > datetime.now():
                redis.zadd(
                    f"event_r:{res.event_id}:reminders",
                    {res.title: reminder_time.timestamp()},
                )

        return res
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error") from e


def update_event(event_id: str, data: EventUpdate, mongo: MongoClient) -> Event:
    try:
        # Validate creator and attendees
        if not ObjectId.is_valid(data.creator):
            raise HTTPException(status_code=400, detail="Invalid creator ID")

        for attendee in data.attendees:
            if not ObjectId.is_valid(attendee):
                raise HTTPException(status_code=400, detail="Invalid attendee ID")
        # Check if creator and attendees exist
        if mongo["users"].find_one({"_id": ObjectId(data.creator)}) is None:
            raise HTTPException(status_code=404, detail="Creator not found")
        if not all(
            mongo["users"].find_one({"_id": ObjectId(attendee)})
            for attendee in data.attendees
        ):
            raise HTTPException(status_code=404, detail="Attendee not found")
        if data.creator not in data.attendees:
            data.attendees.append(data.creator)

        collection: Collection = mongo["events"]

        # Check if title exists with a different event_id
        existing_event = collection.find_one(
            {"title": data.title, "_id": {"$ne": ObjectId(event_id)}}
        )
        if existing_event:
            raise HTTPException(
                status_code=400, detail="Event with title already exists"
            )
        # Update event
        event: dict | None = collection.find_one_and_update(
            {"_id": ObjectId(event_id)},
            {"$set": data.model_dump()},
            return_document=True,
        )
        if not event:
            raise HTTPException(status_code=404, detail="Event not found")
        return Event(**event)
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error") from e
