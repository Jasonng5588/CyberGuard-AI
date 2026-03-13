"""
Logs Route - GET /logs
Retrieve conversation and detection logs
"""
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import desc
from database.connection import get_db
from database.models import ChatLog, Detection, Message, User
from models.schemas import LogsResponse, LogEntry, DetectionLogEntry, AdminSessionPreview
from typing import List

router = APIRouter(prefix="/logs", tags=["Logs"])


@router.get("", response_model=LogsResponse)
async def get_chat_logs(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """Retrieve paginated chat conversation logs."""
    offset = (page - 1) * per_page
    total = db.query(ChatLog).count()

    logs_db = (
        db.query(ChatLog)
        .options(joinedload(ChatLog.user))
        .order_by(desc(ChatLog.timestamp))
        .offset(offset)
        .limit(per_page)
        .all()
    )

    logs = [
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
            feedback_helpful=log.feedback_helpful,
        )
        for log in logs_db
    ]

    return LogsResponse(total=total, page=page, per_page=per_page, logs=logs)


@router.get("/detections", response_model=List[DetectionLogEntry])
async def get_detection_logs(
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db)
):
    """Retrieve recent detection records with message content."""
    records = (
        db.query(Detection, Message, User)
        .join(Message, Detection.message_id == Message.id)
        .outerjoin(User, Message.user_id == User.id)
        .order_by(desc(Detection.created_at))
        .limit(limit)
        .all()
    )

    return [
        DetectionLogEntry(
            id=det.id,
            message_text=msg.message_text,
            label=det.label,
            confidence=det.confidence,
            created_at=det.created_at,
            username=user.username if user else "anonymous",
        )
        for det, msg, user in records
    ]


@router.delete("/chat/{log_id}")
async def delete_chat_log(log_id: int, db: Session = Depends(get_db)):
    """Delete a chat log (super admin feature)."""
    log = db.query(ChatLog).filter(ChatLog.id == log_id).first()
    if not log:
        raise HTTPException(status_code=404, detail="Chat log not found")
    
    db.delete(log)
    db.commit()
    return {"message": "Chat log deleted successfully"}


@router.delete("/detections/{det_id}")
async def delete_detection_log(det_id: int, db: Session = Depends(get_db)):
    """Delete a detection log and associated message (super admin feature)."""
    det = db.query(Detection).filter(Detection.id == det_id).first()
    if not det:
        raise HTTPException(status_code=404, detail="Detection log not found")
    
    # Also delete the associated message
    msg = db.query(Message).filter(Message.id == det.message_id).first()
    if msg:
        db.delete(msg)
        
    db.delete(det)
    db.commit()
    return {"message": "Detection log deleted successfully"}


@router.get("/export/csv/{user_id}")
async def export_chat_history_csv(
    user_id: int,
    db: Session = Depends(get_db)
):
    """Export a user's full chat history as a downloadable CSV file (Data Portability)."""
    import csv
    import io
    from fastapi.responses import StreamingResponse

    logs_db = (
        db.query(ChatLog)
        .filter(ChatLog.user_id == user_id)
        .order_by(ChatLog.timestamp.asc())
        .all()
    )

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["ID", "Timestamp", "User Message", "Bot Response", "Detection Label", "Confidence", "Sub Type", "Explanation", "Session ID"])

    for log in logs_db:
        writer.writerow([
            log.id,
            log.timestamp.isoformat() if log.timestamp else "",
            log.user_message or "",
            log.bot_response or "",
            log.detection_label or "SAFE",
            round(log.confidence or 0.0, 4),
            log.sub_type or "None",
            log.explanation or "",
            log.session_id or "",
        ])

    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=cyberguard_history_user_{user_id}.csv"}
    )


@router.post("/feedback/{log_id}")
async def submit_response_feedback(
    log_id: int,
    helpful: bool,
    db: Session = Depends(get_db)
):
    """
    User feedback on a bot response.
    Records whether a bot response was helpful — used for system evaluation and RO4.
    Saves to the feedback_helpful boolean column for dashboard analytics.
    """
    log = db.query(ChatLog).filter(ChatLog.id == log_id).first()
    if not log:
        raise HTTPException(status_code=404, detail="Chat log not found")
    # Store in dedicated boolean column for analytics queries
    log.feedback_helpful = helpful
    db.commit()
    return {"status": "ok", "log_id": log_id, "helpful": helpful}


@router.get("/admin/sessions/all", response_model=List[AdminSessionPreview])
async def get_all_sessions_admin(
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db)
):
    """Retrieve all chat sessions across all users for Super Admin monitoring."""
    from sqlalchemy import func
    
    subq = (
        db.query(
            ChatLog.session_id,
            func.max(ChatLog.timestamp).label("max_timestamp"),
            func.count(ChatLog.id).label("message_count")
        )
        .filter(ChatLog.session_id.isnot(None))
        .group_by(ChatLog.session_id)
        .subquery()
    )

    records = (
        db.query(ChatLog, subq.c.message_count, User)
        .join(subq, (ChatLog.session_id == subq.c.session_id) & (ChatLog.timestamp == subq.c.max_timestamp))
        .outerjoin(User, ChatLog.user_id == User.id)
        .order_by(desc(ChatLog.timestamp))
        .limit(limit)
        .all()
    )

    return [
        AdminSessionPreview(
            session_id=log.session_id,
            username=user.username if user else "anonymous",
            user_id=log.user_id or 0,
            message_count=msg_count,
            last_message=log.user_message[:50] + ("..." if len(log.user_message) > 50 else ""),
            timestamp=log.timestamp
        )
        for log, msg_count, user in records
    ]
