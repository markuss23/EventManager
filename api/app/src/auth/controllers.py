from app.src.auth.schemas import Token
from app.src.auth.utils import generate_jwt_token, verify_password
from app.src.users.schemas import UserCreate
from fastapi import HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from loguru import logger
from pymongo import MongoClient
from pymongo.results import InsertOneResult
from pymongo.synchronous.collection import Collection


def get_access_token(
    data: OAuth2PasswordRequestForm, mongo: MongoClient
) -> dict[str, str] | None:
    try:
        collection: Collection = mongo["users"]
        user = collection.find_one({"username": data.username})
        if not user:
            print("User not found")
            raise HTTPException(status_code=404, detail="User not found")

        if not verify_password(data.password, user["password"]):
            raise HTTPException(status_code=401, detail="Invalid password")

        token: str = generate_jwt_token(
            str(user["_id"]),
            user["email"],
            user["username"],
            user["first_name"],
            user["last_name"],
        )
        return Token(access_token=token, token_type="Bearer")
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error") from e


def register_user(data: UserCreate, mongo: MongoClient) -> dict[str, str] | None:
    """Register a new user.

    Args:
        data (UserCreate):  pydantic model for user creation
        mongo (MongoClient): mongo client
    Returns:
        dict[str, str] | None: JWT token
    """
    try:
        collection: Collection = mongo["users"]
        # Check if user with email already exists
        user = collection.find_one({"email": data.email})
        if user:
            raise HTTPException(
                status_code=400, detail="User with email already exists"
            )
        # If user with email does not exist, insert user into database
        user: InsertOneResult = collection.insert_one(data.model_dump(by_alias=True))
        token: str = generate_jwt_token(
            str(user.inserted_id),
            data.email,
            data.username,
            data.first_name,
            data.last_name,
        )
        return Token(access_token=token, token_type="Bearer")
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error") from e
