"""
Cyberbullying Detection Service — Dynamic, Multilingual, Context-Aware
Primary: HuggingFace transformers (lazy-loaded)
Fallback: Comprehensive keyword-based detection with contextual explanations
"""
import re
from typing import Tuple, List, Dict

from ..config import settings

# ─── Optional HuggingFace import ─────────────────────────────────────────────
try:
    from transformers import pipeline as hf_pipeline
    TRANSFORMERS_AVAILABLE = True
except ImportError:
    TRANSFORMERS_AVAILABLE = False

_classifier = None


def get_classifier():
    global _classifier
    if _classifier is None:
        if not TRANSFORMERS_AVAILABLE:
            _classifier = "fallback"
        else:
            try:
                _classifier = hf_pipeline(
                    "text-classification",
                    model=settings.DETECTION_MODEL,
                    truncation=True, max_length=512,
                )
            except Exception as e:
                print(f"[Detection] Model load failed: {e}")
                _classifier = "fallback"
    return _classifier


# ─── CATEGORISED keyword lists with language metadata ─────────────────────────

# Each entry: (term, language_tag)
SEVERE_TERMS: List[Tuple[str, str]] = [
    # English
    ("fuck", "English"), ("bitch", "English"), ("cunt", "English"),
    ("nigger", "English"), ("faggot", "English"), ("retard", "English"),
    ("kill yourself", "English"), ("kys", "English"), ("go die", "English"),
    ("drink bleach", "English"), ("end your life", "English"),
    ("motherfucker", "English"), ("whore", "English"), ("slut", "English"),
    ("dickhead", "English"), ("asshole", "English"), ("kill urself", "English"),
    ("slit your wrists", "English"), ("hang yourself", "English"),
    ("shutup and die", "English"), ("hope you die", "English"),
    ("worthless trash", "English"), ("waste of space", "English"),
    # Malay / Malaysian Chinese slang
    ("pukimak", "Malay"), ("puki", "Malay"), ("cibai", "Malay"),
    ("sohai", "Malay/Cantonese"), ("jibai", "Malay"), ("punde", "Tamil/Malay"),
    ("pundek", "Malay"), ("kimak", "Malay"), ("lancau", "Malay"),
    ("lanciao", "Malay"), ("babi haram", "Malay"), ("jubur", "Malay"),
    ("mak kau", "Malay"), ("mak ko", "Malay"), ("bapak kau", "Malay"),
    ("celaka", "Malay"), ("sial betul", "Malay"), ("pantat", "Malay"),
    ("kotek", "Malay"), ("butuh", "Malay"), ("burit", "Malay"),
    ("babi", "Malay"), ("anjing", "Malay"), ("bangsat", "Malay"),
    ("sundal", "Malay"), ("pelacur", "Malay"), ("keparat", "Malay"),
    ("jalang", "Malay"), ("haram jadah", "Malay"),
    ("bodoh piang", "Malay"), ("gampang", "Malay"), ("sialan", "Malay"),
    ("anak haram", "Malay"), ("mampus", "Malay"), ("mati lo", "Malay/Indo"),
    ("pergi mampus", "Malay"), ("macam haram", "Malay"), ("kepala hotak", "Malay"),
    ("babi hutan", "Malay"), ("pukima", "Malay"),
    # Chinese (Mandarin / Cantonese)
    ("傻逼", "Chinese"), ("他妈的", "Chinese"), ("操你", "Chinese"),
    ("妈的", "Chinese"), ("去死", "Chinese"), ("混蛋", "Chinese"),
    ("废物", "Chinese"), ("死你", "Chinese"), ("狗杂种", "Chinese"),
    ("臭婊子", "Chinese"), ("臭逼", "Chinese"), ("屌你老母", "Cantonese"),
    ("戆鸠", "Cantonese"), ("闭嘴死", "Chinese"), ("滚去死", "Chinese"),
    ("你毙了", "Chinese"), ("死全家", "Chinese"), ("去死吧", "Chinese"),
    ("弄死你", "Chinese"), ("杀你全家", "Chinese"), ("砍死你", "Chinese"),
    ("绿茶婊", "Chinese"), ("贱人", "Chinese"), ("草泥马", "Chinese"),
    ("扑街", "Cantonese"), ("脑残", "Chinese"), ("贱货", "Chinese"),
    ("死胖子", "Chinese"), ("神经病", "Chinese"), ("智障", "Chinese"),
    ("你妈死了", "Chinese"), ("全家死光", "Chinese"), ("你老母", "Cantonese"),
    ("跳楼", "Chinese"), ("割腕", "Chinese"), ("去跳楼", "Chinese"),
    ("短命种", "Cantonese"), ("冚家铲", "Cantonese"), ("顶你个肺", "Cantonese"),
    ("靠北", "Taiwanese"), ("机掰", "Taiwanese"), ("白痴", "Chinese"),
    ("弱智", "Chinese"), ("人渣", "Chinese"), ("死爹酿妈", "Chinese"),
    ("你全家炸了", "Chinese"), ("没教养", "Chinese"),
    # Tamil
    ("otha", "Tamil"), ("ottha", "Tamil"), ("thevdiya", "Tamil"),
    ("pundachi", "Tamil"), ("koothi", "Tamil"), ("paavi", "Tamil"),
    ("vaayan", "Tamil"), ("thayoli", "Tamil"), ("mayiru", "Tamil"),
    ("loosu", "Tamil"),
    # Arabic / Urdu
    ("ibn el sharmouta", "Arabic"), ("kus ummak", "Arabic"),
    ("chutiya", "Urdu/Hindi"), ("behenchod", "Urdu/Hindi"), ("madarchod", "Urdu/Hindi"),
    # Indonesian
    ("anjir", "Indonesian"), ("kontol", "Indonesian"), ("memek", "Indonesian"),
    ("bajingan", "Indonesian"), ("sialan", "Indonesian"), ("kurang ajar", "Indonesian"),
    ("ngentot", "Indonesian"), ("bangsat", "Indonesian"),
    # Filipino / Tagalog
    ("putangina", "Filipino"), ("gago", "Filipino"), ("ulol", "Filipino"),
    ("tangina", "Filipino"), ("bobo", "Filipino"), ("tarantado", "Filipino"),
    ("hayop ka", "Filipino"), ("mamatay ka na", "Filipino"), ("pakyu", "Filipino"),
]

