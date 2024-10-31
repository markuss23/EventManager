from bson import ObjectId
from fastapi import APIRouter, HTTPException, Request

from app.src.events.schemas import EventCreate, Event, EventOwner
from app.databases import mongo_client


router = APIRouter(prefix="/events", tags=["events"])

mongo_client = mongo_client.get_db()
collection = mongo_client["events"]


@router.get("/", response_model=list[Event])
def get_events(request: Request) -> list[Event]:
    events = collection.find()
    return list(events)


@router.post("/", response_model=Event)
def create_event(
    request: Request,
    event: EventCreate,
) -> Event:
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
    return new_event


@router.get("/{event_id}", response_model=Event)
def get_event(event_id: str, request: Request) -> Event:
    event = collection.find_one({"_id": event_id})
    if event:
        return event
    raise HTTPException(status_code=404, detail="Event not found")


@router.put("/{event_id}", response_model=Event)
def update_event(event_id: str, event: EventCreate, request: Request) -> Event:
    existing_event = collection.find_one({"_id": event_id})
    if existing_event:
        collection.update_one({"_id": event_id}, {"$set": dict(event)})
        return event
    raise HTTPException(status_code=404, detail="Event not found")


@router.get("/user/{user_id}", response_model=list[EventOwner])
def get_user_events(user_id: str, request: Request) -> list[EventOwner]:
    pipeline = [
        {
            "$lookup": {
                "from": "users",  # Kolekce "users"
                "localField": "owner_id",  # Pole z kolekce "events"
                "foreignField": "_id",  # Pole z kolekce "users"
                "as": "owner",  # Výstupní pole
            }
        },
        {
            "$unwind": "$owner"  # Rozbalí pole "owner" pro jednotlivé události
        },
    ]

    events = list(collection.aggregate(pipeline))

    events: list[EventOwner] = [
        EventOwner(**event) for event in events if event["owner"]["_id"] == user_id
    ]
    if not events:
        raise HTTPException(status_code=404, detail="No events found for this user")

    return events