"""
FastAPI Main Application Entry Point
CyberGuard AI - Cyberbullying Detection & Support System
"""
import sys
import os
# Ensure the backend directory is always on the path, regardless of where
# uvicorn is launched from (local dev vs Render cloud deployment).
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager

from config import settings
from database.connection import engine
from database import models
from routes import detection, chat, logs, analytics, users, evaluate


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Create database tables on startup."""
    print(f"[{settings.APP_NAME}] Starting up...")
    models.Base.metadata.create_all(bind=engine)
    print(f"[{settings.APP_NAME}] Database tables initialized.")
    yield
    print(f"[{settings.APP_NAME}] Shutting down.")


app = FastAPI(
    title=settings.APP_NAME,
    description="AI-Powered Cyberbullying Detection and Support Chatbot API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# ─── CORS ─────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Routers ──────────────────────────────────────────────────────────────────
app.include_router(detection.router, prefix="/api")
app.include_router(chat.router, prefix="/api")
app.include_router(logs.router, prefix="/api")
app.include_router(analytics.router, prefix="/api")
app.include_router(users.router, prefix="/api")
app.include_router(evaluate.router, prefix="/api")


# ─── Health Check ─────────────────────────────────────────────────────────────
@app.get("/", tags=["Health"])
async def root():
    return {
        "app": settings.APP_NAME,
        "status": "running",
        "version": "1.0.0",
        "docs": "/docs",
    }


@app.get("/health", tags=["Health"])
async def health_check():
    return JSONResponse(content={"status": "healthy", "service": settings.APP_NAME})
