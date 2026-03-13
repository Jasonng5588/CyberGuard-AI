"use client";

import { useState, useRef, useEffect } from "react";
import {
    Send, Trash2, Brain, User, Shield, AlertTriangle, CheckCircle,
    Info, Copy, Tag, MessageSquare, Plus, MessageCircle, Menu, X, ThumbsUp, ThumbsDown
} from "lucide-react";
import { detectMessage, sendChatMessage, getUserChatSessions, getSessionHistory, deleteSession, ChatSessionPreview, LogEntry, syncUser, submitFeedback } from "@/lib/api";
import { AuthGuard } from "@/components/AuthGuard";
import { createClient } from "@/lib/supabase";

interface Message {
    id: string;
    role: "user" | "bot";
    text: string;
    timestamp: Date;
    detection?: {
        label: "SAFE" | "OFFENSIVE" | "CYBERBULLYING";
        confidence: number;
        explanation: string;
        model_used: string;
        sub_type?: string;
    };
    suggestions?: string[];
}

const EXAMPLES = [
    "You're so stupid, nobody wants you here.",
    "Kill yourself, you worthless freak!",
    "mak kau hijau sohai, pergi mampus",
    "You're so annoying, just shut up already.",
    "Have a great day! Hope everything goes well for you.",
    "Someone is bullying me online and I don't know what to do.",
];

const BADGE_STYLE: Record<string, React.CSSProperties> = {
    SAFE: { background: "rgba(52,211,153,0.12)", color: "#34d399", border: "1px solid rgba(52,211,153,0.3)", backdropFilter: "blur(8px)" },
    OFFENSIVE: { background: "rgba(251,191,36,0.12)", color: "#fbbf24", border: "1px solid rgba(251,191,36,0.3)", backdropFilter: "blur(8px)" },
    CYBERBULLYING: { background: "rgba(248,113,113,0.12)", color: "#f87171", border: "1px solid rgba(248,113,113,0.3)", backdropFilter: "blur(8px)" },
};

const PANEL_STYLE: Record<string, React.CSSProperties> = {
    SAFE: { background: "rgba(52,211,153,0.06)", border: "1px solid rgba(52,211,153,0.2)", backdropFilter: "blur(12px)" },
    OFFENSIVE: { background: "rgba(251,191,36,0.06)", border: "1px solid rgba(251,191,36,0.2)", backdropFilter: "blur(12px)" },
    CYBERBULLYING: { background: "rgba(248,113,113,0.06)", border: "1px solid rgba(248,113,113,0.2)", backdropFilter: "blur(12px)" },
};

function LabelIcon({ label }: { label: string }) {
    if (label === "SAFE") return <CheckCircle size={14} color="#34d399" />;
    if (label === "OFFENSIVE") return <AlertTriangle size={14} color="#fbbf24" />;
    return <Shield size={14} color="#f87171" />;
}

const SUBTYPE_COLOURS: Record<string, string> = {
    "Death Threat": "#f87171",
    "Social Exclusion": "#fb923c",
    "Sexual Harassment": "#e879f9",
    "Verbal Abuse (Dehumanisation)": "#f87171",
    "Verbal Abuse (Suicidal Incitement)": "#f43f5e",
    "Cyberstalking (Emotional Abuse)": "#fb923c",
    "Verbal Abuse": "#fbbf24",
};

const CHAT_CSS = `
@keyframes fadeInUp { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
@keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.35; } }
@keyframes shimmer { 0% { background-position:-200% 0; } 100% { background-position:200% 0; } }
.typing-dot { animation: pulse 1.2s ease infinite; }
.session-btn:hover { background: rgba(255,255,255,0.06) !important; }
.example-btn:hover { border-color: rgba(139,92,246,0.4) !important; background: rgba(139,92,246,0.08) !important; color: #f1f5f9 !important; }
`;