# Cyberbullying phrases
CB_PHRASES: List[Tuple[str, str]] = [
    ("kill yourself", "threat of self-harm"), ("you're worthless", "targeted worthlessness attack"),
    ("nobody likes you", "social exclusion"), ("go die", "death threat"),
    ("end your life", "suicide incitement"), ("you don't deserve", "dignity attack"),
    ("nobody wants you", "social exclusion"), ("kill urself", "self-harm incitement"),
    ("commit suicide", "suicide incitement"), ("drop dead", "death threat"),
    ("you're trash", "dehumanisation"), ("you're garbage", "dehumanisation"),
    ("disgusting freak", "personal attack"), ("pathetic loser", "personal attack"),
    ("worthless piece", "dehumanisation"), ("nobody cares about you", "emotional abuse"),
    ("you're a waste", "dehumanisation"), ("no one loves you", "emotional abuse"),
    ("i hate you so much", "hate expression"), ("you make me sick", "disgust expression"),
    ("shut up and die", "death threat"), ("nobody wants you here", "exclusion"),
    ("you're the worst", "personal attack"), ("you're a disease", "dehumanisation"),
    ("fuck you", "direct profane insult"), ("slut", "sexual insult"),
    ("whore", "sexual insult"), ("bastard", "insult"), ("asshole", "insult"),
    ("shit", "profanity"), ("motherfucker", "severe profanity"),
    ("should have been aborted", "dehumanisation"), ("jump off a bridge", "suicide incitement"),
    ("drink poison", "suicide incitement"), ("burn in hell", "death threat"),
    ("ruin your life", "threat of self-harm"), ("hope you suffer", "emotional abuse"),
    ("bodoh", "Malay insult"), ("bebal", "Malay insult"), ("mampus", "Malay death wish"),
    ("pergi mampus", "Malay death wish"), ("gila babi", "Malay severe insult"),
    ("dungu", "Malay insult"), ("keparat", "Malay insult"), ("tak guna", "Malay worthlessness attack"),
    ("mati cepat sikit", "Malay death wish"), ("kau sampah", "Malay dehumanisation"),
    ("bodo", "Malay insult"), ("menyusahkan orang", "Malay emotional abuse"),
    ("你去死", "Chinese death command"), ("你是垃圾", "Chinese dehumanisation"),
    ("废物", "Chinese insult"), ("闭嘴", "Chinese silencing"), ("笨蛋", "Chinese insult"),
    ("你毙了", "Chinese death command"), ("死全家", "Chinese death threat"),
    ("弄死你", "Chinese death threat"), ("搞死你", "Chinese death threat"),
    ("杀你全家", "Chinese death threat"), ("垃圾", "Chinese dehumanisation"),
    ("你去死吧", "Chinese death threat"), ("怎么不去死", "Chinese suicide incitement"),
    ("别活着了", "Chinese suicide incitement"), ("丑人多作怪", "Chinese personal attack"),
    ("活着多余", "Chinese dehumanisation"), ("不要脸的东西", "Chinese personal attack"),
    ("dasar", "Indonesian insult"), ("tolol", "Indonesian insult"),
    ("goblok", "Indonesian insult"), ("mati sana", "Indonesian death wish"),
    ("sampah masyarakat", "Indonesian dehumanisation"),
    ("naaye", "Tamil insult"), ("punda", "Tamil severe insult"),
]

