"use client";

import { Bot, Heart, Lightbulb } from "lucide-react";

interface Props {
    botResponse: string;
    suggestions?: string[];
    emotionDetected?: string;
    isLoading?: boolean;
}

export function SupportMessage({ botResponse, suggestions = [], emotionDetected, isLoading }: Props) {
    if (isLoading) {
        return (
            <div className="glass-card p-4">
                <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                        <Bot size={16} className="text-white" />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-white/80">CyberGuard AI</p>
                        <p className="text-xs text-white/40">Thinking...</p>
                    </div>
                </div>
                <div className="flex gap-1.5 pl-11">
                    <span className="typing-dot w-2 h-2 bg-purple-400 rounded-full" />
                    <span className="typing-dot w-2 h-2 bg-purple-400 rounded-full" />
                    <span className="typing-dot w-2 h-2 bg-purple-400 rounded-full" />
                </div>
            </div>
        );
    }

    return (
        <div className="glass-card p-5 space-y-4 border-purple-500/20">
            {/* Bot Header */}
            <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center animate-pulse-glow">
                    <Bot size={17} className="text-white" />
                </div>
                <div>
                    <p className="text-sm font-semibold text-white/90">CyberGuard AI</p>
                    {emotionDetected && (
                        <p className="text-xs text-white/40 capitalize flex items-center gap-1">
                            <Heart size={10} className="text-pink-400" />
                            Detected: {emotionDetected}
                        </p>
                    )}
                </div>
            </div>

            {/* Response */}
            <p className="text-white/80 text-sm leading-relaxed pl-12">{botResponse}</p>

            {/* Suggestions */}
            {suggestions.length > 0 && (
                <div className="pl-12 space-y-2">
                    <div className="flex items-center gap-2 text-xs text-white/40 uppercase tracking-wider">
                        <Lightbulb size={12} className="text-yellow-400" />
                        Suggestions
                    </div>
                    <ul className="space-y-1.5">
                        {suggestions.map((s, i) => (
                            <li key={i} className="text-sm text-white/60 leading-relaxed">{s}</li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
