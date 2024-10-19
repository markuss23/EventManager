
from fastapi import FastAPI
from app.src.users.routes import router as users_router
from app.src.events.routes import router as events_router
from app.src.websockets.routes import router as ws_router
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI(docs_url="/")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(users_router)
app.include_router(events_router)
app.include_router(ws_router)