from app.databases import get_mongo_client
from app.src.auth.controllers import get_access_token, register_user
from typing import Annotated
from app.src.auth.schemas import Token
from app.src.users.schemas import UserCreate
from fastapi import APIRouter, Depends
from fastapi.security import OAuth2PasswordRequestForm


router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login", response_model=Token, summary="Login for access token")
def login_for_access_token(
    data: Annotated[OAuth2PasswordRequestForm, Depends()],
    mongo: Annotated[get_mongo_client, Depends()],
) -> Token:
    return get_access_token(data=data, mongo=mongo)


@router.post("/register", response_model=Token, summary="Register a new user")
def endp_register_user(
    data: UserCreate,
    mongo: Annotated[get_mongo_client, Depends()],
) -> Token:
    return register_user(data=data, mongo=mongo)