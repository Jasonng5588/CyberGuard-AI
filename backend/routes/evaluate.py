"""
Evaluation Route - GET /api/evaluate
Computes precision, recall, F1-score for the detection engine against a curated gold test set.
Also returns survey analysis and feedback analysis.
This fulfils RO4: evaluation of detection accuracy and chatbot quality.
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from database.connection import get_db
from database.models import ChatLog, SurveyResponse
from services.detection_service import detect_cyberbullying
from pydantic import BaseModel
from typing import List, Optional
from collections import Counter

router = APIRouter(prefix="/evaluate", tags=["Evaluation"])

# ─── Gold Standard Test Set (50 labelled examples) ──────────────────────────
# These are curated examples covering all label types and sub-types.
# Used to compute precision/recall/F1 without needing user data.
GOLD_TEST_SET = [
    # CYBERBULLYING examples
    {"text": "You're so stupid, nobody wants you here.", "expected": "CYBERBULLYING"},
    {"text": "Kill yourself, you worthless loser", "expected": "CYBERBULLYING"},
    {"text": "Go die in a hole, nobody cares about you", "expected": "CYBERBULLYING"},
    {"text": "You should just end your life already", "expected": "CYBERBULLYING"},
    {"text": "Everyone hates you and wishes you were gone", "expected": "CYBERBULLYING"},
    {"text": "You're a piece of trash and a waste of space", "expected": "CYBERBULLYING"},
    {"text": "kys freak, you don't deserve to live", "expected": "CYBERBULLYING"},
    {"text": "Nobody wants you around, you're disgusting", "expected": "CYBERBULLYING"},
    {"text": "I will dox you and share your address with everyone", "expected": "CYBERBULLYING"},
    {"text": "We made a fake profile pretending to be you", "expected": "CYBERBULLYING"},
    {"text": "Everyone is laughing at your pathetic life", "expected": "CYBERBULLYING"},
    {"text": "You'll never amount to anything, just give up", "expected": "CYBERBULLYING"},
    {"text": "Stay away or I will expose all your secrets", "expected": "CYBERBULLYING"},
    {"text": "pukimak kau, pergi mampus", "expected": "CYBERBULLYING"},
    {"text": "你去死吧，废物", "expected": "CYBERBULLYING"},
    {"text": "We don't want you here, you freak", "expected": "CYBERBULLYING"},
    {"text": "Sharing the video of you getting hit, it's so funny", "expected": "CYBERBULLYING"},
    {"text": "I've been following all your accounts and know your schedule", "expected": "CYBERBULLYING"},
    {"text": "Your home address is 123 Main Street, everyone should know", "expected": "CYBERBULLYING"},
    {"text": "outing you to everyone — we're telling them your secret", "expected": "CYBERBULLYING"},
    # OFFENSIVE examples
    {"text": "Shut up, you're so annoying", "expected": "OFFENSIVE"},
    {"text": "You're such a jerk, I can't stand you", "expected": "OFFENSIVE"},
    {"text": "That's the dumbest thing I've ever heard", "expected": "OFFENSIVE"},
    {"text": "You're being so stupid right now", "expected": "OFFENSIVE"},
    {"text": "What a pathetic excuse", "expected": "OFFENSIVE"},
    {"text": "You're an idiot if you believe that", "expected": "OFFENSIVE"},
    {"text": "This is trash content, you're terrible", "expected": "OFFENSIVE"},
    {"text": "bodoh sangat kau ni", "expected": "OFFENSIVE"},
    {"text": "ratio stay mad lol cringe", "expected": "OFFENSIVE"},
    {"text": "ok boomer, nobody asked", "expected": "OFFENSIVE"},
    # SAFE examples
    {"text": "Have a great day! Hope things get better for you.", "expected": "SAFE"},
    {"text": "I feel a bit sad today, can we talk?", "expected": "SAFE"},
    {"text": "Can you help me understand cyberbullying?", "expected": "SAFE"},
    {"text": "I love your new profile picture!", "expected": "SAFE"},
    {"text": "Thanks for being such a good friend.", "expected": "SAFE"},
    {"text": "I'm feeling really stressed about exams.", "expected": "SAFE"},
    {"text": "Good morning! How are you today?", "expected": "SAFE"},
    {"text": "I got into university!", "expected": "SAFE"},
    {"text": "I need some advice please", "expected": "SAFE"},
    {"text": "Someone said something mean to me online, I'm upset", "expected": "SAFE"},
    {"text": "What are some good ways to cope with bullying?", "expected": "SAFE"},
    {"text": "I feel lonely sometimes", "expected": "SAFE"},
    {"text": "Did you see that new movie? It was great!", "expected": "SAFE"},
    {"text": "I'm nervous about starting school tomorrow", "expected": "SAFE"},
    {"text": "How do I report someone on Instagram?", "expected": "SAFE"},
    {"text": "Thank you so much for your help!", "expected": "SAFE"},
    {"text": "My friend went through cyberbullying and I want to support them", "expected": "SAFE"},
    {"text": "I lost $100 playing casino and I'm stressed", "expected": "SAFE"},
    {"text": "今天心情不好", "expected": "SAFE"},
    {"text": "Saya rasa sedih hari ini", "expected": "SAFE"},
]


def _compute_metrics(predictions: list, gold: list) -> dict:
    """Compute precision, recall, F1 for each class and overall (macro-averaged)."""
    labels = ["SAFE", "OFFENSIVE", "CYBERBULLYING"]
    results = {}
    total_tp = total_fp = total_fn = 0

    for label in labels:
        tp = sum(1 for p, g in zip(predictions, gold) if p == label and g == label)
        fp = sum(1 for p, g in zip(predictions, gold) if p == label and g != label)
        fn = sum(1 for p, g in zip(predictions, gold) if p != label and g == label)

        precision = tp / (tp + fp) if (tp + fp) > 0 else 0.0
        recall = tp / (tp + fn) if (tp + fn) > 0 else 0.0
        f1 = 2 * precision * recall / (precision + recall) if (precision + recall) > 0 else 0.0

        results[label] = {
            "precision": round(precision, 4),
            "recall": round(recall, 4),
            "f1": round(f1, 4),
            "true_positives": tp,
            "false_positives": fp,
            "false_negatives": fn,
        }
        total_tp += tp; total_fp += fp; total_fn += fn

    # Macro average
    macro_p = sum(results[l]["precision"] for l in labels) / 3
    macro_r = sum(results[l]["recall"] for l in labels) / 3
    macro_f1 = sum(results[l]["f1"] for l in labels) / 3
    accuracy = sum(1 for p, g in zip(predictions, gold) if p == g) / max(len(gold), 1)

    return {
        "per_class": results,
        "macro_precision": round(macro_p, 4),
        "macro_recall": round(macro_r, 4),
        "macro_f1": round(macro_f1, 4),
        "accuracy": round(accuracy, 4),
        "total_samples": len(gold),
        "correct_predictions": sum(1 for p, g in zip(predictions, gold) if p == g),
    }


class EvaluationResult(BaseModel):
    total_samples: int
    correct_predictions: int
    accuracy: float
    macro_precision: float
    macro_recall: float
    macro_f1: float
    per_class: dict
    detailed_results: List[dict]


class SurveyStats(BaseModel):
    total_responses: int
    avg_overall: float
    avg_understanding: float
    avg_detection: float
    avg_support: float
    avg_return: float
    sus_score: float  # System Usability Scale equivalent 0-100


class FeedbackStats(BaseModel):
    total_feedback: int
    helpful_count: int
    unhelpful_count: int
    helpful_rate: float
    by_label: dict


class FullEvaluation(BaseModel):
    detection_metrics: EvaluationResult
    survey_stats: Optional[SurveyStats]
    feedback_stats: FeedbackStats


@router.get("", response_model=FullEvaluation)
async def run_evaluation(db: Session = Depends(get_db)):
    """
    Run the full evaluation suite:
    1. Detection precision/recall/F1 against gold test set
    2. Survey statistics (user satisfaction)
    3. Feedback analysis (helpful/unhelpful rate by label)
    """

    # ─── 1. Run detection on gold test set ────────────────────────────────────
    predictions = []
    detailed_results = []
    for item in GOLD_TEST_SET:
        try:
            result = detect_cyberbullying(item["text"])
            predicted = result.get("label", "SAFE")
        except Exception:
            predicted = "SAFE"
        predictions.append(predicted)
        detailed_results.append({
            "text": item["text"][:60] + "..." if len(item["text"]) > 60 else item["text"],
            "expected": item["expected"],
            "predicted": predicted,
            "correct": predicted == item["expected"],
        })

    gold_labels = [item["expected"] for item in GOLD_TEST_SET]
    metrics = _compute_metrics(predictions, gold_labels)

    detection_result = EvaluationResult(
        total_samples=metrics["total_samples"],
        correct_predictions=metrics["correct_predictions"],
        accuracy=metrics["accuracy"],
        macro_precision=metrics["macro_precision"],
        macro_recall=metrics["macro_recall"],
        macro_f1=metrics["macro_f1"],
        per_class=metrics["per_class"],
        detailed_results=detailed_results,
    )

    # ─── 2. Survey statistics ─────────────────────────────────────────────────
    survey_count = db.query(SurveyResponse).count()
    survey_stats = None
    if survey_count > 0:
        agg = db.query(
            func.avg(SurveyResponse.q_overall).label("avg_overall"),
            func.avg(SurveyResponse.q_understanding).label("avg_understanding"),
            func.avg(SurveyResponse.q_detection).label("avg_detection"),
            func.avg(SurveyResponse.q_support).label("avg_support"),
            func.avg(SurveyResponse.q_return).label("avg_return"),
        ).first()

        avg_o = float(agg.avg_overall or 0)
        avg_u = float(agg.avg_understanding or 0)
        avg_d = float(agg.avg_detection or 0)
        avg_s = float(agg.avg_support or 0)
        avg_r = float(agg.avg_return or 0)
        # SUS-like score: average of all dimensions mapped 1-5 → 0-100
        sus = round(((avg_o + avg_u + avg_d + avg_s + avg_r) / 5 - 1) / 4 * 100, 1)

        survey_stats = SurveyStats(
            total_responses=survey_count,
            avg_overall=round(avg_o, 2),
            avg_understanding=round(avg_u, 2),
            avg_detection=round(avg_d, 2),
            avg_support=round(avg_s, 2),
            avg_return=round(avg_r, 2),
            sus_score=sus,
        )

    # ─── 3. Feedback analysis ─────────────────────────────────────────────────
    total_fb = db.query(ChatLog).filter(ChatLog.feedback_helpful.isnot(None)).count()
    helpful = db.query(ChatLog).filter(ChatLog.feedback_helpful == True).count()  # noqa: E712
    unhelpful = db.query(ChatLog).filter(ChatLog.feedback_helpful == False).count()  # noqa: E712

    # Feedback breakdown by detection label
    by_label: dict = {}
    for label in ("CYBERBULLYING", "OFFENSIVE", "SAFE"):
        total_for_label = db.query(ChatLog).filter(
            ChatLog.detection_label == label,
            ChatLog.feedback_helpful.isnot(None)
        ).count()
        helpful_for_label = db.query(ChatLog).filter(
            ChatLog.detection_label == label,
            ChatLog.feedback_helpful == True  # noqa: E712
        ).count()
        by_label[label] = {
            "total_feedback": total_for_label,
            "helpful": helpful_for_label,
            "unhelpful": total_for_label - helpful_for_label,
            "helpful_rate": round(helpful_for_label / total_for_label, 4) if total_for_label > 0 else 0.0,
        }

    feedback_stats = FeedbackStats(
        total_feedback=total_fb,
        helpful_count=helpful,
        unhelpful_count=unhelpful,
        helpful_rate=round(helpful / total_fb, 4) if total_fb > 0 else 0.0,
        by_label=by_label,
    )

    return FullEvaluation(
        detection_metrics=detection_result,
        survey_stats=survey_stats,
        feedback_stats=feedback_stats,
    )


# ─── Survey Submission ────────────────────────────────────────────────────────

class SurveySubmit(BaseModel):
    user_id: Optional[int] = None
    session_id: Optional[str] = None
    q_overall: int
    q_understanding: int
    q_detection: int
    q_support: int
    q_return: int
    comment: Optional[str] = None


@router.post("/survey", status_code=201)
async def submit_survey(payload: SurveySubmit, db: Session = Depends(get_db)):
    """Save a user satisfaction survey response."""
    # Clamp values 1–5
    def clamp(v: int) -> int:
        return max(1, min(5, v))

    survey = SurveyResponse(
        user_id=payload.user_id,
        session_id=payload.session_id,
        q_overall=clamp(payload.q_overall),
        q_understanding=clamp(payload.q_understanding),
        q_detection=clamp(payload.q_detection),
        q_support=clamp(payload.q_support),
        q_return=clamp(payload.q_return),
        comment=payload.comment,
    )
    db.add(survey)
    db.commit()
    return {"status": "ok", "message": "Survey submitted. Thank you!"}
