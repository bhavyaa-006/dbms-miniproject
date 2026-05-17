import logging
import os
import uuid

from fastapi import FastAPI, HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from starlette.responses import Response
from sqlalchemy import inspect, text

from .database import engine, Base
from .category_constants import DEFAULT_CATEGORY, PREDEFINED_CATEGORIES
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
    "https://dbms-miniproject-sigma.vercel.app"
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
        content={"success": False, "message": "Validation failed", "detail": exc.errors()},
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
        content={"success": False, "message": str(exc.detail), "detail": exc.detail},
    )


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    import traceback
    print(f"Unhandled Exception on {request.method} {request.url.path}: {str(exc)}")
    traceback.print_exc()
    logger.exception(
        "Unhandled error method=%s path=%s",
        request.method,
        request.url.path,
    )
    return JSONResponse(
        status_code=500,
        content={"success": False, "message": "Internal server error"},
    )


def _seed_default_categories(connection):
    existing = {row[0] for row in connection.execute(text("SELECT name FROM categories")).all()}
    missing = [name for name in PREDEFINED_CATEGORIES if name not in existing]
    for name in missing:
        connection.execute(
            text("INSERT INTO categories (id, name) VALUES (:id, :name)"),
            {"id": str(uuid.uuid4()), "name": name},
        )


def _ensure_category_foreign_key(connection, table_name: str):
    inspector = inspect(connection)
    columns = {column["name"] for column in inspector.get_columns(table_name)}
    if "category_id" not in columns:
        connection.execute(text(f"ALTER TABLE {table_name} ADD COLUMN category_id VARCHAR"))

    legacy_column = None
    if "category" in columns:
        legacy_column = "category"
    elif "category_name" in columns:
        legacy_column = "category_name"

    if legacy_column:
        connection.execute(
            text(
                f"UPDATE {table_name} AS item SET category_id = category_lookup.id "
                f"FROM categories AS category_lookup "
                f"WHERE item.category_id IS NULL AND item.{legacy_column} = category_lookup.name"
            )
        )

    others_id = connection.execute(
        text("SELECT id FROM categories WHERE name = :name LIMIT 1"),
        {"name": DEFAULT_CATEGORY},
    ).scalar_one_or_none()
    if others_id:
        connection.execute(
            text(f"UPDATE {table_name} SET category_id = :others_id WHERE category_id IS NULL"),
            {"others_id": others_id},
        )

    connection.execute(text(f"ALTER TABLE {table_name} ALTER COLUMN category_id SET NOT NULL"))


def _ensure_notification_schema(connection):
    inspector = inspect(connection)
    if "notifications" not in inspector.get_table_names():
        return
        
    columns = {column["name"] for column in inspector.get_columns("notifications")}
    
    if "user_id" in columns and "recipient_user_id" not in columns:
        connection.execute(text("ALTER TABLE notifications RENAME COLUMN user_id TO recipient_user_id"))
    
    new_columns = [
        "sender_user_id", "title", "type", "related_claim_id", "related_item_id"
    ]
    for col in new_columns:
        if col not in columns:
            connection.execute(text(f"ALTER TABLE notifications ADD COLUMN {col} VARCHAR"))


def ensure_database_schema():
    with engine.begin() as connection:
        _seed_default_categories(connection)
        _ensure_category_foreign_key(connection, "lost_items")
        _ensure_category_foreign_key(connection, "found_items")
        _ensure_notification_schema(connection)

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
        ensure_database_schema()
        os.makedirs("uploads", exist_ok=True)
    except Exception:
        logger.exception("Failed to initialize database tables")
        raise


@app.get("/")
def root():
    return {"message": "Campus Lost & Found API is running", "docs": "/docs"}
