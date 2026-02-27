import { useState, useEffect } from "react";

// Simulated live price data for demo purposes
const generateTick = () => {
    const base = 0.00315;
    const pancake = base + (Math.random() - 0.5) * 0.0003;
    const biswap = base + (Math.random() - 0.5) * 0.0003;
    const gap = Math.abs(pancake - biswap) / Math.max(pancake, biswap) * 100;
    return {
        ts: new Date().toLocaleTimeString(),
        pancake: pancake.toFixed(6),
        biswap: biswap.toFixed(6),
        gap: gap.toFixed(4),
    };
};

export default function PriceGapCard() {
    const [ticks, setTicks] = useState(() =>
        Array.from({ length: 10 }, generateTick)
    );

    useEffect(() => {
        const interval = setInterval(() => {
            setTicks((prev) => [...prev.slice(-19), generateTick()]);
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    const latest = ticks[ticks.length - 1];
    const gapColor =
        parseFloat(latest.gap) > 0.1 ? "text-[var(--green)]" : "text-[var(--text-secondary)]";

    return (
        <div className="glass-card">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                    <span className="text-2xl">📊</span> Price Gap Monitor
                </h2>
                <span className="text-xs px-3 py-1 rounded-full bg-green-500/10 text-green-400 font-medium animate-pulse">
                    ● LIVE
                </span>
            </div>

            {/* Current prices */}
            <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-white/5 rounded-lg p-3">
                    <p className="text-xs text-[var(--text-secondary)] mb-1">🥞 PancakeSwap</p>
                    <p className="text-xl font-bold font-mono">{latest.pancake}</p>
                    <p className="text-xs text-[var(--text-secondary)]">BUSD → WBNB</p>
                </div>
                <div className="bg-white/5 rounded-lg p-3">
                    <p className="text-xs text-[var(--text-secondary)] mb-1">🔄 BiSwap</p>
                    <p className="text-xl font-bold font-mono">{latest.biswap}</p>
                    <p className="text-xs text-[var(--text-secondary)]">BUSD → WBNB</p>
                </div>
            </div>

            {/* Gap display */}
            <div className="text-center py-3 bg-white/5 rounded-lg">
                <p className="text-xs text-[var(--text-secondary)] mb-1">Current Gap</p>
                <p className={`text-3xl font-extrabold font-mono ${gapColor}`}>
                    {latest.gap}%
                </p>
            </div>

            {/* Recent ticks */}
            <div className="mt-4 max-h-40 overflow-y-auto">
                <table className="w-full text-xs">
                    <thead>
                        <tr className="text-[var(--text-secondary)] border-b border-white/5">
                            <th className="py-1 text-left">Time</th>
                            <th className="py-1 text-right">PCS</th>
                            <th className="py-1 text-right">BiSwap</th>
                            <th className="py-1 text-right">Gap %</th>
                        </tr>
                    </thead>
                    <tbody>
                        {ticks.slice().reverse().map((t, i) => (
                            <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                <td className="py-1 font-mono">{t.ts}</td>
                                <td className="py-1 text-right font-mono">{t.pancake}</td>
                                <td className="py-1 text-right font-mono">{t.biswap}</td>
                                <td className={`py-1 text-right font-mono ${parseFloat(t.gap) > 0.1 ? "text-[var(--green)]" : ""}`}>
                                    {t.gap}%
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
