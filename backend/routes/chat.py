"""
Chat Route - POST /chat
Send a message to the support chatbot
"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc
from database.connection import get_db
from database.models import ChatLog
from models.schemas import ChatRequest, ChatResponse, LogEntry, SupportRequest
from services.detection_service import detect_cyberbullying
from services.chatbot_service import get_chatbot_response
from models.schemas import ChatSessionPreview
from typing import List
import uuid

router = APIRouter(prefix="/chat", tags=["Chatbot"])


@router.post("", response_model=ChatResponse)
async def chat_with_bot(request: ChatRequest, db: Session = Depends(get_db)):
    """
    Send a message to the support chatbot.
    Runs full AI detection and generates a dynamic, context-aware empathetic response.
    """
    # Always run full detection so _meta context is available for dynamic responses
    detection_result = detect_cyberbullying(request.message)

    # Allow client to override label if already detected
    if request.detection_label:
        detection_result["label"] = request.detection_label

    # Generate session_id if none provided
    session_id = request.session_id or str(uuid.uuid4())

    # Get conversation history for this session for context
    history = []
    if request.session_id:
        history = db.query(ChatLog).filter(
            ChatLog.session_id == request.session_id,
            ChatLog.user_id == request.user_id
        ).order_by(ChatLog.timestamp.asc()).all()

    # Get dynamic context-aware chatbot response
    chatbot_result = get_chatbot_response(
        message=request.message,
        detection_result=detection_result,
        history=history
    )

    bot_response = chatbot_result.get("response", "I'm here to help. Please feel free to share more.")

    # Save to chat logs
    log = ChatLog(
        user_id=request.user_id,
        session_id=session_id,
        user_message=request.message,
        bot_response=bot_response,
        detection_label=detection_result["label"],
        confidence=detection_result["confidence"],
        sub_type=detection_result.get("sub_type", "None"),
        explanation=detection_result.get("explanation", ""),
    )
    db.add(log)
    db.commit()
    db.refresh(log)

    return ChatResponse(
        user_message=request.message,
        bot_response=bot_response,
        suggestions=chatbot_result.get("suggestions", []),
        log_id=log.id,
        session_id=session_id,
        support_phase=chatbot_result.get("support_phase"),
        coping_strategy=chatbot_result.get("coping_strategy"),
    )


@router.post("/support", response_model=ChatResponse)
async def victim_support_chat(request: SupportRequest, db: Session = Depends(get_db)):
    """
    Victim-initiated support conversation.
    Bypasses detection and goes straight to empathetic emotional support.
    Used when a user explicitly seeks help (e.g., 'I need help', 'I'm being bullied').
    """
    # Still run detection for logging and context, but prioritize support
    detection_result = detect_cyberbullying(request.message)

    session_id = request.session_id or str(uuid.uuid4())

    # Get history and sort by oldest to newest
    history = []
    if request.session_id:
        history = db.query(ChatLog).filter(
            ChatLog.session_id == request.session_id,
            ChatLog.user_id == request.user_id
        ).order_by(ChatLog.timestamp.asc()).all()

    # Generate support-focused response
    chatbot_result = get_chatbot_response(
        message=request.message,
        detection_result=detection_result,
        history=history
    )

    bot_response = chatbot_result.get("response", "I'm here for you. Please tell me more about what's going on. ")

    # Save to chat logs
    log = ChatLog(
        user_id=request.user_id,
        session_id=session_id,
        user_message=request.message,
        bot_response=bot_response,
        detection_label=detection_result.get("label", "SAFE"),
        confidence=detection_result.get("confidence", 0.0),
        sub_type=detection_result.get("sub_type", "None"),
        explanation="Victim-initiated support conversation",
    )
    db.add(log)
    db.commit()
    db.refresh(log)

    return ChatResponse(
        user_message=request.message,
        bot_response=bot_response,
        suggestions=chatbot_result.get("suggestions", []),
        log_id=log.id,
        session_id=session_id,
        support_phase=chatbot_result.get("support_phase", "emotional_support"),
        coping_strategy=chatbot_result.get("coping_strategy"),
    )

@router.get("/sessions/{user_id}", response_model=List[ChatSessionPreview])
async def get_user_chat_sessions(
    user_id: int,
    limit: int = Query(20, ge=1, le=50),
    db: Session = Depends(get_db)
):
    """Retrieve distinct chat sessions for a specific user to populate the sidebar."""
    # Find the latest message timestamp for each session, excluding null session_ids
    # Using window functions or distinct depending on SQL dialect, here we use simple grouping
    from sqlalchemy import func
    
    subq = (
        db.query(
            ChatLog.session_id,
            func.max(ChatLog.timestamp).label("max_timestamp")
        )
        .filter(ChatLog.user_id == user_id, ChatLog.session_id.isnot(None))
        .group_by(ChatLog.session_id)
        .subquery()
    )

    # Join back to get the latest message text
    latest_logs = (
        db.query(ChatLog)
        .join(subq, (ChatLog.session_id == subq.c.session_id) & (ChatLog.timestamp == subq.c.max_timestamp))
        .order_by(desc(ChatLog.timestamp))
        .limit(limit)
        .all()
    )

    return [
        ChatSessionPreview(
            session_id=log.session_id,
            last_message=log.user_message[:50] + ("..." if len(log.user_message) > 50 else ""),
            timestamp=log.timestamp
        )
        for log in latest_logs
    ]

@router.get("/history/{user_id}/{session_id}", response_model=List[LogEntry])
async def get_session_history(
    user_id: int,
    session_id: str,
    db: Session = Depends(get_db)
):
    """Retrieve the exact chat history for a specific session."""
    logs_db = (
        db.query(ChatLog)
        .filter(ChatLog.user_id == user_id, ChatLog.session_id == session_id)
        .order_by(desc(ChatLog.timestamp))
        .all()
    )

    # Return in chronological order
    logs_db.reverse()

    return [
        LogEntry(
            id=log.id,
            user_message=log.user_message,
            bot_response=log.bot_response,
            detection_label=log.detection_label,
            confidence=log.confidence,
            sub_type=log.sub_type,
            explanation=log.explanation,
            session_id=log.session_id,
            timestamp=log.timestamp,
            username=log.user.username if log.user else "anonymous",
        )
        for log in logs_db
    ]

@router.delete("/sessions/{user_id}/{session_id}")
async def delete_chat_session(
    user_id: int,
    session_id: str,
    db: Session = Depends(get_db)
):
    """Delete a specific chat session and all its logs for a user."""
    deleted = (
        db.query(ChatLog)
        .filter(ChatLog.user_id == user_id, ChatLog.session_id == session_id)
        .delete(synchronize_session=False)
    )
    db.commit()
    return {"deleted": deleted, "session_id": session_id}
