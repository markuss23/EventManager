from app.src.auth.utils import hash_password
from pydantic import BaseModel, field_validator
from pydantic import Field
import uuid


class User(BaseModel):
    id: str = Field(default_factory=uuid.uuid4, alias="_id")
    username: str
    first_name: str
    last_name: str
    email: str

    @field_validator("id", mode="before")
    @classmethod
    def transform_id(cls, value) -> str:
        if not isinstance(value, str):
            return str(value)
        return value


class UserCreator(User):
    id: str
    creator: bool = False
    
    @field_validator("id", mode="before")
    @classmethod
    def transform_id(cls, value) -> str:
        if not isinstance(value, str):
            return str(value)
        return value


class UserCreate(BaseModel):
    username: str
    first_name: str
    last_name: str
    email: str
    password: str | bytes

    @field_validator("password")
    @classmethod
    def validate_password(cls, value) -> bytes:
        return hash_password(value)


class UserUpdate(BaseModel):
    username: str
    email: str
    first_name: str
    last_name: str


class UserSignin(BaseModel):
    email: str
    password: str
