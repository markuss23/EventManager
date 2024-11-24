from app.src.auth.controllers import get_access_token
from typing import Annotated
from app.src.auth.schemas import Token
from fastapi import APIRouter, Depends
from fastapi.security import OAuth2PasswordRequestForm


router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/token")
def login_for_access_token(data: Annotated[OAuth2PasswordRequestForm, Depends()],
) -> Token:
    return get_access_token(data)
