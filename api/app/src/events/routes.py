import json
from bson import ObjectId
from fastapi import APIRouter, HTTPException, Request
from redis import Redis

from app.src.events.schemas import EventCreate, Event, EventOwner
from app.databases import mongo_client, redis_client

router = APIRouter(prefix="/events", tags=["events"])

mongo_client = mongo_client.get_db()
collection = mongo_client["events"]

redis_client: Redis | None = redis_client.get_db()


@router.get("/", response_model=list[Event])
def get_events(request: Request) -> list[Event]:
    cache_key = "events:list_all"

    cached_events = redis_client.get(cache_key)
    if cached_events:
        events = [Event(**event) for event in json.loads(cached_events)]
        return events

    events = list(collection.find())
    redis_client.setex(cache_key, 300, json.dumps(events, default=str))
    return events


@router.post("/", response_model=Event)
def create_event(event: EventCreate) -> Event:
    new_event = {
        "_id": str(ObjectId()),
        "title": event.title,
        "start_time": event.start_time,
        "end_time": event.end_time,
        "description": event.description,
        "owner_id": event.owner_id,
        "attendees": event.attendees,
    }
    collection.insert_one(new_event)

    # Invalidate the cache for all events and the specific user's events
    redis_client.delete("events:list_all")
    redis_client.delete(f"user_events:{event.owner_id}")

    return new_event


@router.get("/{event_id}", response_model=Event)
def get_event(event_id: str) -> Event:
    cache_key = "events:list_all"

    cached_events = redis_client.get(cache_key)
    if cached_events:
        events = json.loads(cached_events)
        for event in events:
            if event["_id"] == event_id:
                return Event(**event)

    events = list(collection.find())
    redis_client.setex(cache_key, 300, json.dumps(events, default=str))

    event = next((event for event in events if event["_id"] == event_id), None)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    return Event(**event)


@router.put("/{event_id}", response_model=Event)
def update_event(event_id: str, event: EventCreate) -> Event:
    existing_event = collection.find_one({"_id": event_id})
    if not existing_event:
        raise HTTPException(status_code=404, detail="Event not found")

    collection.update_one({"_id": event_id}, {"$set": dict(event)})

    # Invalidate the cache for all events and the specific user's events
    redis_client.delete("events:list_all")
    redis_client.delete(f"user_events:{event.owner_id}")

    updated_event = {**dict(event), "_id": event_id}
    return updated_event


@router.get("/user/{user_id}", response_model=list[EventOwner])
def get_user_events(user_id: str) -> list[EventOwner]:
    cache_key = f"user_events:{user_id}"

    cached_user_events = redis_client.get(cache_key)
    if cached_user_events:
        print("Cache hit for user events")
        events = json.loads(cached_user_events)
        return [EventOwner(**event) for event in events]

    pipeline = [
        {"$match": {"owner_id": user_id}},  # Match events for the specific user
        {
            "$lookup": {
                "from": "users",
                "localField": "owner_id",
                "foreignField": "_id",
                "as": "owner",
            }
        },
        {"$unwind": "$owner"},
    ]

    events = list(collection.aggregate(pipeline))
    redis_client.setex(cache_key, 300, json.dumps(events, default=str))

    if not events:
        raise HTTPException(status_code=404, detail="No events found for this user")

    return [EventOwner(**event) for event in events]
