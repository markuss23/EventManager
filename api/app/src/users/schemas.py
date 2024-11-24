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

class UserCreate(BaseModel):
    username: str
    first_name: str
    last_name: str
    email: str
    password: str | bytes

    @field_validator("password")
    @classmethod
    def validate_password(cls, value) -> bytes:
        print(type(value))
        return hash_password(value)
             
    


class UserUpdate(BaseModel):
    username: str | None = None
    email: str | None = None
    first_name: str | None = None
    last_name: str | None = None

class UserSignin(BaseModel):
    email: str
    password: str