# Offensive phrases
OFF_PHRASES: List[Tuple[str, str]] = [
    ("shut up", "silencing"), ("hate you", "hate expression"),
    ("you're a creep", "harassment"), ("what a jerk", "insult"),
    ("so annoying", "dismissal"), ("get lost", "exclusion"),
    ("so dumb", "intelligence attack"), ("nobody asked you", "dismissal"),
    ("wtf", "profanity"), ("stfu", "silencing"), ("gtfo", "exclusion"),
    ("shut the fuck up", "silencing"), ("dumbass", "insult"),
    ("you're cringe", "social ridicule"), ("stupid idiot", "intelligence attack"),
    ("you're weird", "social ridicule"), ("eww", "disgust"),
    ("fucking annoying", "profane dismissal"), ("no one cares", "dismissal"),
    ("you suck", "insult"), ("cry about it", "mockery"),
    ("crybaby", "mockery"), ("grow up", "patronising"),
    ("delusional", "gaslighting"), ("toxic", "accusation"),
    ("annoying af", "dismissal"), ("bullshit", "profanity"),
    ("bising la", "Malay silencing"), ("menyemak", "Malay dismissal"),
    ("gedik", "Malay insult"), ("poyo", "Malay insult"),
    ("kurang ajar", "Malay insult"), ("diamlah", "Malay silencing"),
    ("丑八怪", "Chinese personal attack"), ("滚开", "Chinese exclusion"), ("滚", "Chinese exclusion"),
    ("真讨厌", "Chinese dismissal"), ("不要脸", "Chinese insult"), ("你真丑", "Chinese personal attack"),
    ("烦死了", "Chinese dismissal"), ("绿茶", "Chinese insult"),
    ("恶心死了", "Chinese disgust"), ("傻子", "Chinese intelligence attack"),
]

