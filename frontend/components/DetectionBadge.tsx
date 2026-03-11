"use client";

import { CheckCircle, AlertTriangle, XCircle } from "lucide-react";

type Label = "SAFE" | "OFFENSIVE" | "CYBERBULLYING";

const config: Record<Label, {
    icon: React.ReactNode;
    className: string;
    glowClass: string;
    title: string;
    subtitle: string;
}> = {
    SAFE: {
        icon: <CheckCircle size={20} />,
        className: "badge-safe glow-safe",
        glowClass: "glow-safe",
        title: "Safe",
        subtitle: "No harmful content detected",
    },
    OFFENSIVE: {
        icon: <AlertTriangle size={20} />,
        className: "badge-offensive glow-offensive",
        glowClass: "glow-offensive",
        title: "Potentially Harmful",
        subtitle: "Offensive language detected",
    },
    CYBERBULLYING: {
        icon: <XCircle size={20} />,
        className: "badge-cyberbullying glow-cyberbullying",
        glowClass: "glow-cyberbullying",
        title: "Cyberbullying",
        subtitle: "Bullying content detected",
    },
};

interface Props {
    label: Label;
    confidence: number;
    explanation?: string;
    size?: "sm" | "md" | "lg";
}

export function DetectionBadge({ label, confidence, explanation, size = "md" }: Props) {
    const c = config[label] || config.SAFE;
    const pct = Math.round(confidence * 100);

    if (size === "sm") {
        return (
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${c.className}`}>
                {c.icon}
                {c.title}
            </span>
        );
    }

    return (
        <div className={`glass-card p-4 ${c.glowClass}`}>
            <div className="flex items-center justify-between mb-3">
                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold ${c.className}`}>
                    {c.icon}
                    {c.title}
                </div>
                <span className="text-white/60 text-sm font-mono">{pct}% confidence</span>
            </div>

            {/* Confidence bar */}
            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden mb-3">
                <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                        width: `${pct}%`,
                        background: label === "SAFE"
                            ? "linear-gradient(90deg, #34d399, #10b981)"
                            : label === "OFFENSIVE"
                                ? "linear-gradient(90deg, #fbbf24, #f59e0b)"
                                : "linear-gradient(90deg, #ef4444, #b91c1c)",
                    }}
                />
            </div>

            {explanation && (
                <p className="text-white/50 text-xs leading-relaxed">{explanation}</p>
            )}
        </div>
    );
}
