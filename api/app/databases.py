from pymongo import MongoClient
from app.config import settings

class MongoDB:
    
    @staticmethod
    def get_db():
        try:
            client = MongoClient(settings.mongo)
            db = client["event_planner"]
            yield db

        except Exception as e:
            print(e)

        finally:
            client.close()
            
mongo_client = MongoDB()