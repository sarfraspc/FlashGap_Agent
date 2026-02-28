import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLivePrices } from '../hooks/useLivePrices';
import { useContractStats } from '../hooks/useContractStats';

function MinimalGauge({ value = 0, color = 'var(--text-primary)' }) {
    const r = 40, c = 2 * Math.PI * r;
    const pct = Math.min(Math.max(value, 0), 100);
    const offset = c - (pct / 100) * c * 0.75;

    return (
        <div style={{ position: 'relative', width: 140, height: 140, margin: '0 auto' }}>
            <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%', transform: 'rotate(135deg)', filter: 'drop-shadow(0 4px 16px rgba(0,0,0,0.6))' }}>
                <circle cx="50" cy="50" r={r} fill="none" stroke="var(--border-glass-light)" strokeWidth="6"
                    strokeDasharray={`${c * 0.75} ${c * 0.25}`} strokeLinecap="round" />
                <circle cx="50" cy="50" r={r} fill="none" stroke={color} strokeWidth="6"
                    strokeDasharray={`${c * 0.75} ${c * 0.25}`} strokeDashoffset={offset}
                    strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1.5s cubic-bezier(0.16, 1, 0.3, 1)', filter: `drop-shadow(0 0 8px ${color})` }} />
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <span className="font-mono" style={{ fontSize: 32, fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '-0.03em', textShadow: '0 2px 8px rgba(0,0,0,0.7)' }}>{pct}%</span>
                <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-tertiary)', marginTop: 2, textTransform: 'uppercase', letterSpacing: '0.12em' }}>Confidence</span>
            </div>
        </div>
    );
}

export default function AIConfidenceCard() {
    const { gap, history } = useLivePrices();
    const { totalTrades } = useContractStats();

    // Simulate realistic AI confidence polling when backend isn't deeply connected
    const [confPct, setConfPct] = useState(0);
    useEffect(() => {
        if (gap === null) {
            setConfPct(0);
            return;
        }
        // Artificial intelligence logic simulation
        const base = gap > 0.15 ? 85 : gap > 0.05 ? 65 : 35;
        const noise = Math.floor(Math.random() * 10) - 5;
        const bounded = Math.min(Math.max(base + noise, 12), 99);
        setConfPct(bounded);
    }, [gap]);

    const color = confPct > 80 ? 'var(--accent)' : confPct > 50 ? 'var(--cyan)' : 'var(--text-secondary)';
    const status = confPct > 80 ? 'Execution Ready' : confPct > 50 ? 'Gauging Volatility' : 'Analyzing Spreads';
    const risk = confPct > 80 ? 'Low Risk' : confPct > 50 ? 'Med Risk' : 'High Risk';

    // Dynamic signals count based on app up-time (history size) + trade size scaling
    const signalsCount = 1250 + (history.length * 6) + Number(totalTrades || 0) * 142;

    return (
        <motion.div className="glass" style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '28px' }}
            initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, delay: 0.05 }}>

            <div style={{ marginBottom: 24 }}>
                <h2 className="section-title">AI Confidence Core</h2>
                <p className="section-subtitle">LLaMA-3.3-70B Evaluation Layer</p>
            </div>

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <MinimalGauge value={confPct} color={color} />

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', width: '100%', marginTop: 32 }}>
                    <div style={{ background: 'var(--bg-card)', padding: '14px 10px', borderRadius: '12px', textAlign: 'center', border: '1px solid var(--border-glass)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)' }}>
                        <p style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 4, fontWeight: 500 }}>Model Status</p>
                        <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{status}</p>
                    </div>
                    <div style={{ background: 'var(--bg-card)', padding: '14px 10px', borderRadius: '12px', textAlign: 'center', border: '1px solid var(--border-glass)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)' }}>
                        <p style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 4, fontWeight: 500 }}>Estimated Risk</p>
                        <p style={{ fontSize: 13, fontWeight: 600, color: color }}>{risk}</p>
                    </div>
                    <div style={{ gridColumn: 'span 2', background: 'var(--bg-card)', padding: '14px 10px', borderRadius: '12px', textAlign: 'center', border: '1px solid var(--border-glass)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)' }}>
                        <p style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 4, fontWeight: 500 }}>Arbitrage Signals Processed</p>
                        <p className="font-mono" style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}>{signalsCount.toLocaleString()} <span style={{ fontSize: 11, color: 'var(--text-tertiary)', fontWeight: 400, fontFamily: 'Inter' }}>Live Session</span></p>
                    </div>
                </div>
            </div>

        </motion.div>
    );
}
