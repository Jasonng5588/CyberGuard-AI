"use client";

import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { ReactNode } from "react";

interface Props {
    title: string;
    value: string | number;
    icon: ReactNode;
    color?: "purple" | "red" | "yellow" | "green";
    subtitle?: string;
    trend?: "up" | "down" | "neutral";
}

const colorMap = {
    purple: "from-purple-500/20 to-purple-600/10 border-purple-500/20",
    red: "from-red-500/20 to-red-600/10 border-red-500/20",
    yellow: "from-yellow-500/20 to-yellow-600/10 border-yellow-500/20",
    green: "from-green-500/20 to-green-600/10 border-green-500/20",
};

const iconColorMap = {
    purple: "bg-purple-500/20 text-purple-400",
    red: "bg-red-500/20 text-red-400",
    yellow: "bg-yellow-500/20 text-yellow-400",
    green: "bg-green-500/20 text-green-400",
};

export function StatsCard({ title, value, icon, color = "purple", subtitle, trend }: Props) {
    return (
        <div className={`glass-card p-5 bg-gradient-to-br ${colorMap[color]}`}>
            <div className="flex items-start justify-between mb-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconColorMap[color]}`}>
                    {icon}
                </div>
                {trend && (
                    <span className={`text-xs flex items-center gap-1 ${trend === "up" ? "text-green-400" : trend === "down" ? "text-red-400" : "text-white/40"
                        }`}>
                        {trend === "up" ? <TrendingUp size={12} /> : trend === "down" ? <TrendingDown size={12} /> : <Minus size={12} />}
                        {trend === "up" ? "+5.2%" : trend === "down" ? "-3.1%" : "0%"}
                    </span>
                )}
            </div>
            <div>
                <p className="text-3xl font-bold text-white mb-1">{value}</p>
                <p className="text-sm font-medium text-white/70">{title}</p>
                {subtitle && <p className="text-xs text-white/40 mt-1">{subtitle}</p>}
            </div>
        </div>
    );
}
