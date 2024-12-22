from bson import ObjectId
from fastapi import HTTPException
from loguru import logger
from pymongo import MongoClient
from pymongo.results import InsertOneResult
from pymongo.synchronous.collection import Collection
from pymongo.synchronous.cursor import Cursor
from app.src.events.schemas import Event, EventCreate, EventUpdate


def get_events(mongo: MongoClient) -> list[Event]:
    try:
        collection: Collection = mongo["events"]
        events: Cursor = collection.find()
        return [Event(**event) for event in events]
    except Exception as e:
        logger.error(f"Error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error") from e


def get_event(event_id: str, mongo: MongoClient) -> Event:
    """Get event by ID.

    Args:
        event_id (str): Event ID
        mongo (MongoClient): mongo client

    Returns:
        Event: pydantic model for event
    """
    try:
        collection: Collection = mongo["events"]
        event: dict | None = collection.find_one({"_id": event_id})
        if not event:
            raise HTTPException(status_code=404, detail="Event not found")
        return Event(**event)
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error") from e


def create_event(data: EventCreate, mongo: MongoClient) -> Event:
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

        return Event(**collection.find_one({"_id": event.inserted_id}))
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
