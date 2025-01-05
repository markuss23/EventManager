from app.src.users.schemas import User, UserUpdate
from bson import ObjectId
from fastapi import HTTPException
from loguru import logger
from pymongo import MongoClient
from pymongo.synchronous.collection import Collection


def get_users(mongo: MongoClient) -> list[User]:
    """Get all users.

    Args:
        mongo (MongoClient): mongo client

    Returns:
        list[User]: Pydantic model for users
    """
    try:
        collection: Collection = mongo["users"]
        users: list[dict] = list(collection.find())
        return [User(**user) for user in users]
    except Exception as e:
        logger.error(f"Error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error") from e


def get_user(user_id: str, mongo: MongoClient) -> User:
    """Get user by ID.

    Args:
        user_id (str):  User ID
        mongo (MongoClient): mongo client

    Returns:
        User: Pydantic model for user
    """
    try:
        collection: Collection = mongo["users"]
        user: dict | None = collection.find_one({"_id": ObjectId(user_id)})
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        return User(**user)
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error") from e


def update_user(user_id: str, data: UserUpdate, mongo: MongoClient) -> dict | None:
    """Update user by ID.

    Args:
        user_id (str):  User ID
        data (UserUpdate):  Data to update
        mongo (MongoClient): mongo client

    Returns:
        dict | None: Updated user
    """
    try:
        collection: Collection = mongo["users"]
        user: dict | None = collection.find_one_and_update(
            {"_id": ObjectId(user_id)},
            {"$set": data.model_dump()},
            return_document=True,
        )
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        return user
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error") from e
