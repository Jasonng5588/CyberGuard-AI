"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";
import { X, Mail, Lock, Loader2, UserPlus, LogIn, Shield } from "lucide-react";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    defaultMode?: "login" | "signup";
}

export function AuthModal({ isOpen, onClose, defaultMode = "login" }: Props) {
    const [mode, setMode] = useState<"login" | "signup">(defaultMode);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null);
    const supabase = createClient();

    useEffect(() => { if (isOpen) setMode(defaultMode); }, [isOpen, defaultMode]);

    if (!isOpen) return null;

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        try {
            if (mode === "signup") {
                const { error } = await supabase.auth.signUp({ email, password });
                if (error) throw error;
                setMessage({ text: "Account created! You can now sign in.", ok: true });
                setMode("login");
            } else {
                const { error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) throw error;
                onClose();
            }
        } catch (err: any) {
            setMessage({ text: err.message || "An error occurred. Please try again.", ok: false });
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <style>{`
                @keyframes modalIn {
                    from { opacity: 0; transform: scale(0.94) translateY(16px); }
                    to   { opacity: 1; transform: scale(1) translateY(0); }
                }
                @keyframes overlayIn {
                    from { opacity: 0; }
                    to   { opacity: 1; }
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to   { transform: rotate(360deg); }
                }
            `}</style>

            {/* Backdrop */}
            <div
                style={{
                    position: "fixed", inset: 0, zIndex: 200,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    background: "rgba(0,0,0,0.6)",
                    backdropFilter: "blur(10px)",
                    WebkitBackdropFilter: "blur(10px)",
                    padding: 20,
                    animation: "overlayIn 0.2s ease both",
                }}
                onClick={(e) => e.target === e.currentTarget && onClose()}
            >
                {/* Glass modal */}
                <div style={{
                    position: "relative", width: "100%", maxWidth: 440,
                    background: "rgba(8, 12, 28, 0.85)",
                    backdropFilter: "blur(32px)",
                    WebkitBackdropFilter: "blur(32px)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 22,
                    boxShadow: "0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(139,92,246,0.12), inset 0 1px 0 rgba(255,255,255,0.08)",
                    overflow: "hidden",
                    animation: "modalIn 0.3s cubic-bezier(0.16,1,0.3,1) both",
                }}>

                    {/* Top gradient bar */}
                    <div style={{ height: 3, background: "linear-gradient(90deg,#7c3aed,#2563eb,#06b6d4)" }} />

                    {/* Ambient glow inside modal */}
                    <div style={{
                        position: "absolute", top: -60, right: -60,
                        width: 200, height: 200,
                        background: "radial-gradient(circle, rgba(124,58,237,0.15), transparent 70%)",
                        pointerEvents: "none",
                    }} />

                    {/* Close button */}
                    <button onClick={onClose} style={{
                        position: "absolute", top: 16, right: 16,
                        background: "rgba(255,255,255,0.05)",
                        backdropFilter: "blur(10px)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        cursor: "pointer", color: "rgba(241,245,249,0.5)",
                        padding: 6, borderRadius: 8, display: "flex",
                        transition: "all 0.2s",
                    }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.1)"; (e.currentTarget as HTMLElement).style.color = "#f1f5f9"; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.05)"; (e.currentTarget as HTMLElement).style.color = "rgba(241,245,249,0.5)"; }}
                    >
                        <X size={16} />
                    </button>

                    <div style={{ padding: "32px 36px 36px" }}>
                        {/* Icon + Title */}
                        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                            <div style={{
                                width: 40, height: 40, borderRadius: 11,
                                background: "linear-gradient(135deg,#7c3aed,#2563eb)",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                boxShadow: "0 4px 18px rgba(124,58,237,0.4), inset 0 1px 0 rgba(255,255,255,0.2)",
                            }}>
                                <Shield size={18} color="white" />
                            </div>
                            <h2 style={{ fontSize: 22, fontWeight: 800, color: "#f1f5f9" }}>
                                {mode === "login" ? "Welcome back" : "Join CyberGuard"}
                            </h2>
                        </div>
                        <p style={{ fontSize: 13, color: "rgba(241,245,249,0.45)", marginBottom: 24, paddingLeft: 52 }}>
                            {mode === "login"
                                ? "Sign in to access your dashboard and chat history."
                                : "Create a free account to start detecting cyberbullying."}
                        </p>

                        {/* Message */}
                        {message && (
                            <div style={{
                                padding: "11px 14px", borderRadius: 11, fontSize: 13, marginBottom: 18,
                                background: message.ok ? "rgba(52,211,153,0.08)" : "rgba(248,113,113,0.08)",
                                border: `1px solid ${message.ok ? "rgba(52,211,153,0.28)" : "rgba(248,113,113,0.28)"}`,
                                color: message.ok ? "#34d399" : "#f87171",
                                backdropFilter: "blur(10px)",
                            }}>{message.text}</div>
                        )}

                        <form onSubmit={handleAuth} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                            {/* Email */}
                            <div>
                                <label style={{ fontSize: 12, fontWeight: 700, color: "rgba(241,245,249,0.55)", display: "block", marginBottom: 7, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                                    Email address
                                </label>
                                <div style={{ position: "relative" }}>
                                    <span style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", color: "rgba(241,245,249,0.3)" }}>
                                        <Mail size={15} />
                                    </span>
                                    <input
                                        type="email" required value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        placeholder="you@example.com"
                                        style={{
                                            width: "100%", padding: "11px 14px 11px 40px",
                                            background: "rgba(255,255,255,0.05)",
                                            backdropFilter: "blur(10px)",
                                            border: "1px solid rgba(255,255,255,0.1)",
                                            borderRadius: 11, color: "#f1f5f9", fontSize: 14,
                                            outline: "none", fontFamily: "inherit",
                                            transition: "all 0.2s",
                                        }}
                                        onFocus={e => { e.target.style.borderColor = "rgba(139,92,246,0.5)"; e.target.style.boxShadow = "0 0 0 3px rgba(139,92,246,0.1)"; e.target.style.background = "rgba(255,255,255,0.07)"; }}
                                        onBlur={e => { e.target.style.borderColor = "rgba(255,255,255,0.1)"; e.target.style.boxShadow = ""; e.target.style.background = "rgba(255,255,255,0.05)"; }}
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div>
                                <label style={{ fontSize: 12, fontWeight: 700, color: "rgba(241,245,249,0.55)", display: "block", marginBottom: 7, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                                    Password
                                </label>
                                <div style={{ position: "relative" }}>
                                    <span style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", color: "rgba(241,245,249,0.3)" }}>
                                        <Lock size={15} />
                                    </span>
                                    <input
                                        type="password" required value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        style={{
                                            width: "100%", padding: "11px 14px 11px 40px",
                                            background: "rgba(255,255,255,0.05)",
                                            backdropFilter: "blur(10px)",
                                            border: "1px solid rgba(255,255,255,0.1)",
                                            borderRadius: 11, color: "#f1f5f9", fontSize: 14,
                                            outline: "none", fontFamily: "inherit",
                                            transition: "all 0.2s",
                                        }}
                                        onFocus={e => { e.target.style.borderColor = "rgba(139,92,246,0.5)"; e.target.style.boxShadow = "0 0 0 3px rgba(139,92,246,0.1)"; e.target.style.background = "rgba(255,255,255,0.07)"; }}
                                        onBlur={e => { e.target.style.borderColor = "rgba(255,255,255,0.1)"; e.target.style.boxShadow = ""; e.target.style.background = "rgba(255,255,255,0.05)"; }}
                                    />
                                </div>
                            </div>

                            {/* Submit */}
                            <button type="submit" disabled={loading} style={{
                                width: "100%", padding: "13px 0", borderRadius: 12, border: "none",
                                background: loading
                                    ? "rgba(124,58,237,0.4)"
                                    : "linear-gradient(135deg,#7c3aed,#2563eb)",
                                color: "white", fontSize: 15, fontWeight: 700,
                                cursor: loading ? "not-allowed" : "pointer",
                                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                                boxShadow: loading ? "none" : "0 6px 24px rgba(124,58,237,0.4), inset 0 1px 0 rgba(255,255,255,0.15)",
                                transition: "all 0.25s",
                            }}
                                onMouseEnter={e => { if (!loading) { (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 10px 32px rgba(124,58,237,0.5)"; } }}
                                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ""; (e.currentTarget as HTMLElement).style.boxShadow = loading ? "none" : "0 6px 24px rgba(124,58,237,0.4)"; }}
                            >
                                {loading
                                    ? <><Loader2 size={17} style={{ animation: "spin 1s linear infinite" }} /> Please wait...</>
                                    : mode === "login"
                                        ? <><LogIn size={16} /> Sign In</>
                                        : <><UserPlus size={16} /> Create Account</>
                                }
                            </button>
                        </form>

                        {/* Toggle */}
                        <p style={{ marginTop: 20, textAlign: "center", fontSize: 13, color: "rgba(241,245,249,0.4)" }}>
                            {mode === "login" ? "Don't have an account? " : "Already have an account? "}
                            <button
                                type="button"
                                onClick={() => { setMode(mode === "login" ? "signup" : "login"); setMessage(null); }}
                                style={{ background: "none", border: "none", color: "#a78bfa", fontWeight: 700, cursor: "pointer", fontSize: 13 }}
                            >
                                {mode === "login" ? "Sign up free" : "Log in"}
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}
