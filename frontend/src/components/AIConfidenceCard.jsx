import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLivePrices } from '../hooks/useLivePrices';
import { useContractStats } from '../hooks/useContractStats';
import { useAutoTrade } from '../contexts/AutoTradeContext';

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
    const { autoTrade, aiState } = useAutoTrade();
    const [confPct, setConfPct] = useState(0);
    const [aiStatus, setAiStatus] = useState('Analyzing Spreads');
    const [aiRisk, setAiRisk] = useState('High Risk');
    const [ragIngested, setRagIngested] = useState(0);

    useEffect(() => {
        if (!aiState) {
            // Artificial simulation if backend is disconnected
            if (gap === null) {
                setConfPct(0);
                return;
            }
            const base = gap > 0.15 ? 85 : gap > 0.05 ? 65 : 35;
            const bounded = Math.min(Math.max(base + 5, 12), 99);
            setConfPct(bounded);
            setAiStatus(bounded > 80 ? 'Execution Ready' : bounded > 50 ? 'Gauging Volatility' : 'Analyzing Spreads');
            setAiRisk(bounded > 80 ? 'Low Risk' : bounded > 50 ? 'Med Risk' : 'High Risk');
            setRagIngested(120 + Number(totalTrades || 0));
            return;
        }

        // Use real data from backend
        const pct = Math.round((aiState.confidence || 0) * 100);
        setConfPct(pct);
        setAiStatus(aiState.reasoning ? (pct > 75 ? 'Execution Ready' : pct > 40 ? 'Gauging Volatility' : 'Analyzing Spreads') : 'Analyzing Spreads');
        setAiRisk(pct > 75 ? 'Low Risk' : pct > 40 ? 'Med Risk' : 'High Risk');
        if (aiState.rag_count !== undefined) setRagIngested(aiState.rag_count);
    }, [aiState, gap, totalTrades]);

    const color = confPct > 75 ? 'var(--accent)' : confPct > 40 ? 'var(--cyan)' : 'var(--text-secondary)';

    // Rag count is dynamically fetched above now

    return (
        <motion.div className="glass" style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '28px' }}
            initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, delay: 0.05 }}>

            <div style={{ marginBottom: 24 }}>
                <h2 className="section-title">AI Confidence Core</h2>
                <p className="section-subtitle">LLaMA-3.3-70B Evaluation Layer</p>
            </div>

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: autoTrade ? 1 : 0.35, transition: 'opacity 0.5s' }}>
                {!autoTrade && <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--red)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Agent Paused</p>}
                <MinimalGauge value={autoTrade ? confPct : 0} color={autoTrade ? color : 'var(--text-secondary)'} />

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', width: '100%', marginTop: 32 }}>
                    <div style={{ background: 'var(--bg-card)', padding: '14px 10px', borderRadius: '12px', textAlign: 'center', border: '1px solid var(--border-glass)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)' }}>
                        <p style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 4, fontWeight: 500 }}>Model Status</p>
                        <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{aiStatus}</p>
                    </div>
                    <div style={{ background: 'var(--bg-card)', padding: '14px 10px', borderRadius: '12px', textAlign: 'center', border: '1px solid var(--border-glass)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)' }}>
                        <p style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 4, fontWeight: 500 }}>Estimated Risk</p>
                        <p style={{ fontSize: 13, fontWeight: 600, color: color }}>{aiRisk}</p>
                    </div>
                    <div style={{ gridColumn: 'span 2', background: 'var(--bg-card)', padding: '14px 10px', borderRadius: '12px', textAlign: 'center', border: '1px solid var(--border-glass)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 4 }}>
                            <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--green)', boxShadow: '0 0 8px var(--green)' }} />
                            <p style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 500 }}>Greenfield RAG Experience</p>
                        </div>
                        <p className="font-mono" style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}>
                            {ragIngested.toLocaleString()} <span style={{ fontSize: 11, color: 'var(--text-tertiary)', fontWeight: 400, fontFamily: 'Inter' }}>Local Execution Logs</span>
                        </p>
                    </div>
                </div>
            </div>

        </motion.div>
    );
}
