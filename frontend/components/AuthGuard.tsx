"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { AuthModal } from "./AuthModal";
import { Shield, Loader2 } from "lucide-react";

export function AuthGuard({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<any>(undefined);
    const [showModal, setShowModal] = useState(false);
    const supabase = createClient();

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user || null);
            if (!session?.user) setShowModal(true);
        });
        const { data: l } = supabase.auth.onAuthStateChange((_e, s) => {
            setUser(s?.user || null);
            if (s?.user) setShowModal(false);
        });
        return () => l.subscription.unsubscribe();
    }, []);

    // Loading
    if (user === undefined) {
        return (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
                <Loader2 size={34} color="#a78bfa" style={{ animation: "spin 1s linear infinite" }} />
            </div>
        );
    }

    // Not logged in
    if (!user) {
        return (
            <>
                <div style={{
                    display: "flex", flexDirection: "column", alignItems: "center",
                    justifyContent: "center", minHeight: "60vh", gap: 20, padding: "0 24px",
                    textAlign: "center",
                }}>
                    <div style={{
                        width: 64, height: 64, borderRadius: 18,
                        background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.2)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                        <Shield size={28} color="#a78bfa" />
                    </div>
                    <div>
                        <h2 style={{ fontSize: 22, fontWeight: 800, color: "#f1f5f9", marginBottom: 8 }}>Login Required</h2>
                        <p style={{ color: "rgba(241,245,249,0.45)", fontSize: 14, maxWidth: 320, lineHeight: 1.6 }}>
                            You need to sign in or create a free account to access this feature.
                        </p>
                    </div>
                    <button
                        onClick={() => setShowModal(true)}
                        style={{
                            padding: "12px 28px", borderRadius: 12, border: "none", cursor: "pointer",
                            background: "linear-gradient(135deg,#7c3aed,#2563eb)",
                            color: "white", fontSize: 15, fontWeight: 700,
                            boxShadow: "0 4px 18px rgba(124,58,237,0.35)",
                        }}
                    >
                        Sign In / Sign Up
                    </button>
                </div>
                <AuthModal isOpen={showModal} onClose={() => setShowModal(false)} defaultMode="login" />
            </>
        );
    }

    return <>{children}</>;
}
