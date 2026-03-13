"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  ArrowRight, Brain, MessageCircle, BarChart3, Zap, Lock,
  Heart, Shield, Sparkles, CheckCircle2, AlertTriangle, Siren,
} from "lucide-react";
import { createClient } from "@/lib/supabase";
import { AuthModal } from "@/components/AuthModal";

/* ─── Data ─────────────────────────────────────────────────────────────────── */
const FEATURES = [
  { icon: <Brain size={22} color="#a78bfa" />, title: "AI-Powered Detection", desc: "Multilingual NLP detects harmful content in English, Malay, Chinese, Tamil and more.", accent: "#7c3aed", aGlow: "rgba(124,58,237,0.3)" },
  { icon: <MessageCircle size={22} color="#60a5fa" />, title: "Empathetic Chatbot", desc: "Supportive chatbot provides emotional guidance, coping strategies and mental health resources.", accent: "#2563eb", aGlow: "rgba(37,99,235,0.3)" },
  { icon: <BarChart3 size={22} color="#f472b6" />, title: "Analytics Dashboard", desc: "Real-time statistics on bullying trends, detection rates and most common toxic patterns.", accent: "#be185d", aGlow: "rgba(190,24,93,0.3)" },
  { icon: <Zap size={22} color="#fbbf24" />, title: "Real-Time Analysis", desc: "Instant classification as you type with live confidence meters and risk scoring.", accent: "#b45309", aGlow: "rgba(180,83,9,0.3)" },
  { icon: <Lock size={22} color="#34d399" />, title: "Privacy First", desc: "All analysis happens locally. Your data stays private and secure at all times.", accent: "#047857", aGlow: "rgba(4,120,87,0.3)" },
  { icon: <Heart size={22} color="#f87171" />, title: "Gen Z Focused", desc: "Purpose-built for young users with understanding of slang, context and emotional wellbeing.", accent: "#b91c1c", aGlow: "rgba(185,28,28,0.3)" },
];

const CATEGORIES = [
  { label: "SAFE", icon: <CheckCircle2 size={30} color="#34d399" />, color: "#34d399", bg: "rgba(52,211,153,0.07)", border: "rgba(52,211,153,0.20)", glow: "rgba(52,211,153,0.15)", desc: "Friendly, neutral, or positive messages with no harmful intent." },
  { label: "OFFENSIVE", icon: <AlertTriangle size={30} color="#fbbf24" />, color: "#fbbf24", bg: "rgba(251,191,36,0.07)", border: "rgba(251,191,36,0.20)", glow: "rgba(251,191,36,0.15)", desc: "Rude or insensitive content that may be hurtful but not direct bullying." },
  { label: "CYBERBULLYING", icon: <Siren size={30} color="#f87171" />, color: "#f87171", bg: "rgba(248,113,113,0.07)", border: "rgba(248,113,113,0.20)", glow: "rgba(248,113,113,0.15)", desc: "Direct harassment, threats, or targeted abuse. Immediate support triggered." },
];

const CSS_INJECT = `
.home-grid-3{display:grid;grid-template-columns:repeat(3,1fr);gap:18px;}
.home-grid-2{display:grid;grid-template-columns:repeat(2,1fr);gap:18px;}
.home-hero-btns{display:flex;gap:14px;justify-content:center;flex-wrap:wrap;}
.cat-card { transition: all 0.3s cubic-bezier(0.4,0,0.2,1); }
.cat-card:hover { transform: translateY(-4px); }
@media(max-width:768px){
  .home-grid-3{grid-template-columns:1fr;}
  .home-grid-2{grid-template-columns:1fr;}
  .home-hero-btns{flex-direction:column;align-items:stretch;}
  .home-hero-btns button{width:100%;}
}
`;

