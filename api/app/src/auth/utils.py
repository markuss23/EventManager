import bcrypt
from fastapi import HTTPException
import jwt
import datetime

from loguru import logger

from app.config import settings


def generate_jwt_token(
    user_id,
    username,
    email,
    first_name,
    last_name,
    algorithm="HS256",
    expiration_minutes=30,
) -> str:
    """Generate a JWT token.

    Args:
        user_id (_type_): user id
        username (_type_):  username
        email (_type_): email
        first_name (_type_): fisrt_name
        last_name (_type_): last_name
        algorithm (str, optional):algorithm . Defaults to "HS256".
        expiration_minutes (int): token expiration . Defaults to 30.

    Returns:
        str: JWT token
    """
    payload = {
        "user_id": user_id,
        "email": email,
        "username": username,
        "first_name": first_name,
        "last_name": last_name,
        "exp": datetime.datetime.now() + datetime.timedelta(minutes=expiration_minutes),
    }
    token = jwt.encode(payload, settings.app.secret_key, algorithm=algorithm)
    return token


def verify_jwt_token(token, algorithm="HS256"):
    """
    Verify the JWT token.

    :param token: The token to verify.
    :param secret_key: The secret key to decode the token.
    :param algorithm: The algorithm to use for decoding the token. Default is HS256.
    :return: The decoded token payload.
    """
    try:
        return jwt.decode(token, settings.app.secret_key, algorithms=[algorithm])
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None
    except Exception as e:
        logger.error(f"auth/utils/verify_jwt_token | {e}")
        return None


def hash_password(password):
    """
    Hash the password using bcrypt.

    :param password: The password to hash.
    :return: The hashed password.
    """
    try:
        return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt())
    except Exception as e:
        logger.error(f"auth/utils/hash_password | {e}")
        raise HTTPException(status_code=500, detail="Internal server error") from e


def verify_password(password, hashed_password):
    """
    Verify the password against the hashed password.

    :param password: The password to verify.
    :param hashed_password: The hashed password to verify against.
    :return: True if the password is verified, False otherwise.
    """
    try:
        return bcrypt.checkpw(password.encode("utf-8"), hashed_password)
    except Exception as e:
        logger.error(f"auth/utils/verify_password | {e}")
        raise HTTPException(status_code=500, detail="Internal server error") from e
