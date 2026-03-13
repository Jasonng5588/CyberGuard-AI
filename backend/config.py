"""
Application settings using pydantic-settings
Loads .env from the backend/ directory regardless of where Python is run from
"""
from pathlib import Path
from pydantic_settings import BaseSettings
from typing import Optional

# Always resolve .env relative to this file's directory (backend/)
_ENV_FILE = Path(__file__).parent / ".env"


class Settings(BaseSettings):
    DATABASE_URL: str = f"sqlite:///{_ENV_FILE.parent / 'cyberguard.db'}"
    API_HOST: str = "0.0.0.0"
    API_PORT: int = 8000
    DEBUG: bool = True
    FRONTEND_URL: str = "http://localhost:3000"
    OPENAI_API_KEY: Optional[str] = None
    GROQ_API_KEY: Optional[str] = None
    OPENROUTER_API_KEY: Optional[str] = None
    DETECTION_MODEL: str = "martin-ha/toxic-comment-model"
    USE_OPENAI_CHATBOT: bool = False
    SECRET_KEY: str = "dev-secret-key-change-in-production"
    APP_NAME: str = "CyberGuard AI"

    class Config:
        env_file = str(_ENV_FILE)
        env_file_encoding = "utf-8"


settings = Settings()
