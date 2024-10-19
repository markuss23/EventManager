from pymongo import MongoClient
from redis import Redis
from app.config import settings
class MongoDB:
    
    @staticmethod
    def get_db():
        try:
            client = MongoClient(settings.mongo.url())
            db = client[settings.mongo.db]
            return db

        except Exception as e:
            print(e)
            
        # finally:
        #     client.close()

class RedisDB:
    
    @staticmethod
    def get_db():
        try:
            client = Redis(host=settings.redis.host, port=settings.redis.port, db=settings.redis.db)
            return client

        except Exception as e:
            print(e)
            
mongo_client = MongoDB()
redis_client = RedisDB()
