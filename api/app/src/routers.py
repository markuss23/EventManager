from fastapi import APIRouter, Security

from app.src.users.routes import router as users_router
from app.src.events.routes import router as events_router
# from app.src.websockets.routes import router as ws_router
from app.src.auth.routes import router as auth_router
from fastapi.security import APIKeyHeader

router = APIRouter(prefix="/v1")


router.include_router(auth_router)
router.include_router(
    users_router,
    dependencies=[Security(APIKeyHeader(name="Authorization"))],
)
router.include_router(
    events_router,
    dependencies=[Security(APIKeyHeader(name="Authorization"))],
)
# router.include_router(
#     ws_router,
#     dependencies=[Security(APIKeyHeader(name="Authorization"))],
# )
