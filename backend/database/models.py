"""
SQLAlchemy ORM Models
"""
from sqlalchemy import Column, Integer, String, Float, Boolean, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database.connection import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(100), unique=True, nullable=False, index=True)
    email = Column(String(255), unique=True, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    is_active = Column(Boolean, default=True)

    messages = relationship("Message", back_populates="user")
    chat_logs = relationship("ChatLog", back_populates="user")


class Message(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    message_text = Column(Text, nullable=False)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="messages")
    detection = relationship("Detection", back_populates="message", uselist=False)


class Detection(Base):
    __tablename__ = "detections"

    id = Column(Integer, primary_key=True, index=True)
    message_id = Column(Integer, ForeignKey("messages.id", ondelete="CASCADE"), nullable=True)
    label = Column(String(50), nullable=False)
    confidence = Column(Float, nullable=False)
    model_used = Column(String(100), default="distilbert-toxic-classifier")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    message = relationship("Message", back_populates="detection")


class ChatLog(Base):
    __tablename__ = "chat_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    user_message = Column(Text, nullable=False)
    bot_response = Column(Text, nullable=False)
    detection_label = Column(String(50), nullable=True)
    confidence = Column(Float, nullable=True, default=0.0)
    sub_type = Column(String(100), nullable=True, default="None")
    explanation = Column(Text, nullable=True)
    session_id = Column(String(36), nullable=True, index=True)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    feedback_helpful = Column(Boolean, nullable=True)  # thumbs up/down result

    user = relationship("User", back_populates="chat_logs")


class SurveyResponse(Base):
    """Post-session user satisfaction survey (SUS-style, 5 questions)."""
    __tablename__ = "survey_responses"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    session_id = Column(String(36), nullable=True, index=True)
    # Ratings 1–5 for each dimension
    q_overall = Column(Integer, nullable=False)       # Overall satisfaction
    q_understanding = Column(Integer, nullable=False) # Chatbot understood my situation
    q_detection = Column(Integer, nullable=False)     # Detection felt accurate
    q_support = Column(Integer, nullable=False)       # Support responses were helpful
    q_return = Column(Integer, nullable=False)        # Would use again (1=No, 5=Definitely)
    comment = Column(Text, nullable=True)
    submitted_at = Column(DateTime(timezone=True), server_default=func.now())
