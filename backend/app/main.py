import logging
import os

from fastapi import FastAPI, HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from starlette.responses import Response

from .database import engine, Base
from . import models  # noqa: F401 - ensures models are registered with Base
from .routers import auth, lost_items, found_items, claims, notifications, categories, dashboard

logger = logging.getLogger(__name__)

# ─── Ensure uploads directory exists ─────────────────────────────────────────
os.makedirs("uploads", exist_ok=True)

# ─── FastAPI App ──────────────────────────────────────────────────────────────
app = FastAPI(
    title="Campus Lost & Found API",
    description="Backend API for the Campus Lost & Found Management System",
    version="1.0.0",
)

# ─── CORS ─────────────────────────────────────────────────────────────────────
origins = [
    "https://dbms-miniproject-sigma.vercel.app",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def log_requests(request: Request, call_next) -> Response:
    origin = request.headers.get("origin")
    logger.info(
        "Incoming request method=%s path=%s origin=%s",
        request.method,
        request.url.path,
        origin,
    )
    response = await call_next(request)
    logger.info(
        "Completed request method=%s path=%s status_code=%s origin=%s",
        request.method,
        request.url.path,
        response.status_code,
        origin,
    )
    return response


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    logger.warning(
        "Validation error method=%s path=%s errors=%s",
        request.method,
        request.url.path,
        exc.errors(),
    )
    return JSONResponse(
        status_code=422,
        content={"detail": exc.errors(), "message": "Validation failed"},
    )


@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    logger.warning(
        "HTTP error method=%s path=%s status_code=%s detail=%s",
        request.method,
        request.url.path,
        exc.status_code,
        exc.detail,
    )
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail, "message": str(exc.detail)},
    )


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    logger.exception(
        "Unhandled error method=%s path=%s",
        request.method,
        request.url.path,
    )
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error", "message": "Internal server error"},
    )

# ─── Static files (uploaded images) ──────────────────────────────────────────
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# ─── Routers ──────────────────────────────────────────────────────────────────
API_PREFIX = "/api"
app.include_router(auth.router, prefix=API_PREFIX)
app.include_router(categories.router, prefix=API_PREFIX)
app.include_router(lost_items.router, prefix=API_PREFIX)
app.include_router(found_items.router, prefix=API_PREFIX)
app.include_router(claims.router, prefix=API_PREFIX)
app.include_router(notifications.router, prefix=API_PREFIX)
app.include_router(dashboard.router, prefix=API_PREFIX)


@app.on_event("startup")
def startup_event():
    try:
        logger.info("Creating database tables on startup")
        Base.metadata.create_all(bind=engine)
        os.makedirs("uploads", exist_ok=True)
    except Exception:
        logger.exception("Failed to initialize database tables")
        raise


@app.get("/")
def root():
    return {"message": "Campus Lost & Found API is running", "docs": "/docs"}
