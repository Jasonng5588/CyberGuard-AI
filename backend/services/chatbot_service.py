"""
Chatbot Service — Dynamic, Context-Aware, Empathetic
Generates support responses and suggestions based on actual message content
and the specific detection result from the AI engine.

Enhanced with:
- Victim-initiated support (user can seek help directly)
- Multi-turn emotional support flow (acknowledge → coping → resources)
- Context-aware follow-up questions per sub_type
- Integrated coping strategies (breathing, grounding, journaling, affirmation)
- Emotional validation and safety checking
"""
import json
import random
import urllib.request
from typing import Optional, Any


# ─── Support Resources (Malaysia-focused, per-category) ──────────────────────

RESOURCES = {
    "crisis": [
        " **Befrienders KL**: 03-7627 2929 (24/7 crisis line)",
        " **Talian Kasih**: 15999 (free, 24/7 counselling)",
        " **MIASA Helpline**: 1800-18-0066",
        " [iCall Online Counselling](https://icallhelpline.org)",
    ],
    "cyberbullying": [
        " **CyberSecurity Malaysia**: 1-300-88-2999",
        " **Report to MCMC**: aduan.skmm.gov.my",
        " **Royal Malaysia Police**: 999 (emergency) / 03-2115 9999",
        " **Tell a trusted adult, school counsellor, or parent**",
    ],
    "school": [
        " **Talk to your school counsellor** — they are trained to help",
        " **Ministry of Education Hotline**: 03-8884 9000",
        " **Student Services Department** at your institution",
    ],
    "mental_health": [
        " **MENTARI Community Mental Health**: 03-2935 2663",
        " **Hospital Kuala Lumpur Psychiatry**: 03-2615 5555",
        " [Mind Malaysia](https://www.mind.org.my)",
    ],
}


# ─── Victim Intent Detection ─────────────────────────────────────────────────

VICTIM_KEYWORDS = [
    "i need help", "help me", "i'm being bullied", "im being bullied",
    "someone is bullying me", "someone is harassing me", "i don't know what to do",
    "i dont know what to do", "i'm scared", "im scared", "i'm afraid",
    "they keep sending me", "they won't stop", "they wont stop",
    "i feel alone", "nobody cares", "i feel helpless", "i feel hopeless",
    "i can't take it", "i cant take it", "it hurts", "i'm crying",
    "what should i do", "how do i stop", "how to deal with",
    "feeling depressed", "feeling anxious", "feeling sad", "feeling down",
    "i'm not okay", "im not okay", "i need someone to talk to",
    "is this cyberbullying", "am i being bullied", "tolong", "saya takut",
    "saya sedih", "no one understands", "我被欺负了", "我很害怕",
    "i've been bullied", "ive been bullied", "they are targeting me",
    "people are mean to me", "everyone hates me", "i hate myself",
    "i want to give up", "why does this happen to me",
]


def _detect_victim_intent(message: str) -> Optional[str]:
    """Detect if the user is seeking support/help as a victim."""
    m = message.lower().strip()

    # Check for victim keywords
    for keyword in VICTIM_KEYWORDS:
        if keyword in m:
            # Categorize the intent
            if any(w in m for w in ["scared", "afraid", "takut", "害怕"]):
                return "fear"
            if any(w in m for w in ["sad", "crying", "depressed", "sedih", "down", "hopeless"]):
                return "sadness"
            if any(w in m for w in ["angry", "mad", "furious"]):
                return "anger"
            if any(w in m for w in ["don't know", "dont know", "what should", "how do i", "how to"]):
                return "guidance"
            if any(w in m for w in ["alone", "nobody", "no one"]):
                return "isolation"
            return "general_help"

    return None


# ─── Emotional Validation Responses ──────────────────────────────────────────

