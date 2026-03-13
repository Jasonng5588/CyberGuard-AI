"""
Analytics Route - GET /analytics
Return detection statistics for the admin dashboard
"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, desc, cast, Date
from database.connection import get_db
from database.models import Detection, Message, ChatLog, User
from models.schemas import AnalyticsResponse, DailyStat, TopWord, DetectionLogEntry
import re
from collections import Counter
from datetime import datetime, date

router = APIRouter(prefix="/analytics", tags=["Analytics"])

def _safe_dt(value) -> datetime:
    """Coerce any timestamp value to a datetime object safely."""
    if value is None:
        return datetime.utcnow()
    if isinstance(value, datetime):
        return value
    if isinstance(value, date):
        return datetime(value.year, value.month, value.day)
    if isinstance(value, str):
        try:
            return datetime.fromisoformat(value.replace("Z", "+00:00"))
        except Exception:
            return datetime.utcnow()
    return datetime.utcnow()

STOPWORDS = {
    "i", "me", "my", "you", "your", "the", "a", "an", "and", "or",
    "but", "is", "it", "in", "on", "at", "to", "for", "of", "with",
    "that", "this", "was", "are", "be", "have", "do", "just", "so",
    "we", "he", "she", "they", "not", "no", "yes", "up", "if", "as"
}


@router.get("", response_model=AnalyticsResponse)
async def get_analytics(
    user_id: int = Query(None, description="Optional user ID to filter analytics for a specific user"),
    db: Session = Depends(get_db)
):
    """
    Return comprehensive analytics. If user_id is provided, returns personal stats.
    Otherwise, returns global stats for the admin dashboard.
    """
    try:
        # Helper to apply user filter
        def apply_filter(query):
            if user_id:
                query = query.filter(ChatLog.user_id == user_id)
            return query

        print("[DEBUG] Getting totals")
        # ── Totals ──────────────────────────────────────────────────────────────────
        total_messages = apply_filter(db.query(ChatLog)).count()
        total_bullying = apply_filter(db.query(ChatLog)).filter(ChatLog.detection_label == "CYBERBULLYING").count()
        total_offensive = apply_filter(db.query(ChatLog)).filter(ChatLog.detection_label == "OFFENSIVE").count()
        total_safe = apply_filter(db.query(ChatLog)).filter(ChatLog.detection_label == "SAFE").count()

        bullying_rate = round((total_bullying / total_messages * 100), 2) if total_messages > 0 else 0.0

        print("[DEBUG] Getting Daily Stats")
        # ── Daily Stats (last 14 days) ───────────────────────────────────────────────
        recent_logs_query = db.query(ChatLog.timestamp, ChatLog.detection_label).order_by(desc(ChatLog.timestamp))
        recent_logs = apply_filter(recent_logs_query).limit(1000).all()

        date_map: dict = {}
        for row in recent_logs:
            if row.timestamp:
                try:
                    ts = _safe_dt(row.timestamp)
                    d = ts.strftime("%Y-%m-%d")
                except Exception:
                    continue
                
                if d not in date_map:
                    date_map[d] = {"CYBERBULLYING": 0, "OFFENSIVE": 0, "SAFE": 0}
                
                label = row.detection_label or "SAFE"
                if label in date_map[d]:
                    date_map[d][label] += 1

        daily_stats = [
            DailyStat(
                date=d,
                total=v["CYBERBULLYING"] + v["OFFENSIVE"] + v["SAFE"],
                cyberbullying=v["CYBERBULLYING"],
                offensive=v["OFFENSIVE"],
                safe=v["SAFE"],
            )
            for d, v in sorted(date_map.items())
        ][-14:]  # Keep last 14 days

        print("[DEBUG] Getting Toxic Words")
        # ── Top Toxic Words ──────────────────────────────────────────────────────────
        toxic_messages_query = (
            db.query(ChatLog.user_message)
            .filter(ChatLog.detection_label.in_(["CYBERBULLYING", "OFFENSIVE"]))
        )
        if user_id:
            toxic_messages_query = toxic_messages_query.filter(ChatLog.user_id == user_id)
        
        toxic_messages_query = toxic_messages_query.limit(500)
        toxic_messages = toxic_messages_query.all()

        word_counter: Counter = Counter()
        for (text,) in toxic_messages:
            if text:
                words = re.findall(r'\b[a-z]{3,}\b', text.lower())
                for w in words:
                    if w not in STOPWORDS:
                        word_counter[w] += 1

        top_toxic_words = [
            TopWord(word=w, count=c)
            for w, c in word_counter.most_common(15)
        ]

        print("[DEBUG] Getting Recent Detections")
        # ── Recent Detections ────────────────────────────────────────────────────────
        recent_records_query = (
            db.query(ChatLog, User)
            .outerjoin(User, ChatLog.user_id == User.id)
            .filter(ChatLog.detection_label != "SAFE")
            .order_by(desc(ChatLog.timestamp))
        )
        if user_id:
            recent_records_query = recent_records_query.filter(ChatLog.user_id == user_id)
            
        recent_records_query = recent_records_query.limit(10)
        recent_records = recent_records_query.all()

        recent_detections = []
        for log, user in recent_records:
            t = log.user_message or ""
            short_text = t[:100] + "..." if len(t) > 100 else t
            
            recent_detections.append(DetectionLogEntry(
                id=log.id,
                message_text=short_text,
                label=log.detection_label or "SAFE",
                confidence=log.confidence or 0.0,
                created_at=_safe_dt(log.timestamp),
                username=user.username if user else "anonymous",
            ))

        print("[DEBUG] Analytics Successful")
        return AnalyticsResponse(
            total_messages=total_messages,
            total_bullying=total_bullying,
            total_offensive=total_offensive,
            total_safe=total_safe,
            bullying_rate=bullying_rate,
            daily_stats=daily_stats,
            top_toxic_words=top_toxic_words,
            recent_detections=recent_detections,
        )
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise e
