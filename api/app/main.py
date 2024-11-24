import sys
import time
from app.src.auth.utils import verify_jwt_token
from fastapi import FastAPI, Request, Response
from app.src.routers import router
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from loguru import logger


public_endpoints = ["/", "/openapi.json", "/v1/auth/token"]


log_level = "DEBUG"
log_format = "<green>{time:YYYY-MM-DD HH:mm:ss.SSS zz}</green> | <level>{level: <8}</level> | <yellow>Line {line: >4} ({file}):</yellow> <b>{message}</b>"
logger.add(
    sys.stderr,
    level=log_level,
    format=log_format,
    colorize=True,
    backtrace=True,
    diagnose=True,
)
logger.add(
    "logs/app.log",
    level=log_level,
    format=log_format,
    colorize=False,
    backtrace=True,
    diagnose=True,
    rotation="00:00",
    retention="5 days",
)


app = FastAPI(
    docs_url="/",
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    start_time = time.perf_counter()
    response: Response = await call_next(request)
    process_time = time.perf_counter() - start_time
    response.headers["X-Process-Time"] = str(process_time)

    if request.url.path not in public_endpoints:
        token: str = request.headers.get("Authorization")
        if not token:
            logger.info(
                f"{request.method} {request.url.path} {401} {"Missing token"}  {process_time}"
            )
            return JSONResponse(status_code=401, content={"detail": "Missing token"})
        if "Bearer " not in token:
            logger.info(
                f"{request.method} {request.url.path} {401} {"Invalid token"}  {process_time}"
            )
            return JSONResponse(status_code=401, content={"detail": "Invalid token"})
        token = token.split("Bearer ")[1]
        if not verify_jwt_token(token):
            logger.info(
                f"{request.method} {request.url.path} {401} {"Invalid token"}  {process_time}"
            )
            return JSONResponse(status_code=401, content={"detail": "Invalid token"})

    logger.info(
        f"{request.method} {request.url.path} {response.status_code} {process_time}"
    )

    return response


app.include_router(router)