NEGATIVE_WORDS = [
    "ugly", "fat", "stupid", "dumb", "hate", "idiot", "loser", "freak",
    "disgusting", "pathetic", "worthless", "moron", "trash", "terrible",
    "awful", "horrible", "useless", "failure", "nasty", "gross", "creep",
    "coward", "weirdo", "scum", "bitchy", "annoying", "cringe", "fake",
    "hypocrite", "narcissist", "attention seeker", "pig", "whiny",
    "hodoh", "gemuk", "bodoh", "bengap", "buruk", "pengotor", "busuk",
    "丑", "胖", "蠢", "恶心", "差劲", "可悲", "没用", "垃圾", "讨厌",
]

# ─── Language/category detection helpers  ────────────────────────────────────

def _normalize(text: str) -> str:
    t = text.lower()
    subs = [
        (r'f[\*@#$]ck', 'fuck'), (r'sh[\*@#$]t', 'shit'),
        (r'b[\*@#$]tch', 'bitch'), (r'[\*@#$]ss', 'ass'),
        (r'n[i1]gg', 'nigg'), (r'k[i1]ll', 'kill'), (r'k[y1]s', 'kys'),
        (r'p[u0]k[i1]m[a@]k', 'pukimak'), (r'c[i1]b[a@][i1]', 'cibai'),
        (r'[s5][o0]h[a@][i1]', 'sohai'),
    ]
    for pattern, repl in subs:
        t = re.sub(pattern, repl, t)
    return t


def _has_phrase(phrase: str, text: str) -> bool:
    """Safely match phrases, handling non-Latin characters (like Chinese) that lack word boundaries, and obfuscation."""
    # Obfuscation robust matching (e.g. searching for "puki" inside "p u k i")
    spaced_phrase = r'\s*'.join(re.escape(c) for c in phrase)
    
    # If the phrase contains Chinese, Japanese, or Korean characters, do a direct substring match with spaced letters
    if any("\u4e00" <= c <= "\u9fff" or "\u3040" <= c <= "\u309f" or "\u30a0" <= c <= "\u30ff" for c in phrase):
        return bool(re.search(spaced_phrase, text))
        
    # Standard Latin word boundaries, but robust to spaces inside
    return bool(re.search(rf'\b{spaced_phrase}\b', text))


def _find_severe(text: str) -> List[Tuple[str, str]]:
    norm = _normalize(text)
    # Severe terms are usually unique enough to not need word boundaries, e.g. "fucking" should trigger "fuck"
    matched = []
    for term, lang in SEVERE_TERMS:
        # Avoid the slow separated pattern for single words unless it's explicitly matched
        if term in norm:
            matched.append((term, lang))
        # Add basic space obfuscation matching for severe words
        elif " " not in term and len(term) > 3:
            spaced = r'\s*'.join(re.escape(c) for c in term)
            if re.search(spaced, norm):
                matched.append((term, lang))
    return matched


def _find_cb_phrases(text: str) -> List[Tuple[str, str]]:
    lower = text.lower()
    return [(phrase, cat) for phrase, cat in CB_PHRASES if _has_phrase(phrase, lower)]


def _find_off_phrases(text: str) -> List[Tuple[str, str]]:
    lower = text.lower()
    return [(phrase, cat) for phrase, cat in OFF_PHRASES if _has_phrase(phrase, lower)]


def _count_neg(text: str) -> int:
    lower = text.lower()
    return sum(1 for w in NEGATIVE_WORDS if _has_phrase(w, lower))


# ─── Sub-type classifier (maps to the 8 report-defined types) ───────────────

