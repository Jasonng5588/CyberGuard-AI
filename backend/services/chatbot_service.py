"""
Chatbot Service — Dynamic, Context-Aware, Empathetic
Generates support responses and suggestions based on actual message content
and the specific detection result from the AI engine.
"""
import json
import random
import urllib.request
from typing import Optional


# ─── Support Resources (Malaysia-focused, per-category) ──────────────────────

RESOURCES = {
    "crisis": [
        "🆘 **Befrienders KL**: 03-7627 2929 (24/7 crisis line)",
        "📞 **Talian Kasih**: 15999 (free, 24/7 counselling)",
        "💛 **MIASA Helpline**: 1800-18-0066",
        "🌐 [iCall Online Counselling](https://icallhelpline.org)",
    ],
    "cyberbullying": [
        "🛡️ **CyberSecurity Malaysia**: 1-300-88-2999",
        "📋 **Report to MCMC**: aduan.skmm.gov.my",
        "👮 **Royal Malaysia Police**: 999 (emergency) / 03-2115 9999",
        "📱 **Tell a trusted adult, school counsellor, or parent**",
    ],
    "school": [
        "📚 **Talk to your school counsellor** — they are trained to help",
        "🏫 **Ministry of Education Hotline**: 03-8884 9000",
        "👥 **Student Services Department** at your institution",
    ],
    "mental_health": [
        "💬 **MENTARI Community Mental Health**: 03-2935 2663",
        "🧠 **Hospital Kuala Lumpur Psychiatry**: 03-2615 5555",
        "🌐 [Mind Malaysia](https://www.mind.org.my)",
    ],
}


# ─── Category helpers ─────────────────────────────────────────────────────────

def _detect_context(message: str, meta: dict) -> dict:
    """
    Analyse the message and detection metadata to identify
    the most relevant context for generating a response.
    """
    m = message.lower()
    severe = meta.get("severe", [])
    cb = meta.get("cb", [])

    context = {
        "is_death_threat": False,
        "is_self_harm": False,
        "is_exclusion": False,
        "is_body_attack": False,
        "is_intelligence_attack": False,
        "is_sexual_insult": False,
        "is_racial": False,
        "is_local_slang": False,
        "languages": set(),
    }

    # Collect languages from detected terms
    for _, lang in severe:
        context["languages"].add(lang)

    # Pattern categories
    cb_cats = {cat for _, cat in cb}
    if any(c in cb_cats for c in ("death threat", "suicide incitement", "self-harm incitement")):
        context["is_death_threat"] = True
    if any(c in cb_cats for c in ("social exclusion", "exclusion")):
        context["is_exclusion"] = True
    if "sexual insult" in cb_cats:
        context["is_sexual_insult"] = True
    if "dehumanisation" in cb_cats or "targeted worthlessness attack" in cb_cats:
        context["is_self_harm"] = True
    if "intelligence attack" in cb_cats:
        context["is_intelligence_attack"] = True

    # Local slang check
    local_langs = {"Malay", "Malay/Cantonese", "Tamil/Malay", "Cantonese", "Tamil"}
    if context["languages"] & local_langs:
        context["is_local_slang"] = True

    # Keyword checks in the raw message
    if any(w in m for w in ["race", "racist", "racism", "melayu", "cina", "india", "negro"]):
        context["is_racial"] = True
    if any(w in m for w in ["fat", "ugly", "weight", "appearance"]):
        context["is_body_attack"] = True

    return context


# ─── Bot Response Generator ───────────────────────────────────────────────────

