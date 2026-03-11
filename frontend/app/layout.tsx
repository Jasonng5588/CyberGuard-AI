import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/Navbar";

export const metadata: Metadata = {
  title: "CyberGuard AI — Cyberbullying Detection & Support",
  description: "AI-powered cyberbullying detection and emotional support chatbot.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning style={{ backgroundColor: "#030712", color: "#f1f5f9" }}>
      <body style={{ backgroundColor: "#030712", color: "#f1f5f9", minHeight: "100vh", margin: 0, overflowX: "hidden" }}>

        {/* ── Animated ambient blobs ── */}
        <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
          {/* Top-left purple blob */}
          <div style={{
            position: "absolute", top: "-15%", left: "-5%",
            width: 700, height: 700,
            background: "radial-gradient(circle, rgba(124,58,237,0.22) 0%, rgba(124,58,237,0.06) 45%, transparent 70%)",
            borderRadius: "50%",
            animation: "blobPulse 9s ease-in-out infinite",
          }} />
          {/* Bottom-right blue blob */}
          <div style={{
            position: "absolute", bottom: "-10%", right: "-5%",
            width: 600, height: 600,
            background: "radial-gradient(circle, rgba(37,99,235,0.18) 0%, rgba(37,99,235,0.05) 45%, transparent 70%)",
            borderRadius: "50%",
            animation: "blobPulse 11s ease-in-out infinite reverse",
          }} />
          {/* Mid cyan accent */}
          <div style={{
            position: "absolute", top: "40%", left: "55%",
            width: 380, height: 380,
            background: "radial-gradient(circle, rgba(6,182,212,0.10) 0%, transparent 65%)",
            borderRadius: "50%",
            animation: "blobPulse 14s ease-in-out infinite 3s",
          }} />
        </div>

        {/* ── Grid overlay ── */}
        <div className="grid-bg" style={{
          position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, opacity: 0.6
        }} />

        <Navbar />
        <main style={{ position: "relative", zIndex: 1, paddingTop: 64 }}>
          {children}
        </main>
      </body>
    </html>
  );
}
