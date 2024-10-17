from pydantic import BaseModel
from pydantic import Field
import uuid


class User(BaseModel):
    id: str = Field(default_factory=uuid.uuid4, alias="_id")
    username: str
    first_name: str 
    last_name: str
    email: str


class UserCreate(BaseModel):
    username: str
    first_name: str
    last_name: str
    email: str


class UserUpdate(BaseModel):
    username: str | None = None
    email: str | None = None
    first_name: str | None = None
    last_name: str | None = None

class UserSignin(BaseModel):
    email: str
    password: str