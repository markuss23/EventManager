from typing import Any
from collections.abc import Generator
from pymongo import MongoClient
from redis import Redis
from app.config import settings
from pymongo.synchronous.database import Database


def get_mongo_client() -> Generator[MongoClient, Any, None]:
    try:
        db: Database = MongoClient(settings.mongo.url())["app"]
        yield db
    finally:
        db.client.close()


def get_redis() -> Generator[Redis, Any, None]:
    redis = Redis(
        host=settings.redis.host,
        port=settings.redis.port,
        db=settings.redis.db,
        decode_responses=True,
    )

    try:
        if redis.ping():
            yield redis
    finally:
        redis.close()