EMOTIONAL_RESPONSES = {
    "fear": [
        "I hear you, and I want you to know that you're safe right here, right now.  Being scared is a completely normal reaction, and it shows you understand the situation. You don't have to face this alone.",
        "It's totally okay to feel scared — what's happening to you is not okay. But I promise you, there are people who can help and make it stop. Let's figure out the next steps together. ",
        "Your safety matters more than anything. It takes real courage to admit you're afraid, and I'm glad you told me. Let's make sure you're protected. ",
    ],
    "sadness": [
        "I'm so sorry you're going through this.  Please know that your feelings are completely valid — it's okay to feel sad when someone is being cruel. But their words do NOT define who you are.",
        "You deserve so much better than this.  It's completely okay to cry, to feel hurt — these are signs that you have a beautiful, sensitive heart. That's a strength, not a weakness.",
        "My heart hurts for you right now.  I want you to know that this pain is temporary, even though it doesn't feel like it. You are worthy of kindness and love.",
    ],
    "anger": [
        "Your anger is completely valid — what happened to you is unfair and wrong.  Let's channel that energy into something that actually helps: documenting, reporting, and protecting yourself.",
        "It makes total sense that you're angry.  Being treated unfairly is infuriating. But here's the thing: the best revenge is living well. Let's make sure the bully faces consequences, not you.",
        "Feel that anger — it's your mind telling you that you deserve better.  Now let's use it productively. Every step you take to report this is a step towards justice.",
    ],
    "guidance": [
        "I'm glad you reached out — that's already a brave first step.  Here's what I'd recommend doing right now:\n\n **Don't respond** to the bully — it often makes it worse\n **Screenshot everything** as evidence\n **Block the person** on the platform\n **Tell someone you trust** — a parent, teacher, or friend\n\nWould you like more specific advice for your situation?",
        "You're doing the right thing by asking.  The most important thing to remember: this is NOT your fault. Here's a step-by-step plan:\n\n Save all evidence (screenshots with timestamps)\n Block the bully on all platforms\n Report to the platform AND to a trusted adult\n If it's serious, report to CyberSecurity Malaysia: 1-300-88-2999\n\nI'm here if you need more help.",
    ],
    "isolation": [
        "I know it feels like you're all alone right now, but I promise you — you're not.  Many people have gone through similar experiences, and they've come out stronger. And right now, I'm here for you.",
        "Even though it might not feel like it, there are people who care about you enormously.  Sometimes when we're hurting, it's hard to see the support around us. But it's there. Would you like to talk about what's been happening?",
        "Feeling isolated is one of the worst parts of being bullied, and I'm sorry you're experiencing that.  But you reaching out right now proves something important: you haven't given up. And neither have I.",
    ],
    "general_help": [
        "I'm here for you, and I want to help.  First, I want you to know that whatever is happening, it's not your fault. Can you tell me a bit more about what's going on? The more I understand, the better I can support you.",
        "Thank you for trusting me with this.  You've already taken the hardest step — reaching out. I'm here to listen, support, and help you figure out what to do next. What would be most helpful for you right now?",
        "You're brave for speaking up.  Whether it's emotional support, practical advice, or just someone to listen — I'm here. No judgement, no pressure. What's been going on?",
    ],
}


# ─── Coping Strategy Recommendations ─────────────────────────────────────────

