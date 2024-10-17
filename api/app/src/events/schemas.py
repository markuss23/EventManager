from datetime import datetime
import uuid
from pydantic import BaseModel, Field


class Event(BaseModel):
    event_id: str =  Field(default_factory=uuid.uuid4, alias="_id")
    title: str
    start_time: datetime
    end_time: datetime
    description: str
    owner_id: str 
    attendees: list[str] = []
    
class EventCreate(BaseModel):
    title: str
    start_time: datetime
    end_time: datetime
    description: str
    owner_id: str
    attendees: list[str] = []


class EventUpdate(BaseModel):
    title: str | None = None
    start_time: datetime | None = None
    end_time: datetime | None = None
    description: str | None = None
    owner_id: str | None = None
    attendees: list[str] | None = None