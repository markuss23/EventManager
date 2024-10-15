from pydantic import BaseModel
from ..events.schemas import Event
from pydantic import Field
import uuid


class User(BaseModel):
    id: str = Field(default_factory=uuid.uuid4, alias="_id")
    username: str
    first_name: str 
    last_name: str
    email: str
    events: list[Event] = []


class UserCreate(BaseModel):
    username: str
    first_name: str
    last_name: str
    email: str


class UserUpdate(BaseModel):
    username: str | None = None
    email: str | None = None
    events: list[Event] = []

    model_config = {
        "json_schema_extra": {
            "example": {
                "username": "example",
                "email": "asd",
                "events": [
                    {
                        "event_id": "123",
                        "title": "example",
                        "start_time": "2021-09-29T11:00:00",
                        "end_time": "2021-09-29T12:00:00",
                        "attendees": ["asd"],
                    }
                ],
            }
        }
    }

class UserSignin(BaseModel):
    email: str
    password: str