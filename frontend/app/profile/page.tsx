"use client";

import { useState, useEffect } from "react";
import { User, Save, CheckCircle, AlertTriangle } from "lucide-react";
import { AuthGuard } from "@/components/AuthGuard";
import { createClient } from "@/lib/supabase";
import { updateProfile, syncUser } from "@/lib/api";

export default function ProfilePage() {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [dbId, setDbId] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const supabase = createClient();

    useEffect(() => {
        async function fetchProfile() {
            setLoading(true);
            try {
                const { data: { user }, error: authError } = await supabase.auth.getUser();
                if (authError || !user) throw new Error("Please log in to edit your profile.");

                setEmail(user.email || "");
                let currentDbId = user.user_metadata?.db_id;

                if (!currentDbId && user.email) {
                    const defaultUsername = user.email.split("@")[0];
                    const backendUser = await syncUser(user.email, defaultUsername);
                    currentDbId = backendUser.id;
                    await supabase.auth.updateUser({ data: { db_id: currentDbId } });
                }

                if (!currentDbId) throw new Error("Unable to resolve backend user profile.");
                setDbId(currentDbId);
                setUsername(user.user_metadata?.username || user.email?.split("@")[0] || "");
            } catch (err: any) {
                setError(err.message || "Failed to load profile.");
            } finally {
                setLoading(false);
            }
        }
        fetchProfile();
    }, []);

    const handleSave = async () => {
        if (!dbId) return;
        setSaving(true);
        setError(null);
        setSuccess(null);
        try {
            await updateProfile(dbId, username);
            await supabase.auth.updateUser({ data: { username } });
            setSuccess("Profile updated successfully!");
        } catch (err: any) {
            setError(err.message || "Failed to update profile.");
        } finally {
            setSaving(false);
            setTimeout(() => setSuccess(null), 3000);
        }
    };

    return (
        <AuthGuard>
            <div style={{ minHeight: "100vh", padding: "32px 24px", maxWidth: 800, margin: "0 auto", display: "flex", flexDirection: "column", gap: 24 }}>
                <div>
                    <h1 style={{ fontSize: 28, fontWeight: 800, color: "#f1f5f9", marginBottom: 4 }}>
                        <span className="gradient-text">Edit Profile</span>
                    </h1>
                    <p style={{ fontSize: 13, color: "rgba(241,245,249,0.4)" }}>
                        Manage your personal details and account settings.
                    </p>
                </div>

                {error && (
                    <div style={{
                        background: "rgba(248,113,113,0.08)", backdropFilter: "blur(14px)",
                        border: "1px solid rgba(248,113,113,0.22)", borderRadius: 14, padding: 16,
                        display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#f87171",
                    }}>
                        <AlertTriangle size={15} /> {error}
                    </div>
                )}

                {success && (
                    <div style={{
                        background: "rgba(52,211,153,0.08)", backdropFilter: "blur(14px)",
                        border: "1px solid rgba(52,211,153,0.22)", borderRadius: 14, padding: 16,
                        display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#34d399",
                    }}>
                        <CheckCircle size={15} /> {success}
                    </div>
                )}

                <div style={{
                    background: "rgba(255,255,255,0.02)", backdropFilter: "blur(20px)",
                    border: "1px solid rgba(255,255,255,0.05)", borderRadius: 20, padding: 32,
                    boxShadow: "0 8px 32px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.05)",
                    display: "flex", flexDirection: "column", gap: 24
                }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 10 }}>
                        <div style={{
                            width: 80, height: 80, borderRadius: "50%", background: "rgba(37,99,235,0.15)",
                            border: "1px solid rgba(37,99,235,0.3)", display: "flex", alignItems: "center",
                            justifyContent: "center", flexShrink: 0
                        }}>
                            <User size={36} color="#60a5fa" opacity={0.8} />
                        </div>
                        <div>
                            <div style={{ fontSize: 18, fontWeight: 700, color: "#f1f5f9" }}>{username || "User"}</div>
                            <div style={{ fontSize: 13, color: "rgba(241,245,249,0.4)" }}>{email}</div>
                        </div>
                    </div>

                    {loading ? (
                        <div style={{ height: 60, background: "rgba(255,255,255,0.04)", borderRadius: 12, animation: "pulse 1.5s ease infinite" }} />
                    ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                <label style={{ fontSize: 12, fontWeight: 600, color: "rgba(241,245,249,0.6)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Username</label>
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    placeholder="Enter your username"
                                    style={{
                                        width: "100%", padding: "12px 16px",
                                        background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.08)",
                                        borderRadius: 12, color: "#f1f5f9", fontSize: 14, outline: "none",
                                        transition: "all 0.2s"
                                    }}
                                    onFocus={(e) => e.target.style.border = "1px solid rgba(59,130,246,0.5)"}
                                    onBlur={(e) => e.target.style.border = "1px solid rgba(255,255,255,0.08)"}
                                />
                            </div>

                            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                <label style={{ fontSize: 12, fontWeight: 600, color: "rgba(241,245,249,0.6)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Email Address</label>
                                <input
                                    type="email"
                                    value={email}
                                    disabled
                                    style={{
                                        width: "100%", padding: "12px 16px",
                                        background: "rgba(0,0,0,0.1)", border: "1px solid rgba(255,255,255,0.03)",
                                        borderRadius: 12, color: "rgba(241,245,249,0.3)", fontSize: 14, outline: "none",
                                        cursor: "not-allowed"
                                    }}
                                />
                                <span style={{ fontSize: 11, color: "rgba(241,245,249,0.3)" }}>Email address cannot be changed.</span>
                            </div>

                            <div style={{ marginTop: 16, display: "flex", justifyContent: "flex-end" }}>
                                <button
                                    onClick={handleSave}
                                    disabled={saving || !username.trim()}
                                    style={{
                                        display: "flex", alignItems: "center", gap: 8,
                                        background: saving ? "rgba(59,130,246,0.5)" : "#2563eb",
                                        color: "#f1f5f9", fontSize: 14, fontWeight: 600, padding: "10px 24px",
                                        borderRadius: 999, border: "none", cursor: saving ? "not-allowed" : "pointer",
                                        transition: "all 0.2s", boxShadow: "0 4px 14px rgba(37,99,235,0.4)"
                                    }}
                                >
                                    {saving ? <div style={{ width: 16, height: 16, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 1s linear infinite" }} /> : <Save size={16} />}
                                    Save Changes
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AuthGuard>
    );
}