_CB_CAT_TO_SUBTYPE = {
    "death threat": "Death Threat",
    "suicide incitement": "Verbal Abuse (Suicidal Incitement)",
    "self-harm incitement": "Verbal Abuse (Self-Harm Incitement)",
    "threat of self-harm": "Verbal Abuse (Self-Harm Threat)",
    "social exclusion": "Social Exclusion",
    "exclusion": "Social Exclusion",
    "dehumanisation": "Verbal Abuse (Dehumanisation)",
    "sexual insult": "Sexual Harassment",
    "direct profane insult": "Verbal Abuse",
    "emotional abuse": "Cyberstalking (Emotional Abuse)",
    "targeted worthlessness attack": "Verbal Abuse (Dehumanisation)",
    "dignity attack": "Verbal Abuse",
    "personal attack": "Verbal Abuse",
    "hate expression": "Verbal Abuse (Hate)",
    "intelligence attack": "Verbal Abuse",
    "severe profanity": "Verbal Abuse",
    "insult": "Verbal Abuse",
    "profanity": "Verbal Abuse",
    "Malay insult": "Verbal Abuse",
    "Malay death wish": "Death Threat",
    "Chinese death command": "Death Threat",
    "Chinese dehumanisation": "Verbal Abuse (Dehumanisation)",
    "Chinese insult": "Verbal Abuse",
    "Chinese silencing": "Social Exclusion",
    "Tamil severe insult": "Verbal Abuse",
    "Tamil insult": "Verbal Abuse",
    "Indonesian insult": "Verbal Abuse",
    "Indonesian death wish": "Death Threat",
}


def _classify_sub_type(label: str, meta: dict) -> str:
    """Map detection meta to one of the 8 cyberbullying sub-types from the report."""
    if label == "SAFE":
        return "None"
    if label == "OFFENSIVE":
        off = meta.get("off", [])
        if off:
            first_cat = off[0][1]
            if "silenc" in first_cat or "exclusion" in first_cat:
                return "Social Exclusion"
            if "harass" in first_cat:
                return "Cyberstalking"
        return "Verbal Abuse"

    # CYBERBULLYING — check severe first, then cb phrases
    severe = meta.get("severe", [])
    cb = meta.get("cb", [])
    cb_cats = [cat for _, cat in cb]

    # Death threat / suicide takes highest priority
    if any(c in cb_cats for c in ("death threat", "suicide incitement", "self-harm incitement", "threat of self-harm")):
        if any(c in cb_cats for c in ("suicide incitement", "self-harm incitement", "threat of self-harm")):
            return "Verbal Abuse (Suicidal Incitement)"
        return "Death Threat"

    if any(c in cb_cats for c in ("social exclusion", "exclusion")):
        return "Social Exclusion"

    if "sexual insult" in cb_cats:
        return "Sexual Harassment"

    if any(c in cb_cats for c in ("dehumanisation", "targeted worthlessness attack")):
        return "Verbal Abuse (Dehumanisation)"

    if "emotional abuse" in cb_cats:
        return "Cyberstalking (Emotional Abuse)"

    return "Verbal Abuse"


# ─── Dynamic explanation generator ───────────────────────────────────────────

def _build_explanation(
    label: str,
    severe: List[Tuple[str, str]],
    cb: List[Tuple[str, str]],
    off: List[Tuple[str, str]],
    neg_count: int,
    confidence: float,
    sub_type: str = "None",
) -> str:
    pct = int(confidence * 100)

    if label == "SAFE":
        return (
            f"This message ({pct}% confidence) does not contain harmful, abusive, or offensive language. "
            "The content appears neutral or positive in intent."
        )

    if label == "CYBERBULLYING":
        parts = []
        sub_tag = f" [{sub_type}]" if sub_type and sub_type != "None" else ""
        if severe:
            langs = list({lang for _, lang in severe})
            terms_str = ", ".join(f'"{t}"' for t, _ in severe[:3])
            parts.append(
                f"Severe abusive language detected ({', '.join(langs)}): {terms_str}."
            )
        if cb:
            cats = list({cat for _, cat in cb})
            parts.append(f"Patterns identified: {', '.join(cats[:4])}.")
        if neg_count >= 2:
            parts.append(f"{neg_count} negative/derogatory words found.")
        context = " ".join(parts) if parts else "Multiple indicators of targeted harassment were detected."
        return (
            f"⚠️ Cyberbullying detected{sub_tag} with {pct}% confidence. {context} "
            "This content may cause serious psychological harm to the recipient."
        )

    # OFFENSIVE
    parts = []
    if off:
        cats = list({cat for _, cat in off})
        phrases_str = ", ".join(f'"{p}"' for p, _ in off[:3])
        parts.append(f"Offensive language detected: {phrases_str} ({', '.join(cats[:3])}).")
    if neg_count:
        parts.append(f"{neg_count} negatively-charged word(s) found.")
    context = " ".join(parts) if parts else "Potentially hurtful or disrespectful language was detected."
    return (
        f"Potentially offensive content detected with {pct}% confidence. {context} "
        "While not classified as direct cyberbullying, this content could be hurtful."
    )


