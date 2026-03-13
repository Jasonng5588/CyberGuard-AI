"""
Standalone Chatbot Engine
Can be run independently to test chatbot responses

Usage:
    python chatbot_engine.py
    python chatbot_engine.py --label CYBERBULLYING
"""
import argparse
import random
import sys
import os
from typing import Dict, List, Optional

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# ─── Response Database ────────────────────────────────────────────────────────

RESPONSES: Dict[str, List[str]] = {
    "CYBERBULLYING": [
        "I'm really sorry you experienced that. What happened to you is not okay, and you deserve to be treated with respect and kindness. ",
        "That must have been really hurtful. Please know that the words of bullies do not define your worth. You are valued and important.",
        "I hear you, and I want you to know you're not alone. Many people go through this, and there is always support available for you.",
        "What you experienced sounds really difficult. Remember — the problem is with the bully, not with you. You deserve kindness.",
        "Your feelings are completely valid. Being targeted online is a real form of harm and it's right to take it seriously. ",
    ],
    "OFFENSIVE": [
        "I noticed that message contains some harsh language. If someone sent that to you, please don't let it affect your self-worth.",
        "It seems like this message has some negativity. Would you like to talk about what's been going on?",
        "That kind of language can be hurtful. You don't deserve to be spoken to that way. How are you feeling right now?",
        "Some language online can be really unkind. If this is affecting you, it's completely okay to step away and take a break.",
    ],
    "SAFE": [
        "Hello! I'm CyberGuard AI. I'm here to help you with any concerns about online interactions. ",
        "Everything looks fine! If you ever receive a message that worries you, feel free to share it with me.",
        "That message looks perfectly safe. Is there anything on your mind you'd like to talk about?",
        "Great! Remember — if anything ever makes you uncomfortable online, you can always come here to talk.",
    ],
    "GENERAL": [
        "I'm here to listen. Tell me more about what's been happening.",
        "Thank you for sharing that with me. How long has this been going on?",
        "You're brave for reaching out. Would you like some advice on what to do next?",
        "I understand. Please know you're not alone in this.",
    ]
}

SUGGESTIONS: Dict[str, List[str]] = {
    "CYBERBULLYING": [
        " Block and report the person on the platform immediately.",
        " Take screenshots as evidence before blocking.",
        " Tell a trusted adult, teacher, or school counselor.",
        " Malaysia Befrienders: 03-7627 2929 | Crisis Text: Text HOME to 741741",
        " Review your privacy settings on all social media.",
        " Remember: It is NEVER your fault. Bullies bully because of their own problems.",
    ],
    "OFFENSIVE": [
        " You can mute or restrict the person without blocking them.",
        " Take a break from social media if it's affecting your mood.",
        " Journal how you're feeling — writing can really help.",
        " Talk to a friend or someone you trust.",
    ],
    "SAFE": [
        " Keep enjoying positive online interactions!",
        " If anything ever feels wrong, check messages here.",
        " Learn more about online safety at stopbullying.gov",
    ],
}

EMOTION_MAP = {
    "CYBERBULLYING": "distressed",
    "OFFENSIVE": "concerned",
    "SAFE": "neutral",
}

INTENT_RESPONSES: Dict[str, str] = {
    "help": "Of course! Here's what you can do: document the incident, block the user, and report it to a trusted adult or school authority.",
    "advice": "My top advice: don't respond to the bully — it often makes things worse. Block, screenshot, report, and talk to someone.",
    "scared": "It's completely understandable to feel scared. You are safe here. Would you like me to share some support resources?",
    "sad": "I'm so sorry you're feeling sad.  It's okay to cry. But please know things can get better.",
    "angry": "Your anger makes complete sense. Channel that energy into reporting and making change rather than responding to the bully.",
    "thank": "You're so welcome! Take care of yourself. Remember — you deserve kindness and respect, always. ",
}


# ─── Core Engine ─────────────────────────────────────────────────────────────

def detect_intent(message: str) -> Optional[str]:
    lower = message.lower()
    for keyword, response in INTENT_RESPONSES.items():
        if keyword in lower:
            return keyword
    return None


def generate_response(message: str, detection_label: Optional[str] = None) -> Dict:
    """Generate empathetic chatbot response."""
    intent = detect_intent(message)

    if intent:
        response = INTENT_RESPONSES[intent]
    else:
        label = detection_label or "GENERAL"
        responses = RESPONSES.get(label, RESPONSES["GENERAL"])
        response = random.choice(responses)

    label = detection_label or "SAFE"
    suggestions = SUGGESTIONS.get(label, SUGGESTIONS["SAFE"])
    emotion = EMOTION_MAP.get(label, "neutral")

    return {
        "user_message": message,
        "bot_response": response,
        "emotion_detected": emotion,
        "suggestions": suggestions[:4],
    }


# ─── Interactive CLI ──────────────────────────────────────────────────────────

def chat_session(label: Optional[str] = None):
    print("\n" + "═" * 60)
    print("  CyberGuard AI — Support Chatbot")
    print("  Type your message. Type 'quit' to exit.")
    print("═" * 60 + "\n")

    history = []

    while True:
        user_input = input("You: ").strip()
        if not user_input:
            continue
        if user_input.lower() in ("quit", "exit", "q"):
            print("\nCyberGuard: Take care! Remember, you are never alone. \n")
            break

        result = generate_response(user_input, label)
        history.append(result)

        print(f"\nCyberGuard: {result['bot_response']}")
        print(f"[Emotion detected: {result['emotion_detected']}]")

        if result["suggestions"]:
            print("\nSuggestions:")
            for s in result["suggestions"][:2]:
                print(f"  {s}")
        print()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="CyberGuard AI — Support Chatbot")
    parser.add_argument("--label", choices=["SAFE", "OFFENSIVE", "CYBERBULLYING"],
                        help="Simulate detection label context")
    args = parser.parse_args()
    chat_session(label=args.label)
