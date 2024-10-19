from datetime import timedelta, datetime
import threading
from fastapi import APIRouter, WebSocketException, WebSocket
from app.databases import mongo_client
from app.src.events.schemas import Event
from app.src.websockets.utils import event_listener
from app.databases import redis_client

router = APIRouter(prefix="/ws")

mongo_client = mongo_client.get_db()
redis_client = redis_client.get_db()

collection = mongo_client["events"]
thread = threading.Thread(target=event_listener)
thread.start()


@router.websocket("/notification/{event_id}")
async def websocket_endpoint(websocket: WebSocket, event_id: str):
    query = collection.find_one({"_id": event_id})
    if query:
        event = Event(**query)
    
    # #hmset by key
    redis_client.set(event_id, event.model_dump_json())
    # # notify_time = (datetime.now() - timedelta(minutes=1))
    # # ttl = (notify_time - datetime.now()).total_seconds()
    
    redis_client.expire(event_id, 10)
    
    

    await websocket.accept()
    while True:
        # if not query:
        #     raise WebSocketException(code=404, reason="Event not found")
        # if not redis_client.get(event_id):
        #     raise WebSocketException(code=404, reason="Event not found")
        await websocket.send_text(f"Connection established for event {event.title}")
        data = await websocket.receive_text()
        await websocket.send_text(f"Zpráva: {data}")