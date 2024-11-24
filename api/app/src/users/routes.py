from app.src.auth.utils import generate_jwt_token
from fastapi import APIRouter, HTTPException
from bson import ObjectId
from fastapi.requests import Request

# from app.databases import mongo_client
from app.src.users.schemas import User, UserCreate, UserSignin, UserUpdate
from app.databases import mongo_client

router = APIRouter(prefix="/users", tags=["users"])

# TOOD: add redis for notifications

mongo_client = mongo_client.get_db()
collection = mongo_client["users"]


@router.get("/", response_model=list[User])
def get_users(request: Request) -> list[User]:
    users = mongo_client["users"].find()
    return list(users)


@router.post("/", response_model=User)
def create_user(
    user: UserCreate,
) -> User:
    existing_user = collection.find_one({"email": user.email})
    if existing_user:
        raise HTTPException(
            status_code=400, detail="User with this email already exists"
        )

    new_user = {
        "_id": str(ObjectId()),
        "username": user.username,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "email": user.email,
        "password": user.password,
        "events": [],
    }

    collection.insert_one(new_user)
    return new_user


@router.get("/{user_id}", response_model=User)
def get_user(user_id: str) -> User:
    user = collection.find_one({"_id": user_id})
    if user:
        return user
    raise HTTPException(status_code=404, detail="User not found")


@router.put("/{user_id}", response_model=User)
def update_user(
    user_id: str,
    user: UserUpdate,
) -> User:
    existing_user = collection.find_one({"_id": user_id})
    if existing_user:
        collection.update_one(
            {"_id": user_id}, {"$set": user.model_dump(exclude_unset=True)}
        )
        return user
    raise HTTPException(status_code=404, detail="User not found")
