# from app.databases import redis_client
# from websockets.sync.client import connect

# def connect_and_send(event_id):
#     uri = f"ws://127.0.0.1:8000/ws/notification/{event_id}"  # Adjust the URL as needed
#     print(f"Connecting to {uri}...")
#     with connect(uri) as websocket:  # Use async with for asynchronous context
#         websocket.send("Hello world!")  # Await the send operation
#         message = websocket.recv()  # Await the receive operation
#         print(f"Received: {message}")


# def event_listener():
#     pubsub = redis_client.get_db().pubsub()
#     # Subscribe to all key expirations
#     pubsub.psubscribe("__keyevent@0__:expired")


#     for message in pubsub.listen():
#         if message["type"] == "pmessage":
#             event_id = message["data"].decode("utf-8")

#             print(f"Key {event_id} expired.")

#             # Schedule the connect_and_send coroutine to run in the event loop
#             # connect_and_send(event_id)