export default function ChatPage() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState(false);
    const [sessions, setSessions] = useState<ChatSessionPreview[]>([]);
    const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
    const [isMobile, setIsMobile] = useState(false);
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
    const [userId, setUserId] = useState<number | null>(null);
    const [feedbackState, setFeedbackState] = useState<Record<string, "up" | "down" | null>>({});
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const check = () => setIsMobile(window.innerWidth < 768);
        check();
        window.addEventListener("resize", check);

        const initChat = async () => {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                let uid: number | null = user.user_metadata?.db_id ?? null;
                if (!uid && user.email) {
                    try {
                        const username = user.email.split("@")[0];
                        const backendUser = await syncUser(user.email, username);
                        uid = backendUser.id;
                        await supabase.auth.updateUser({ data: { db_id: uid } });
                    } catch { /* backend offline */ }
                }
                if (uid) {
                    setUserId(uid);
                    try {
                        const sessionList = await getUserChatSessions(uid, 20);
                        setSessions(sessionList);
                        if (sessionList.length > 0) loadSession(uid, sessionList[0].session_id);
                    } catch { /* backend offline — sessions unavailable */ }
                }
            }
        };
        initChat();
        return () => window.removeEventListener("resize", check);
    }, []);

    const loadSession = async (uid: number, sessionId: string) => {
        setLoading(true);
        setActiveSessionId(sessionId);
        setMessages([]);
        try {
            const logs = await getSessionHistory(uid, sessionId);
            const historyMsgs: Message[] = [];
            logs.forEach((log: LogEntry) => {
                historyMsgs.push({
                    id: `log-user-${log.id}`, role: "user", text: log.user_message,
                    timestamp: new Date(log.timestamp),
                    detection: log.detection_label ? {
                        label: log.detection_label as any, confidence: log.confidence ?? 0,
                        explanation: log.explanation || "Historical record", model_used: "history", sub_type: log.sub_type || "None"
                    } : undefined
                });
                historyMsgs.push({
                    id: `log-bot-${log.id}`, role: "bot", text: log.bot_response,
                    timestamp: new Date(new Date(log.timestamp).getTime() + 1000),
                    detection: log.detection_label ? {
                        label: log.detection_label as any, confidence: log.confidence ?? 0,
                        explanation: log.explanation || "Historical record", model_used: "history", sub_type: log.sub_type || "None"
                    } : undefined
                });
            });
            setMessages(historyMsgs);
        } catch { /* backend offline — session history unavailable */ }
        finally {
            setLoading(false);
            if (isMobile) setMobileSidebarOpen(false);
        }
    };

    const startNewChat = () => {
        setActiveSessionId(null);
        setMessages([]);
        if (isMobile) setMobileSidebarOpen(false);
    };

    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const sendMessage = async (text: string) => {
        if (!text.trim() || loading) return;
        setInput("");
        const userMsg: Message = { id: Date.now().toString(), role: "user", text, timestamp: new Date() };
        setMessages((prev) => [...prev, userMsg]);
        setLoading(true);
        try {
            const detectRes = await detectMessage(text);
            setMessages((prev) => prev.map(m => m.id === userMsg.id ? {
                ...m, detection: {
                    label: detectRes.label, confidence: detectRes.confidence,
                    explanation: detectRes.explanation, model_used: detectRes.model_used, sub_type: detectRes.sub_type,
                }
            } : m));
            const chatRes = await sendChatMessage(text, detectRes.label, userId || undefined, activeSessionId || undefined);
            if (!activeSessionId && chatRes.session_id) {
                setActiveSessionId(chatRes.session_id);
                if (userId) getUserChatSessions(userId, 20).then(setSessions);
            }
            const botMsg: Message = {
                id: (Date.now() + 1).toString(), role: "bot", text: chatRes.bot_response,
                timestamp: new Date(),
                detection: { label: detectRes.label, confidence: detectRes.confidence, explanation: detectRes.explanation, model_used: detectRes.model_used, sub_type: detectRes.sub_type },
                suggestions: chatRes.suggestions,
            };
            setMessages((prev) => [...prev, botMsg]);
        } catch {
            setMessages((prev) => [...prev, {
                id: (Date.now() + 1).toString(), role: "bot",
                text: " Cannot connect to backend. Make sure FastAPI is running on port 8000.",
                timestamp: new Date(),
            }]);
        } finally { setLoading(false); }
    };

    const handleKey = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(input); }
    };

    const deleteActiveSession = async () => {
        if (!activeSessionId || !userId) {
            // No active session, just clear view
            setMessages([]);
            return;
        }
        if (!confirm("Delete this chat session permanently? This cannot be undone.")) return;
        try {
            await deleteSession(userId, activeSessionId);
        } catch {
            // If backend fails, still clear locally
        }
        setMessages([]);
        setActiveSessionId(null);
        // Refresh session list
        try {
            const sessionList = await getUserChatSessions(userId, 20);
            setSessions(sessionList);
        } catch { /* backend offline */ }
    };

    const copyText = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    };

    const latest = [...messages].reverse().find(m => m.detection);

    /* ── Glass color presets for panels ── */
    const glassBase: React.CSSProperties = {
        background: "rgba(255,255,255,0.04)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)" as any,
        border: "1px solid rgba(255,255,255,0.08)",
    };

    return (
        <AuthGuard>
            <style>{CHAT_CSS}</style>

            <div style={{
                position: "relative", zIndex: 10,
                display: "flex",
                flexDirection: isMobile ? "column" : "row",
                height: isMobile ? "auto" : "calc(100vh - 64px)",
                overflow: isMobile ? "auto" : "hidden",
                minHeight: isMobile ? "calc(100vh - 64px)" : undefined,
            }}>

                {/* ─── LEFT: Sessions Sidebar ─────────────────────────────────── */}
                {!isMobile && (
                    <div style={{
                        width: 256, flexShrink: 0,
                        borderRight: "1px solid rgba(255,255,255,0.07)",
                        display: "flex", flexDirection: "column",
                        background: "rgba(3,7,18,0.7)",
                        backdropFilter: "blur(24px)",
                        WebkitBackdropFilter: "blur(24px)" as any,
                    }}>
                        <div style={{ padding: 16 }}>
                            <button onClick={startNewChat} style={{
                                width: "100%", padding: "10px 14px",
                                background: "linear-gradient(135deg,#7c3aed,#2563eb)",
                                border: "none", borderRadius: 12, color: "white", fontWeight: 700,
                                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                                cursor: "pointer", fontSize: 14,
                                boxShadow: "0 4px 18px rgba(124,58,237,0.35), inset 0 1px 0 rgba(255,255,255,0.15)",
                                transition: "all 0.2s",
                            }}
                                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 28px rgba(124,58,237,0.5)"; }}
                                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ""; (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 18px rgba(124,58,237,0.35)"; }}
                            >
                                <Plus size={16} /> New Chat
                            </button>
                        </div>

                        <div style={{ padding: "0 16px 10px", fontSize: 11, color: "rgba(241,245,249,0.28)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em" }}>
                            Recent Sessions
                        </div>
                        <div style={{ flex: 1, overflowY: "auto", padding: "0 10px 16px", display: "flex", flexDirection: "column", gap: 3 }}>
                            {sessions.map(s => (
                                <button key={s.session_id}
                                    className="session-btn"
                                    onClick={() => userId && loadSession(userId, s.session_id)} style={{
                                        width: "100%", padding: "10px 12px",
                                        background: activeSessionId === s.session_id
                                            ? "rgba(139,92,246,0.14)"
                                            : "transparent",
                                        backdropFilter: activeSessionId === s.session_id ? "blur(10px)" : undefined,
                                        border: activeSessionId === s.session_id
                                            ? "1px solid rgba(139,92,246,0.3)"
                                            : "1px solid transparent",
                                        borderRadius: 10,
                                        color: activeSessionId === s.session_id ? "#f1f5f9" : "rgba(241,245,249,0.55)",
                                        display: "flex", alignItems: "center", gap: 10,
                                        cursor: "pointer", textAlign: "left", transition: "all 0.2s",
                                    }}>
                                    <MessageCircle size={14} color={activeSessionId === s.session_id ? "#a78bfa" : "rgba(241,245,249,0.35)"} style={{ flexShrink: 0 }} />
                                    <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", fontSize: 13, flex: 1 }}>
                                        {s.last_message || "Empty chat"}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* ─── MIDDLE: Chat Column ─────────────────────────────────────── */}
                <div style={{
                    flex: 1, display: "flex", flexDirection: "column", minWidth: 0,
                    borderRight: isMobile ? "none" : "1px solid rgba(255,255,255,0.07)",
                    borderBottom: isMobile ? "1px solid rgba(255,255,255,0.07)" : "none",
                    height: isMobile ? "65vh" : undefined,
                    minHeight: isMobile ? 420 : undefined,
                }}>
                    {/* Chat header */}
                    <div style={{
                        padding: "14px 20px",
                        borderBottom: "1px solid rgba(255,255,255,0.07)",
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                        background: "rgba(3,7,18,0.6)",
                        backdropFilter: "blur(20px)",
                        WebkitBackdropFilter: "blur(20px)" as any,
                        flexShrink: 0,
                    }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                            {isMobile && (
                                <button onClick={() => setMobileSidebarOpen(true)} style={{
                                    background: "rgba(255,255,255,0.05)", backdropFilter: "blur(10px)",
                                    border: "1px solid rgba(255,255,255,0.1)",
                                    borderRadius: 9, padding: 8, cursor: "pointer",
                                    display: "flex", alignItems: "center", color: "rgba(241,245,249,0.7)",
                                }}>
                                    <Menu size={16} />
                                </button>
                            )}
                            <div>
                                <h2 style={{ fontSize: 15, fontWeight: 700, color: "#f1f5f9", display: "flex", alignItems: "center", gap: 8 }}>
                                    <div style={{
                                        width: 28, height: 28, borderRadius: 8,
                                        background: "rgba(124,58,237,0.15)",
                                        backdropFilter: "blur(10px)",
                                        border: "1px solid rgba(139,92,246,0.25)",
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                    }}>
                                        <MessageSquare size={14} color="#a78bfa" />
                                    </div>
                                    Chat Interface
                                </h2>
                                {!isMobile && <p style={{ fontSize: 12, color: "rgba(241,245,249,0.35)", marginTop: 2 }}>Submit a message to detect cyberbullying and get support</p>}
                            </div>
                        </div>
                        <div style={{ display: "flex", gap: 8 }}>
                            {[
                                { icon: <Trash2 size={14} />, title: "Delete Session", onClick: deleteActiveSession },
                            ].map((btn, i) => (
                                <button key={i} onClick={btn.onClick} title={btn.title} style={{
                                    background: "rgba(255,255,255,0.04)", backdropFilter: "blur(10px)",
                                    border: "1px solid rgba(255,255,255,0.08)",
                                    borderRadius: 9, padding: 8, cursor: "pointer",
                                    display: "flex", alignItems: "center", color: "rgba(241,245,249,0.45)",
                                    transition: "all 0.2s",
                                }}
                                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.08)"; (e.currentTarget as HTMLElement).style.color = "rgba(241,245,249,0.8)"; }}
                                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.04)"; (e.currentTarget as HTMLElement).style.color = "rgba(241,245,249,0.45)"; }}
                                >
                                    {btn.icon}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Messages */}
                    <div style={{ flex: 1, overflowY: "auto", padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>
                        {messages.length === 0 ? (
                            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10 }}>
                                {/* Empty state icon */}
                                <div style={{
                                    width: 64, height: 64, borderRadius: "50%",
                                    background: "rgba(124,58,237,0.1)",
                                    backdropFilter: "blur(12px)",
                                    border: "1px solid rgba(139,92,246,0.2)",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    boxShadow: "0 0 32px rgba(124,58,237,0.15)",
                                    marginBottom: 4,
                                }}>
                                    <Brain size={28} color="rgba(167,139,250,0.7)" />
                                </div>
                                <p style={{ color: "rgba(241,245,249,0.55)", fontSize: 14, fontWeight: 600 }}>CyberGuard AI is ready</p>
                                <p style={{ color: "rgba(241,245,249,0.28)", fontSize: 12, marginBottom: 16 }}>Try one of these examples:</p>
                                <div style={{ display: "flex", flexDirection: "column", gap: 8, width: "100%", maxWidth: 520 }}>
                                    {EXAMPLES.map((ex) => (
                                        <button key={ex} className="example-btn" onClick={() => sendMessage(ex)} style={{
                                            background: "rgba(255,255,255,0.03)",
                                            backdropFilter: "blur(10px)",
                                            border: "1px solid rgba(255,255,255,0.07)",
                                            borderRadius: 12, padding: "10px 16px", cursor: "pointer",
                                            color: "rgba(241,245,249,0.55)", fontSize: 13, textAlign: "left",
                                            transition: "all 0.2s", lineHeight: 1.4,
                                        }}>
                                            &ldquo;{ex}&rdquo;
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            messages.map((m, i) => (
                                <div key={m.id} style={{
                                    display: "flex", gap: 10, alignItems: "flex-start",
                                    animation: "fadeInUp 0.3s ease both",
                                    animationDelay: `${i * 0.03}s`
                                }}>
                                    {/* Avatar */}
                                    <div style={{
                                        width: 31, height: 31, borderRadius: "50%", flexShrink: 0,
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                        background: m.role === "user"
                                            ? "rgba(139,92,246,0.18)"
                                            : "linear-gradient(135deg,#7c3aed,#2563eb)",
                                        border: m.role === "user" ? "1px solid rgba(139,92,246,0.28)" : "none",
                                        backdropFilter: "blur(10px)",
                                        boxShadow: m.role === "bot" ? "0 4px 14px rgba(124,58,237,0.3)" : undefined,
                                        marginTop: 2,
                                    }}>
                                        {m.role === "user" ? <User size={13} color="#c4b5fd" /> : <Brain size={13} color="white" />}
                                    </div>

                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontSize: 11, color: "rgba(241,245,249,0.28)", marginBottom: 5 }}>
                                            {m.role === "user" ? "You" : "CyberGuard AI"} · {m.timestamp.toLocaleTimeString("en-MY", { hour: "2-digit", minute: "2-digit" })}
                                        </div>

                                        {/* Bubble */}
                                        <div style={{
                                            padding: "10px 14px",
                                            borderRadius: m.role === "user" ? "13px 13px 4px 13px" : "13px 13px 13px 4px",
                                            fontSize: 14, lineHeight: 1.6, color: "#f1f5f9",
                                            background: m.role === "user"
                                                ? "rgba(124,58,237,0.16)"
                                                : "rgba(255,255,255,0.05)",
                                            border: m.role === "user"
                                                ? "1px solid rgba(139,92,246,0.25)"
                                                : "1px solid rgba(255,255,255,0.08)",
                                            backdropFilter: "blur(12px)",
                                            WebkitBackdropFilter: "blur(12px)" as any,
                                            display: "inline-block", maxWidth: "90%", wordBreak: "break-word",
                                            boxShadow: m.role === "user"
                                                ? "0 4px 20px rgba(124,58,237,0.12)"
                                                : "0 4px 20px rgba(0,0,0,0.15)",
                                        }}>
                                            {m.text}
                                        </div>

                                        {/* Feedback buttons for bot messages */}
                                        {m.role === "bot" && m.id && (
                                            <div style={{ display: "flex", gap: 6, marginTop: 6, alignItems: "center" }}>
                                                <span style={{ fontSize: 10, color: "rgba(241,245,249,0.25)", marginRight: 4 }}>Helpful?</span>
                                                <button
                                                    onClick={async () => {
                                                        setFeedbackState(prev => ({ ...prev, [m.id]: "up" }));
                                                        try { await submitFeedback(parseInt(m.id.replace(/\D/g, "") || "0"), true); } catch { /* silent */ }
                                                    }}
                                                    disabled={feedbackState[m.id] != null}
                                                    style={{
                                                        background: feedbackState[m.id] === "up" ? "rgba(52,211,153,0.15)" : "transparent",
                                                        border: feedbackState[m.id] === "up" ? "1px solid rgba(52,211,153,0.4)" : "1px solid rgba(255,255,255,0.08)",
                                                        borderRadius: 8, padding: "2px 8px", cursor: feedbackState[m.id] ? "default" : "pointer",
                                                        display: "flex", alignItems: "center", gap: 4,
                                                        transition: "all 0.2s",
                                                    }}>
                                                    <ThumbsUp size={11} color={feedbackState[m.id] === "up" ? "#34d399" : "rgba(241,245,249,0.35)"} />
                                                    <span style={{ fontSize: 10, color: feedbackState[m.id] === "up" ? "#34d399" : "rgba(241,245,249,0.35)" }}>Yes</span>
                                                </button>
                                                <button
                                                    onClick={async () => {
                                                        setFeedbackState(prev => ({ ...prev, [m.id]: "down" }));
                                                        try { await submitFeedback(parseInt(m.id.replace(/\D/g, "") || "0"), false); } catch { /* silent */ }
                                                    }}
                                                    disabled={feedbackState[m.id] != null}
                                                    style={{
                                                        background: feedbackState[m.id] === "down" ? "rgba(248,113,113,0.15)" : "transparent",
                                                        border: feedbackState[m.id] === "down" ? "1px solid rgba(248,113,113,0.4)" : "1px solid rgba(255,255,255,0.08)",
                                                        borderRadius: 8, padding: "2px 8px", cursor: feedbackState[m.id] ? "default" : "pointer",
                                                        display: "flex", alignItems: "center", gap: 4,
                                                        transition: "all 0.2s",
                                                    }}>
                                                    <ThumbsDown size={11} color={feedbackState[m.id] === "down" ? "#f87171" : "rgba(241,245,249,0.35)"} />
                                                    <span style={{ fontSize: 10, color: feedbackState[m.id] === "down" ? "#f87171" : "rgba(241,245,249,0.35)" }}>No</span>
                                                </button>
                                                {feedbackState[m.id] && (
                                                    <span style={{ fontSize: 10, color: "rgba(241,245,249,0.3)", marginLeft: 4 }}>Thanks for your feedback! </span>
                                                )}
                                            </div>
                                        )}

                                        {/* Detection badge */}
                                        {m.role === "user" && m.detection && (
                                            <div style={{ marginTop: 7, display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                                                <span style={{
                                                    ...BADGE_STYLE[m.detection.label ?? "SAFE"],
                                                    display: "inline-flex", alignItems: "center", gap: 5,
                                                    padding: "4px 11px", borderRadius: 999, fontSize: 11, fontWeight: 700
                                                }}>
                                                    <LabelIcon label={m.detection.label ?? "SAFE"} />
                                                    {m.detection.label} · {((m.detection.confidence ?? 0) * 100).toFixed(1)}%
                                                </span>
                                                {m.detection.sub_type && m.detection.sub_type !== "None" && (
                                                    <span style={{
                                                        display: "inline-flex", alignItems: "center", gap: 4,
                                                        padding: "4px 10px", borderRadius: 999, fontSize: 10, fontWeight: 600,
                                                        background: "rgba(255,255,255,0.06)", backdropFilter: "blur(8px)",
                                                        color: SUBTYPE_COLOURS[m.detection.sub_type] || "#a78bfa",
                                                        border: "1px solid rgba(255,255,255,0.1)"
                                                    }}>
                                                        <Tag size={9} /> {m.detection.sub_type}
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}

                        {/* Typing indicator */}
                        {loading && (
                            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                                <div style={{
                                    width: 31, height: 31, borderRadius: "50%",
                                    background: "linear-gradient(135deg,#7c3aed,#2563eb)",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    boxShadow: "0 4px 14px rgba(124,58,237,0.3)",
                                }}>
                                    <Brain size={13} color="white" />
                                </div>
                                <div style={{
                                    padding: "12px 16px",
                                    background: "rgba(255,255,255,0.05)",
                                    backdropFilter: "blur(12px)",
                                    border: "1px solid rgba(255,255,255,0.08)",
                                    borderRadius: "13px 13px 13px 4px",
                                    display: "flex", gap: 5, alignItems: "center",
                                }}>
                                    {[0, 1, 2].map(i => (
                                        <span key={i} className="typing-dot" style={{
                                            width: 7, height: 7, borderRadius: "50%",
                                            background: "#a78bfa", display: "block",
                                            animationDelay: `${i * 0.2}s`,
                                        }} />
                                    ))}
                                </div>
                            </div>
                        )}
                        <div ref={scrollRef} />
                    </div>

                    {/* Input area */}
                    <div style={{
                        padding: "12px 16px",
                        borderTop: "1px solid rgba(255,255,255,0.07)",
                        background: "rgba(3,7,18,0.5)",
                        backdropFilter: "blur(20px)",
                        WebkitBackdropFilter: "blur(20px)" as any,
                        flexShrink: 0,
                    }}>
                        <div style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
                            <textarea
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                onKeyDown={handleKey}
                                placeholder="Type a message... (Enter to send)"
                                disabled={loading}
                                rows={1}
                                style={{
                                    flex: 1,
                                    background: "rgba(255,255,255,0.06)",
                                    backdropFilter: "blur(14px)",
                                    border: "1px solid rgba(255,255,255,0.1)",
                                    borderRadius: 13, padding: "12px 16px",
                                    color: "#f1f5f9", fontSize: 14,
                                    outline: "none", resize: "none", lineHeight: 1.5,
                                    fontFamily: "inherit", transition: "all 0.2s",
                                }}
                                onFocus={e => { e.target.style.borderColor = "rgba(139,92,246,0.5)"; e.target.style.boxShadow = "0 0 0 3px rgba(139,92,246,0.1)"; e.target.style.background = "rgba(255,255,255,0.08)"; }}
                                onBlur={e => { e.target.style.borderColor = "rgba(255,255,255,0.1)"; e.target.style.boxShadow = ""; e.target.style.background = "rgba(255,255,255,0.06)"; }}
                            />
                            <button
                                onClick={() => sendMessage(input)}
                                disabled={loading || !input.trim()}
                                style={{
                                    width: 46, height: 46, borderRadius: 13, cursor: "pointer",
                                    background: loading || !input.trim()
                                        ? "rgba(139,92,246,0.25)"
                                        : "linear-gradient(135deg,#7c3aed,#2563eb)",
                                    border: "none",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    flexShrink: 0, transition: "all 0.2s",
                                    boxShadow: !loading && input.trim() ? "0 4px 18px rgba(124,58,237,0.4)" : "none",
                                }}
                                onMouseEnter={e => { if (input.trim() && !loading) (e.currentTarget as HTMLElement).style.transform = "scale(1.05)"; }}
                                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ""; }}
                            >
                                <Send size={17} color="white" />
                            </button>
                        </div>
                        <p style={{ fontSize: 11, color: "rgba(241,245,249,0.22)", marginTop: 8, textAlign: "center" }}>
                            Messages are analysed by AI · Results for educational purposes only
                        </p>
                    </div>
                </div>

                {/* ─── RIGHT: Context-Aware Support & Detection Panel ─────────── */}
                <div style={{
                    width: isMobile ? "100%" : 350, flexShrink: 0,
                    display: "flex", flexDirection: "column",
                    overflowY: isMobile ? "visible" : "auto",
                }}>
                    {/* Panel header */}
                    <div style={{
                        padding: "14px 20px",
                        borderBottom: "1px solid rgba(255,255,255,0.07)",
                        background: "rgba(3,7,18,0.6)",
                        backdropFilter: "blur(20px)",
                        WebkitBackdropFilter: "blur(20px)" as any,
                        flexShrink: 0,
                    }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <div style={{
                                width: 28, height: 28, borderRadius: 8,
                                background: latest?.detection?.label === "CYBERBULLYING" ? "rgba(248,113,113,0.15)" : latest?.detection?.label === "OFFENSIVE" ? "rgba(251,191,36,0.15)" : "rgba(124,58,237,0.15)",
                                backdropFilter: "blur(10px)",
                                border: latest?.detection?.label === "CYBERBULLYING" ? "1px solid rgba(248,113,113,0.25)" : latest?.detection?.label === "OFFENSIVE" ? "1px solid rgba(251,191,36,0.25)" : "1px solid rgba(139,92,246,0.25)",
                                display: "flex", alignItems: "center", justifyContent: "center",
                            }}>
                                {latest?.detection?.label === "CYBERBULLYING" || latest?.detection?.label === "OFFENSIVE"
                                    ? <Shield size={14} color={latest?.detection?.label === "CYBERBULLYING" ? "#f87171" : "#fbbf24"} />
                                    : <Shield size={14} color="#a78bfa" />
                                }
                            </div>
                            <div>
                                <h2 style={{ fontSize: 15, fontWeight: 700, color: "#f1f5f9" }}>
                                    {latest?.detection?.label === "CYBERBULLYING" ? "Victim Support" : latest?.detection?.label === "OFFENSIVE" ? "Support & Info" : "Detection Panel"}
                                </h2>
                                <p style={{ fontSize: 12, color: "rgba(241,245,249,0.35)" }}>
                                    {latest?.detection?.label === "CYBERBULLYING" ? "We're here to help you" : latest?.detection?.label === "OFFENSIVE" ? "Resources & guidance" : "Real-time AI analysis results"}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div style={{ flex: 1, padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
                        {!latest ? (
                            <div style={{ padding: "48px 0", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 12 }}>
                                <div style={{
                                    width: 60, height: 60, borderRadius: "50%",
                                    background: "rgba(139,92,246,0.08)",
                                    backdropFilter: "blur(12px)",
                                    border: "1px solid rgba(139,92,246,0.18)",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    boxShadow: "0 0 32px rgba(139,92,246,0.12)",
                                }}>
                                    <Shield size={24} color="rgba(167,139,250,0.55)" />
                                </div>
                                <p style={{ color: "rgba(241,245,249,0.4)", fontSize: 13 }}>Send a message to see analysis and support here</p>
                            </div>
                        ) : (
                            <>
                                {/* ─── CRISIS BANNER (Death Threats / Suicidal) ─── */}
                                {latest.detection?.label === "CYBERBULLYING" && latest.detection?.sub_type && (
                                    latest.detection.sub_type.includes("Death") || latest.detection.sub_type.includes("Suicidal")
                                ) && (
                                    <div style={{
                                        background: "rgba(248,113,113,0.1)",
                                        border: "1px solid rgba(248,113,113,0.3)",
                                        borderRadius: 14, padding: "12px 14px",
                                        display: "flex", alignItems: "center", gap: 10,
                                    }}>
                                        <AlertTriangle size={18} color="#f87171" style={{ flexShrink: 0 }} />
                                        <div>
                                            <p style={{ color: "#f87171", fontSize: 13, fontWeight: 700, marginBottom: 2 }}>Crisis Support</p>
                                            <p style={{ color: "rgba(241,245,249,0.6)", fontSize: 12, lineHeight: 1.5 }}>
                                                If you&apos;re in danger, call <strong>999</strong> or Befrienders KL: <strong>03-7627 2929</strong> (24/7)
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* ─── Detection Result Card ─── */}
                                <div style={{
                                    ...PANEL_STYLE[latest.detection!.label],
                                    borderRadius: 14, padding: 18, textAlign: "center",
                                }}>
                                    <div style={{ fontSize: 11, color: "rgba(241,245,249,0.35)", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.07em" }}>Detection Result</div>
                                    <div style={{
                                        ...BADGE_STYLE[latest.detection!.label],
                                        display: "inline-flex", alignItems: "center", gap: 6,
                                        padding: "8px 20px", borderRadius: 999, fontSize: 13, fontWeight: 800, marginBottom: 10,
                                    }}>
                                        <LabelIcon label={latest.detection!.label} />
                                        {latest.detection!.label}
                                    </div>

                                    {/* Sub-type */}
                                    {latest.detection!.sub_type && latest.detection!.sub_type !== "None" && (
                                        <div style={{ marginBottom: 12 }}>
                                            <span style={{
                                                display: "inline-flex", alignItems: "center", gap: 5,
                                                padding: "4px 13px", borderRadius: 999, fontSize: 11, fontWeight: 600,
                                                background: "rgba(255,255,255,0.07)",
                                                backdropFilter: "blur(8px)",
                                                border: "1px solid rgba(255,255,255,0.1)",
                                                color: SUBTYPE_COLOURS[latest.detection!.sub_type!] || "#a78bfa"
                                            }}>
                                                <Tag size={10} /> {latest.detection!.sub_type}
                                            </span>
                                        </div>
                                    )}

                                    {/* Confidence */}
                                    <div style={{ fontSize: 12, color: "rgba(241,245,249,0.4)", marginBottom: 8 }}>
                                        Confidence: <strong>{(latest.detection!.confidence * 100).toFixed(1)}%</strong>
                                    </div>
                                    <div style={{ height: 6, background: "rgba(255,255,255,0.07)", borderRadius: 999, overflow: "hidden" }}>
                                        <div style={{
                                            height: "100%", borderRadius: 999,
                                            width: `${latest.detection!.confidence * 100}%`,
                                            background: latest.detection!.label === "SAFE" ? "linear-gradient(90deg,#34d399,#6ee7b7)"
                                                : latest.detection!.label === "OFFENSIVE" ? "linear-gradient(90deg,#fbbf24,#fde68a)"
                                                    : "linear-gradient(90deg,#f87171,#fca5a5)",
                                            transition: "width 0.6s cubic-bezier(0.4,0,0.2,1)",
                                            boxShadow: latest.detection!.label === "SAFE" ? "0 0 8px rgba(52,211,153,0.5)"
                                                : latest.detection!.label === "OFFENSIVE" ? "0 0 8px rgba(251,191,36,0.5)"
                                                    : "0 0 8px rgba(248,113,113,0.5)",
                                        }} />
                                    </div>
                                    <div style={{ fontSize: 10, color: "rgba(241,245,249,0.22)", marginTop: 7 }}>
                                        Model: {latest.detection!.model_used}
                                    </div>
                                </div>

                                {/* ─── Emotional Support Card (CYBERBULLYING / OFFENSIVE) ─── */}
                                {(latest.detection?.label === "CYBERBULLYING" || latest.detection?.label === "OFFENSIVE") && (
                                    <div style={{
                                        background: "rgba(124,58,237,0.08)",
                                        backdropFilter: "blur(14px)",
                                        border: "1px solid rgba(139,92,246,0.2)",
                                        borderRadius: 14, padding: 14,
                                    }}>
                                        <div style={{ fontSize: 11, color: "rgba(167,139,250,0.7)", marginBottom: 8, display: "flex", alignItems: "center", gap: 5, textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 700 }}>
                                             Emotional Support
                                        </div>
                                        <p style={{ fontSize: 13, color: "rgba(241,245,249,0.82)", lineHeight: 1.7 }}>
                                            {latest.text}
                                        </p>
                                    </div>
                                )}

                                {/* ─── AI Explanation (always shown) ─── */}
                                <div style={{
                                    background: "rgba(255,255,255,0.04)",
                                    backdropFilter: "blur(14px)",
                                    border: "1px solid rgba(255,255,255,0.07)",
                                    borderRadius: 14, padding: 14,
                                }}>
                                    <div style={{ fontSize: 11, color: "rgba(241,245,249,0.35)", marginBottom: 8, display: "flex", alignItems: "center", gap: 4, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                                        <Info size={10} /> AI Explanation
                                    </div>
                                    <p style={{ fontSize: 13, color: "rgba(241,245,249,0.72)", lineHeight: 1.6 }}>
                                        {latest.detection!.explanation}
                                    </p>
                                </div>

                                {/* ─── Quick Coping Action (CYBERBULLYING only) ─── */}
                                {latest.detection?.label === "CYBERBULLYING" && (
                                    <div style={{
                                        background: "rgba(52,211,153,0.06)",
                                        backdropFilter: "blur(14px)",
                                        border: "1px solid rgba(52,211,153,0.18)",
                                        borderRadius: 14, padding: 14,
                                    }}>
                                        <div style={{ fontSize: 11, color: "rgba(52,211,153,0.7)", marginBottom: 8, display: "flex", alignItems: "center", gap: 5, textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 700 }}>
                                             Quick Coping Action
                                        </div>
                                        <p style={{ fontSize: 13, color: "rgba(241,245,249,0.72)", lineHeight: 1.6, marginBottom: 8 }}>
                                            Take a slow deep breath. Breathe in for 4 seconds, hold 7, out for 8. Repeat 3 times. You are safe.
                                        </p>
                                        <a href="/support" style={{
                                            display: "inline-flex", alignItems: "center", gap: 5,
                                            fontSize: 12, color: "#34d399", fontWeight: 600, textDecoration: "none",
                                        }}>
                                            Try guided exercises → Support Hub
                                        </a>
                                    </div>
                                )}

                                {/* ─── Bot SAFE response (only for SAFE label) ─── */}
                                {latest.detection?.label === "SAFE" && (
                                    <div style={{
                                        background: "rgba(124,58,237,0.08)",
                                        backdropFilter: "blur(14px)",
                                        border: "1px solid rgba(139,92,246,0.18)",
                                        borderRadius: 14, padding: 14,
                                    }}>
                                        <div style={{ fontSize: 11, color: "rgba(167,139,250,0.6)", marginBottom: 8, display: "flex", alignItems: "center", gap: 4, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                                            <Brain size={10} /> Bot Response
                                        </div>
                                        <p style={{ fontSize: 13, color: "rgba(241,245,249,0.78)", lineHeight: 1.6 }}>
                                            {latest.text}
                                        </p>
                                    </div>
                                )}

                                {/* ─── Suggestions as styled cards ─── */}
                                {latest.suggestions && latest.suggestions.length > 0 && (
                                    <div style={{
                                        background: "rgba(255,255,255,0.03)",
                                        backdropFilter: "blur(14px)",
                                        border: "1px solid rgba(255,255,255,0.07)",
                                        borderRadius: 14, padding: 14,
                                    }}>
                                        <div style={{ fontSize: 11, color: "rgba(241,245,249,0.35)", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                                            {latest.detection?.label === "CYBERBULLYING" ? " What You Can Do" : latest.detection?.label === "OFFENSIVE" ? " Suggested Actions" : " Tips"}
                                        </div>
                                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                            {latest.suggestions.map((s, i) => (
                                                <div key={i} style={{
                                                    display: "flex", alignItems: "flex-start", gap: 8,
                                                    fontSize: 12, color: "rgba(241,245,249,0.65)", lineHeight: 1.55,
                                                    padding: "6px 8px", borderRadius: 10,
                                                    background: "rgba(255,255,255,0.02)",
                                                    border: "1px solid rgba(255,255,255,0.04)",
                                                }}>
                                                    <span style={{ color: "#a78bfa", fontWeight: 800, flexShrink: 0, fontSize: 13 }}>{i + 1}.</span>
                                                    {s}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* ─── Get More Support Link (CYBERBULLYING / OFFENSIVE) ─── */}
                                {(latest.detection?.label === "CYBERBULLYING" || latest.detection?.label === "OFFENSIVE") && (
                                    <a href="/support" style={{
                                        display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                                        padding: "12px 16px", borderRadius: 12, textDecoration: "none",
                                        background: "linear-gradient(135deg, rgba(124,58,237,0.15), rgba(37,99,235,0.12))",
                                        border: "1px solid rgba(139,92,246,0.3)",
                                        color: "#c4b5fd", fontSize: 13, fontWeight: 700,
                                        transition: "all 0.2s",
                                    }}>
                                         Get More Support &amp; Coping Resources
                                    </a>
                                )}

                                {/* ─── Copy button ─── */}
                                <button
                                    onClick={() => copyText(latest.text)}
                                    style={{
                                        background: "rgba(255,255,255,0.04)",
                                        backdropFilter: "blur(10px)",
                                        border: "1px solid rgba(255,255,255,0.08)",
                                        borderRadius: 10, padding: "8px 14px", cursor: "pointer", fontSize: 12,
                                        color: "rgba(241,245,249,0.5)",
                                        display: "flex", alignItems: "center", gap: 6, transition: "all 0.2s",
                                    }}
                                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.08)"; (e.currentTarget as HTMLElement).style.color = "#f1f5f9"; }}
                                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.04)"; (e.currentTarget as HTMLElement).style.color = "rgba(241,245,249,0.5)"; }}
                                >
                                    <Copy size={11} /> {copied ? "Copied!" : "Copy bot response"}
                                </button>
                            </>
                        )}
                    </div>
                </div>

                {/* ─── Mobile Sidebar Overlay ──────────────────────────────────── */}
                {isMobile && mobileSidebarOpen && (
                    <div style={{
                        position: "fixed", top: 0, left: 0, width: "100%", height: "100%", zIndex: 100,
                        background: "rgba(0,0,0,0.55)", backdropFilter: "blur(6px)", display: "flex"
                    }}>
                        <div style={{
                            width: 290, height: "100%",
                            background: "rgba(3,7,18,0.92)",
                            backdropFilter: "blur(32px)",
                            borderRight: "1px solid rgba(255,255,255,0.1)",
                            display: "flex", flexDirection: "column",
                            boxShadow: "8px 0 40px rgba(0,0,0,0.5)",
                        }}>
                            <div style={{ padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                                <h3 style={{ fontSize: 15, fontWeight: 700, color: "#f1f5f9", margin: 0 }}>Chat History</h3>
                                <button onClick={() => setMobileSidebarOpen(false)} style={{
                                    background: "rgba(255,255,255,0.05)", backdropFilter: "blur(10px)",
                                    border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: 6,
                                    color: "rgba(255,255,255,0.6)", cursor: "pointer", display: "flex",
                                }}>
                                    <X size={17} />
                                </button>
                            </div>
                            <div style={{ padding: 16 }}>
                                <button onClick={startNewChat} style={{
                                    width: "100%", padding: "10px",
                                    background: "linear-gradient(135deg,#7c3aed,#2563eb)",
                                    border: "none", borderRadius: 11, color: "white", fontWeight: 700,
                                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8, cursor: "pointer",
                                    boxShadow: "0 4px 18px rgba(124,58,237,0.35)",
                                }}>
                                    <Plus size={16} /> New Chat
                                </button>
                            </div>
                            <div style={{ flex: 1, overflowY: "auto", padding: "0 12px 16px", display: "flex", flexDirection: "column", gap: 4 }}>
                                {sessions.map(s => (
                                    <button key={s.session_id} onClick={() => userId && loadSession(userId, s.session_id)} style={{
                                        width: "100%", padding: "12px",
                                        background: activeSessionId === s.session_id ? "rgba(139,92,246,0.14)" : "transparent",
                                        border: activeSessionId === s.session_id ? "1px solid rgba(139,92,246,0.28)" : "1px solid transparent",
                                        borderRadius: 10,
                                        color: activeSessionId === s.session_id ? "#f1f5f9" : "rgba(241,245,249,0.6)",
                                        display: "flex", alignItems: "center", gap: 10, cursor: "pointer", textAlign: "left",
                                        transition: "all 0.2s",
                                    }}>
                                        <MessageCircle size={14} color={activeSessionId === s.session_id ? "#a78bfa" : "rgba(241,245,249,0.35)"} style={{ flexShrink: 0 }} />
                                        <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", fontSize: 14, flex: 1 }}>
                                            {s.last_message || "Empty chat"}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div style={{ flex: 1 }} onClick={() => setMobileSidebarOpen(false)} />
                    </div>
                )}
            </div>
        </AuthGuard>
    );
}
