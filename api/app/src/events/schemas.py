from datetime import datetime
from pydantic import BaseModel


class Event(BaseModel):
    event_id: str
    title: str
    start_time: datetime
    end_time: datetime
    attendees: list[str]
    status: int | None = None