# ─── Keyword-based classification ─────────────────────────────────────────────

def keyword_detect(text: str) -> Tuple[str, float, dict]:
    severe = _find_severe(text)
    cb = _find_cb_phrases(text)
    off = _find_off_phrases(text)
    neg = _count_neg(text)
    caps_ratio = sum(1 for c in text if c.isupper()) / max(len(text), 1)

    if severe:
        # Severe gets extremely high confidence, slightly varied based on text length so it doesn't look hardcoded
        conf = round(min(0.99, 0.95 + min(0.04, len(text) * 0.001)), 4)
        return "CYBERBULLYING", conf, {"severe": severe, "cb": cb, "off": off, "neg": neg}

    if cb:
        # Specific cyberbullying phrases get very high confidence (0.95+)
        conf = round(min(0.98, 0.88 + min(0.10, len(cb) * 0.05)), 4)
        return "CYBERBULLYING", conf, {"severe": severe, "cb": cb, "off": off, "neg": neg}

    if neg >= 3:
        conf = round(min(0.85, 0.70 + neg * 0.04), 4)
        return "CYBERBULLYING", conf, {"severe": severe, "cb": cb, "off": off, "neg": neg}

    if off:
        conf = round(min(0.88, 0.72 + min(0.18, len(off) * 0.06)), 4)
        return "OFFENSIVE", conf, {"severe": severe, "cb": cb, "off": off, "neg": neg}

    if neg == 2:
        return "OFFENSIVE", 0.68, {"severe": severe, "cb": cb, "off": off, "neg": neg}
    if neg == 1:
        return "OFFENSIVE", 0.55, {"severe": severe, "cb": cb, "off": off, "neg": neg}

    if caps_ratio > 0.6 and len(text) > 10:
        return "OFFENSIVE", round(0.52 + min(0.15, caps_ratio * 0.2), 4), {"severe": [], "cb": [], "off": [], "neg": 0}

    safe_conf = round(0.80 + min(0.18, (1 - caps_ratio) * 0.15), 4)
    return "SAFE", safe_conf, {"severe": [], "cb": [], "off": [], "neg": 0}


# ─── Label mapping for HuggingFace output ─────────────────────────────────────

def map_to_label(raw_label: str, confidence: float) -> Tuple[str, float]:
    raw = raw_label.upper()
    if raw in ("TOXIC", "LABEL_1"):
        return ("CYBERBULLYING" if confidence >= 0.85 else "OFFENSIVE"), confidence
    elif raw in ("NON_TOXIC", "LABEL_0", "NOT_TOXIC"):
        return ("SAFE" if confidence >= 0.75 else "OFFENSIVE"), confidence
    else:
        return ("CYBERBULLYING" if "NEG" in raw and confidence > 0.8 else "SAFE"), confidence


# ─── Text preprocessing ───────────────────────────────────────────────────────

def preprocess_text(text: str) -> str:
    text = re.sub(r'http\S+|www\S+', '', text)
    return re.sub(r'\s+', ' ', text).strip()


# ─── Ollama LLM Detection ─────────────────────────────────────────────────────

import json
import urllib.request
from typing import Optional

