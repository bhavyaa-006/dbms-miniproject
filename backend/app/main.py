from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from .database import engine, Base
from . import models  # noqa: F401 - ensures models are registered with Base
from .routers import auth, lost_items, found_items, claims, notifications, categories, dashboard

# ─── Create tables on startup ─────────────────────────────────────────────────
Base.metadata.create_all(bind=engine)

# ─── Ensure uploads directory exists ─────────────────────────────────────────
os.makedirs("uploads", exist_ok=True)

# ─── FastAPI App ──────────────────────────────────────────────────────────────
app = FastAPI(
    title="Campus Lost & Found API",
    description="Backend API for the Campus Lost & Found Management System",
    version="1.0.0",
)

# ─── CORS ─────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
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


@app.get("/")
def root():
    return {"message": "Campus Lost & Found API is running", "docs": "/docs"}
