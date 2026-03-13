"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
    Heart, Phone, MessageCircle, BookOpen, Wind, Eye, Sparkles,
    Shield, ChevronDown, ChevronUp, ExternalLink, ArrowRight,
    Smile, Meh, AlertTriangle, HeartHandshake,
    LifeBuoy, FileText, Brain, GraduationCap,
    Hand, Ear, Coffee, Utensils, Flame, CloudRain
} from "lucide-react";

/* ─── Data ─────────────────────────────────────────────────────────────── */

const MOODS = [
    { icon: <Smile size={28} color="#34d399" />, label: "I'm okay", color: "#34d399", key: "okay" },
    { icon: <Meh size={28} color="#fbbf24" />, label: "Not great", color: "#fbbf24", key: "notgreat" },
    { icon: <CloudRain size={28} color="#60a5fa" />, label: "I'm sad", color: "#60a5fa", key: "sad" },
    { icon: <Wind size={28} color="#f97316" />, label: "Anxious", color: "#f97316", key: "anxious" },
    { icon: <Flame size={28} color="#f87171" />, label: "Angry", color: "#f87171", key: "angry" },
];

const MOOD_RESPONSES: Record<string, { text: string; suggestion: string }[]> = {
    okay: [
        { text: "That's great to hear! Remember, it's always okay to come back here if things change.", suggestion: "Explore our resources to learn how to support a friend who might be struggling." },
        { text: "Love that energy! Keep spreading the good vibes.", suggestion: "You can use this positive mindset to uplift others." },
        { text: "Awesome! Sending you a high five.", suggestion: "Take a moment to appreciate what's making you feel good today." },
        { text: "Glad you're feeling okay today!", suggestion: "Keep up the good habits that support your mental well-being." },
        { text: "Vibe check passed! Love to see it.", suggestion: "Share some of that positivity with someone you care about!" }
    ],
    notgreat: [
        { text: "I hear you. It takes courage to acknowledge that. You don't have to go through this alone.", suggestion: "Try the breathing exercise below — even 60 seconds can make a difference." },
        { text: "It's totally valid to have off days. Be gentle with yourself right now.", suggestion: "Sometimes just stepping away from your screen can help clear your head." },
        { text: "Sending a virtual hug. Tomorrow is a fresh start.", suggestion: "Check out the affirmation wall below to remind yourself of your worth." },
        { text: "That's tough. Just remember this feeling is temporary.", suggestion: "Listen to your favorite calming music for a few minutes." },
        { text: "I'm sorry today isn't the best. It's okay to rest and recharge.", suggestion: "Try writing out what's bothering you using our journaling prompts." }
    ],
    sad: [
        { text: "I'm sorry you're feeling this way. Your feelings are completely valid, and it's okay to not be okay right now.", suggestion: "Sometimes writing things down helps. Check out our journaling prompts below." },
        { text: "It hurts, and I hear you. Please don't carry this heavy feeling all by yourself.", suggestion: "Consider talking to a friend, or use one of the helplines if it feels too much." },
        { text: "Sending you so much love. Crying is a healthy way to release built-up emotions.", suggestion: "Try a grounding exercise to bring yourself back to the present moment." },
        { text: "I wish I could make it better. Just know that you matter so much.", suggestion: "Reading through the self-affirmations below might help comfort you." },
        { text: "This sadness won't last forever, even if it feels like it right now.", suggestion: "Be extra kind to yourself today. Remember that reaching out is a superpower." }
    ],
    anxious: [
        { text: "Anxiety can feel overwhelming, but you're safe right here, right now. Let's take this one step at a time.", suggestion: "The 5-4-3-2-1 grounding exercise below is really effective for anxiety." },
        { text: "Breathe with me. You are grounded, and this panic will pass.", suggestion: "Try our 4-7-8 breathing exercise to slow down your heart rate." },
        { text: "I know your mind is racing, but you are not in danger here.", suggestion: "Focus on physical sensations. Splash some cold water on your face." },
        { text: "It's okay that you're anxious. It's just your body's alarm system, and we can turn it down together.", suggestion: "Read the affirmations below to remind yourself that you are in control." },
        { text: "You've survived every anxious moment before this, and you'll survive this one too.", suggestion: "Write down your worries in a journal—getting them out of your head can help." }
    ],
    angry: [
        { text: "Your anger makes sense. What happened to you is not fair, and it's okay to feel this way.", suggestion: "Channel that energy productively — check out the Block & Report guide below." },
        { text: "It's entirely normal to feel mad right now. Don't let their negativity consume your peace.", suggestion: "Step away from the device for a moment and take some deep breaths." },
        { text: "Take a deep breath. Reacting in anger might give them what they want.", suggestion: "Take a moment to ground yourself before deciding how to respond." },
        { text: "Your boundaries were crossed, and anger is a natural reaction.", suggestion: "Use the reporting tools to regain control of your online space." },
        { text: "It's okay to express this anger, just make sure you do it safely.", suggestion: "Writing an unsent letter in a journal is a great way to vent this out securely." }
    ],
};

