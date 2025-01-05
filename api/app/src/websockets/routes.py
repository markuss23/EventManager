import asyncio
from collections import defaultdict
from datetime import datetime, timedelta
import json
from typing import Annotated
from app.databases import get_mongo_client, get_redis_client
from bson import ObjectId
from fastapi import APIRouter, Depends, WebSocket, WebSocketDisconnect
from loguru import logger
from pymongo import MongoClient
from redis import Redis

router = APIRouter(prefix="/ws")


async def send_reminder_notification(websocket: WebSocket, reminder_text: str):
    """Sends a reminder notification over the WebSocket."""
    try:
        await websocket.send_text(reminder_text)
    except RuntimeError as e:
        if "WebSocket is not connected" in str(e):
            logger.info("WebSocket disconnected, stopping reminder sending.")
            return False  # Indicate disconnection
        else:
            raise  # Re-raise other RuntimeErrors
    return True


async def monitor_reminders(
    websocket: WebSocket, user_id: str, redis: Redis, mongo: MongoClient
):
    """Monitors reminders for a user and sends notifications via WebSocket."""
    try:
        while True:  # Keep monitoring until WebSocket disconnects
            await websocket.send_text("test")
            events = mongo["events"].find({"attendees": {"$in": [ObjectId(user_id)]}})
            for event in events:
                event_id = str(event["_id"])
                reminders_key = f"event_r:{event_id}:reminders"
                sent_reminders_key = f"event_r:{event_id}:sent_reminders"

                # Get reminders from event data
                event_reminders = event.get("reminders", [])
                # Calculate upcoming reminders based on event start time
                upcoming_reminders = []
                event_start_time = event.get("start_time")
                if event_start_time:
                    for rem in event_reminders:
                        reminder_time = event_start_time - timedelta(
                            minutes=rem["reminder_time"]
                        )
                        if reminder_time.replace(
                            second=0, microsecond=0
                        ) >= datetime.now().replace(second=0, microsecond=0):
                            # Reminder is upcoming and hasn't been sent yet
                            reminder_text: str = json.dumps(
                                {
                                    "event_id": event_id,
                                    "event_title": event["title"],
                                    "reminder_text": rem["reminder_text"],
                                    "type": "reminder",
                                }
                            )
                            upcoming_reminders.append(
                                (
                                    reminder_text.encode("utf-8"),
                                    reminder_time.timestamp(),
                                )
                            )

                # Sort reminders by timestamp (ascending)
                upcoming_reminders.sort(key=lambda x: x[1])

                for reminder, _rem_timestamp in upcoming_reminders:
                    # Check if the reminder has already been sent
                    if redis.zscore(sent_reminders_key, reminder) is None:
                        if await send_reminder_notification(
                            websocket, reminder.decode("utf-8")
                        ):
                            redis.zrem(reminders_key, reminder)  # Remove from reminders
                            redis.zadd(sent_reminders_key, {reminder: _rem_timestamp})
                        else:
                            return  # Exit the loop if WebSocket is disconnected

            await asyncio.sleep(30)
    except Exception as e:
        logger.info(f"Error in reminder monitoring: {e}")
    finally:
        await websocket.close()  # Close connection only once, after loop exits

        logger.info(f"Reminder monitoring stopped for user {user_id}")


@router.websocket("/{user_id}")
async def websocket_endpoint(
    websocket: WebSocket,
    user_id: str,
    redis: Annotated[get_redis_client, Depends()],
    mongo: Annotated[get_mongo_client, Depends()],
) -> None:
    is_closed = False  # Flag to track WebSocket closure

    try:
        if mongo["users"].find_one({"_id": ObjectId(user_id)}) is None:
            await websocket.close(code=1000, reason="User not found")
            is_closed = True
            return

        await websocket.accept()
        logger.info(f"WebSocket connection established for user {user_id}")

        events = mongo["events"].find({"attendees": {"$in": [ObjectId(user_id)]}})
        if not events:
            await websocket.send_text(
                json.dumps({"type": "message", "content": "Nemáte žádné události"})
            )
            await websocket.close()
            is_closed = True
            return

        await monitor_reminders(websocket, user_id, redis, mongo)

        # Keep the connection alive to receive data
        await websocket.receive()

    except Exception as e:
        logger.error(f"WebSocket error: {e}")

    finally:
        if not is_closed:
            logger.info(f"Closing WebSocket connection for user {user_id}")
            await websocket.close()
            is_closed = True


active_connections = defaultdict(
    set
)  # A dictionary to store active WebSocket connections by event_id


@router.websocket("/chat/{event_id}")
async def chat_websocket_endpoint(
    websocket: WebSocket,
    event_id: str,
    mongo: Annotated[get_mongo_client, Depends()],
) -> None:
    """
    WebSocket chat room for events. User details are sent in the first message.
    """
    if (
        not ObjectId.is_valid(event_id)
        or mongo["events"].find_one({"_id": ObjectId(event_id)}) is None
    ):
        await websocket.close(code=1000, reason="Event not found")
        return

    await websocket.accept()
    first_message = await websocket.receive_text()
    first_message = json.loads(first_message)

    user_id = first_message.get("user_id")
    user_name = first_message.get("name")

    if not user_id or not user_name:
        await websocket.close(code=1003, reason="Invalid user details")
        return

    if mongo["users"].find_one({"_id": ObjectId(user_id)}) is None:
        await websocket.close(code=1000, reason="User not found")
        return

    if (
        mongo["events"].find_one(
            {"_id": ObjectId(event_id), "attendees": {"$in": [ObjectId(user_id)]}}
        )
        is None
    ):
        await websocket.close(code=1000, reason="User not in event")
        return

    collection = mongo["chat"]

    # Load and send chat history
    load_history = collection.find({"event_id": event_id}).sort("timestamp", -1)
    load_history = list(load_history)
    for message in load_history:
        message["type"] = "load"
        message["_id"] = str(message["_id"])
        message["timestamp"] = message["timestamp"].isoformat()

    await websocket.send_text(json.dumps(load_history))

    # Add the current WebSocket connection to the active connections
    active_connections[event_id].add(websocket)

    try:
        while True:
            data = await websocket.receive_text()
            data_object = json.loads(data)
            if data_object["type"] == "message":
                message = {
                    "event_id": event_id,
                    "user_id": user_id,
                    "name": user_name,
                    "message": data_object["message"],
                    "timestamp": datetime.utcnow(),
                }
                collection.insert_one(message)
                message["type"] = "message"
                message["_id"] = str(message["_id"])
                message["timestamp"] = message["timestamp"].isoformat()

                # Broadcast the message to all connections for this event_id
                for conn in active_connections[event_id]:
                    await conn.send_text(json.dumps(message))

    except WebSocketDisconnect:
        # Remove the disconnected WebSocket from active connections
        active_connections[event_id].remove(websocket)
        if not active_connections[event_id]:
            del active_connections[event_id]  # Clean up empty event_id entry