export default function HomePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [authModal, setAuthModal] = useState(false);
  const [pendingRoute, setPendingRoute] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user || null);
      if (session?.user && pendingRoute) {
        router.push(pendingRoute);
        setPendingRoute(null);
      }
    });
    return () => listener.subscription.unsubscribe();
  }, [pendingRoute]);

  const go = (href: string) => {
    if (user) router.push(href);
    else { setPendingRoute(href); setAuthModal(true); }
  };

  return (
    <>
      <style>{CSS_INJECT}</style>

      {/* ─── HERO ─────────────────────────────────────────────────────── */}
      <section style={{ textAlign: "center", padding: "80px 24px 60px", maxWidth: 900, margin: "0 auto" }}>
        {/* Badge */}
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 32,
          padding: "7px 20px", borderRadius: 999,
          background: "rgba(139,92,246,0.10)",
          backdropFilter: "blur(12px)",
          border: "1px solid rgba(139,92,246,0.28)",
          fontSize: 13, fontWeight: 600, color: "#c4b5fd",
          boxShadow: "0 0 20px rgba(139,92,246,0.12), inset 0 1px 0 rgba(255,255,255,0.07)",
        }}>
          <Sparkles size={13} color="#a78bfa" />
          Final Year Project · AI &amp; NLP Security
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#a78bfa", display: "inline-block", boxShadow: "0 0 8px #a78bfa" }} />
        </div>

        {/* Title */}
        <h1 style={{ fontSize: "clamp(46px,8vw,84px)", fontWeight: 900, lineHeight: 1.0, letterSpacing: "-0.04em", marginBottom: 20, animation: "fadeInUp 0.7s ease both" }}>
          <span className="gradient-text">CyberGuard AI</span>
        </h1>

        <p style={{ fontSize: "clamp(17px,2.5vw,23px)", color: "rgba(241,245,249,0.65)", fontWeight: 500, marginBottom: 14, animation: "fadeInUp 0.7s 0.1s ease both" }}>
          AI-Powered Cyberbullying Detection &amp; Support Chatbot
        </p>
        <p style={{ fontSize: 15, color: "rgba(241,245,249,0.38)", maxWidth: 560, margin: "0 auto 40px", lineHeight: 1.7, animation: "fadeInUp 0.7s 0.15s ease both" }}>
          Protecting social media users with intelligent NLP analysis across multiple languages. Provides empathetic emotional support in real-time.
        </p>

        {/* CTA Buttons */}
        <div className="home-hero-btns" style={{ marginBottom: 56, animation: "fadeInUp 0.7s 0.2s ease both" }}>
          <button onClick={() => go("/chat")} style={{
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            padding: "14px 30px", borderRadius: 14, border: "none", cursor: "pointer",
            background: "linear-gradient(135deg,#7c3aed,#2563eb)",
            color: "white", fontSize: 15, fontWeight: 700,
            boxShadow: "0 6px 28px rgba(124,58,237,0.45), inset 0 1px 0 rgba(255,255,255,0.15)",
            transition: "all 0.25s cubic-bezier(0.4,0,0.2,1)",
          }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 12px 40px rgba(124,58,237,0.55)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ""; (e.currentTarget as HTMLElement).style.boxShadow = "0 6px 28px rgba(124,58,237,0.45)"; }}
          >
            Try the Chatbot <ArrowRight size={16} />
          </button>
          <button onClick={() => go("/dashboard")} style={{
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            padding: "14px 30px", borderRadius: 14, cursor: "pointer",
            background: "rgba(255,255,255,0.06)",
            backdropFilter: "blur(14px)",
            border: "1px solid rgba(255,255,255,0.13)",
            color: "#e2e8f0", fontSize: 15, fontWeight: 600,
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08)",
            transition: "all 0.25s ease",
          }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.1)"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(139,92,246,0.35)"; (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.06)"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.13)"; (e.currentTarget as HTMLElement).style.transform = ""; }}
          >
            <BarChart3 size={16} /> View Dashboard
          </button>
        </div>

        {/* Demo Preview — glass card */}
        <div style={{
          background: "rgba(255,255,255,0.04)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          border: "1px solid rgba(255,255,255,0.09)",
          borderRadius: 20,
          padding: 24, maxWidth: 640, margin: "0 auto", textAlign: "left",
          boxShadow: "0 24px 60px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.07)",
          animation: "fadeInUp 0.8s 0.25s ease both",
        }}>
          {/* Window chrome */}
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 18 }}>
            <span style={{ width: 11, height: 11, borderRadius: "50%", background: "#f87171", display: "inline-block" }} />
            <span style={{ width: 11, height: 11, borderRadius: "50%", background: "#fbbf24", display: "inline-block" }} />
            <span style={{ width: 11, height: 11, borderRadius: "50%", background: "#34d399", display: "inline-block" }} />
            <span style={{ marginLeft: 10, fontSize: 12, color: "rgba(241,245,249,0.28)", fontWeight: 500 }}>CyberGuard AI — Live Demo</span>
          </div>

          {/* User bubble */}
          <div style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 12 }}>
            <div style={{
              width: 30, height: 30, borderRadius: "50%",
              background: "rgba(139,92,246,0.18)",
              border: "1px solid rgba(139,92,246,0.25)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 11, fontWeight: 700, color: "#c4b5fd", flexShrink: 0
            }}>U</div>
            <div className="chat-bubble-user" style={{ padding: "10px 15px", fontSize: 14 }}>
              "You're so stupid, nobody wants you here."
            </div>
          </div>

          {/* Detection badge */}
          <div style={{ textAlign: "center", marginBottom: 12 }}>
            <span className="badge-cyberbullying" style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              padding: "6px 16px", borderRadius: 999, fontSize: 12, fontWeight: 700,
              backdropFilter: "blur(10px)",
            }}>
              <Shield size={12} /> CYBERBULLYING DETECTED — 92% confidence
            </span>
          </div>

          {/* Bot bubble */}
          <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
            <div style={{
              width: 30, height: 30, borderRadius: "50%",
              background: "linear-gradient(135deg,#7c3aed,#2563eb)",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0, boxShadow: "0 4px 12px rgba(124,58,237,0.35)",
            }}>
              <Brain size={14} color="white" />
            </div>
            <div className="chat-bubble-bot" style={{ padding: "10px 15px", fontSize: 14, color: "rgba(241,245,249,0.85)" }}>
              I'm really sorry you experienced that. You deserve to be treated with respect and kindness. 
            </div>
          </div>
        </div>
      </section>

      {/* ─── CATEGORIES ─────────────────────────────────────────────── */}
      <section style={{ padding: "56px 24px", maxWidth: 1120, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <h2 style={{ fontSize: 32, fontWeight: 800, color: "#f1f5f9", marginBottom: 10 }}>Detection Categories</h2>
          <p style={{ color: "rgba(241,245,249,0.42)", fontSize: 15 }}>
            Our NLP model classifies every message into one of three categories
          </p>
        </div>
        <div className="home-grid-3">
          {CATEGORIES.map((c) => (
            <div key={c.label} className="cat-card" style={{
              background: `rgba(255,255,255,0.04)`,
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              border: `1px solid ${c.border}`,
              borderRadius: 20, padding: 28,
              boxShadow: `0 8px 32px rgba(0,0,0,0.2), 0 0 0 1px ${c.border}`,
            }}>
              <div style={{ marginBottom: 14 }}>{c.icon}</div>
              <div style={{
                color: c.color, fontSize: 12, fontWeight: 800,
                letterSpacing: "0.1em", marginBottom: 12,
                textShadow: `0 0 20px ${c.glow}`,
              }}>{c.label}</div>
              <p style={{ color: "rgba(241,245,249,0.52)", fontSize: 14, lineHeight: 1.65 }}>{c.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── FEATURES ────────────────────────────────────────────────── */}
      <section style={{ padding: "56px 24px", maxWidth: 1120, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <h2 style={{ fontSize: 32, fontWeight: 800, color: "#f1f5f9", marginBottom: 10 }}>System Features</h2>
          <p style={{ color: "rgba(241,245,249,0.42)", fontSize: 15 }}>
            Everything you need to detect, understand, and respond to cyberbullying
          </p>
        </div>
        <div className="home-grid-2">
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {FEATURES.slice(0, 3).map((f) => <FeatureCard key={f.title} f={f} />)}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {FEATURES.slice(3).map((f) => <FeatureCard key={f.title} f={f} />)}
          </div>
        </div>
      </section>

      {/* ─── CTA BOTTOM ─────────────────────────────────────────────── */}
      <section style={{ padding: "56px 24px 96px", maxWidth: 700, margin: "0 auto", textAlign: "center" }}>
        <div style={{
          background: "rgba(255,255,255,0.04)",
          backdropFilter: "blur(28px)",
          WebkitBackdropFilter: "blur(28px)",
          border: "1px solid rgba(139,92,246,0.2)",
          borderRadius: 28, padding: "56px 40px",
          boxShadow: "0 32px 64px rgba(0,0,0,0.3), 0 0 80px rgba(124,58,237,0.08), inset 0 1px 0 rgba(255,255,255,0.07)",
          position: "relative", overflow: "hidden",
        }}>
          {/* Inner glow */}
          <div style={{
            position: "absolute", top: -80, left: "50%", transform: "translateX(-50%)",
            width: 400, height: 200,
            background: "radial-gradient(ellipse, rgba(124,58,237,0.2) 0%, transparent 70%)",
            pointerEvents: "none",
          }} />
          <h2 style={{ fontSize: 30, fontWeight: 800, color: "#f1f5f9", marginBottom: 14, position: "relative" }}>Ready to try it out?</h2>
          <p style={{ color: "rgba(241,245,249,0.43)", marginBottom: 32, fontSize: 15, lineHeight: 1.65, position: "relative" }}>
            {user ? "You're signed in — start detecting cyberbullying in real-time." : "Create a free account to start analysing messages for cyberbullying."}
          </p>
          <button onClick={() => go("/chat")} style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "14px 32px", borderRadius: 14, border: "none", cursor: "pointer",
            background: "linear-gradient(135deg,#7c3aed,#2563eb)",
            color: "white", fontSize: 15, fontWeight: 700,
            boxShadow: "0 6px 28px rgba(124,58,237,0.45), inset 0 1px 0 rgba(255,255,255,0.15)",
            transition: "all 0.25s ease", position: "relative",
          }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 12px 40px rgba(124,58,237,0.55)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ""; (e.currentTarget as HTMLElement).style.boxShadow = "0 6px 28px rgba(124,58,237,0.45)"; }}
          >
            {user ? "Open Chat" : "Get Started Free"} <ArrowRight size={16} />
          </button>
        </div>
      </section>

      <AuthModal isOpen={authModal} onClose={() => setAuthModal(false)} defaultMode="login" />
    </>
  );
}

function FeatureCard({ f }: { f: typeof FEATURES[0] }) {
  return (
    <div style={{
      background: "rgba(255,255,255,0.04)",
      backdropFilter: "blur(20px)",
      WebkitBackdropFilter: "blur(20px)",
      border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: 16, padding: 20,
      display: "flex", gap: 14, alignItems: "flex-start",
      transition: "all 0.3s cubic-bezier(0.4,0,0.2,1)",
      cursor: "default",
    }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.07)";
        (e.currentTarget as HTMLElement).style.borderColor = "rgba(139,92,246,0.25)";
        (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
        (e.currentTarget as HTMLElement).style.boxShadow = `0 12px 36px rgba(0,0,0,0.25), 0 0 24px ${f.aGlow}`;
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.04)";
        (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.08)";
        (e.currentTarget as HTMLElement).style.transform = "";
        (e.currentTarget as HTMLElement).style.boxShadow = "";
      }}
    >
      <div style={{
        width: 44, height: 44, borderRadius: 12, display: "flex",
        alignItems: "center", justifyContent: "center", flexShrink: 0,
        background: `${f.accent}15`,
        border: `1px solid ${f.accent}30`,
        backdropFilter: "blur(10px)",
      }}>
        {f.icon}
      </div>
      <div>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: "#f1f5f9", marginBottom: 5 }}>{f.title}</h3>
        <p style={{ fontSize: 13, color: "rgba(241,245,249,0.48)", lineHeight: 1.6 }}>{f.desc}</p>
      </div>
    </div>
  );
}