const AFFIRMATIONS = [
    "I am worthy of respect and kindness.",
    "What happened is NOT my fault.",
    "I am stronger than I think.",
    "My feelings are valid.",
    "I deserve to feel safe online.",
    "I have the power to protect my peace.",
    "I am not alone in this.",
    "This situation does not define me.",
    "I am loved and valued by people who matter.",
    "It's okay to ask for help.",
    "I choose not to let their words control me.",
    "Better days are coming.",
];

const JOURNAL_PROMPTS = [
    "Write about a time someone made you feel valued. What did they say or do?",
    "If you could tell the person who hurt you one thing (without consequence), what would it be?",
    "List 3 things you like about yourself that no bully can ever take away.",
    "Describe a place where you feel completely safe. What does it look like, sound like, feel like?",
    "Write a letter to your future self. What do you want to remember about today?",
    "What would your best friend say to you right now if they knew what you're going through?",
];

const CRISIS_RESOURCES = [
    { name: "Befrienders KL", number: "03-7627 2929", desc: "24/7 emotional support & crisis line", icon: <LifeBuoy size={20} color="#a78bfa" />, highlight: true },
    { name: "Talian Kasih", number: "15999", desc: "Free 24/7 counselling hotline (KPWKM)", icon: <Phone size={20} color="#a78bfa" />, highlight: true },
    { name: "MIASA Helpline", number: "1800-18-0066", desc: "Mental health support (toll-free)", icon: <Heart size={20} color="#fbbf24" />, highlight: false },
    { name: "CyberSecurity Malaysia", number: "1-300-88-2999", desc: "Report cybercrime & online harassment", icon: <Shield size={20} color="#60a5fa" />, highlight: false },
    { name: "MCMC Complaints", number: "aduan.skmm.gov.my", desc: "Report harmful online content", icon: <FileText size={20} color="#34d399" />, highlight: false },
    { name: "MENTARI", number: "03-2935 2663", desc: "Community mental health centre", icon: <Brain size={20} color="#f472b6" />, highlight: false },
    { name: "Royal Malaysia Police", number: "999", desc: "Emergency — for immediate threats", icon: <AlertTriangle size={20} color="#f87171" />, highlight: false },
    { name: "Ministry of Education", number: "03-8884 9000", desc: "School-related bullying support", icon: <GraduationCap size={20} color="#a78bfa" />, highlight: false },
];

const PLATFORM_GUIDES = [
    { platform: "Instagram", steps: ["Go to the comment/message", "Tap ··· (three dots)", "Select 'Report'", "Choose 'Bullying or Harassment'", "Block the account from their profile"] },
    { platform: "TikTok", steps: ["Long-press the comment or tap ···", "Select 'Report'", "Choose 'Harassment or Bullying'", "Go to the user's profile → ··· → Block"] },
    { platform: "WhatsApp", steps: ["Open the chat with the bully", "Tap the contact name at top", "Scroll down → 'Report Contact'", "Check 'Block Contact' too", "Forward evidence to a trusted adult"] },
    { platform: "Twitter/X", steps: ["Click ··· on the tweet", "Select 'Report Tweet'", "Choose 'It's abusive or harmful'", "Select 'Targeted harassment'", "Block/Mute from their profile"] },
];

const PAGE_CSS = `
@keyframes breatheIn { from { transform: scale(1); } to { transform: scale(1.5); } }
@keyframes breatheOut { from { transform: scale(1.5); } to { transform: scale(1); } }
@keyframes fadeInUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
@keyframes gentlePulse { 0%,100% { box-shadow: 0 0 20px rgba(139,92,246,0.15); } 50% { box-shadow: 0 0 40px rgba(139,92,246,0.3); } }
.support-card { transition: all 0.3s cubic-bezier(0.4,0,0.2,1); cursor: pointer; }
.support-card:hover { transform: translateY(-3px); border-color: rgba(139,92,246,0.35) !important; box-shadow: 0 12px 40px rgba(0,0,0,0.3), 0 0 20px rgba(139,92,246,0.1) !important; }
.affirmation-btn { transition: all 0.25s ease; }
.affirmation-btn:hover { transform: scale(1.03); border-color: rgba(139,92,246,0.4) !important; background: rgba(139,92,246,0.12) !important; }
.mood-btn { transition: all 0.2s ease; cursor: pointer; }
.mood-btn:hover { transform: scale(1.1); }
.mood-btn.active { transform: scale(1.15); }
.resource-card { transition: all 0.2s ease; }
.resource-card:hover { background: rgba(255,255,255,0.07) !important; border-color: rgba(139,92,246,0.3) !important; }
.support-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 18px; }
@media(max-width:768px) { .support-grid { grid-template-columns: 1fr; } }
`;

/* ─── Breathing Exercise Component ──────────────────────────────────── */

