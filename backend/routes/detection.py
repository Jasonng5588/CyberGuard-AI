"""
Detection Route - POST /detect
Analyze text for cyberbullying
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database.connection import get_db
from database.models import User, Message, Detection
from models.schemas import DetectRequest, DetectResponse
from services.detection_service import detect_cyberbullying

router = APIRouter(prefix="/detect", tags=["Detection"])


@router.post("", response_model=DetectResponse)
async def analyze_message(request: DetectRequest, db: Session = Depends(get_db)):
    """
    Analyze a text message for cyberbullying content.
    Returns classification label (SAFE/OFFENSIVE/CYBERBULLYING) with confidence score.
    """
    if not request.text.strip():
        raise HTTPException(status_code=400, detail="Message text cannot be empty.")

    # Run AI detection
    detection_result = detect_cyberbullying(request.text)

    # Save message to DB
    message = Message(
        user_id=request.user_id,
        message_text=request.text,
    )
    db.add(message)
    db.flush()  # get message.id without committing

    # Save detection result to DB
    detection_record = Detection(
        message_id=message.id,
        label=detection_result["label"],
        confidence=detection_result["confidence"],
        model_used=detection_result["model_used"],
    )
    db.add(detection_record)
    db.commit()
    db.refresh(message)

    return DetectResponse(
        text=request.text,
        label=detection_result["label"],
        confidence=detection_result["confidence"],
        risk_score=detection_result["risk_score"],
        model_used=detection_result["model_used"],
        message_id=message.id,
        explanation=detection_result["explanation"],
        sub_type=detection_result.get("sub_type"),
    )
