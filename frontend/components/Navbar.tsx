"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Shield, Menu, X, User, LogOut, LayoutDashboard, MessageCircle, Home, Heart, BookOpen } from "lucide-react";
import { useState, useEffect } from "react";
import { AuthModal } from "./AuthModal";
import { createClient } from "@/lib/supabase";

const links = [
    { href: "/", label: "Home", icon: <Home size={15} /> },
    { href: "/chat", label: "Chat", icon: <MessageCircle size={15} /> },
    { href: "/learn", label: "Learn", icon: <BookOpen size={15} /> },
    { href: "/support", label: "Support", icon: <Heart size={15} /> },
    { href: "/dashboard", label: "Dashboard", icon: <LayoutDashboard size={15} /> },
];

const NAV_CSS = `
.nb-desktop-links { display: flex; gap: 4px; }
.nb-auth-desktop  { display: flex; align-items: center; gap: 8px; border-left: 1px solid rgba(255,255,255,0.08); padding-left: 16px; }
.nb-badge         { display: flex; align-items: center; gap: 6px; margin-right: 8px; }
.nb-hamburger     { display: none; padding: 8px; border: 1px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.05); cursor: pointer; color: rgba(241,245,249,0.7); border-radius: 10px; backdrop-filter: blur(10px); }
.nb-mobile-menu   { display: none; }
@media (max-width: 767px) {
  .nb-desktop-links { display: none; }
  .nb-auth-desktop  { display: none; }
  .nb-badge         { display: none; }
  .nb-hamburger     { display: flex; align-items: center; justify-content: center; }
  .nb-mobile-menu.open { display: block; }
}

.nb-nav-link {
  color: rgba(241,245,249,0.55);
  border: 1px solid transparent;
  border-radius: 10px;
  padding: 7px 15px;
  font-size: 14px;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.2s cubic-bezier(0.4,0,0.2,1);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  gap: 6px;
}
.nb-nav-link:hover {
  color: rgba(241,245,249,0.9);
  background: rgba(255,255,255,0.07);
  border-color: rgba(255,255,255,0.1);
}
.nb-nav-link.active {
  color: #c4b5fd;
  background: rgba(139,92,246,0.12);
  border-color: rgba(139,92,246,0.3);
  font-weight: 600;
  box-shadow: 0 0 16px rgba(139,92,246,0.12), inset 0 1px 0 rgba(255,255,255,0.08);
}
.nb-mobile-link {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 13px 14px;
  margin-bottom: 4px;
  border-radius: 12px;
  text-decoration: none;
  font-size: 15px;
  font-weight: 500;
  border: 1px solid transparent;
  backdrop-filter: blur(10px);
  transition: all 0.2s;
}
.nb-mobile-link:hover {
  background: rgba(255,255,255,0.05) !important;
}
.nb-mobile-link.active {
  color: #c4b5fd !important;
  background: rgba(139,92,246,0.12) !important;
  border-color: rgba(139,92,246,0.28) !important;
}
`;

