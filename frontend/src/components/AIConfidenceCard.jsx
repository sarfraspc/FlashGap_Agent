import { useState, useEffect } from "react";

export default function AIConfidenceCard() {
    const [confidence, setConfidence] = useState(0.72);
    const [reasoning, setReasoning] = useState(
        "Gap appears to be narrowing. Moderate opportunity detected."
    );
    const [history, setHistory] = useState([
        { ts: "17:02:01", confidence: 0.65, action: "skip" },
        { ts: "17:02:04", confidence: 0.71, action: "skip" },
        { ts: "17:02:07", confidence: 0.78, action: "skip" },
    ]);

    useEffect(() => {
        const interval = setInterval(() => {
            const newConf = Math.min(1, Math.max(0, confidence + (Math.random() - 0.48) * 0.08));
            const action = newConf >= 0.8 ? "EXECUTE" : "skip";
            const reasons = [
                "Gap widening — strong signal for arbitrage.",
                "Gap narrowing — risk of slippage too high.",
                "Stable gap detected. Moderate confidence.",
                "High volatility — opportunity window detected.",
                "Low spread — not profitable after fees.",
            ];

            setConfidence(newConf);
            setReasoning(reasons[Math.floor(Math.random() * reasons.length)]);
            setHistory((prev) => [
                ...prev.slice(-9),
                { ts: new Date().toLocaleTimeString(), confidence: newConf, action },
            ]);
        }, 3000);
        return () => clearInterval(interval);
    }, [confidence]);

    const confPercent = (confidence * 100).toFixed(1);
    const isHot = confidence >= 0.8;

    return (
        <div className={`glass-card ${isHot ? "animate-glow" : ""}`}>
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                    <span className="text-2xl">🤖</span> AI Confidence
                </h2>
                <span className={`text-xs px-3 py-1 rounded-full font-medium ${isHot
                        ? "bg-[var(--accent)]/20 text-[var(--accent)]"
                        : "bg-white/10 text-[var(--text-secondary)]"
                    }`}>
                    {isHot ? "🔥 HOT" : "⏳ Watching"}
                </span>
            </div>

            {/* Confidence gauge */}
            <div className="flex flex-col items-center py-6">
                <div className="relative w-32 h-32">
                    <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
                        <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="10" />
                        <circle
                            cx="60" cy="60" r="50" fill="none"
                            stroke={isHot ? "#F0B90B" : "#64748b"}
                            strokeWidth="10"
                            strokeLinecap="round"
                            strokeDasharray={`${confidence * 314} 314`}
                            className="transition-all duration-700 ease-out"
                        />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className={`text-3xl font-extrabold ${isHot ? "text-[var(--accent)]" : ""}`}>
                            {confPercent}%
                        </span>
                        <span className="text-xs text-[var(--text-secondary)]">confidence</span>
                    </div>
                </div>
            </div>

            {/* Reasoning */}
            <div className="bg-white/5 rounded-lg p-3 mb-4">
                <p className="text-xs text-[var(--text-secondary)] mb-1">Latest Reasoning</p>
                <p className="text-sm italic">"{reasoning}"</p>
            </div>

            {/* History */}
            <div className="max-h-36 overflow-y-auto">
                <table className="w-full text-xs">
                    <thead>
                        <tr className="text-[var(--text-secondary)] border-b border-white/5">
                            <th className="py-1 text-left">Time</th>
                            <th className="py-1 text-right">Confidence</th>
                            <th className="py-1 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {history.slice().reverse().map((h, i) => (
                            <tr key={i} className="border-b border-white/5">
                                <td className="py-1 font-mono">{h.ts}</td>
                                <td className="py-1 text-right font-mono">{(h.confidence * 100).toFixed(1)}%</td>
                                <td className={`py-1 text-right font-semibold ${h.action === "EXECUTE" ? "text-[var(--accent)]" : "text-[var(--text-secondary)]"
                                    }`}>
                                    {h.action}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