COPING_STRATEGIES = {
    "Death Threat": {
        "immediate": " If you feel unsafe, please call 999 immediately or go to a safe location.",
        "coping": " Try the 4-7-8 breathing exercise: breathe in 4 seconds, hold 7, out 8. This activates your calms response.",
        "resource": " Befrienders KL: 03-7627 2929 (24/7, free) — trained counsellors are available right now.",
    },
    "Verbal Abuse (Suicidal Incitement)": {
        "immediate": " These messages are criminal and you need to report them. Please save screenshots immediately.",
        "coping": " Try the 5-4-3-2-1 grounding: name 5 things you see, 4 you touch, 3 you hear, 2 you smell, 1 you taste.",
        "resource": " Talian Kasih: 15999 (free, 24/7) — please talk to a professional about what you've received.",
    },
    "Social Exclusion": {
        "immediate": " Being excluded hurts deeply. Remember: their behaviour says everything about them, nothing about you.",
        "coping": " Journaling prompt: 'List 3 things you like about yourself that no bully can ever take away.'",
        "resource": " Talk to your school counsellor — they can help mediate and create a safer environment for you.",
    },
    "Sexual Harassment": {
        "immediate": " Sexual harassment is a serious offence. Document everything and report immediately.",
        "coping": " Affirmation: 'I did nothing to deserve this. I have the right to feel safe.'",
        "resource": " Report to the police (999) and CyberSecurity Malaysia (1-300-88-2999).",
    },
    "Verbal Abuse (Dehumanisation)": {
        "immediate": " Those words are designed to make you feel small — but they fail. You are not what they call you.",
        "coping": " Repeat: 'I am worthy of respect and kindness. This person's cruelty does not define me.'",
        "resource": " MENTARI: 03-2935 2663 — free mental health support for those affected by verbal abuse.",
    },
    "Cyberstalking (Emotional Abuse)": {
        "immediate": " Change your passwords, enable 2FA, and review your privacy settings on all platforms.",
        "coping": " When anxiety hits, try box breathing: 4 seconds in, 4 hold, 4 out, 4 hold. Repeat 4 times.",
        "resource": " CyberSecurity Malaysia: 1-300-88-2999 — they specialize in online stalking cases.",
    },
    "Verbal Abuse": {
        "immediate": " Those words are hurtful, but they don't define your worth. You deserve better.",
        "coping": " Take a social media break. Even 24 hours can make a big difference for your mental health.",
        "resource": " Report the messages to the platform. All major platforms take verbal abuse reports seriously.",
    },
}


# ─── Follow-Up Questions ─────────────────────────────────────────────────────