export function Navbar() {
    const pathname = usePathname();
    const [menuOpen, setMenuOpen] = useState(false);
    const [authModalOpen, setAuthModalOpen] = useState(false);
    const [authMode, setAuthMode] = useState<"login" | "signup">("login");
    const [user, setUser] = useState<any>(null);
    const [scrolled, setScrolled] = useState(false);
    const supabase = createClient();

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => setUser(session?.user || null));
        const { data: l } = supabase.auth.onAuthStateChange((_e, s) => setUser(s?.user || null));

        const onScroll = () => setScrolled(window.scrollY > 10);
        window.addEventListener("scroll", onScroll);

        return () => {
            l.subscription.unsubscribe();
            window.removeEventListener("scroll", onScroll);
        };
    }, []);

    const signOut = async () => {
        await supabase.auth.signOut();
        setUser(null);
        setMenuOpen(false);
        window.location.href = "/";
    };

    const openAuth = (m: "login" | "signup") => {
        setAuthMode(m);
        setAuthModalOpen(true);
        setMenuOpen(false);
    };

    // Instead of completely unmounting (which might cause hydration issues or get ignored during Fast Refresh),
    // we use CSS to forcefully hide it.
    const isHidden = pathname?.startsWith('/admin');

    return (
        <>
            <style>{NAV_CSS}</style>
            <nav style={{
                position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
                display: isHidden ? "none" : "flex", alignItems: "center",
                height: 64,
                background: scrolled
                    ? "rgba(3, 7, 18, 0.85)"
                    : "rgba(3, 7, 18, 0.6)",
                backdropFilter: "blur(24px)",
                WebkitBackdropFilter: "blur(24px)" as any,
                borderBottom: scrolled
                    ? "1px solid rgba(139,92,246,0.15)"
                    : "1px solid rgba(255,255,255,0.06)",
                padding: "0 20px",
                transition: "all 0.3s ease",
                boxShadow: scrolled ? "0 4px 32px rgba(0,0,0,0.4), 0 1px 0 rgba(139,92,246,0.1)" : "none",
            }}>
                <div style={{ maxWidth: 1280, width: "100%", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>

                    {/* Logo */}
                    <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
                        <div style={{
                            width: 36, height: 36, borderRadius: 11,
                            background: "linear-gradient(135deg,#7c3aed,#2563eb)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            boxShadow: "0 4px 18px rgba(124,58,237,0.45), inset 0 1px 0 rgba(255,255,255,0.2)",
                            flexShrink: 0
                        }}>
                            <Shield size={18} color="white" />
                        </div>
                        <span style={{
                            fontWeight: 800, fontSize: 17, letterSpacing: "-0.025em",
                            background: "linear-gradient(135deg,#c4b5fd 0%,#93c5fd 60%,#6ee7b7 100%)",
                            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent"
                        }}>
                            CyberGuard AI
                        </span>
                    </Link>

                    {/* Desktop nav */}
                    <div className="nb-desktop-links">
                        {links.map((l) => (
                            <Link
                                key={l.href}
                                href={l.href}
                                className={`nb-nav-link${pathname === l.href ? " active" : ""}`}
                            >
                                {l.label}
                            </Link>
                        ))}
                    </div>

                    {/* Right side */}
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        {/* Live badge */}
                        <div className="nb-badge" style={{
                            padding: "5px 12px", borderRadius: 999, fontSize: 12,
                            background: "rgba(52,211,153,0.08)",
                            border: "1px solid rgba(52,211,153,0.2)",
                            backdropFilter: "blur(10px)",
                        }}>
                            <span style={{ color: "rgba(241,245,249,0.4)", fontWeight: 500 }}>FYP 2026</span>
                            <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#34d399", boxShadow: "0 0 8px #34d399", marginLeft: 4, animation: "pulseGlow 2.5s ease-in-out infinite" }} />
                        </div>

                        {/* Desktop auth */}
                        <div className="nb-auth-desktop">
                            {user ? (
                                <>
                                    <span style={{ fontSize: 13, color: "rgba(241,245,249,0.5)", maxWidth: 150, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                        {user.email}
                                    </span>
                                    <Link href="/profile" style={{
                                        display: "flex", alignItems: "center", gap: 6,
                                        fontSize: 13, padding: "6px 14px",
                                        background: "rgba(139,92,246,0.08)",
                                        backdropFilter: "blur(10px)",
                                        border: "1px solid rgba(139,92,246,0.2)",
                                        borderRadius: 9, color: "#c4b5fd",
                                        textDecoration: "none",
                                        transition: "all 0.2s",
                                    }}
                                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(139,92,246,0.15)"; }}
                                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "rgba(139,92,246,0.08)"; }}
                                    >
                                        <User size={13} /> Profile
                                    </Link>
                                    <button onClick={signOut} style={{
                                        fontSize: 13, padding: "6px 14px",
                                        background: "rgba(255,255,255,0.05)",
                                        backdropFilter: "blur(10px)",
                                        border: "1px solid rgba(255,255,255,0.1)",
                                        borderRadius: 9, color: "rgba(241,245,249,0.65)", cursor: "pointer",
                                        transition: "all 0.2s",
                                        display: "flex", alignItems: "center", gap: 6,
                                    }}
                                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(239,68,68,0.1)"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(239,68,68,0.25)"; (e.currentTarget as HTMLElement).style.color = "#f87171"; }}
                                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.05)"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.1)"; (e.currentTarget as HTMLElement).style.color = "rgba(241,245,249,0.65)"; }}
                                    ><LogOut size={13} /> Sign Out</button>
                                </>
                            ) : (
                                <>
                                    <button onClick={() => openAuth("login")} style={{
                                        fontSize: 14, padding: "7px 16px", background: "transparent",
                                        border: "1px solid transparent", borderRadius: 9,
                                        color: "rgba(241,245,249,0.7)", cursor: "pointer", transition: "all 0.2s",
                                    }}
                                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.05)"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.1)"; }}
                                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.borderColor = "transparent"; }}
                                    >Log In</button>
                                    <button onClick={() => openAuth("signup")} style={{
                                        fontSize: 14, padding: "7px 18px",
                                        background: "linear-gradient(135deg,#7c3aed,#2563eb)",
                                        border: "none", borderRadius: 9,
                                        color: "white", fontWeight: 700, cursor: "pointer",
                                        boxShadow: "0 4px 18px rgba(124,58,237,0.35), inset 0 1px 0 rgba(255,255,255,0.15)",
                                        transition: "all 0.2s",
                                    }}
                                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 24px rgba(124,58,237,0.5)"; }}
                                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ""; (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 18px rgba(124,58,237,0.35)"; }}
                                    >Sign Up</button>
                                </>
                            )}
                        </div>

                        {/* Hamburger */}
                        <button className="nb-hamburger" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
                            {menuOpen ? <X size={20} color="#f1f5f9" /> : <Menu size={20} color="#f1f5f9" />}
                        </button>
                    </div>
                </div>

                {/* Mobile menu */}
                <div className={`nb-mobile-menu${menuOpen ? " open" : ""}`} style={{
                    position: "absolute", top: 64, left: 0, right: 0,
                    background: "rgba(3,7,18,0.96)",
                    backdropFilter: "blur(28px)",
                    WebkitBackdropFilter: "blur(28px)",
                    borderBottom: "1px solid rgba(255,255,255,0.07)",
                    padding: "12px 16px 20px",
                    boxShadow: "0 16px 48px rgba(0,0,0,0.5)",
                    zIndex: 100,
                }}>
                    {/* Nav links */}
                    {links.map((l) => (
                        <Link key={l.href} href={l.href} onClick={() => setMenuOpen(false)}
                            className={`nb-mobile-link${pathname === l.href ? " active" : ""}`}
                            style={{
                                color: pathname === l.href ? "#c4b5fd" : "rgba(241,245,249,0.75)",
                                background: pathname === l.href ? "rgba(139,92,246,0.12)" : "transparent",
                                border: `1px solid ${pathname === l.href ? "rgba(139,92,246,0.28)" : "transparent"}`,
                            }}
                        >
                            <span style={{ opacity: 0.6 }}>{l.icon}</span>
                            {l.label}
                        </Link>
                    ))}

                    {user && (
                        <Link href="/profile" onClick={() => setMenuOpen(false)}
                            className={`nb-mobile-link${pathname === "/profile" ? " active" : ""}`}
                            style={{
                                color: pathname === "/profile" ? "#c4b5fd" : "rgba(241,245,249,0.75)",
                                background: pathname === "/profile" ? "rgba(139,92,246,0.12)" : "transparent",
                                border: `1px solid ${pathname === "/profile" ? "rgba(139,92,246,0.28)" : "transparent"}`,
                            }}
                        >
                            <span style={{ opacity: 0.6 }}><User size={15} /></span>
                            Edit Profile
                        </Link>
                    )}

                    <div style={{ height: 1, background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)", margin: "12px 0" }} />

                    {user ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                            <div style={{
                                display: "flex", alignItems: "center", gap: 8, padding: "10px 14px",
                                background: "rgba(255,255,255,0.04)", borderRadius: 12,
                                border: "1px solid rgba(255,255,255,0.07)",
                                backdropFilter: "blur(10px)",
                            }}>
                                <User size={14} color="#a78bfa" />
                                <span style={{ fontSize: 13, color: "rgba(241,245,249,0.6)" }}>{user.email}</span>
                            </div>
                            <button onClick={signOut} style={{
                                width: "100%", padding: "11px 0",
                                background: "rgba(239,68,68,0.08)",
                                backdropFilter: "blur(10px)",
                                border: "1px solid rgba(239,68,68,0.22)", borderRadius: 12,
                                color: "#f87171", fontWeight: 600, cursor: "pointer", fontSize: 14,
                                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                            }}>
                                <LogOut size={14} /> Sign Out
                            </button>
                        </div>
                    ) : (
                        <div style={{ display: "flex", gap: 10 }}>
                            <button onClick={() => openAuth("login")} style={{
                                flex: 1, padding: "11px 0",
                                background: "rgba(255,255,255,0.05)",
                                backdropFilter: "blur(10px)",
                                border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12,
                                color: "#f1f5f9", fontWeight: 600, cursor: "pointer", fontSize: 14,
                            }}>Log In</button>
                            <button onClick={() => openAuth("signup")} style={{
                                flex: 1, padding: "11px 0",
                                background: "linear-gradient(135deg,#7c3aed,#2563eb)", border: "none",
                                borderRadius: 12, color: "white", fontWeight: 700, cursor: "pointer",
                                fontSize: 14, boxShadow: "0 4px 18px rgba(124,58,237,0.35)",
                            }}>Sign Up</button>
                        </div>
                    )}
                </div>
            </nav>

            <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} defaultMode={authMode} />
        </>
    );
}
