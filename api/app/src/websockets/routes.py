import asyncio
import json
import threading
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.databases import mongo_client, redis_client
from app.src.events.schemas import Event

router = APIRouter(prefix="/ws")

mongo_client = mongo_client.get_db()
redis_client = redis_client.get_db()

collection = mongo_client["events"]

# Dictionary to store active websockets by event_id
active_websockets = {}

def event_listener():
    pubsub = redis_client.pubsub()
    # Subscribe to key expiration events in Redis
    pubsub.psubscribe("__keyevent@0__:expired")

    for message in pubsub.listen():
        if message["type"] == "pmessage":
            event_id = message["data"].decode("utf-8")
            print(f"Key {event_id} expired.")
            
            # Notify active websocket clients when the event expires
            if event_id in active_websockets:
                websocket = active_websockets.pop(event_id, None)
                if websocket:
                    try:
                        threading.Thread(target=lambda: asyncio.run(notify_expiration(websocket, event_id))).start()
                    except Exception as e:
                        print(f"Error notifying WebSocket: {e}")

async def notify_expiration(websocket, event_id):
    try:
        message = f"Event {event_id} has expired."
        await websocket.send_text(json.dumps({
            "message": message,
            "event_id": event_id,
            "type": "expiration"
            
        }))
        # await websocket.close()
    except Exception as e:
        print(f"Error sending expiration notification: {e}")

# Start the Redis event listener in a separate thread
thread = threading.Thread(target=event_listener)
thread.start()

@router.websocket("/notification/{event_id}")
async def websocket_endpoint(websocket: WebSocket, event_id: str):
    # Connect WebSocket
    await websocket.accept()

    # Store WebSocket connection for event_id
    active_websockets[event_id] = websocket

    # Fetch event from MongoDB
    query = collection.find_one({"_id": event_id})
    if query:
        event = Event(**query)
    else:
        await websocket.send_text(f"Event {event_id} not found.")
        # await websocket.close()
        return

    # Store event in Redis with a TTL (5 seconds for demonstration)
    redis_client.set(event_id, event.model_dump_json())
    redis_client.expire(event_id, 5)

    try:
        while True:
            data = await websocket.receive_text()
            await websocket.send_text(f"Received: {data}")
    except WebSocketDisconnect:
        print(f"WebSocket for event {event_id} disconnected.")
        active_websockets.pop(event_id, None)
