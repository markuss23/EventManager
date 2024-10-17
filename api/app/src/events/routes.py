from bson import ObjectId
from fastapi import APIRouter, HTTPException, Request

from app.src.events.schemas import EventCreate, Event


router = APIRouter(prefix="/events", tags=["events"])

@router.get("/", response_model=list[Event])
def get_events(request:Request) -> list[Event]:
    events = request.app.database["events"].find()
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
    request.app.database["events"].insert_one(new_event)
    return new_event


@router.get("/{event_id}", response_model=Event)
def get_event(event_id: str, request: Request) -> Event:
    event = request.app.database["events"].find_one({"_id": event_id})
    if event:
        return event
    raise HTTPException(status_code=404, detail="Event not found")


@router.put("/{event_id}", response_model=Event)
def update_event(event_id: str, event: EventCreate, request: Request) -> Event:
    existing_event = request.app.database["events"].find_one({"_id": event_id})
    if existing_event:
        request.app.database["events"].update_one(
            {"_id": event_id}, {"$set": dict(event)}
        )
        return event
    raise HTTPException(status_code=404, detail="Event not found")


@router.get("/user/{user_id}", response_model=list[Event])
def get_user_events(user_id: str, request: Request) -> list[Event]:
    events = request.app.database["events"].find({"owner_id": user_id})
    return list(events)