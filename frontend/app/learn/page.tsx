"use client";

import { useState } from "react";
import {
    BookOpen, AlertTriangle, Shield, Users, TrendingUp, ChevronDown, ChevronUp,
    ExternalLink, Heart, MessageSquare, Eye, MapPin, UserMinus, UserX, Flame, Volume2,
    Video, Smartphone, Brain, MicOff, Globe, Lock, Camera, ShieldAlert, HeartHandshake,
    Frown, DoorClosed, HeartOff, TrendingDown, Moon, AlertOctagon, HeartCrack, Bot
} from "lucide-react";
import Link from "next/link";

const LEARN_CSS = `
@keyframes fadeInUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
@keyframes float { 0%,100% { transform:translateY(0); } 50% { transform:translateY(-8px); } }
.learn-card { transition: all 0.25s ease; }
.learn-card:hover { transform: translateY(-3px); box-shadow: 0 20px 50px rgba(0,0,0,0.3) !important; }
.type-card { transition: all 0.2s ease; cursor: pointer; }
.type-card:hover { border-color: rgba(139,92,246,0.35) !important; background: rgba(139,92,246,0.06) !important; }
`;

const CB_TYPES = [
    {
        icon: <MessageSquare size={22} color="#fb923c" />, name: "Verbal Abuse", color: "#fb923c",
        description: "Sending deliberately hurtful, offensive, or demeaning messages targeting an individual.",
        example: "\"You're so stupid and ugly, no one will ever love you.\"",
        signs: ["Repeated insulting messages", "Demeaning comments on posts", "Name-calling and ridicule"]
    },
    {
        icon: <Eye size={22} color="#f87171" />, name: "Cyberstalking", color: "#f87171",
        description: "Sending repeated, threatening messages or monitoring someone's online activity with intent to cause fear.",
        example: "\"I know where you live. You'll regret this.\"",
        signs: ["Repeated messages from unknown accounts", "Location tracking", "Obsessive online monitoring"]
    },
    {
        icon: <MapPin size={22} color="#ec4899" />, name: "Doxxing", color: "#ec4899",
        description: "Publishing private or identifying information about an individual online without their consent, typically with malicious intent.",
        example: "Posting someone's home address and phone number on a public forum for harassment.",
        signs: ["Personal details leaked", "Unknown people contacting you offline", "Threats based on personal info"]
    },
    {
        icon: <UserMinus size={22} color="#fbbf24" />, name: "Social Exclusion", color: "#fbbf24",
        description: "Deliberately excluding someone from online groups, activities, or conversations to isolate them.",
        example: "\"We're creating a new group chat without you.\"",
        signs: ["Being removed from group chats", "Being ignored or left on read", "Untagged from group photos"]
    },
    {
        icon: <UserX size={22} color="#a78bfa" />, name: "Impersonation", color: "#a78bfa",
        description: "Creating fake accounts pretending to be the victim to spread false information or damage reputation.",
        example: "Creating a fake profile using someone's photos to send offensive messages to their friends.",
        signs: ["Fake accounts using your photos", "Friends receiving strange messages", "Accounts you didn't create"]
    },
    {
        icon: <Flame size={22} color="#60a5fa" />, name: "Trolling", color: "#60a5fa",
        description: "Posting provocative, offensive, or controversial messages online purely to elicit an angry response or cause disruption.",
        example: "Leaving intentionally inflammatory and cruel comments on someone's heartfelt post.",
        signs: ["Hostile comments designed to provoke", "Mocking serious discussions", "Persistent antagonistic behavior"]
    },
    {
        icon: <Volume2 size={22} color="#f43f5e" />, name: "Outing", color: "#f43f5e",
        description: "Publicly revealing someone's private, sensitive, or embarrassing secrets without their permission.",
        example: "Sharing private chat screenshots about someone's medical condition or sexual orientation.",
        signs: ["Private conversations leaked", "Secrets posted publicly", "Loss of control over personal narrative"]
    },
    {
        icon: <Video size={22} color="#34d399" />, name: "Happy Slapping", color: "#34d399",
        description: "Recording someone being physically attacked or humiliated and posting the video online to maximize their distress.",
        example: "Filming a classmate tripping and falling, and posting it on TikTok for others to mock.",
        signs: ["Videos of your accidents/humiliation online", "People recording you without consent", "Viral mocking content"]
    },
];

const STATISTICS = [
    { value: "40%", label: "Of Malaysian youths aged 13-18 have experienced cyberbullying", color: "#f87171" },
    { value: "70%", label: "Of cyberbullying occurs on social media platforms like Instagram and TikTok", color: "#fbbf24" },
    { value: "58%", label: "Of Gen Z victims never tell a trusted adult about being cyberbullied", color: "#a78bfa" },
    { value: "3x", label: "More likely to experience depression if cyberbullied vs non-victims", color: "#34d399" },
];

