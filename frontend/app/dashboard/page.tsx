"use client";

import { useState, useEffect } from "react";
import {
    LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";
import {
    MessageSquare, AlertTriangle, Shield, TrendingUp,
    RefreshCw, Clock, Users, Info
} from "lucide-react";
import { getAnalytics, AnalyticsData, syncUser } from "@/lib/api";
import { AuthGuard } from "@/components/AuthGuard";
import { createClient } from "@/lib/supabase";

const PIE_COLORS = ["#f87171", "#fbbf24", "#34d399"];
const BADGE: Record<string, React.CSSProperties> = {
    SAFE: { background: "rgba(52,211,153,0.15)", color: "#34d399", border: "1px solid rgba(52,211,153,0.3)" },
    OFFENSIVE: { background: "rgba(251,191,36,0.15)", color: "#fbbf24", border: "1px solid rgba(251,191,36,0.3)" },
    CYBERBULLYING: { background: "rgba(248,113,113,0.15)", color: "#f87171", border: "1px solid rgba(248,113,113,0.3)" },
};

const card = (icon: React.ReactNode, title: string, value: string | number, sub: string, accent: string) => (
    <div style={{
        background: "rgba(255,255,255,0.05)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: `1px solid ${accent}25`,
        borderRadius: 16, padding: 22, position: "relative", overflow: "hidden",
        boxShadow: `0 8px 32px rgba(0,0,0,0.2), 0 0 0 1px ${accent}15`,
        transition: "all 0.3s ease",
    }}
        onMouseEnter={(e: any) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = `0 16px 40px rgba(0,0,0,0.25), 0 0 0 1px ${accent}30, 0 0 30px ${accent}20`; }}
        onMouseLeave={(e: any) => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = `0 8px 32px rgba(0,0,0,0.2), 0 0 0 1px ${accent}15`; }}
    >
        <div style={{ position: "absolute", top: -20, right: -20, width: 100, height: 100, background: `radial-gradient(circle, ${accent}22 0%, transparent 70%)`, pointerEvents: "none" }} />
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
            <div style={{
                width: 38, height: 38, borderRadius: 11,
                background: `${accent}18`,
                backdropFilter: "blur(10px)",
                border: `1px solid ${accent}30`,
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: `0 0 16px ${accent}20`,
            }}>
                {icon}
            </div>
            <span style={{ fontSize: 12, color: "rgba(241,245,249,0.42)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>{title}</span>
        </div>
        <div style={{ fontSize: 30, fontWeight: 900, color: "#f1f5f9", lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: 12, color: "rgba(241,245,249,0.32)", marginTop: 7 }}>{sub}</div>
    </div>
);

const chartTooltip = {
    contentStyle: {
        background: "rgba(3,7,18,0.92)",
        backdropFilter: "blur(20px)",
        border: "1px solid rgba(139,92,246,0.25)",
        borderRadius: 12, color: "#f1f5f9", fontSize: 12,
        boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
    }
};

export default function DashboardPage() {
    const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [lastRefresh, setLastRefresh] = useState(new Date());
    const supabase = createClient();

    const fetchData = async () => {
        setLoading(true); setError(null);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                setError("Please log in to view your dashboard.");
                setLoading(false);
                return;
            }

            let dbId = user.user_metadata?.db_id;

            // Fallback: if db_id is missing, fetch/sync via email
            if (!dbId && user.email) {
                try {
                    const username = user.email.split("@")[0];
                    const backendUser = await syncUser(user.email, username);
                    dbId = backendUser.id;
                    await supabase.auth.updateUser({ data: { db_id: dbId } });
                } catch (e) {
                    console.error("Failed to sync user:", e);
                }
            }

            if (!dbId) {
                setError("Unable to resolve user profile. Please try logging out and back in.");
                setLoading(false);
                return;
            }

            const a = await getAnalytics(dbId);
            setAnalytics(a);
            setLastRefresh(new Date());
        } catch {
            setError("Cannot connect to backend. Make sure FastAPI is running on port 8000.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    return (
        <AuthGuard>
            <div style={{ minHeight: "100vh", padding: "32px 24px", maxWidth: 1200, margin: "0 auto" }}>
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 style={{ fontSize: 28, fontWeight: 800, color: "#f1f5f9", marginBottom: 4 }}>
                            <span className="gradient-text">My Personal Dashboard</span>
                        </h1>
                        <p style={{ fontSize: 12, color: "rgba(241,245,249,0.35)", display: "flex", alignItems: "center", gap: 5 }}>
                            <Clock size={11} /> Last refreshed: {lastRefresh.toLocaleTimeString()}
                        </p>
                    </div>
                    <button onClick={fetchData} disabled={loading} style={{
                        display: "flex", alignItems: "center", gap: 7, padding: "9px 20px",
                        background: "rgba(255,255,255,0.06)",
                        backdropFilter: "blur(14px)",
                        border: "1px solid rgba(255,255,255,0.12)",
                        borderRadius: 11, fontSize: 13, color: "rgba(241,245,249,0.65)", cursor: "pointer",
                        transition: "all 0.2s", fontFamily: "inherit",
                        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.07)",
                    }}>
                        <RefreshCw size={13} style={{ animation: loading ? "spin 1s linear infinite" : "none" }} />
                        Refresh
                    </button>
                </div>

                {/* Error */}
                {error && (
                    <div style={{
                        background: "rgba(248,113,113,0.08)",
                        backdropFilter: "blur(14px)",
                        border: "1px solid rgba(248,113,113,0.22)",
                        borderRadius: 14, padding: 16, marginBottom: 24,
                        display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#f87171",
                        boxShadow: "0 4px 20px rgba(248,113,113,0.1)",
                    }}>
                        <AlertTriangle size={15} /> {error}
                    </div>
                )}

                {/* Loading skeleton */}
                {loading && !analytics && (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 24 }}>
                        {[...Array(4)].map((_, i) => (
                            <div key={i} style={{ height: 110, background: "rgba(255,255,255,0.04)", borderRadius: 14, animation: "pulse 1.5s ease infinite" }} />
                        ))}
                    </div>
                )}

                {analytics && (
                    <>
                        {/* KPI Cards */}
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 16, marginBottom: 24 }}>
                            {card(<MessageSquare size={16} color="#a78bfa" />, "Total Analyzed", analytics.total_messages.toLocaleString(), "All time messages", "#7c3aed")}
                            {card(<AlertTriangle size={16} color="#f87171" />, "Cyberbullying", analytics.total_bullying.toLocaleString(), `${analytics.bullying_rate.toFixed(1)}% of total`, "#dc2626")}
                            {card(<Shield size={16} color="#fbbf24" />, "Offensive", analytics.total_offensive.toLocaleString(), "Potentially harmful", "#b45309")}
                            {card(<TrendingUp size={16} color="#34d399" />, "Safe Messages", analytics.total_safe.toLocaleString(), "Clean content", "#047857")}
                        </div>

                        {/* Charts row */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">
                            {/* Line chart */}
                            <div className="md:col-span-2" style={{ background: "rgba(255,255,255,0.04)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: 20, boxShadow: "0 8px 32px rgba(0,0,0,0.2)" }}>
                                <p style={{ fontSize: 13, fontWeight: 600, color: "#f1f5f9", marginBottom: 16 }}>Detection Trends (Last 14 Days)</p>
                                <ResponsiveContainer width="100%" height={200}>
                                    <LineChart data={analytics.daily_stats.map(d => ({
                                        ...d,
                                        date: new Date(d.date).toLocaleDateString("en-MY", { month: "short", day: "numeric" })
                                    }))}>
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

                            {/* Pie chart */}
                            <div className="md:col-span-1" style={{ background: "rgba(255,255,255,0.04)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: 20, boxShadow: "0 8px 32px rgba(0,0,0,0.2)" }}>
                                <p style={{ fontSize: 13, fontWeight: 600, color: "#f1f5f9", marginBottom: 16 }}>Label Distribution</p>
                                <ResponsiveContainer width="100%" height={160}>
                                    <PieChart>
                                        <Pie
                                            data={[
                                                { name: "Cyberbullying", value: analytics.total_bullying || 1 },
                                                { name: "Offensive", value: analytics.total_offensive || 1 },
                                                { name: "Safe", value: analytics.total_safe || 1 },
                                            ]}
                                            cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value"
                                        >
                                            {PIE_COLORS.map((c, i) => <Cell key={i} fill={c} />)}
                                        </Pie>
                                        <Tooltip {...chartTooltip} />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 8 }}>
                                    {[
                                        { label: "Cyberbullying", n: analytics.total_bullying, c: "#f87171" },
                                        { label: "Offensive", n: analytics.total_offensive, c: "#fbbf24" },
                                        { label: "Safe", n: analytics.total_safe, c: "#34d399" },
                                    ].map(x => (
                                        <div key={x.label} style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                                <span style={{ width: 8, height: 8, borderRadius: "50%", background: x.c, display: "inline-block" }} />
                                                <span style={{ color: "rgba(241,245,249,0.55)" }}>{x.label}</span>
                                            </div>
                                            <span style={{ color: "#f1f5f9", fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>{x.n}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Bar chart + recent detections */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                            {/* Top toxic words */}
                            <div style={{ background: "rgba(255,255,255,0.04)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)" as any, border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: 20, boxShadow: "0 8px 32px rgba(0,0,0,0.2)" }}>
                                <p style={{ fontSize: 13, fontWeight: 600, color: "#f1f5f9", marginBottom: 16 }}>Top Toxic Words</p>
                                {analytics?.top_toxic_words?.length === 0 ? (
                                    <div style={{ textAlign: "center", padding: "30px 0", color: "rgba(241,245,249,0.3)", fontSize: 13 }}>
                                        <Info size={20} style={{ marginBottom: 8 }} /> No data yet. Send some messages in Chat.
                                    </div>
                                ) : (
                                    <ResponsiveContainer width="100%" height={200}>
                                        <BarChart data={analytics?.top_toxic_words?.slice(0, 10)} layout="vertical">
                                            <defs>
                                                <linearGradient id="barG" x1="0" y1="0" x2="1" y2="0">
                                                    <stop offset="0%" stopColor="#7c3aed" />
                                                    <stop offset="100%" stopColor="#2563eb" />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                            <XAxis type="number" tick={{ fill: "rgba(241,245,249,0.3)", fontSize: 10 }} />
                                            <YAxis dataKey="word" type="category" tick={{ fill: "rgba(241,245,249,0.5)", fontSize: 10 }} width={65} />
                                            <Tooltip {...chartTooltip} />
                                            <Bar dataKey="count" fill="url(#barG)" radius={[0, 4, 4, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                )}
                            </div>

                            {/* Recent detections */}
                            <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: 20 }}>
                                <p style={{ fontSize: 13, fontWeight: 600, color: "#f1f5f9", marginBottom: 16 }}>Recent Detections</p>
                                {analytics?.recent_detections?.length === 0 ? (
                                    <div style={{ textAlign: "center", padding: "30px 0", color: "rgba(241,245,249,0.3)", fontSize: 13 }}>
                                        No detections yet. Start chatting!
                                    </div>
                                ) : (
                                    <div style={{ display: "flex", flexDirection: "column", gap: 10, maxHeight: 220, overflowY: "auto" }}>
                                        {analytics?.recent_detections?.map((d) => (
                                            <div key={d.id} style={{
                                                display: "flex", alignItems: "flex-start", gap: 10,
                                                paddingBottom: 10, borderBottom: "1px solid rgba(255,255,255,0.05)"
                                            }}>
                                                <span style={{
                                                    ...BADGE[d.label], display: "inline-flex", alignItems: "center",
                                                    padding: "2px 8px", borderRadius: 999, fontSize: 10, fontWeight: 700, flexShrink: 0
                                                }}>
                                                    {d.label.slice(0, 3)}
                                                </span>
                                                <div style={{ minWidth: 0 }}>
                                                    <p style={{ fontSize: 12, color: "rgba(241,245,249,0.6)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{d.message_text}</p>
                                                    <p style={{ fontSize: 10, color: "rgba(241,245,249,0.3)", marginTop: 2, display: "flex", alignItems: "center", gap: 4 }}>
                                                        <Users size={9} /> {d.username} · {(d.confidence * 100).toFixed(1)}%
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </AuthGuard>
    );
}
