
from app.src.auth.schemas import Token
from app.src.auth.utils import generate_jwt_token, verify_jwt_token, verify_password
from fastapi import HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from loguru import logger

from app.databases import mongo_client


mongo_client = mongo_client.get_db()
collection = mongo_client["users"]


def get_access_token(data: OAuth2PasswordRequestForm) -> dict[str, str] | None:
    try:
        user = collection.find_one({"username": data.username})
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        if not verify_password(data.password, user["password"]):
            raise HTTPException(status_code=400, detail="Invalid password")

        token: str = generate_jwt_token(
            user["_id"],
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

    