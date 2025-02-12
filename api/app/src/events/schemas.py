from datetime import datetime
import uuid
from app.src.users.schemas import User, UserCreator
from pydantic import BaseModel, Field, field_validator


class Reminder(BaseModel):
    reminder_time: int
    reminder_text: str


class Event(BaseModel):
    event_id: str = Field(default_factory=uuid.uuid4, alias="_id")
    title: str
    start_time: datetime
    end_time: datetime
    description: str
    creator: str = Field(default_factory=uuid.uuid4)
    attendees: list = []
    reminders: list[Reminder] = []

    @field_validator("event_id", mode="before")
    @classmethod
    def transform_id(cls, value) -> str:
        if not isinstance(value, str):
            return str(value)
        return value

    @field_validator("attendees", mode="before")
    @classmethod
    def transform_attendees(cls, value) -> str:
        if len(value) > 0:
            return [str(attendee) for attendee in value]
        return value

    @field_validator("creator", mode="before")
    @classmethod
    def transform_creator(cls, value) -> str:
        if not isinstance(value, str):
            return str(value)
        return value


class EventAttendees(Event):
    attendees: list[UserCreator]
    
    @field_validator("attendees", mode="before")
    @classmethod
    def transform_attendees(cls, value) -> str:
        return value


class EventOwner(Event):
    owner: User


class EventCreate(BaseModel):
    title: str
    start_time: datetime
    end_time: datetime
    description: str
    creator: str
    attendees: list[str] = []
    reminders: list[Reminder] = [
        Reminder(reminder_time=15, reminder_text="15 minutes before"),
    ]  # Připomenutí v minutách před začátkem


class EventUpdate(EventCreate): ...
