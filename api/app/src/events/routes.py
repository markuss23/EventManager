from typing import Annotated
from app.annotations import (
    ATTEND_ANNOTATION,
    ID_PATH_ANNOTATION,
    INCLUDE_PASS_EVENT_ANNOTATION,
)
from app.databases import get_mongo_client, get_redis_client
from app.src.events.controllers import (
    create_event,
    delete_event,
    get_event,
    get_event_users,
    get_events,
    update_event,
)
from fastapi import APIRouter, Depends
from app.src.events.schemas import Event, EventAttendees, EventCreate


router = APIRouter(prefix="/events", tags=["events"])


@router.get("/", response_model=list[Event], summary="Get all events")
def endp_get_events(
    mongo: Annotated[get_mongo_client, Depends()],
    redis: Annotated[get_redis_client, Depends()],
    attend: ATTEND_ANNOTATION = None,
    include_pass_event: INCLUDE_PASS_EVENT_ANNOTATION = False,
    include_upcoming_event: INCLUDE_PASS_EVENT_ANNOTATION = False,
    include_current_event: INCLUDE_PASS_EVENT_ANNOTATION = False,
) -> list[Event]:
    return get_events(
        mongo=mongo,
        redis=redis,
        attend=attend,
        include_pass_event=include_pass_event,
        include_upcoming_event=include_upcoming_event,
        include_current_event=include_current_event,
    )


@router.get("/{event_id}", response_model=Event, summary="Get event by ID")
def endp_get_event(
    event_id: ID_PATH_ANNOTATION,
    mongo: Annotated[get_mongo_client, Depends()],
    redis: Annotated[get_redis_client, Depends()],
) -> Event:
    return get_event(event_id=event_id, mongo=mongo, redis=redis)


@router.get(
    "/{event_id}/users",
    response_model=EventAttendees,
    summary="Get event by ID joined with users",
)
def endp_get_event_users(
    event_id: ID_PATH_ANNOTATION,
    mongo: Annotated[get_mongo_client, Depends()],
    redis: Annotated[get_redis_client, Depends()],
) -> EventAttendees:
    return get_event_users(event_id=event_id, mongo=mongo, redis=redis)


@router.post("/", response_model=Event, summary="Create a new event")
def endp_create_event(
    data: EventCreate,
    mongo: Annotated[get_mongo_client, Depends()],
    redis: Annotated[get_redis_client, Depends()],
) -> Event:
    return create_event(data=data, mongo=mongo, redis=redis)


@router.put("/{event_id}", response_model=Event, summary="Update event by ID")
def endp_update_event(
    event_id: ID_PATH_ANNOTATION,
    data: EventCreate,
    mongo: Annotated[get_mongo_client, Depends()],
    redis: Annotated[get_redis_client, Depends()],
) -> Event:
    return update_event(data=data, mongo=mongo, event_id=event_id, redis=redis)


@router.delete("/{event_id}", summary="delete event by ID")
def endp_delete_event(
    event_id: ID_PATH_ANNOTATION,
    mongo: Annotated[get_mongo_client, Depends()],
    redis: Annotated[get_redis_client, Depends()],
):
    return delete_event(mongo=mongo, event_id=event_id, redis=redis)
