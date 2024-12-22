import asyncio
from datetime import datetime, timedelta
import json
from typing import Annotated, LiteralString
from app.databases import get_mongo_client, get_redis_client
from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, WebSocket, WebSocketDisconnect
from loguru import logger
from pymongo import MongoClient
from pymongo.synchronous.collection import Collection
from redis import Redis


router = APIRouter(prefix="/ws")


async def send_reminder_notification(websocket: WebSocket, reminder_text: str):
    """Sends a reminder notification over the WebSocket."""
    try:
        await websocket.send_text(
            reminder_text
        )
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
            events = mongo["events"].find({"attendees": {"$in": [user_id]}})
            for event in events:
                event_id = str(event["_id"])
                reminders_key = f"event:{event_id}:reminders"
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
                        ) == datetime.now().replace(second=0, microsecond=0):
                            # Reminder is upcoming and hasn't been sent yet
                            reminder_text: str = (
                                json.dumps(
                                    {
                                        "event_id": event_id,
                                        "reminder_text": rem["reminder_text"],
                                        "type": "reminder",
                                    }
                                )
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
                    if await send_reminder_notification(
                        websocket, reminder.decode("utf-8")
                    ):
                        redis.zrem(reminders_key, reminder)  # Remove after sending
                    else:
                        return  # Exit the loop if WebSocket is disconnected

            await asyncio.sleep(60) 
    except Exception as e:
        logger.info(f"Error in reminder monitoring: {e}")
    finally:
        logger.info(f"Reminder monitoring stopped for user {user_id}")


@router.websocket("/{user_id}")
async def websocket_endpoint(
    websocket: WebSocket,
    user_id: str,
    redis: Annotated[get_redis_client, Depends()],
    mongo: Annotated[get_mongo_client, Depends()],
) -> None:
    try:
        if mongo["users"].find_one({"_id": ObjectId(user_id)}) is None:
            await websocket.close(
                code=1000, reason="User not found"
            )  # Close with proper code
            return

        await websocket.accept()
        logger.info(f"WebSocket connection established for user {user_id}")
        events = (
            mongo["events"].find({"attendees": {"$in": [user_id]}}).to_list(length=None)
        )
        if not events:
            await websocket.send_text(
                json.dumps({"type": "message", "content": "Nemáte žádné události"})
            )
            await websocket.close()
            return

        await monitor_reminders(websocket, user_id, redis, mongo)  # Start monitoring
        await websocket.receive()  # Keep connection alive

    except Exception as e:
        logger.error(f"WebSocket error: {e}")

    finally:
        logger.error(f"WebSocket connection closed for user {user_id}")
        await websocket.close()
