"use client";

import { useState, useEffect } from "react";
import { getLogs, deleteLog, getDetectionLogs, deleteDetection, getAllSessionsAdmin, getSessionHistory, getAnalytics } from "@/lib/api";
import { LogEntry, DetectionLogEntry, AdminSessionPreview, AnalyticsData } from "@/lib/api";
import { Trash2, ShieldAlert, Database, Lock, User, RefreshCw, Key, Shield, MessageSquare, X, ChevronRight, Brain, TrendingUp } from "lucide-react";
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const PIE_COLORS = ["#f87171", "#fbbf24", "#34d399"];
const chartTooltip = {
    contentStyle: { background: "rgba(6,11,20,0.95)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#f1f5f9", fontSize: 12 }
};
const card = (icon: React.ReactNode, title: string, value: string | number, sub: string, accent: string) => (
    <div style={{ background: "rgba(255,255,255,0.04)", border: `1px solid rgba(255,255,255,0.07)`, borderRadius: 14, padding: 22, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: 0, right: 0, width: 80, height: 80, background: `${accent}14`, borderRadius: "0 14px 0 80px" }} />
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: `${accent}22`, display: "flex", alignItems: "center", justifyContent: "center" }}>{icon}</div>
            <span style={{ fontSize: 12, color: "rgba(241,245,249,0.45)", fontWeight: 500 }}>{title}</span>
        </div>
        <div style={{ fontSize: 28, fontWeight: 800, color: "#f1f5f9", lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: 12, color: "rgba(241,245,249,0.35)", marginTop: 6 }}>{sub}</div>
    </div>
);

