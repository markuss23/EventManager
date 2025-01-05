from typing import Annotated
from app.annotations import ID_PATH_ANNOTATION
from app.databases import get_mongo_client, get_redis_client
from app.src.users.controllers import get_user, get_users, update_user
from app.src.users.schemas import User, UserUpdate
from fastapi import APIRouter, Depends

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/", response_model=list[User], summary="Get all users")
def endp_get_users(mongo: Annotated[get_mongo_client, Depends()]) -> list[User]:
    return list(get_users(mongo=mongo))


@router.get("/{user_id}", response_model=User, summary="Get user by ID")
def endp_get_user(
    user_id: ID_PATH_ANNOTATION,
    mongo: Annotated[get_mongo_client, Depends()],
    redis: Annotated[get_redis_client, Depends()],
) -> User:
    return get_user(user_id=user_id, mongo=mongo, redis=redis)


@router.put("/{user_id}", response_model=User, summary="Update user by ID")
def endp_update_user(
    user_id: ID_PATH_ANNOTATION,
    data: UserUpdate,
    mongo: Annotated[get_mongo_client, Depends()],
) -> User:
    return update_user(user_id=user_id, data=data, mongo=mongo)