const PREVENTION_TIPS = [
    { icon: <Lock size={24} color="#34d399" />, title: "Protect Your Privacy", tips: ["Set social media to private", "Never share personal info with strangers", "Use strong, unique passwords", "Enable 2-factor authentication"] },
    { icon: <Camera size={24} color="#34d399" />, title: "Be Smart With Photos", tips: ["Think before you post", "Check your location settings", "Avoid sharing photos showing your address", "Report misused content immediately"] },
    { icon: <ShieldAlert size={24} color="#34d399" />, title: "Block & Report", tips: ["Use block feature immediately", "Screenshot evidence before blocking", "Report to platform moderators", "Contact CyberSecurity Malaysia if severe"] },
    { icon: <HeartHandshake size={24} color="#34d399" />, title: "Talk to Someone", tips: ["Tell a trusted adult immediately", "Contact a school counselor", "Call Befrienders KL: 03-7627 2929", "You are not alone — speaking up is strength"] },
];

export default function LearnPage() {
    const [expandedType, setExpandedType] = useState<number | null>(null);

    return (
        <>
            <style>{LEARN_CSS}</style>
            <div style={{ minHeight: "100vh", maxWidth: 1100, margin: "0 auto", padding: "40px 24px" }}>

                {/* ── Hero ── */}
                <div style={{ textAlign: "center", marginBottom: 64, animation: "fadeInUp 0.6s ease" }}>
                    <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 18px", borderRadius: 999, background: "rgba(139,92,246,0.12)", border: "1px solid rgba(139,92,246,0.3)", marginBottom: 20 }}>
                        <BookOpen size={14} color="#a78bfa" />
                        <span style={{ fontSize: 12, fontWeight: 700, color: "#a78bfa", letterSpacing: "0.06em", textTransform: "uppercase" }}>Education & Awareness</span>
                    </div>
                    <h1 style={{ fontSize: "clamp(28px,5vw,48px)", fontWeight: 900, color: "#f1f5f9", lineHeight: 1.15, marginBottom: 16 }}>
                        Understanding <span style={{ background: "linear-gradient(135deg,#7c3aed,#2563eb)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Cyberbullying</span>
                    </h1>
                    <p style={{ fontSize: 16, color: "rgba(241,245,249,0.55)", maxWidth: 600, margin: "0 auto", lineHeight: 1.7 }}>
                        Knowledge is your first line of defense. Learn to recognize, prevent, and respond to cyberbullying — because awareness saves lives.
                    </p>
                </div>

                {/* ── Statistics ── */}
                <div style={{ marginBottom: 60 }}>
                    <h2 style={{ fontSize: 20, fontWeight: 800, color: "#f1f5f9", marginBottom: 24, display: "flex", alignItems: "center", gap: 10 }}>
                        <TrendingUp size={20} color="#7c3aed" /> The Reality: Cyberbullying in Malaysia
                    </h2>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 16 }}>
                        {STATISTICS.map((s, i) => (
                            <div key={i} className="learn-card" style={{
                                background: "rgba(255,255,255,0.04)", backdropFilter: "blur(20px)",
                                border: `1px solid ${s.color}25`, borderRadius: 16, padding: 24,
                                boxShadow: `0 8px 32px rgba(0,0,0,0.2), 0 0 0 1px ${s.color}15`,
                                animation: `fadeInUp 0.5s ease ${i * 0.1}s both`
                            }}>
                                <div style={{ fontSize: 38, fontWeight: 900, color: s.color, marginBottom: 8, lineHeight: 1 }}>{s.value}</div>
                                <div style={{ fontSize: 13, color: "rgba(241,245,249,0.55)", lineHeight: 1.5 }}>{s.label}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── 8 Types of Cyberbullying ── */}
                <div style={{ marginBottom: 60 }}>
                    <h2 style={{ fontSize: 20, fontWeight: 800, color: "#f1f5f9", marginBottom: 8, display: "flex", alignItems: "center", gap: 10 }}>
                        <AlertTriangle size={20} color="#f87171" /> 8 Types of Cyberbullying
                    </h2>
                    <p style={{ fontSize: 13, color: "rgba(241,245,249,0.4)", marginBottom: 24 }}>
                        Based on the classification framework used in this system. Click each card to learn more.
                    </p>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: 14 }}>
                        {CB_TYPES.map((t, i) => (
                            <div key={i} className="type-card" onClick={() => setExpandedType(expandedType === i ? null : i)}
                                style={{
                                    background: "rgba(255,255,255,0.03)", backdropFilter: "blur(16px)",
                                    border: expandedType === i ? `1px solid ${t.color}55` : "1px solid rgba(255,255,255,0.07)",
                                    borderRadius: 14, padding: 18, animation: `fadeInUp 0.4s ease ${i * 0.05}s both`,
                                    userSelect: "none"
                                }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                        <span style={{
                                            fontSize: 24, width: 44, height: 44, borderRadius: 12,
                                            background: `${t.color}15`, border: `1px solid ${t.color}30`,
                                            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
                                        }}>{t.icon}</span>
                                        <span style={{ fontSize: 14, fontWeight: 700, color: t.color, lineHeight: 1.3 }}>{t.name}</span>
                                    </div>
                                    {expandedType === i ? <ChevronUp size={16} color="rgba(241,245,249,0.3)" /> : <ChevronDown size={16} color="rgba(241,245,249,0.3)" />}
                                </div>

                                {expandedType === i && (
                                    <div style={{ marginTop: 14, animation: "fadeInUp 0.3s ease" }}>
                                        <p style={{ fontSize: 13, color: "rgba(241,245,249,0.65)", lineHeight: 1.6, marginBottom: 12 }}>{t.description}</p>
                                        <div style={{ background: `${t.color}08`, border: `1px solid ${t.color}20`, borderRadius: 8, padding: "10px 14px", marginBottom: 12 }}>
                                            <p style={{ fontSize: 11, fontWeight: 700, color: t.color, marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.05em" }}>Example</p>
                                            <p style={{ fontSize: 13, color: "rgba(241,245,249,0.6)", fontStyle: "italic" }}>{t.example}</p>
                                        </div>
                                        <div>
                                            <p style={{ fontSize: 11, fontWeight: 700, color: "rgba(241,245,249,0.4)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>Warning Signs</p>
                                            <ul style={{ margin: 0, padding: "0 0 0 16px" }}>
                                                {t.signs.map((s, j) => (
                                                    <li key={j} style={{ fontSize: 12, color: "rgba(241,245,249,0.55)", marginBottom: 4 }}>{s}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── Why Gen Z is Especially Vulnerable ── */}
                <div style={{ marginBottom: 60 }}>
                    <h2 style={{ fontSize: 20, fontWeight: 800, color: "#f1f5f9", marginBottom: 24, display: "flex", alignItems: "center", gap: 10 }}>
                        <Users size={20} color="#60a5fa" /> Why Gen Z Is Especially Vulnerable
                    </h2>
                    <div style={{
                        display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 16,
                        background: "rgba(255,255,255,0.02)", borderRadius: 20, padding: 24,
                        border: "1px solid rgba(255,255,255,0.07)"
                    }}>
                        {[
                            { icon: <Smartphone size={20} color="#60a5fa" />, title: "Always Connected", desc: "Gen Z are digital natives who spend 6-9 hours daily on social media, making them constantly exposed to online interactions — including harmful ones." },
                            { icon: <Brain size={20} color="#60a5fa" />, title: "Developing Identity", desc: "Teenagers are still forming their sense of self. Online criticism and harassment during this critical stage causes disproportionately lasting psychological damage." },
                            { icon: <MicOff size={20} color="#60a5fa" />, title: "Fear of Reporting", desc: "58% of victims don't tell adults because they fear judgment, having devices taken away, or that it will \"make things worse\"." },
                            { icon: <Globe size={20} color="#60a5fa" />, title: "24/7 Exposure", desc: "Unlike traditional bullying which ends at school gates, cyberbullying follows victims home, into their bedrooms, at any hour." },
                        ].map((item, i) => (
                            <div key={i} style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                                <span style={{
                                    fontSize: 20, width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                                    background: "rgba(96,165,250,0.1)", border: "1px solid rgba(96,165,250,0.2)",
                                    display: "flex", alignItems: "center", justifyContent: "center"
                                }}>{item.icon}</span>
                                <div>
                                    <p style={{ fontSize: 14, fontWeight: 700, color: "#f1f5f9", marginBottom: 6 }}>{item.title}</p>
                                    <p style={{ fontSize: 13, color: "rgba(241,245,249,0.5)", lineHeight: 1.6 }}>{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── Prevention Tips ── */}
                <div style={{ marginBottom: 60 }}>
                    <h2 style={{ fontSize: 20, fontWeight: 800, color: "#f1f5f9", marginBottom: 24, display: "flex", alignItems: "center", gap: 10 }}>
                        <Shield size={20} color="#34d399" /> How to Protect Yourself
                    </h2>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 16 }}>
                        {PREVENTION_TIPS.map((p, i) => (
                            <div key={i} className="learn-card" style={{
                                background: "rgba(52,211,153,0.04)", border: "1px solid rgba(52,211,153,0.15)",
                                borderRadius: 16, padding: 20,
                                animation: `fadeInUp 0.5s ease ${i * 0.1}s both`
                            }}>
                                <div style={{ fontSize: 24, marginBottom: 10 }}>{p.icon}</div>
                                <p style={{ fontSize: 15, fontWeight: 700, color: "#34d399", marginBottom: 12 }}>{p.title}</p>
                                <ul style={{ margin: 0, padding: "0 0 0 18px" }}>
                                    {p.tips.map((tip, j) => (
                                        <li key={j} style={{ fontSize: 13, color: "rgba(241,245,249,0.6)", marginBottom: 8, lineHeight: 1.5 }}>{tip}</li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── Impact on Mental Health ── */}
                <div style={{ marginBottom: 60, background: "rgba(248,113,113,0.05)", border: "1px solid rgba(248,113,113,0.15)", borderRadius: 20, padding: 32 }}>
                    <h2 style={{ fontSize: 20, fontWeight: 800, color: "#f87171", marginBottom: 20, display: "flex", alignItems: "center", gap: 10 }}>
                        <HeartCrack size={20} color="#f87171" /> Mental Health Impact
                    </h2>
                    <p style={{ fontSize: 14, color: "rgba(241,245,249,0.6)", lineHeight: 1.7, marginBottom: 20 }}>
                        Cyberbullying is not "just online" — the psychological damage is real and profound. Research shows that victims of cyberbullying experience significantly higher rates of:
                    </p>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 12 }}>
                        {[
                            { label: "Depression & Anxiety", icon: <Frown size={18} color="#f87171" /> },
                            { label: "Social Withdrawal", icon: <DoorClosed size={18} color="#f87171" /> },
                            { label: "Low Self-Esteem", icon: <HeartOff size={18} color="#f87171" /> },
                            { label: "Academic Decline", icon: <TrendingDown size={18} color="#f87171" /> },
                            { label: "Sleep Disorders", icon: <Moon size={18} color="#f87171" /> },
                            { label: "Suicidal Ideation", icon: <AlertOctagon size={18} color="#f87171" /> },
                        ].map((item, i) => (
                            <div key={i} style={{
                                display: "flex", alignItems: "center", gap: 10,
                                padding: "12px 16px", borderRadius: 12,
                                background: "rgba(248,113,113,0.07)", border: "1px solid rgba(248,113,113,0.12)"
                            }}>
                                <span style={{ fontSize: 18 }}>{item.icon}</span>
                                <span style={{ fontSize: 13, fontWeight: 600, color: "rgba(241,245,249,0.7)" }}>{item.label}</span>
                            </div>
                        ))}
                    </div>
                    <p style={{ fontSize: 13, color: "rgba(241,245,249,0.4)", marginTop: 20, fontStyle: "italic" }}>
                        * If you or someone you know is in crisis, please contact Befrienders KL immediately: 03-7627 2929 (24/7)
                    </p>
                </div>

                {/* ── CTA ── */}
                <div style={{ textAlign: "center", marginBottom: 20 }}>
                    <h2 style={{ fontSize: 22, fontWeight: 800, color: "#f1f5f9", marginBottom: 12 }}>
                        Ready to Get Help or Practice Detection?
                    </h2>
                    <p style={{ fontSize: 14, color: "rgba(241,245,249,0.5)", marginBottom: 28 }}>
                        Our AI-powered chatbot is here to help you detect cyberbullying and provide immediate emotional support.
                    </p>
                    <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
                        <Link href="/chat" style={{
                            padding: "13px 28px", borderRadius: 14, fontWeight: 700, fontSize: 14, textDecoration: "none",
                            background: "linear-gradient(135deg,#7c3aed,#2563eb)",
                            color: "white", boxShadow: "0 4px 20px rgba(124,58,237,0.4)",
                            transition: "all 0.2s", display: "flex", alignItems: "center", gap: 8
                        }}>
                            <Bot size={16} /> Try the AI Chatbot
                        </Link>
                        <Link href="/support" style={{
                            padding: "13px 28px", borderRadius: 14, fontWeight: 700, fontSize: 14, textDecoration: "none",
                            background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)",
                            color: "#f1f5f9", display: "flex", alignItems: "center", gap: 8
                        }}>
                            <Heart size={14} /> Visit Support Center
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
}