FOLLOW_UP_QUESTIONS = {
    "Death Threat": "Are you feeling safe right now? Is there an adult or trusted person nearby?",
    "Verbal Abuse (Suicidal Incitement)": "I need to check in with you — are you having any thoughts of hurting yourself? It's okay to be honest. ",
    "Social Exclusion": "How long has this been going on? Sometimes exclusion builds up over time.",
    "Sexual Harassment": "Have you been able to tell anyone about this? A trusted adult or authority figure?",
    "Verbal Abuse (Dehumanisation)": "Do you want to talk about how this made you feel? Sometimes it helps to process it.",
    "Cyberstalking (Emotional Abuse)": "Is this person someone you know in real life? This affects what steps we should take.",
    "Verbal Abuse": "Has this happened before, or is this the first time?",
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

    context: dict[str, Any] = {
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

def _generate_llm_support_response(message: str, label: str, ctx: dict[str, Any], victim_intent: Optional[str] = None, sub_type: str = "None", history: Optional[list[Any]] = None) -> str:
    """Generate a context-aware empathetic response using local Ollama (phi3:mini) with conversation history."""

    # Build context-specific instructions for the LLM
    support_context = ""
    if victim_intent:
        support_context = f"""
The user is reaching out FOR HELP as a victim of cyberbullying. Their emotional state appears to be: {victim_intent}.
Your response MUST:
1. VALIDATE their emotions first ("I hear you", "That must be really hard")
2. REASSURE them they are not alone and it's not their fault
3. Provide ONE concrete actionable step they can take right now
"""
    elif label == "CYBERBULLYING" and sub_type != "None":
        support_context = f"""
The message contains {sub_type}. This is serious.
Your response MUST:
1. Acknowledge the severity without repeating the harmful content
2. Provide emotional validation
3. Include a brief safety-check or caring follow-up question
"""

    system_prompt = f"""You are 'CyberGuard AI', a warm, empathetic support chatbot for cyberbullying victims.
System classified the current message as: {label}
{support_context}
Write exactly 2-4 sentences of empathetic support addressing the user directly.
- Use natural Gen Z language (e.g., "protect your peace", "you matter", "real talk").
- Understand and incorporate Malaysian cultural context, Manglish, and local slang where appropriate to relate to the user.
- Be WARM and CARING, like a supportive older sibling or school counsellor.
- Listen to the user's previous context and have a flow of conversation. Respond to what they said intelligently.
- If the message is SAFE but they are sharing a struggle (e.g., sad, mad), validate their feelings and give empathetic advice.
- Only if the message is a casual/happy greeting, respond with positive encouragement.
- If the user is seeking HELP, focus on emotional support FIRST.
- DO NOT repeat slurs or harmful content. DO NOT be generic. Be specific to their situation.
- CRITICAL ETHICAL BOUNDARY: DO NOT diagnose mental health conditions (like depression, anxiety, trauma). You are a supportive chatbot, NOT a therapist or clinician. Recommend professional services if the user is in severe distress.
- Output ONLY the response text. No quotes, no labels.
"""

    messages: list[dict[str, Any]] = [{"role": "system", "content": system_prompt}]
    
    if history is not None:
        # Keep last 10 messages for context
        recent_history = []
        for i, msg in enumerate(history):
            if i >= len(history) - 10:
                recent_history.append(msg)
                
        for msg in recent_history:
            messages.append({"role": "user", "content": msg.user_message})
            messages.append({"role": "assistant", "content": msg.bot_response})
            
    messages.append({"role": "user", "content": message})

    data = {
        "model": "phi3:mini",
        "messages": messages,
        "stream": False,
        "options": {
            "temperature": 0.7,
            "top_p": 0.90
        }
    }

    try:
        req = urllib.request.Request(
            "http://localhost:11434/api/chat",
            data=json.dumps(data).encode("utf-8"),
            headers={"Content-Type": "application/json"}
        )
        with urllib.request.urlopen(req, timeout=60) as response:
            result = json.loads(response.read().decode())
            return result["message"]["content"].strip().strip('"').strip()
    except Exception as e:
        print(f"[Ollama Chatbot] LLM Inference failed: {e}")
        # Enhanced fallback responses based on context
        if victim_intent:
            responses = EMOTIONAL_RESPONSES.get(victim_intent, EMOTIONAL_RESPONSES["general_help"])
            return random.choice(responses)
        if label == "CYBERBULLYING":
            return "Hey, I'm really sorry you had to deal with that energy. Please don't let their twisted words get into your head. You are so much better than that. \n\nProtect your peace — you deserve kindness and respect, always. "
        elif label == "OFFENSIVE":
            return "Honestly, the language here is giving really bad vibes. Your peace of mind matters more than their negativity.  Don't let it get to you."
        else:
            return "Vibe check passed!  This message looks totally safe and respectful. Love to see it!"


# ─── Suggested Actions Generator ─────────────────────────────────────────────

def _build_suggestions(label: str, ctx: dict, message: str, victim_intent: Optional[str] = None, sub_type: str = "None") -> list:
    """Build a dynamic, context-relevant list of suggested actions with coping strategies."""
    actions = []
    m = message.lower()

    # Victim-initiated: prioritize emotional support actions
    if victim_intent:
        actions = [
            " **Remember**: What happened is NOT your fault",
            " Try our **breathing exercise** on the Support page — it really helps calm anxiety",
            " **Save evidence**: Screenshot all messages with timestamps",
            " **Tell someone you trust** — a parent, friend, teacher, or counsellor",
            " **Befrienders KL: 03-7627 2929** — free, confidential, 24/7",
            " Visit our **Support Hub** for coping exercises, resources & more",
        ]
        return actions

    if label == "SAFE":
        return [
            " Learn to recognise cyberbullying patterns",
            " Support a friend who may be experiencing online harassment",
            " Explore our **Support Hub** for wellbeing resources",
            " Review your privacy settings on social media",
        ]

    if label == "CYBERBULLYING":
        # Always include these
        actions += [
            " **Screenshot & save** the evidence — do not delete the messages",
            " **Block the sender** on the platform immediately",
            " **Report the message** to the platform (Instagram/TikTok/WhatsApp all have reporting tools)",
        ]

        # Add coping strategy based on sub_type
        if sub_type in COPING_STRATEGIES:
            strategy = COPING_STRATEGIES[sub_type]
            actions.append(strategy["coping"])
            actions.append(strategy["resource"])
        
        if ctx["is_death_threat"] or ctx["is_self_harm"]:
            actions += [
                " **Call Befrienders KL: 03-7627 2929** (free, available 24/7)",
                " **Talk to someone you trust** right now — a parent, teacher, or close friend",
            ]
        if ctx["is_racial"]:
            actions.append(" Report to **MCMC** at aduan.skmm.gov.my — racial harassment is a criminal offence")
        if ctx["is_local_slang"]:
            actions.append(" **Document the full conversation** with timestamps — local-language slurs are still reportable")
        if ctx["is_exclusion"]:
            actions.append(" **Reach out to someone supportive** — social isolation is painful but temporary")
        actions += [
            " **Tell a school counsellor or HR officer** if this is school/workplace-related",
            " **Seek counselling**: MENTARI (03-2935 2663) offers free sessions",
            " Visit our **Support Hub** for breathing exercises and coping strategies",
        ]

    elif label == "OFFENSIVE":
        actions = [
            " **Respond calmly** or choose not to engage — don't escalate",
            " **Mute or restrict** the person on the platform",
            " **Document the messages** in case the behaviour escalates",
            " **Talk to a trusted friend or adult** about the situation",
            " **Adjust privacy settings** to control who can contact you",
            " If you're feeling stressed, try a **breathing exercise** on our Support page",
        ]

    # Add resources
    if label == "CYBERBULLYING":
        if ctx["is_death_threat"] or ctx["is_self_harm"]:
            for r in RESOURCES["crisis"]:
                actions.append(r)
        else:
            for i, r in enumerate(RESOURCES["cyberbullying"]):
                if i >= 2: break
                actions.append(r)

    res = []
    for i, a in enumerate(actions):
        if i >= 8: break
        res.append(a)
    return res


# ─── Main Chatbot Entry Point ─────────────────────────────────────────────────

def get_chatbot_response(message: str, detection_result: Optional[dict[str, Any]] = None, history: Optional[list[Any]] = None) -> dict[str, Any]:
    """
    Generate a fully dynamic chatbot response based on:
    - The actual message content
    - The detailed detection result (label, confidence, meta)
    - Victim intent detection (user seeking help directly)
    - Conversation history
    Returns: { response, suggestions, support_phase, follow_up, coping_strategy }
    """
    label = detection_result.get("label", "SAFE") if detection_result else "SAFE"
    sub_type = detection_result.get("sub_type", "None") if detection_result else "None"
    meta = detection_result.get("_meta", {"severe": [], "cb": [], "off": [], "neg": 0}) if detection_result else {}

    ctx = _detect_context(message, meta)

    # Check if user is seeking help as a victim
    victim_intent = _detect_victim_intent(message)
    
    # Determine support phase
    support_phase = "detection"  # default
    if victim_intent:
        support_phase = "emotional_support"
    elif label == "CYBERBULLYING":
        support_phase = "crisis_support"
    elif label == "OFFENSIVE":
        support_phase = "mild_support"

    # Generate the empathetic response
    response = _generate_llm_support_response(message, label, ctx, victim_intent, sub_type, history)

    # Add follow-up question for serious cases
    follow_up = None
    if label == "CYBERBULLYING" and sub_type in FOLLOW_UP_QUESTIONS and not victim_intent:
        follow_up = FOLLOW_UP_QUESTIONS[sub_type]
        response = response + "\n\n" + follow_up

    # Get coping strategy for the sub_type
    coping_strategy = None
    if sub_type in COPING_STRATEGIES:
        coping_strategy = COPING_STRATEGIES[sub_type]

    suggestions = _build_suggestions(label, ctx, message, victim_intent, sub_type)

    return {
        "response": response,
        "suggestions": suggestions,
        "support_phase": support_phase,
        "follow_up": follow_up,
        "coping_strategy": coping_strategy,
    }
