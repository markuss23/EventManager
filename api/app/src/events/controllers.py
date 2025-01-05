from datetime import datetime, timedelta
import json
from app.src.users.schemas import UserCreator
from bson import ObjectId
from fastapi import HTTPException
from loguru import logger
from pymongo import MongoClient
from pymongo.results import InsertOneResult
from pymongo.synchronous.collection import Collection
from pymongo.synchronous.cursor import Cursor
from app.src.events.schemas import Event, EventAttendees, EventCreate, EventUpdate
from redis import Redis


def get_events(
    mongo: MongoClient,
    redis: Redis,
    include_pass_event: bool = False,
    include_upcoming_event: bool = False,
    include_current_event: bool = False,
    attend: list | None = None,
) -> list[Event]:
    try:
        # event_keys = redis.keys("event:*")
        # if event_keys:
        #     events_data = [json.loads(redis.get(key)) for key in event_keys]
        #     events_data = [
        #         {
        #             "event_id": str(event.get("event_id")),  # Use .get to avoid KeyError  # noqa: E501
        #             "creator": str(event.get("creator")), # Convert creator to string
        #             **event
        #         }
        #         for event in events_data
        #     ]
        #     return [Event(**event) for event in events_data]

        collection: Collection = mongo["events"]

        # Initialize the query dictionary
        query = {}

        # Add attendance filter if provided
        if attend and len(attend) > 0:
            query["attendees"] = {"$in": [ObjectId(attendee) for attendee in attend]}

        # Build time-based conditions
        time_conditions = []

        if include_pass_event:
            time_conditions.append({"end_time": {"$lt": datetime.now()}})

        if include_upcoming_event:
            time_conditions.append({"start_time": {"$gt": datetime.now()}})

        if include_current_event:
            time_conditions.append(
                {
                    "$and": [
                        {"start_time": {"$lt": datetime.now()}},
                        {"end_time": {"$gt": datetime.now()}},
                    ]
                }
            )

        # Combine time conditions with OR if multiple conditions exist
        if time_conditions:
            query["$or"] = time_conditions

        # Execute the query
        events: Cursor = collection.find(query)

        events_list: list[Event] = [Event(**event) for event in events]

        # for event in events_list:
        #     event_key = f"event:{event.event_id}"
        #     redis.set(event_key, event.model_dump_json(), ex=3600)

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


def get_event_users(event_id: str, mongo: MongoClient, redis: Redis) -> Event:
    """Get event by ID joined with users.

    Args:
        event_id (str): Event ID
        mongo (MongoClient): mongo client

    Returns:
        Event: pydantic model for event
    """
    try:
        cache_key = f"event:{event_id}"
        cached_event = redis.get(cache_key)

        if cached_event:
            # If cached, parse and return the cached event data
            event_data = json.loads(cached_event)
            attendees = [UserCreator(**att) for att in event_data["attendees"]]
            return EventAttendees(
                event_id=event_data["event_id"],
                title=event_data["title"],
                start_time=event_data["start_time"],
                end_time=event_data["end_time"],
                description=event_data["description"],
                creator=event_data["creator"],
                attendees=attendees,
                reminders=event_data["reminders"],
            )

        collection: Collection = mongo["events"]
        if not ObjectId.is_valid(event_id):
            raise HTTPException(status_code=400, detail="Invalid event ID")
        event: dict | None = collection.find_one({"_id": ObjectId(event_id)})
        if not event:
            raise HTTPException(status_code=404, detail="Event not found")
        pipeline = [
            {"$match": {"_id": ObjectId(event_id)}},
            {
                "$lookup": {
                    "from": "users",
                    "localField": "attendees",
                    "foreignField": "_id",
                    "as": "attendees",
                }
            },
        ]
        collection = list(collection.aggregate(pipeline))
        if not collection:
            raise HTTPException(status_code=404, detail="Event not found")
        attendees: list[UserCreator] = [
            UserCreator(
                **att,
                creator=True
                if ObjectId(att["_id"]) == ObjectId(collection[0]["creator"])
                else False,
            )
            for att in collection[0]["attendees"]
        ]
        res = EventAttendees(
            event_id=collection[0]["_id"],
            title=collection[0]["title"],
            start_time=collection[0]["start_time"],
            end_time=collection[0]["end_time"],
            description=collection[0]["description"],
            creator=collection[0]["creator"],
            attendees=attendees,
            reminders=collection[0]["reminders"],
        )
        redis.set(cache_key, res.model_dump_json(), ex=360)
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

        data.attendees = [ObjectId(attendee) for attendee in data.attendees]
        if collection.find_one({"title": data.title}):
            raise HTTPException(
                status_code=409, detail="Event with title already exists"
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


def update_event(
    event_id: str, data: EventUpdate, mongo: MongoClient, redis: Redis
) -> Event:
    try:
        # Validate creator and attendees
        if not ObjectId.is_valid(data.creator):
            raise HTTPException(status_code=500, detail="Invalid creator ID")
        if data.attendees:
            for attendee in data.attendees:
                if not ObjectId.is_valid(attendee):
                    raise HTTPException(status_code=500, detail="Invalid attendee ID")
        # Check if creator and attendees exist
        if mongo["users"].find_one({"_id": ObjectId(data.creator)}) is None:
            raise HTTPException(status_code=404, detail="Creator not found")
        if not all(
            mongo["users"].find_one({"_id": ObjectId(attendee)})
            for attendee in data.attendees
        ):
            raise HTTPException(status_code=404, detail="Attendee not found")
        if data.creator not in data.attendees:
            data.attendees.append(ObjectId(data.creator))
        data.attendees = [ObjectId(attendee) for attendee in data.attendees]

        collection: Collection = mongo["events"]

        # Check if title exists with a different event_id
        existing_event = collection.find_one(
            {"title": data.title, "_id": {"$ne": ObjectId(event_id)}}
        )
        if existing_event:
            raise HTTPException(
                status_code=409, detail="Event with title already exists"
            )
        # Update event
        event: dict | None = collection.find_one_and_update(
            {"_id": ObjectId(event_id)},
            {"$set": data.model_dump()},
            return_document=True,
        )
        if not event:
            raise HTTPException(status_code=404, detail="Event not found")
        redis.delete(f"event:{event_id}")

        # Add updated reminders to Redis
        for rem in event["reminders"]:
            reminder_time: datetime = event["start_time"] - timedelta(
                minutes=rem["reminder_time"]
            )
            if reminder_time > datetime.now():
                redis.zadd(
                    f"event_r:{event_id}",
                    {event["title"]: reminder_time.timestamp()},
                )
        return Event(**event)
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error") from e


def delete_event(event_id: str, mongo: MongoClient, redis: Redis) -> None:
    try:
        collection: Collection = mongo["events"]
        event: dict | None = collection.find_one({"_id": ObjectId(event_id)})
        if not event:
            raise HTTPException(status_code=404, detail="Event not found")
        collection.delete_one({"_id": ObjectId(event_id)})
        redis.delete(f"event:{event_id}")
        return {"detail": "Event deleted successfully"}
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error") from e
