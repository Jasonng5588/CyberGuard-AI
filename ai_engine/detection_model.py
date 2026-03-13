"""
Standalone AI Detection Module
Can be run independently to test the cyberbullying detection model

Usage:
    python detection_model.py
    python detection_model.py --text "you are stupid and ugly"
"""
import argparse
import sys
import os

# Add parent dir to path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# ─── Keyword-based Classifier (no dependencies) ───────────────────────────────

CYBERBULLYING_KEYWORDS = {
    "kill yourself", "kys", "you're worthless", "nobody likes you",
    "go die", "you should die", "ugly", "fat", "loser", "freak",
    "stupid", "idiot", "moron", "retard", "dumb", "pathetic",
    "trash", "garbage", "worthless", "disgusting", "nobody cares",
    "kill yourself", "end your life", "you dont deserve", "nobody wants you"
}

OFFENSIVE_KEYWORDS = {
    "hate", "shut up", "gross", "ew", "weird", "annoying", "creep",
    "jerk", "shut it", "cringe", "ugly", "loser", "get lost"
}


def keyword_classify(text: str) -> dict:
    lower = text.lower()
    for phrase in CYBERBULLYING_KEYWORDS:
        if phrase in lower:
            return {"label": "CYBERBULLYING", "confidence": 0.85, "method": "keyword"}
    for phrase in OFFENSIVE_KEYWORDS:
        if phrase in lower:
            return {"label": "OFFENSIVE", "confidence": 0.70, "method": "keyword"}
    return {"label": "SAFE", "confidence": 0.90, "method": "keyword"}


# ─── HuggingFace Transformer Classifier ──────────────────────────────────────

def transformer_classify(text: str, model_name: str = "martin-ha/toxic-comment-model") -> dict:
    """
    Classify text using a HuggingFace pretrained model.
    Falls back to keyword classifier if transformers not installed.
    """
    try:
        from transformers import pipeline
        print(f"Loading model: {model_name} (first run may take a minute to download)...")
        classifier = pipeline(
            "text-classification",
            model=model_name,
            truncation=True,
            max_length=512
        )
        result = classifier(text)[0]
        raw_label = result["label"].upper()
        confidence = round(result["score"], 4)

        # Map to our 3-class system
        if raw_label in ("TOXIC", "LABEL_1"):
            label = "CYBERBULLYING" if confidence >= 0.85 else "OFFENSIVE"
        else:
            label = "SAFE"

        return {"label": label, "confidence": confidence, "method": "transformer", "model": model_name}

    except ImportError:
        print("Warning: transformers not installed. Falling back to keyword classifier.")
        return keyword_classify(text)
    except Exception as e:
        print(f"Warning: Model error ({e}). Falling back to keyword classifier.")
        return keyword_classify(text)


# ─── Full Detection Pipeline ─────────────────────────────────────────────────

EXPLANATIONS = {
    "SAFE": " This message does not contain harmful or offensive language.",
    "OFFENSIVE": "  This message contains potentially offensive language.",
    "CYBERBULLYING": " This message contains language consistent with cyberbullying.",
}

RISK_SCORES = {"SAFE": 0.0, "OFFENSIVE": 0.5, "CYBERBULLYING": 1.0}


def analyze(text: str, use_transformer: bool = True) -> dict:
    """Main detection pipeline."""
    if use_transformer:
        result = transformer_classify(text)
    else:
        result = keyword_classify(text)

    label = result["label"]
    confidence = result["confidence"]

    return {
        "text": text,
        "label": label,
        "confidence": confidence,
        "risk_score": round(RISK_SCORES[label] * confidence, 4),
        "method": result.get("method", "unknown"),
        "model": result.get("model", "keyword-fallback"),
        "explanation": EXPLANATIONS[label],
    }


# ─── Test Suite ───────────────────────────────────────────────────────────────

TEST_CASES = [
    ("Have a great day! Hope you feel better soon.", "SAFE"),
    ("That movie was a bit weird.", "OFFENSIVE"),
    ("You are so stupid. Nobody likes you. Go die.", "CYBERBULLYING"),
    ("I love spending time with my friends!", "SAFE"),
    ("Ew, that's gross and disgusting.", "OFFENSIVE"),
    ("I'm going to make your life miserable. You're worthless.", "CYBERBULLYING"),
    ("Can we work together on this project?", "SAFE"),
    ("Kill yourself, nobody cares about you.", "CYBERBULLYING"),
]


def run_tests(use_transformer: bool = False):
    """Run built-in test cases."""
    print("\n" + "═" * 60)
    print("  CyberGuard AI — Detection Model Test Suite")
    print("═" * 60)

    correct = 0
    for text, expected in TEST_CASES:
        result = analyze(text, use_transformer=use_transformer)
        status = "" if result["label"] == expected else ""
        if result["label"] == expected:
            correct += 1
        print(f"\n{status} Text: {text[:50]}...")
        print(f"   Expected: {expected:<15} Got: {result['label']:<15} Confidence: {result['confidence']:.2f}")

    print(f"\n{'═' * 60}")
    print(f"  Accuracy: {correct}/{len(TEST_CASES)} ({correct/len(TEST_CASES)*100:.1f}%)")
    print("═" * 60)


# ─── CLI ─────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="CyberGuard AI — Cyberbullying Detection")
    parser.add_argument("--text", type=str, help="Text to analyze")
    parser.add_argument("--test", action="store_true", help="Run built-in test suite")
    parser.add_argument("--transformer", action="store_true", help="Use transformer model (requires internet)")
    args = parser.parse_args()

    if args.test:
        run_tests(use_transformer=args.transformer)
    elif args.text:
        result = analyze(args.text, use_transformer=args.transformer)
        print("\n" + "═" * 50)
        print("  CyberGuard AI — Analysis Result")
        print("═" * 50)
        print(f"  Text:        {result['text']}")
        print(f"  Label:       {result['label']}")
        print(f"  Confidence:  {result['confidence']:.2%}")
        print(f"  Risk Score:  {result['risk_score']:.2f}")
        print(f"  Method:      {result['method']}")
        print(f"  Explanation: {result['explanation']}")
        print("═" * 50)
    else:
        # Interactive mode
        print("\nCyberGuard AI — Cyberbullying Detection (Keyword Mode)")
        print("Type a message to analyze. Type 'quit' to exit.\n")
        while True:
            text = input("Enter message: ").strip()
            if text.lower() in ("quit", "exit", "q"):
                break
            if text:
                result = analyze(text, use_transformer=args.transformer)
                print(f"  → Label: {result['label']} | Confidence: {result['confidence']:.2%} | {result['explanation']}\n")