function BreathingExercise() {
    const [active, setActive] = useState(false);
    const [phase, setPhase] = useState<"inhale" | "hold" | "exhale">("inhale");
    const [count, setCount] = useState(4);
    const [cycles, setCycles] = useState(0);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    const PHASES = { inhale: { duration: 4, next: "hold" as const, label: "Breathe In", color: "#60a5fa" }, hold: { duration: 7, next: "exhale" as const, label: "Hold", color: "#a78bfa" }, exhale: { duration: 8, next: "inhale" as const, label: "Breathe Out", color: "#34d399" } };

    useEffect(() => {
        if (!active) return;
        intervalRef.current = setInterval(() => {
            setCount(prev => {
                if (prev <= 1) {
                    setPhase(p => {
                        const next = PHASES[p].next;
                        if (next === "inhale") setCycles(c => c + 1);
                        setCount(PHASES[next].duration);
                        return next;
                    });
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
    }, [active, phase]);

    const start = () => { setActive(true); setPhase("inhale"); setCount(4); setCycles(0); };
    const stop = () => { setActive(false); if (intervalRef.current) clearInterval(intervalRef.current); };

    const currentPhase = PHASES[phase];
    const circleSize = phase === "inhale" ? 120 : phase === "hold" ? 120 : 80;

    return (
        <div style={{ textAlign: "center", padding: "20px 0" }}>
            {!active ? (
                <div>
                    <p style={{ color: "rgba(241,245,249,0.55)", fontSize: 14, marginBottom: 16, lineHeight: 1.7 }}>
                        The <strong style={{ color: "#a78bfa" }}>4-7-8 breathing technique</strong> activates your parasympathetic nervous system, helping you calm down quickly. Try 3-4 cycles.
                    </p>
                    <button onClick={start} style={{
                        padding: "12px 28px", borderRadius: 14, border: "none", cursor: "pointer",
                        background: "linear-gradient(135deg,#7c3aed,#2563eb)", color: "white",
                        fontSize: 14, fontWeight: 700,
                        boxShadow: "0 4px 18px rgba(124,58,237,0.4)",
                    }}>
                        <Wind size={14} style={{ marginRight: 8, verticalAlign: "middle" }} />
                        Start Breathing Exercise
                    </button>
                </div>
            ) : (
                <div>
                    {/* Animated circle */}
                    <div style={{
                        width: circleSize, height: circleSize, borderRadius: "50%",
                        background: `radial-gradient(circle, ${currentPhase.color}30, ${currentPhase.color}08)`,
                        border: `2px solid ${currentPhase.color}60`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        margin: "0 auto 20px",
                        transition: "all 1s cubic-bezier(0.4,0,0.2,1)",
                        boxShadow: `0 0 40px ${currentPhase.color}25`,
                    }}>
                        <span style={{ fontSize: 32, fontWeight: 800, color: currentPhase.color }}>{count}</span>
                    </div>
                    <p style={{ fontSize: 18, fontWeight: 700, color: currentPhase.color, marginBottom: 6 }}>{currentPhase.label}</p>
                    <p style={{ fontSize: 12, color: "rgba(241,245,249,0.35)", marginBottom: 16 }}>Cycle {cycles + 1} of 4</p>
                    {cycles >= 4 ? (
                        <div>
                            <p style={{ color: "#34d399", fontWeight: 600, marginBottom: 12 }}>Great job! You completed 4 cycles.</p>
                            <button onClick={stop} style={{ padding: "8px 20px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.06)", color: "#f1f5f9", cursor: "pointer", fontSize: 13 }}>Done</button>
                        </div>
                    ) : (
                        <button onClick={stop} style={{ padding: "8px 20px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.06)", color: "rgba(241,245,249,0.6)", cursor: "pointer", fontSize: 13 }}>Stop</button>
                    )}
                </div>
            )}
        </div>
    );
}

/* ─── Grounding Exercise Component ─────────────────────────────────── */

function GroundingExercise() {
    const [step, setStep] = useState(0);
    const [started, setStarted] = useState(false);
    const steps = [
        { count: 5, sense: "SEE", instruction: "Look around. Name 5 things you can see right now.", color: "#60a5fa", icon: <Eye size={36} color="#60a5fa" /> },
        { count: 4, sense: "TOUCH", instruction: "Name 4 things you can physically touch or feel.", color: "#a78bfa", icon: <Hand size={36} color="#a78bfa" /> },
        { count: 3, sense: "HEAR", instruction: "Listen carefully. Name 3 things you can hear.", color: "#34d399", icon: <Ear size={36} color="#34d399" /> },
        { count: 2, sense: "SMELL", instruction: "Name 2 things you can smell (or like the smell of).", color: "#fbbf24", icon: <Coffee size={36} color="#fbbf24" /> },
        { count: 1, sense: "TASTE", instruction: "Name 1 thing you can taste (or your favourite taste).", color: "#f87171", icon: <Utensils size={36} color="#f87171" /> },
    ];

    if (!started) {
        return (
            <div style={{ textAlign: "center", padding: "20px 0" }}>
                <p style={{ color: "rgba(241,245,249,0.55)", fontSize: 14, marginBottom: 16, lineHeight: 1.7 }}>
                    The <strong style={{ color: "#a78bfa" }}>5-4-3-2-1 grounding</strong> technique helps bring you back to the present moment when anxiety or distress takes over.
                </p>
                <button onClick={() => setStarted(true)} style={{
                    padding: "12px 28px", borderRadius: 14, border: "none", cursor: "pointer",
                    background: "linear-gradient(135deg,#7c3aed,#2563eb)", color: "white",
                    fontSize: 14, fontWeight: 700,
                    boxShadow: "0 4px 18px rgba(124,58,237,0.4)",
                }}>
                    <Eye size={14} style={{ marginRight: 8, verticalAlign: "middle" }} />
                    Start Grounding Exercise
                </button>
            </div>
        );
    }

    if (step >= steps.length) {
        return (
            <div style={{ textAlign: "center", padding: "20px 0" }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 10 }}>
                    <Sparkles size={32} color="#34d399" />
                </div>
                <p style={{ color: "#34d399", fontWeight: 700, fontSize: 16, marginBottom: 8 }}>You did it!</p>
                <p style={{ color: "rgba(241,245,249,0.55)", fontSize: 14, marginBottom: 16 }}>You are grounded. You are here. You are safe.</p>
                <button onClick={() => { setStep(0); setStarted(false); }} style={{ padding: "8px 20px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.06)", color: "#f1f5f9", cursor: "pointer", fontSize: 13 }}>Start over</button>
            </div>
        );
    }

    const s = steps[step];
    return (
        <div style={{ textAlign: "center", padding: "20px 0", animation: "fadeInUp 0.4s ease" }}>
            <div style={{ marginBottom: 10, display: 'flex', justifyContent: 'center' }}>{s.icon}</div>
            <div style={{ fontSize: 14, fontWeight: 800, color: s.color, letterSpacing: "0.1em", marginBottom: 6 }}>{s.count} — {s.sense}</div>
            <p style={{ color: "rgba(241,245,249,0.7)", fontSize: 15, marginBottom: 20, lineHeight: 1.6 }}>{s.instruction}</p>
            {/* Progress */}
            <div style={{ display: "flex", gap: 6, justifyContent: "center", marginBottom: 16 }}>
                {steps.map((_, i) => (
                    <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: i <= step ? steps[i].color : "rgba(255,255,255,0.15)", transition: "all 0.3s" }} />
                ))}
            </div>
            <button onClick={() => setStep(step + 1)} style={{
                padding: "10px 24px", borderRadius: 12, border: "none", cursor: "pointer",
                background: `linear-gradient(135deg, ${s.color}, ${s.color}cc)`, color: "white",
                fontSize: 14, fontWeight: 700,
            }}>
                {step < steps.length - 1 ? "Next →" : "Finish"}
            </button>
        </div>
    );
}

/* ─── Main Page ────────────────────────────────────────────────────── */

export default function SupportPage() {
    const [selectedMood, setSelectedMood] = useState<string | null>(null);
    const [moodResponseIndices, setMoodResponseIndices] = useState<Record<string, number>>({});
    const [expandedCard, setExpandedCard] = useState<string | null>(null);
    const [visibleAffirmation, setVisibleAffirmation] = useState(0);
    const [journalIndex, setJournalIndex] = useState(0);
    const [expandedPlatform, setExpandedPlatform] = useState<string | null>(null);

    const toggleCard = (id: string) => setExpandedCard(prev => prev === id ? null : id);

    const handleMoodSelect = (moodKey: string) => {
        setSelectedMood(moodKey);
        setMoodResponseIndices(prev => {
            const currentIdx = prev[moodKey] ?? -1;
            const responses = MOOD_RESPONSES[moodKey];
            let nextIdx;
            if (responses.length > 1) {
                do {
                    nextIdx = Math.floor(Math.random() * responses.length);
                } while (nextIdx === currentIdx);
            } else {
                nextIdx = 0;
            }
            return { ...prev, [moodKey]: nextIdx };
        });
    };

    return (
        <>
            <style>{PAGE_CSS}</style>

            {/* ─── HERO ────────────────────────────────────────────────────── */}
            <section style={{ textAlign: "center", padding: "80px 24px 48px", maxWidth: 800, margin: "0 auto" }}>
                <div style={{
                    width: 72, height: 72, borderRadius: "50%", margin: "0 auto 24px",
                    background: "rgba(139,92,246,0.12)", border: "1px solid rgba(139,92,246,0.25)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    animation: "gentlePulse 3s ease-in-out infinite",
                }}>
                    <HeartHandshake size={32} color="#a78bfa" />
                </div>
                <h1 style={{ fontSize: "clamp(32px,6vw,52px)", fontWeight: 900, lineHeight: 1.1, letterSpacing: "-0.03em", marginBottom: 16 }}>
                    <span className="gradient-text">You Are Not Alone</span>
                </h1>
                <p style={{ fontSize: "clamp(16px,2.5vw,20px)", color: "rgba(241,245,249,0.6)", fontWeight: 500, marginBottom: 8 }}>
                    Emotional Support &amp; Coping Resources
                </p>
                <p style={{ fontSize: 14, color: "rgba(241,245,249,0.35)", maxWidth: 560, margin: "0 auto 32px", lineHeight: 1.7 }}>
                    Whether you&apos;re being bullied online, feeling overwhelmed, or just need someone to listen — this space is for you. Everything here is private and judgement-free.
                </p>

                {/* CTA Buttons */}
                <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
                    <Link href="/chat" style={{
                        display: "inline-flex", alignItems: "center", gap: 8, padding: "13px 28px",
                        borderRadius: 14, border: "none", textDecoration: "none",
                        background: "linear-gradient(135deg,#7c3aed,#2563eb)", color: "white",
                        fontSize: 14, fontWeight: 700,
                        boxShadow: "0 6px 24px rgba(124,58,237,0.4)",
                    }}>
                        <MessageCircle size={15} /> Talk to CyberGuard AI
                    </Link>
                    <a href="tel:03-76272929" style={{
                        display: "inline-flex", alignItems: "center", gap: 8, padding: "13px 28px",
                        borderRadius: 14, textDecoration: "none",
                        background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.3)",
                        color: "#f87171", fontSize: 14, fontWeight: 700,
                    }}>
                        <Phone size={15} /> Crisis Line: 03-7627 2929
                    </a>
                </div>
            </section>

            {/* ─── MOOD CHECK-IN ──────────────────────────────────────────── */}
            <section style={{ padding: "24px 24px 48px", maxWidth: 800, margin: "0 auto" }}>
                <div style={{
                    background: "rgba(255,255,255,0.04)", backdropFilter: "blur(20px)",
                    border: "1px solid rgba(255,255,255,0.08)", borderRadius: 20, padding: "28px 24px",
                }}>
                    <h2 style={{ fontSize: 18, fontWeight: 700, color: "#f1f5f9", textAlign: "center", marginBottom: 6 }}>How are you feeling right now?</h2>
                    <p style={{ fontSize: 13, color: "rgba(241,245,249,0.35)", textAlign: "center", marginBottom: 20 }}>Select the one that feels closest — there are no wrong answers.</p>

                    <div style={{ display: "flex", justifyContent: "center", gap: 14, flexWrap: "wrap", marginBottom: selectedMood ? 20 : 0 }}>
                        {MOODS.map(m => (
                            <button key={m.key} className={`mood-btn${selectedMood === m.key ? " active" : ""}`} onClick={() => handleMoodSelect(m.key)} style={{
                                display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
                                padding: "14px 16px", borderRadius: 16, border: selectedMood === m.key ? `2px solid ${m.color}` : "2px solid rgba(255,255,255,0.08)",
                                background: selectedMood === m.key ? `${m.color}18` : "rgba(255,255,255,0.03)",
                                backdropFilter: "blur(10px)", minWidth: 80,
                            }}>
                                <span style={{ marginBottom: 4 }}>{m.icon}</span>
                                <span style={{ fontSize: 11, color: selectedMood === m.key ? m.color : "rgba(241,245,249,0.5)", fontWeight: 600 }}>{m.label}</span>
                            </button>
                        ))}
                    </div>

                    {selectedMood && MOOD_RESPONSES[selectedMood] && (
                        <div style={{ animation: "fadeInUp 0.4s ease", background: "rgba(139,92,246,0.06)", border: "1px solid rgba(139,92,246,0.15)", borderRadius: 14, padding: 18 }}>
                            <p style={{ color: "rgba(241,245,249,0.8)", fontSize: 14, lineHeight: 1.7, marginBottom: 8 }}>
                                {MOOD_RESPONSES[selectedMood][moodResponseIndices[selectedMood] || 0].text}
                            </p>
                            <p style={{ color: "rgba(241,245,249,0.45)", fontSize: 13, fontStyle: "italic" }}>
                                Tip: {MOOD_RESPONSES[selectedMood][moodResponseIndices[selectedMood] || 0].suggestion}
                            </p>
                        </div>
                    )}
                </div>
            </section>

            {/* ─── COPING MECHANISM CARDS ─────────────────────────────────── */}
            <section style={{ padding: "0 24px 56px", maxWidth: 800, margin: "0 auto" }}>
                <div style={{ textAlign: "center", marginBottom: 28 }}>
                    <h2 style={{ fontSize: 26, fontWeight: 800, color: "#f1f5f9", marginBottom: 8 }}>Coping Strategies</h2>
                    <p style={{ color: "rgba(241,245,249,0.4)", fontSize: 14 }}>Interactive exercises to help you manage stress, anxiety, and emotional distress</p>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    {/* Card 1: Breathing */}
                    <div className="support-card" onClick={() => toggleCard("breathing")} style={{
                        background: "rgba(255,255,255,0.04)", backdropFilter: "blur(20px)",
                        border: expandedCard === "breathing" ? "1px solid rgba(96,165,250,0.35)" : "1px solid rgba(255,255,255,0.08)",
                        borderRadius: 18, overflow: "hidden",
                    }}>
                        <div style={{ padding: "18px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                                <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(96,165,250,0.12)", border: "1px solid rgba(96,165,250,0.25)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    <Wind size={20} color="#60a5fa" />
                                </div>
                                <div>
                                    <h3 style={{ fontSize: 15, fontWeight: 700, color: "#f1f5f9" }}>4-7-8 Breathing Exercise</h3>
                                    <p style={{ fontSize: 12, color: "rgba(241,245,249,0.4)" }}>Calm your nervous system in minutes</p>
                                </div>
                            </div>
                            {expandedCard === "breathing" ? <ChevronUp size={18} color="rgba(241,245,249,0.4)" /> : <ChevronDown size={18} color="rgba(241,245,249,0.4)" />}
                        </div>
                        {expandedCard === "breathing" && (
                            <div style={{ padding: "0 20px 20px" }} onClick={e => e.stopPropagation()}>
                                <BreathingExercise />
                            </div>
                        )}
                    </div>

                    {/* Card 2: Grounding */}
                    <div className="support-card" onClick={() => toggleCard("grounding")} style={{
                        background: "rgba(255,255,255,0.04)", backdropFilter: "blur(20px)",
                        border: expandedCard === "grounding" ? "1px solid rgba(52,211,153,0.35)" : "1px solid rgba(255,255,255,0.08)",
                        borderRadius: 18, overflow: "hidden",
                    }}>
                        <div style={{ padding: "18px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                                <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(52,211,153,0.12)", border: "1px solid rgba(52,211,153,0.25)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    <Eye size={20} color="#34d399" />
                                </div>
                                <div>
                                    <h3 style={{ fontSize: 15, fontWeight: 700, color: "#f1f5f9" }}>5-4-3-2-1 Grounding</h3>
                                    <p style={{ fontSize: 12, color: "rgba(241,245,249,0.4)" }}>Come back to the present moment</p>
                                </div>
                            </div>
                            {expandedCard === "grounding" ? <ChevronUp size={18} color="rgba(241,245,249,0.4)" /> : <ChevronDown size={18} color="rgba(241,245,249,0.4)" />}
                        </div>
                        {expandedCard === "grounding" && (
                            <div style={{ padding: "0 20px 20px" }} onClick={e => e.stopPropagation()}>
                                <GroundingExercise />
                            </div>
                        )}
                    </div>

                    {/* Card 3: Journaling */}
                    <div className="support-card" onClick={() => toggleCard("journal")} style={{
                        background: "rgba(255,255,255,0.04)", backdropFilter: "blur(20px)",
                        border: expandedCard === "journal" ? "1px solid rgba(251,191,36,0.35)" : "1px solid rgba(255,255,255,0.08)",
                        borderRadius: 18, overflow: "hidden",
                    }}>
                        <div style={{ padding: "18px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                                <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(251,191,36,0.12)", border: "1px solid rgba(251,191,36,0.25)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    <BookOpen size={20} color="#fbbf24" />
                                </div>
                                <div>
                                    <h3 style={{ fontSize: 15, fontWeight: 700, color: "#f1f5f9" }}>Journaling Prompts</h3>
                                    <p style={{ fontSize: 12, color: "rgba(241,245,249,0.4)" }}>Process your emotions through writing</p>
                                </div>
                            </div>
                            {expandedCard === "journal" ? <ChevronUp size={18} color="rgba(241,245,249,0.4)" /> : <ChevronDown size={18} color="rgba(241,245,249,0.4)" />}
                        </div>
                        {expandedCard === "journal" && (
                            <div style={{ padding: "0 20px 20px" }} onClick={e => e.stopPropagation()}>
                                <div style={{ textAlign: "center", padding: "16px 0" }}>
                                    <div style={{
                                        background: "rgba(251,191,36,0.06)", border: "1px solid rgba(251,191,36,0.2)",
                                        borderRadius: 14, padding: 20, marginBottom: 16, minHeight: 80,
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                    }}>
                                        <p style={{ color: "rgba(241,245,249,0.75)", fontSize: 15, lineHeight: 1.7, fontStyle: "italic" }}>
                                            &ldquo;{JOURNAL_PROMPTS[journalIndex]}&rdquo;
                                        </p>
                                    </div>
                                    <button onClick={() => setJournalIndex((journalIndex + 1) % JOURNAL_PROMPTS.length)} style={{
                                        padding: "10px 22px", borderRadius: 12, border: "1px solid rgba(251,191,36,0.3)",
                                        background: "rgba(251,191,36,0.08)", color: "#fbbf24",
                                        fontSize: 13, fontWeight: 600, cursor: "pointer",
                                    }}>
                                        <Sparkles size={13} style={{ marginRight: 6, verticalAlign: "middle" }} />
                                        Next Prompt ({journalIndex + 1}/{JOURNAL_PROMPTS.length})
                                    </button>
                                    <p style={{ fontSize: 12, color: "rgba(241,245,249,0.3)", marginTop: 12 }}>
                                        Tip: Write your answers in a notebook or notes app. You don&apos;t need to share them with anyone.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Card 4: Self-Affirmations */}
                    <div className="support-card" onClick={() => toggleCard("affirmations")} style={{
                        background: "rgba(255,255,255,0.04)", backdropFilter: "blur(20px)",
                        border: expandedCard === "affirmations" ? "1px solid rgba(244,114,182,0.35)" : "1px solid rgba(255,255,255,0.08)",
                        borderRadius: 18, overflow: "hidden",
                    }}>
                        <div style={{ padding: "18px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                                <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(244,114,182,0.12)", border: "1px solid rgba(244,114,182,0.25)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    <Heart size={20} color="#f472b6" />
                                </div>
                                <div>
                                    <h3 style={{ fontSize: 15, fontWeight: 700, color: "#f1f5f9" }}>Self-Affirmation Wall</h3>
                                    <p style={{ fontSize: 12, color: "rgba(241,245,249,0.4)" }}>Remind yourself of your worth</p>
                                </div>
                            </div>
                            {expandedCard === "affirmations" ? <ChevronUp size={18} color="rgba(241,245,249,0.4)" /> : <ChevronDown size={18} color="rgba(241,245,249,0.4)" />}
                        </div>
                        {expandedCard === "affirmations" && (
                            <div style={{ padding: "0 20px 20px" }} onClick={e => e.stopPropagation()}>
                                <div style={{ display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center", padding: "12px 0" }}>
                                    {AFFIRMATIONS.map((a, i) => (
                                        <button key={i} className="affirmation-btn" onClick={() => setVisibleAffirmation(i)} style={{
                                            padding: "10px 16px", borderRadius: 12,
                                            background: visibleAffirmation === i ? "rgba(244,114,182,0.15)" : "rgba(255,255,255,0.04)",
                                            border: visibleAffirmation === i ? "1px solid rgba(244,114,182,0.4)" : "1px solid rgba(255,255,255,0.08)",
                                            color: visibleAffirmation === i ? "#f472b6" : "rgba(241,245,249,0.6)",
                                            fontSize: 13, fontWeight: 500, cursor: "pointer",
                                            backdropFilter: "blur(8px)",
                                        }}>
                                            {a}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Card 5: Block & Report Guide */}
                    <div className="support-card" onClick={() => toggleCard("blockreport")} style={{
                        background: "rgba(255,255,255,0.04)", backdropFilter: "blur(20px)",
                        border: expandedCard === "blockreport" ? "1px solid rgba(139,92,246,0.35)" : "1px solid rgba(255,255,255,0.08)",
                        borderRadius: 18, overflow: "hidden",
                    }}>
                        <div style={{ padding: "18px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                                <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(139,92,246,0.12)", border: "1px solid rgba(139,92,246,0.25)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    <Shield size={20} color="#a78bfa" />
                                </div>
                                <div>
                                    <h3 style={{ fontSize: 15, fontWeight: 700, color: "#f1f5f9" }}>Block &amp; Report Guide</h3>
                                    <p style={{ fontSize: 12, color: "rgba(241,245,249,0.4)" }}>Step-by-step for Instagram, TikTok, WhatsApp &amp; X</p>
                                </div>
                            </div>
                            {expandedCard === "blockreport" ? <ChevronUp size={18} color="rgba(241,245,249,0.4)" /> : <ChevronDown size={18} color="rgba(241,245,249,0.4)" />}
                        </div>
                        {expandedCard === "blockreport" && (
                            <div style={{ padding: "0 20px 20px" }} onClick={e => e.stopPropagation()}>
                                <div style={{ display: "flex", flexDirection: "column", gap: 12, paddingTop: 8 }}>
                                    {PLATFORM_GUIDES.map(pg => (
                                        <div key={pg.platform}>
                                            <button onClick={() => setExpandedPlatform(expandedPlatform === pg.platform ? null : pg.platform)} style={{
                                                width: "100%", padding: "12px 14px", borderRadius: 12, cursor: "pointer",
                                                background: expandedPlatform === pg.platform ? "rgba(139,92,246,0.1)" : "rgba(255,255,255,0.03)",
                                                border: expandedPlatform === pg.platform ? "1px solid rgba(139,92,246,0.25)" : "1px solid rgba(255,255,255,0.06)",
                                                color: "#f1f5f9", fontSize: 14, fontWeight: 600, textAlign: "left",
                                                display: "flex", justifyContent: "space-between", alignItems: "center",
                                            }}>
                                                {pg.platform}
                                                {expandedPlatform === pg.platform ? <ChevronUp size={14} color="rgba(241,245,249,0.4)" /> : <ChevronDown size={14} color="rgba(241,245,249,0.4)" />}
                                            </button>
                                            {expandedPlatform === pg.platform && (
                                                <div style={{ padding: "10px 14px", animation: "fadeInUp 0.3s ease" }}>
                                                    {pg.steps.map((step, i) => (
                                                        <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 8 }}>
                                                            <span style={{ color: "#a78bfa", fontWeight: 800, fontSize: 13, flexShrink: 0 }}>{i + 1}.</span>
                                                            <span style={{ color: "rgba(241,245,249,0.65)", fontSize: 13 }}>{step}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* ─── CRISIS RESOURCES ────────────────────────────────────────── */}
            <section style={{ padding: "0 24px 56px", maxWidth: 800, margin: "0 auto" }}>
                <div style={{ textAlign: "center", marginBottom: 28 }}>
                    <h2 style={{ fontSize: 26, fontWeight: 800, color: "#f1f5f9", marginBottom: 8 }}>Crisis &amp; Support Resources</h2>
                    <p style={{ color: "rgba(241,245,249,0.4)", fontSize: 14 }}>Malaysia-specific helplines and services — all free and confidential</p>
                </div>

                {/* Emergency Banner */}
                <div style={{
                    background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.25)",
                    borderRadius: 16, padding: "16px 20px", marginBottom: 18,
                    display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap",
                }}>
                    <AlertTriangle size={20} color="#f87171" />
                    <div style={{ flex: 1, minWidth: 200 }}>
                        <p style={{ color: "#f87171", fontSize: 14, fontWeight: 700, marginBottom: 2 }}>If you are in immediate danger</p>
                        <p style={{ color: "rgba(241,245,249,0.55)", fontSize: 13 }}>Call <strong>999</strong> (Police) or go to your nearest hospital emergency department immediately.</p>
                    </div>
                </div>

                <div className="support-grid">
                    {CRISIS_RESOURCES.map((r, i) => (
                        <div key={i} className="resource-card" style={{
                            background: r.highlight ? "rgba(139,92,246,0.06)" : "rgba(255,255,255,0.04)",
                            backdropFilter: "blur(16px)",
                            border: r.highlight ? "1px solid rgba(139,92,246,0.2)" : "1px solid rgba(255,255,255,0.08)",
                            borderRadius: 14, padding: "16px 18px",
                        }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                                <span style={{ display: 'flex' }}>{r.icon}</span>
                                <div>
                                    <h3 style={{ fontSize: 14, fontWeight: 700, color: "#f1f5f9" }}>{r.name}</h3>
                                    <p style={{ fontSize: 12, color: "rgba(241,245,249,0.4)" }}>{r.desc}</p>
                                </div>
                            </div>
                            <div style={{
                                padding: "8px 12px", borderRadius: 10,
                                background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)",
                                fontSize: 15, fontWeight: 700, color: r.highlight ? "#a78bfa" : "rgba(241,245,249,0.7)",
                                display: "flex", alignItems: "center", gap: 8,
                            }}>
                                <Phone size={13} /> {r.number}
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ─── IMPORTANT REMINDERS ──────────────────────────────────────── */}
            <section style={{ padding: "0 24px 56px", maxWidth: 800, margin: "0 auto" }}>
                <div style={{
                    background: "rgba(52,211,153,0.06)", border: "1px solid rgba(52,211,153,0.18)",
                    borderRadius: 18, padding: "24px 24px",
                }}>
                    <h3 style={{ fontSize: 17, fontWeight: 700, color: "#34d399", marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
                        <Sparkles size={16} /> Remember These Things
                    </h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                        {[
                            "It is NEVER your fault. Bullies bully because of their own issues, not because of anything you did.",
                            "You ALWAYS have the right to feel safe online. Blocking and reporting is never overreacting.",
                            "Talking to someone — a parent, teacher, counsellor, or friend — is a sign of STRENGTH, not weakness.",
                            "Cyberbullying is a crime in Malaysia under the Communications and Multimedia Act 1998.",
                            "This chatbot is not a substitute for professional help. If you're in crisis, please call a helpline.",
                        ].map((t, i) => (
                            <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                                <span style={{ color: "#34d399", fontWeight: 800, fontSize: 14, flexShrink: 0 }}>✓</span>
                                <p style={{ color: "rgba(241,245,249,0.65)", fontSize: 14, lineHeight: 1.6 }}>{t}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── BOTTOM CTA ──────────────────────────────────────────────── */}
            <section style={{ padding: "0 24px 96px", maxWidth: 680, margin: "0 auto", textAlign: "center" }}>
                <div style={{
                    background: "rgba(255,255,255,0.04)", backdropFilter: "blur(28px)",
                    border: "1px solid rgba(139,92,246,0.2)", borderRadius: 24, padding: "48px 32px",
                    boxShadow: "0 24px 60px rgba(0,0,0,0.3), 0 0 60px rgba(124,58,237,0.06)",
                    position: "relative", overflow: "hidden",
                }}>
                    <div style={{ position: "absolute", top: -60, left: "50%", transform: "translateX(-50%)", width: 300, height: 150, background: "radial-gradient(ellipse, rgba(124,58,237,0.18) 0%, transparent 70%)", pointerEvents: "none" }} />
                    <h2 style={{ fontSize: 24, fontWeight: 800, color: "#f1f5f9", marginBottom: 10, position: "relative" }}>Need to talk?</h2>
                    <p style={{ color: "rgba(241,245,249,0.45)", marginBottom: 24, fontSize: 14, lineHeight: 1.7, position: "relative" }}>
                        Our AI chatbot is available 24/7 to listen, support, and guide you. No judgement, no pressure.
                    </p>
                    <Link href="/chat" style={{
                        display: "inline-flex", alignItems: "center", gap: 8,
                        padding: "14px 30px", borderRadius: 14, textDecoration: "none",
                        background: "linear-gradient(135deg,#7c3aed,#2563eb)", color: "white",
                        fontSize: 15, fontWeight: 700,
                        boxShadow: "0 6px 28px rgba(124,58,237,0.45)", position: "relative",
                    }}>
                        Start a Conversation <ArrowRight size={16} />
                    </Link>
                </div>
            </section>
        </>
    );
}
