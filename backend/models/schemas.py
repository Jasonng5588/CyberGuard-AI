"""
Pydantic Schemas for request/response validation
"""
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


# ─── User Schemas ─────────────────────────────────────────────────────────────

class UserCreate(BaseModel):
    username: str = Field(..., min_length=3, max_length=100, example="demo_user")
    email: Optional[str] = Field(None, example="user@example.com")


class UserResponse(BaseModel):
    id: int
    username: str
    email: Optional[str]
    created_at: datetime
    is_active: bool

    class Config:
        from_attributes = True


# ─── Detection Schemas ────────────────────────────────────────────────────────

class DetectRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=5000, example="you are so stupid and ugly")
    user_id: Optional[int] = Field(None, example=1)


class DetectResponse(BaseModel):
    text: str
    label: str          # SAFE | OFFENSIVE | CYBERBULLYING
    confidence: float
    risk_score: float   # 0.0 - 1.0 normalized
    model_used: str
    message_id: Optional[int]
    explanation: str
    sub_type: Optional[str] = None   # Verbal Abuse | Social Exclusion | Death Threat | etc.


# ─── Chat Schemas ─────────────────────────────────────────────────────────────

class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=5000, example="someone is bullying me online")
    user_id: Optional[int] = Field(None, example=1)
    detection_label: Optional[str] = Field(None, example="CYBERBULLYING")
    session_id: Optional[str] = Field(None, example="123e4567-e89b-12d3-a456-426614174000")


class ChatResponse(BaseModel):
    user_message: str
    bot_response: str
    suggestions: List[str]
    log_id: Optional[int]
    session_id: Optional[str] = None
    emotion_detected: Optional[str] = None   # kept for backward-compat
    support_phase: Optional[str] = None      # detection | emotional_support | crisis_support | mild_support
    coping_strategy: Optional[dict] = None   # {immediate, coping, resource} per sub_type


class SupportRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=5000, example="I need help, I'm being bullied")
    user_id: Optional[int] = Field(None, example=1)
    session_id: Optional[str] = Field(None)


# ─── Log Schemas ──────────────────────────────────────────────────────────────

class LogEntry(BaseModel):
    id: int
    user_message: str
    bot_response: str
    detection_label: Optional[str]
    confidence: Optional[float] = 0.0
    sub_type: Optional[str] = "None"
    explanation: Optional[str] = None
    session_id: Optional[str]
    timestamp: datetime
    username: Optional[str]

    class Config:
        from_attributes = True


class ChatSessionPreview(BaseModel):
    session_id: str
    last_message: str
    timestamp: datetime

class AdminSessionPreview(BaseModel):
    session_id: str
    username: str
    user_id: int
    message_count: int
    last_message: str
    timestamp: datetime


class LogsResponse(BaseModel):
    total: int
    page: int
    per_page: int
    logs: List[LogEntry]


class DetectionLogEntry(BaseModel):
    id: int
    message_text: str
    label: str
    confidence: float
    created_at: datetime
    username: Optional[str]

    class Config:
        from_attributes = True


# ─── Analytics Schemas ────────────────────────────────────────────────────────

class DailyStat(BaseModel):
    date: str
    total: int
    cyberbullying: int
    offensive: int
    safe: int


class TopWord(BaseModel):
    word: str
    count: int


class AnalyticsResponse(BaseModel):
    total_messages: int
    total_bullying: int
    total_offensive: int
    total_safe: int
    bullying_rate: float        # percentage
    daily_stats: List[DailyStat]
    top_toxic_words: List[TopWord]
    recent_detections: List[DetectionLogEntry]