def _generate_llm_support_response(message: str, label: str, ctx: dict) -> str:
    """Generate an infinitely unique, context-aware Gen-Z empathetic response using local Ollama (phi3:mini)."""
    
    prompt = f"""You are 'CyberGuard AI', an empathetic support chatbot.
A user received this message: "{message}"
System classified it as: {label}

Write exactly 2-3 sentences of empathetic support addressing the user directly.
- Use natural Gen Z language (e.g., "protect your peace", "vibe check", "red flags").
- If the message is SAFE, just respond with positive encouragement.
- DO NOT repeat their slurs. DO NOT write a long paragraph. DO NOT hallucinate.
- Output ONLY the final response text. No quotes.
"""
    data = {
        "model": "phi3:mini",
        "prompt": prompt,
        "stream": False,
        "options": {
            "temperature": 0.7,
            "top_p": 0.90
        }
    }
    
    try:
        req = urllib.request.Request(
            "http://localhost:11434/api/generate",
            data=json.dumps(data).encode("utf-8"),
            headers={"Content-Type": "application/json"}
        )
        with urllib.request.urlopen(req, timeout=15) as response:
            result = json.loads(response.read().decode())
            return result["response"].strip().strip('"').strip()
    except Exception as e:
        print(f"[Ollama Chatbot] LLM Inference failed: {e}")
        # Fallback if AI crashes/times out
        if label == "CYBERBULLYING":
            return "Hey, I'm really sorry you had to deal with that energy. Please don't let their twisted words get into your head. You are so much better than that. 🌟\n\nProtect your peace."
        elif label == "OFFENSIVE":
            return "Honestly, the language they used here is giving really bad vibes. Protect your peace ✨"
        else:
            return "Vibe check passed! ✅ This message looks totally safe and respectful. Love to see it!"


# ─── Suggested Actions Generator ─────────────────────────────────────────────

def _build_suggestions(label: str, ctx: dict, message: str) -> list:
    """Build a dynamic, context-relevant list of suggested actions."""
    actions = []
    m = message.lower()

    if label == "SAFE":
        return [
            "📚 Learn to recognise cyberbullying patterns",
            "🤝 Support a friend who may be experiencing online harassment",
            "💡 Explore our resources on digital wellbeing",
            "🛡️ Review your privacy settings on social media",
        ]

    if label == "CYBERBULLYING":
        # Always include these
        actions += [
            "📸 **Screenshot & save** the evidence — do not delete the messages",
            "🔒 **Block the sender** on the platform immediately",
            "🚫 **Report the message** to the platform (Instagram/TikTok/WhatsApp all have reporting tools)",
        ]
        if ctx["is_death_threat"] or ctx["is_self_harm"]:
            actions += [
                "📞 **Call Befrienders KL: 03-7627 2929** (free, available 24/7)",
                "❤️ **Talk to someone you trust** right now — a parent, teacher, or close friend",
            ]
        if ctx["is_racial"]:
            actions.append("🏛️ Report to **MCMC** at aduan.skmm.gov.my — racial harassment is a criminal offence")
        if ctx["is_local_slang"]:
            actions.append("📋 **Document the full conversation** with timestamps — local-language slurs are still reportable")
        if ctx["is_exclusion"]:
            actions.append("🧑‍🤝‍🧑 **Reach out to someone supportive** — social isolation is painful but temporary")
        actions += [
            "🏫 **Tell a school counsellor or HR officer** if this is school/workplace-related",
            "🧠 **Seek counselling**: MENTARI (03-2935 2663) offers free sessions",
        ]

    elif label == "OFFENSIVE":
        actions = [
            "💬 **Respond calmly** or choose not to engage — don't escalate",
            "🔕 **Mute or restrict** the person on the platform",
            "📸 **Document the messages** in case the behaviour escalates",
            "🗣️ **Talk to a trusted friend or adult** about the situation",
            "⚙️ **Adjust privacy settings** to control who can contact you",
        ]

    # Add resources
    if label == "CYBERBULLYING":
        if ctx["is_death_threat"] or ctx["is_self_harm"]:
            for r in RESOURCES["crisis"]:
                actions.append(r)
        else:
            for r in RESOURCES["cyberbullying"][:2]:
                actions.append(r)

    return actions[:7]  # Cap at 7 suggestions


# ─── Main Chatbot Entry Point ─────────────────────────────────────────────────

def get_chatbot_response(message: str, detection_result: Optional[dict] = None) -> dict:
    """
    Generate a fully dynamic chatbot response based on:
    - The actual message content
    - The detailed detection result (label, confidence, meta)
    Returns: { response, suggestions }
    """
    label = detection_result.get("label", "SAFE") if detection_result else "SAFE"
    meta = detection_result.get("_meta", {"severe": [], "cb": [], "off": [], "neg": 0}) if detection_result else {}

    ctx = _detect_context(message, meta)

    response = _generate_llm_support_response(message, label, ctx)

    suggestions = _build_suggestions(label, ctx, message)

    return {
        "response": response,
        "suggestions": suggestions,
    }
