# from contextlib import asynccontextmanager
from fastapi import FastAPI
from app.src.users.routes import router as users_router
from app.src.events.routes import router as events_router
from pymongo import MongoClient
from fastapi.middleware.cors import CORSMiddleware

# TODO: refactor to this
# @asynccontextmanager
# async def get_db():
#     try:
#         client = MongoClient("mongodb://root:example@localhost:27017/")
#         db = client["event_planner"]
#         yield db
#     finally:
#         client.close()


app = FastAPI(docs_url="/")


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def startup_db_client():
    app.mongodb_client = MongoClient("mongodb://root:example@localhost:27017/")
    app.database = app.mongodb_client["event_planner"]
    print("Connected to MongoDB")


@app.on_event("shutdown")
def shutdown_db_client():
    app.mongodb_client.close()


app.include_router(users_router)
app.include_router(events_router)