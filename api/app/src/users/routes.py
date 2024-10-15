from fastapi import APIRouter, HTTPException
from bson import ObjectId
from fastapi.requests import Request

# from app.databases import mongo_client
from app.src.users.schemas import User, UserCreate, UserSignin, UserUpdate

router = APIRouter(prefix="/users", tags=["users"])

#TOOD: add redis for notifications

@router.get("/", response_model=list[User])
def get_users(request: Request) -> list[User]:
    users = request.app.database["users"].find()
    return list(users)


@router.post("/", response_model=User)
def create_user(
    request: Request,
    user: UserCreate,
) -> User:
    existing_user = request.app.database["users"].find_one({"email": user.email})
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
        "events": [],
        
    }

    request.app.database["users"].insert_one(new_user)
    return new_user


@router.post("/signin", response_model=User)
def signin_user(
    request: Request,
    user: UserSignin,
) -> User:
    existing_user = request.app.database["users"].find_one({"email": user.email})
    if existing_user:
        return existing_user
    raise HTTPException(status_code=404, detail="User not found")


@router.get("/{user_id}", response_model=User)
def get_user(user_id: str, request: Request) -> User:
    user = request.app.database["users"].find_one({"_id": user_id})
    if user:
        return user
    raise HTTPException(status_code=404, detail="User not found")


@router.put("/{user_id}", response_model=User)
def update_user(user_id: str, user: UserUpdate, request: Request) -> User:
    existing_user = request.app.database["users"].find_one({"_id": user_id})
    if existing_user:
        request.app.database["users"].update_one(
            {"_id": user_id}, {"$set": user.model_dump(exclude_unset=True)}
        )
        return user
    raise HTTPException(status_code=404, detail="User not found")