export default function AdminPage() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loginError, setLoginError] = useState("");

    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [detections, setDetections] = useState<DetectionLogEntry[]>([]);
    const [sessions, setSessions] = useState<AdminSessionPreview[]>([]);
    const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<"logs" | "detections" | "sessions" | "analytics">("analytics");

    // Modal state for viewing transcripts
    const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
    const [selectedSessionLogs, setSelectedSessionLogs] = useState<LogEntry[]>([]);
    const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);
    const [loadingTranscript, setLoadingTranscript] = useState(false);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (username === "admin123" && password === "admin123") {
            setIsAuthenticated(true);
            setLoginError("");
            fetchData();
        } else {
            setLoginError("Invalid super admin credentials");
        }
    };

    const handleLogout = () => {
        setIsAuthenticated(false);
        setUsername("");
        setPassword("");
        setLogs([]);
        setDetections([]);
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            const [logsRes, detRes, sesRes, anaRes] = await Promise.all([
                getLogs(1, 100),
                getDetectionLogs(100),
                getAllSessionsAdmin(200),
                getAnalytics()
            ]);
            setLogs(logsRes.logs);
            setDetections(detRes);
            setSessions(sesRes);
            setAnalytics(anaRes);
        } catch (err) {
            console.error("Failed to fetch admin data", err);
        } finally {
            setLoading(false);
        }
    };

    const handleViewTranscript = async (userId: number, sessionId: string) => {
        setIsSessionModalOpen(true);
        setSelectedSessionId(sessionId);
        setLoadingTranscript(true);
        try {
            const history = await getSessionHistory(userId, sessionId);
            setSelectedSessionLogs(history);
        } catch (e) {
            alert("Failed to load transcript");
        } finally {
            setLoadingTranscript(false);
        }
    };

    const handleDeleteLog = async (id: number) => {
        if (!confirm("Are you sure you want to permanently delete this chat log?")) return;
        try {
            await deleteLog(id);
            setLogs(logs.filter(l => l.id !== id));
        } catch (err) {
            alert("Failed to delete log");
        }
    };

    const handleDeleteDetection = async (id: number) => {
        if (!confirm("Are you sure you want to permanently delete this detection log and its associated message?")) return;
        try {
            await deleteDetection(id);
            setDetections(detections.filter(d => d.id !== id));
        } catch (err) {
            alert("Failed to delete detection log");
        }
    };

    // ─── LOGIN SCREEN ──────────────────────────────────────────────────────────
    if (!isAuthenticated) {
        return (
            <div style={{
                height: "calc(100vh - 64px)", display: "flex", alignItems: "center", justifyContent: "center",
                background: "linear-gradient(180deg, rgba(6,11,20,1) 0%, rgba(15,23,42,1) 100%)"
            }}>
                <div style={{
                    width: "100%", maxWidth: 400, background: "rgba(15,23,42,0.8)",
                    border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16, overflow: "hidden",
                    backdropFilter: "blur(12px)", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)"
                }}>
                    <div style={{ height: 4, background: "linear-gradient(90deg, #ef4444, #f97316)" }} />
                    <div style={{ padding: 30 }}>
                        <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
                            <div style={{
                                width: 56, height: 56, borderRadius: "50%", background: "rgba(239,68,68,0.1)",
                                border: "1px solid rgba(239,68,68,0.2)", display: "flex", alignItems: "center", justifyContent: "center"
                            }}>
                                <ShieldAlert size={28} color="#ef4444" />
                            </div>
                        </div>
                        <h1 style={{ fontSize: 22, fontWeight: 700, color: "#f8fafc", textAlign: "center", marginBottom: 6 }}>Super Admin Access</h1>
                        <p style={{ fontSize: 13, color: "rgba(248,250,252,0.5)", textAlign: "center", marginBottom: 30 }}>
                            Restricted area. Authorised personnel only.
                        </p>

                        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                            {loginError && (
                                <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: "#fca5a5", padding: "10px 14px", borderRadius: 8, fontSize: 13, display: "flex", alignItems: "center", gap: 8 }}>
                                    <AlertTriangle size={14} /> {loginError}
                                </div>
                            )}
                            <div>
                                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "rgba(248,250,252,0.6)", marginBottom: 6 }}>USERNAME</label>
                                <div style={{ position: "relative" }}>
                                    <User size={16} color="rgba(248,250,252,0.4)" style={{ position: "absolute", left: 14, top: 12 }} />
                                    <input
                                        type="text" value={username} onChange={e => setUsername(e.target.value)} required
                                        style={{ width: "100%", background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "11px 14px 11px 40px", color: "white", fontSize: 14, outline: "none" }}
                                    />
                                </div>
                            </div>
                            <div>
                                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "rgba(248,250,252,0.6)", marginBottom: 6 }}>PASSWORD</label>
                                <div style={{ position: "relative" }}>
                                    <Key size={16} color="rgba(248,250,252,0.4)" style={{ position: "absolute", left: 14, top: 12 }} />
                                    <input
                                        type="password" value={password} onChange={e => setPassword(e.target.value)} required
                                        style={{ width: "100%", background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "11px 14px 11px 40px", color: "white", fontSize: 14, outline: "none" }}
                                    />
                                </div>
                            </div>
                            <button type="submit" style={{
                                marginTop: 10, background: "linear-gradient(135deg, #ef4444, #b91c1c)", color: "white",
                                border: "none", borderRadius: 8, padding: "12px", fontSize: 14, fontWeight: 600, cursor: "pointer",
                                boxShadow: "0 4px 15px rgba(239,68,68,0.2)"
                            }}>
                                Authenticate System
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        );
    }

    // ─── ADMIN DASHBOARD ───────────────────────────────────────────────────────
    return (
        <div style={{ padding: "40px 20px", maxWidth: 1200, margin: "0 auto", color: "#f8fafc" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 30, flexWrap: "wrap", gap: 20 }}>
                <div>
                    <h1 style={{ fontSize: 28, fontWeight: 800, display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                        <ShieldAlert size={28} color="#ef4444" />
                        Super Admin Control Panel
                    </h1>
                    <p style={{ color: "rgba(248,250,252,0.5)" }}>Manage system records securely. Actions taken here are permanent.</p>
                </div>
                <div style={{ display: "flex", gap: 12 }}>
                    <button onClick={fetchData} style={{
                        background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
                        color: "white", padding: "8px 16px", borderRadius: 8, fontSize: 13, cursor: "pointer",
                        display: "flex", alignItems: "center", gap: 6
                    }}>
                        <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh Data
                    </button>
                    <button onClick={handleLogout} style={{
                        background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)",
                        color: "#fca5a5", padding: "8px 16px", borderRadius: 8, fontSize: 13, cursor: "pointer",
                        display: "flex", alignItems: "center", gap: 6
                    }}>
                        <Lock size={14} /> Sign Out
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div style={{ display: "flex", gap: 10, marginBottom: 20, borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: 16 }}>
                <button
                    onClick={() => setActiveTab("analytics")}
                    style={{
                        background: activeTab === "analytics" ? "rgba(255,255,255,0.1)" : "transparent",
                        border: "1px solid", borderColor: activeTab === "analytics" ? "rgba(255,255,255,0.2)" : "transparent",
                        padding: "8px 16px", borderRadius: 8, color: activeTab === "analytics" ? "white" : "rgba(255,255,255,0.5)",
                        cursor: "pointer", fontWeight: 600, display: "flex", alignItems: "center", gap: 8
                    }}
                >
                    <TrendingUp size={16} /> Global Analytics
                </button>
                <button
                    onClick={() => setActiveTab("logs")}
                    style={{
                        background: activeTab === "logs" ? "rgba(255,255,255,0.1)" : "transparent",
                        border: "1px solid", borderColor: activeTab === "logs" ? "rgba(255,255,255,0.2)" : "transparent",
                        padding: "8px 16px", borderRadius: 8, color: activeTab === "logs" ? "white" : "rgba(255,255,255,0.5)",
                        cursor: "pointer", fontWeight: 600, display: "flex", alignItems: "center", gap: 8
                    }}
                >
                    <Database size={16} /> Chat Logs ({logs.length})
                </button>
                <button
                    onClick={() => setActiveTab("detections")}
                    style={{
                        background: activeTab === "detections" ? "rgba(255,255,255,0.1)" : "transparent",
                        border: "1px solid", borderColor: activeTab === "detections" ? "rgba(255,255,255,0.2)" : "transparent",
                        padding: "8px 16px", borderRadius: 8, color: activeTab === "detections" ? "white" : "rgba(255,255,255,0.5)",
                        cursor: "pointer", fontWeight: 600, display: "flex", alignItems: "center", gap: 8
                    }}
                >
                    <Shield size={16} /> Detection Records ({detections.length})
                </button>
                <button
                    onClick={() => setActiveTab("sessions")}
                    style={{
                        background: activeTab === "sessions" ? "rgba(255,255,255,0.1)" : "transparent",
                        border: "1px solid", borderColor: activeTab === "sessions" ? "rgba(255,255,255,0.2)" : "transparent",
                        padding: "8px 16px", borderRadius: 8, color: activeTab === "sessions" ? "white" : "rgba(255,255,255,0.5)",
                        cursor: "pointer", fontWeight: 600, display: "flex", alignItems: "center", gap: 8
                    }}
                >
                    <MessageSquare size={16} /> User Sessions ({sessions.length})
                </button>
            </div>

            {/* Content Area */}
            {activeTab === "analytics" && analytics && (
                <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
                        {card(<MessageSquare size={16} color="#a78bfa" />, "Total Platform Msgs", analytics.total_messages.toLocaleString(), "All time messages", "#7c3aed")}
                        {card(<ShieldAlert size={16} color="#f87171" />, "Cyberbullying", analytics.total_bullying.toLocaleString(), `${analytics.bullying_rate.toFixed(1)}% of total`, "#dc2626")}
                        {card(<Shield size={16} color="#fbbf24" />, "Offensive", analytics.total_offensive.toLocaleString(), "Potentially harmful", "#b45309")}
                        {card(<TrendingUp size={16} color="#34d399" />, "Safe Messages", analytics.total_safe.toLocaleString(), "Clean content", "#047857")}
                    </div>

                    <div style={{ display: "flex", flexWrap: "wrap", gap: 20 }}>
                        <div style={{ flex: "2 1 500px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: 20 }}>
                            <p style={{ fontSize: 13, fontWeight: 600, color: "#f1f5f9", marginBottom: 16 }}>Detection Trends (Platform-Wide)</p>
                            <ResponsiveContainer width="100%" height={240}>
                                <LineChart data={analytics.daily_stats.map(d => ({ ...d, date: new Date(d.date).toLocaleDateString("en-MY", { month: "short", day: "numeric" }) }))}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                    <XAxis dataKey="date" tick={{ fill: "rgba(241,245,249,0.3)", fontSize: 10 }} />
                                    <YAxis tick={{ fill: "rgba(241,245,249,0.3)", fontSize: 10 }} />
                                    <Tooltip {...chartTooltip} />
                                    <Line type="monotone" dataKey="cyberbullying" stroke="#f87171" strokeWidth={2} dot={false} name="Cyberbullying" />
                                    <Line type="monotone" dataKey="offensive" stroke="#fbbf24" strokeWidth={2} dot={false} name="Offensive" />
                                    <Line type="monotone" dataKey="safe" stroke="#34d399" strokeWidth={2} dot={false} name="Safe" />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>

                        <div style={{ flex: "1 1 250px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: 20 }}>
                            <p style={{ fontSize: 13, fontWeight: 600, color: "#f1f5f9", marginBottom: 16 }}>Label Distribution</p>
                            <ResponsiveContainer width="100%" height={180}>
                                <PieChart>
                                    <Pie data={[
                                        { name: "Cyberbullying", value: analytics.total_bullying || 1 },
                                        { name: "Offensive", value: analytics.total_offensive || 1 },
                                        { name: "Safe", value: analytics.total_safe || 1 }
                                    ]} cx="50%" cy="50%" innerRadius={60} outerRadius={80} dataKey="value" stroke="none">
                                        {[0, 1, 2].map((_, i) => <Cell key={`cell-${i}`} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                                    </Pie>
                                    <Tooltip {...chartTooltip} />
                                </PieChart>
                            </ResponsiveContainer>
                            <div style={{ display: "flex", justifyContent: "center", gap: 14, marginTop: 10 }}>
                                {["Bullying", "Offensive", "Safe"].map((lbl, i) => (
                                    <div key={lbl} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "rgba(255,255,255,0.5)" }}>
                                        <div style={{ width: 8, height: 8, borderRadius: "50%", background: PIE_COLORS[i] }} /> {lbl}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab !== "analytics" && (
                <div style={{ background: "rgba(15,23,42,0.6)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, overflow: "hidden" }}>
                    <div style={{ overflowX: "auto" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                            <thead>
                                <tr style={{ background: "rgba(255,255,255,0.03)", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
                                    <th style={{ padding: "14px 16px", fontSize: 12, color: "rgba(255,255,255,0.4)" }}>ID</th>
                                    <th style={{ padding: "14px 16px", fontSize: 12, color: "rgba(255,255,255,0.4)" }}>TIMESTAMP</th>
                                    <th style={{ padding: "14px 16px", fontSize: 12, color: "rgba(255,255,255,0.4)" }}>USER</th>
                                    {activeTab === "logs" && (
                                        <>
                                            <th style={{ padding: "14px 16px", fontSize: 12, color: "rgba(255,255,255,0.4)" }}>USER MESSAGE</th>
                                            <th style={{ padding: "14px 16px", fontSize: 12, color: "rgba(255,255,255,0.4)" }}>LABEL</th>
                                        </>
                                    )}
                                    {activeTab === "detections" && (
                                        <>
                                            <th style={{ padding: "14px 16px", fontSize: 12, color: "rgba(255,255,255,0.4)" }}>MESSAGE TEXT</th>
                                            <th style={{ padding: "14px 16px", fontSize: 12, color: "rgba(255,255,255,0.4)" }}>DETECTION</th>
                                        </>
                                    )}
                                    {activeTab === "sessions" && (
                                        <>
                                            <th style={{ padding: "14px 16px", fontSize: 12, color: "rgba(255,255,255,0.4)" }}>MESSAGES</th>
                                            <th style={{ padding: "14px 16px", fontSize: 12, color: "rgba(255,255,255,0.4)" }}>LAST MESSAGE</th>
                                        </>
                                    )}
                                    <th style={{ padding: "14px 16px", fontSize: 12, color: "rgba(255,255,255,0.4)", textAlign: "right" }}>ACTIONS</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading && (
                                    <tr>
                                        <td colSpan={6} style={{ padding: 40, textAlign: "center", color: "rgba(255,255,255,0.5)" }}>
                                            <RefreshCw size={24} className="animate-spin" style={{ margin: "0 auto", marginBottom: 10 }} />
                                            Loading records...
                                        </td>
                                    </tr>
                                )}

                                {!loading && activeTab === "logs" && logs.map(log => (
                                    <tr key={log.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                                        <td style={{ padding: "14px 16px", fontSize: 13, color: "rgba(255,255,255,0.4)" }}>#{log.id}</td>
                                        <td style={{ padding: "14px 16px", fontSize: 13 }}>{new Date(log.timestamp).toLocaleString()}</td>
                                        <td style={{ padding: "14px 16px", fontSize: 13, color: "#94a3b8" }}>{log.username}</td>
                                        <td style={{ padding: "14px 16px", fontSize: 13, maxWidth: 300 }}><div style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{log.user_message}</div></td>
                                        <td style={{ padding: "14px 16px" }}>
                                            <span style={{
                                                padding: "3px 8px", borderRadius: 4, fontSize: 11, fontWeight: 700,
                                                background: log.detection_label === 'SAFE' ? "rgba(52,211,153,0.15)" : log.detection_label === 'CYBERBULLYING' ? "rgba(248,113,113,0.15)" : "rgba(251,191,36,0.15)",
                                                color: log.detection_label === 'SAFE' ? "#34d399" : log.detection_label === 'CYBERBULLYING' ? "#f87171" : "#fbbf24",
                                            }}>{log.detection_label}</span>
                                        </td>
                                        <td style={{ padding: "14px 16px", textAlign: "right" }}>
                                            <button onClick={() => handleDeleteLog(log.id)} style={{
                                                background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)",
                                                color: "#f87171", borderRadius: 6, padding: "6px 10px", cursor: "pointer",
                                                display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12
                                            }}>
                                                <Trash2 size={13} /> Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}

                                {!loading && activeTab === "detections" && detections.map(det => (
                                    <tr key={det.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                                        <td style={{ padding: "14px 16px", fontSize: 13, color: "rgba(255,255,255,0.4)" }}>#{det.id}</td>
                                        <td style={{ padding: "14px 16px", fontSize: 13 }}>{new Date(det.created_at).toLocaleString()}</td>
                                        <td style={{ padding: "14px 16px", fontSize: 13, color: "#94a3b8" }}>{det.username}</td>
                                        <td style={{ padding: "14px 16px", fontSize: 13, maxWidth: 300 }}><div style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{det.message_text}</div></td>
                                        <td style={{ padding: "14px 16px" }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                                <span style={{
                                                    padding: "3px 8px", borderRadius: 4, fontSize: 11, fontWeight: 700,
                                                    background: det.label === 'SAFE' ? "rgba(52,211,153,0.15)" : det.label === 'CYBERBULLYING' ? "rgba(248,113,113,0.15)" : "rgba(251,191,36,0.15)",
                                                    color: det.label === 'SAFE' ? "#34d399" : det.label === 'CYBERBULLYING' ? "#f87171" : "#fbbf24",
                                                }}>{det.label}</span>
                                                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>{(det.confidence * 100).toFixed(1)}%</span>
                                            </div>
                                        </td>
                                        <td style={{ padding: "14px 16px", textAlign: "right" }}>
                                            <button onClick={() => handleDeleteDetection(det.id)} style={{
                                                background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)",
                                                color: "#f87171", borderRadius: 6, padding: "6px 10px", cursor: "pointer",
                                                display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12
                                            }}>
                                                <Trash2 size={13} /> Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}

                                {!loading && activeTab === "sessions" && sessions.map(ses => (
                                    <tr key={ses.session_id} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                                        <td style={{ padding: "14px 16px", fontSize: 13, color: "rgba(255,255,255,0.4)" }}>{ses.session_id.split("-")[0]}...</td>
                                        <td style={{ padding: "14px 16px", fontSize: 13 }}>{new Date(ses.timestamp).toLocaleString()}</td>
                                        <td style={{ padding: "14px 16px", fontSize: 13, color: "#94a3b8" }}>{ses.username} (ID: {ses.user_id})</td>
                                        <td style={{ padding: "14px 16px", fontSize: 13 }}>{ses.message_count} messages</td>
                                        <td style={{ padding: "14px 16px", fontSize: 13, maxWidth: 300 }}><div style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", color: "rgba(248,250,252,0.7)" }}>"{ses.last_message}"</div></td>
                                        <td style={{ padding: "14px 16px", textAlign: "right" }}>
                                            <button onClick={() => handleViewTranscript(ses.user_id, ses.session_id)} style={{
                                                background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.3)",
                                                color: "#c4b5fd", borderRadius: 6, padding: "6px 12px", cursor: "pointer",
                                                display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 600
                                            }}>
                                                Transcript <ChevronRight size={14} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}

                                {!loading && ((activeTab === "logs" && logs.length === 0) || (activeTab === "detections" && detections.length === 0) || (activeTab === "sessions" && sessions.length === 0)) && (
                                    <tr>
                                        <td colSpan={6} style={{ padding: 40, textAlign: "center", color: "rgba(255,255,255,0.3)", fontSize: 14 }}>
                                            No records found in database.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Session Transcript Modal */}
            {isSessionModalOpen && (
                <div style={{
                    position: "fixed", top: 0, left: 0, width: "100%", height: "100%", zIndex: 9999,
                    background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center"
                }}>
                    <div style={{
                        width: "100%", maxWidth: 800, background: "#0f172a", border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: 16, height: "85vh", display: "flex", flexDirection: "column", overflow: "hidden",
                        boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)"
                    }}>
                        <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.1)", display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(255,255,255,0.03)" }}>
                            <div>
                                <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: "white" }}>Chat Session Transcript</h3>
                                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>Session: {selectedSessionId}</div>
                            </div>
                            <button onClick={() => setIsSessionModalOpen(false)} style={{ background: "transparent", border: "none", color: "white", cursor: "pointer", padding: 8 }}>
                                <X size={20} />
                            </button>
                        </div>

                        <div style={{ flex: 1, overflowY: "auto", padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
                            {loadingTranscript ? (
                                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: 12, color: "rgba(255,255,255,0.5)" }}>
                                    <RefreshCw className="animate-spin" size={24} />
                                    <span>Loading exact transcript...</span>
                                </div>
                            ) : selectedSessionLogs.length === 0 ? (
                                <div style={{ textAlign: "center", color: "rgba(255,255,255,0.5)", marginTop: 40 }}>No logs found for this session.</div>
                            ) : (
                                selectedSessionLogs.map(log => (
                                    <div key={log.id} style={{ display: "flex", flexDirection: "column", gap: 8, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 12, padding: 16 }}>
                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: 8, marginBottom: 4 }}>
                                            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>
                                                {new Date(log.timestamp).toLocaleString()}
                                            </div>
                                            <div style={{
                                                padding: "2px 8px", borderRadius: 4, fontSize: 10, fontWeight: 700,
                                                background: log.detection_label === 'SAFE' ? "rgba(52,211,153,0.15)" : log.detection_label === 'CYBERBULLYING' ? "rgba(248,113,113,0.15)" : "rgba(251,191,36,0.15)",
                                                color: log.detection_label === 'SAFE' ? "#34d399" : log.detection_label === 'CYBERBULLYING' ? "#f87171" : "#fbbf24",
                                            }}>
                                                {log.detection_label}
                                            </div>
                                        </div>
                                        <div>
                                            <div style={{ fontSize: 11, fontWeight: 600, color: "#a78bfa", marginBottom: 4, display: "flex", alignItems: "center", gap: 6 }}><User size={12} /> {log.username}</div>
                                            <div style={{ fontSize: 14, color: "#f8fafc", paddingLeft: 14, borderLeft: "2px solid rgba(139,92,246,0.5)" }}>{log.user_message}</div>
                                        </div>
                                        <div style={{ marginTop: 8 }}>
                                            <div style={{ fontSize: 11, fontWeight: 600, color: "#38bdf8", marginBottom: 4, display: "flex", alignItems: "center", gap: 6 }}><Brain size={12} /> CyberGuard AI</div>
                                            <div style={{ fontSize: 14, color: "rgba(248,250,252,0.8)", paddingLeft: 14, borderLeft: "2px solid rgba(56,189,248,0.5)" }}>{log.bot_response}</div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// Ensure AlertTriangle is imported for the login error
function AlertTriangle({ size }: { size: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
    );
}