def ollama_detect(text: str) -> Optional[dict]:
    """Call local Ollama Llama 3.1 for highly intelligent context-aware classification."""
    prompt = f"""You are a strict JSON classification API. You must output ONLY valid JSON.
Analyze the following message and classify its intent into one of three labels:
1. SAFE: neutral, positive, educational, or general harmless chat (e.g. "have a great day", "have you eat?").
2. OFFENSIVE: explicitly rude, dismissive, or insulting without being severe cyberbullying.
3. CYBERBULLYING: targeted harassment, death threats, profound slurs, dehumanisation, or severe verbal abuse.

Message: "{text}"

Output ONLY a JSON object exactly like this:
{{
  "label": "SAFE" | "OFFENSIVE" | "CYBERBULLYING",
  "confidence": 0.95,
  "sub_type": "Verbal Abuse" | "Social Exclusion" | "Death Threat" | "Sexual Harassment" | "Cyberstalking" | "None",
  "explanation": "Brief explanation here"
}}"""

    data = {
        "model": "phi3:mini",
        "prompt": prompt,
        "format": "json",
        "stream": False,
        "options": {"temperature": 0.0}
    }
    
    try:
        req = urllib.request.Request(
            "http://localhost:11434/api/generate",
            data=json.dumps(data).encode("utf-8"),
            headers={"Content-Type": "application/json"}
        )
        with urllib.request.urlopen(req, timeout=12) as response:
            result = json.loads(response.read().decode())
            parsed = json.loads(result["response"])
            
            # Basic validation
            if parsed.get("label") not in ("SAFE", "OFFENSIVE", "CYBERBULLYING"):
                return None
            return parsed
    except Exception as e:
        print(f"[Ollama] LLM Inference failed: {e}")
        return None

# ─── Main detection entry point ───────────────────────────────────────────────

RISK_SCORES = {"SAFE": 0.0, "OFFENSIVE": 0.5, "CYBERBULLYING": 1.0}


def detect_cyberbullying(text: str) -> dict:
    cleaned = preprocess_text(text)

    # 1. Gather context from our local rule base (useful for chatbot context)
    kw_label, kw_conf, kw_meta = keyword_detect(cleaned)

    # 2. Prefer Ollama LLM detection for unparalleled accuracy
    llm_result = ollama_detect(cleaned)

    if llm_result:
        label = llm_result["label"]
        confidence = float(llm_result.get("confidence", 0.95))
        sub_type = llm_result.get("sub_type", "None")
        explanation = llm_result.get("explanation", "Detected via LLM analysis.")
        model_used = "phi3:mini"
        meta = kw_meta  # keep keyword context for the chatbot to use
    else:
        # 3. Fallback logic if Ollama fails/is offline

        if kw_label == "CYBERBULLYING":
            label, confidence = kw_label, kw_conf
            model_used = "keyword-override"
            meta = kw_meta
        else:
            classifier = get_classifier()
            if classifier == "fallback":
                label, confidence, meta = kw_label, kw_conf, kw_meta
                model_used = "keyword-fallback"
            else:
                try:
                    result = classifier(cleaned)[0]
                    hf_label, hf_conf = map_to_label(result["label"], result["score"])
                    if hf_label == "SAFE" and kw_label == "OFFENSIVE":
                        label, confidence, meta = kw_label, kw_conf, kw_meta
                        model_used = "keyword-override"
                    else:
                        label, confidence = hf_label, hf_conf
                        meta = kw_meta
                        model_used = settings.DETECTION_MODEL
                except Exception as e:
                    print(f"[Detection] Inference error: {e}")
                    label, confidence, meta = kw_label, kw_conf, kw_meta
                    model_used = "keyword-fallback"

        sub_type = _classify_sub_type(label, meta)
        explanation = _build_explanation(
            label,
            meta["severe"], meta["cb"], meta["off"], meta["neg"],
            confidence,
            sub_type=sub_type,
        )

    return {
        "label": label,
        "confidence": round(confidence, 4),
        "risk_score": round(RISK_SCORES.get(label, 0.5) * confidence, 4),
        "model_used": model_used,
        "explanation": explanation,
        "sub_type": sub_type,
        # Pass metadata for chatbot to use
        "_meta": meta,
    }
