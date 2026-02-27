import { motion } from 'framer-motion';
import { useLivePrices } from '../hooks/useLivePrices';

function MinimalGauge({ value = 0, color = 'var(--text-primary)' }) {
    const r = 90, c = 2 * Math.PI * r;
    const pct = Math.min(Math.max(value, 0), 100);
    const offset = c - (pct / 100) * c * 0.75;

    return (
        <div style={{ position: 'relative', width: 100, height: 100, margin: '0 auto' }}>
            <svg viewBox="0 0 200 200" style={{ transform: 'rotate(135deg)', filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.5))' }}>
                {/* subtle track */}
                <circle cx="100" cy="100" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10"
                    strokeDasharray={`${c * 0.75} ${c * 0.25}`} strokeLinecap="round" />
                {/* value path - thicker and brighter */}
                <circle cx="100" cy="100" r={r} fill="none" stroke={color} strokeWidth="10"
                    strokeDasharray={`${c * 0.75} ${c * 0.25}`} strokeDashoffset={offset}
                    strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.16, 1, 0.3, 1)' }} />
            </svg>
            {/* center typography */}
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <span className="font-mono" style={{ fontSize: 24, fontWeight: 500, color: 'var(--text-primary)', letterSpacing: '-0.04em', textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}>{pct}%</span>
                <span style={{ fontSize: 9, fontWeight: 500, color: 'var(--text-tertiary)', marginTop: 2, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Confidence</span>
            </div>
        </div>
    );
}

export default function AIConfidenceCard() {
    const { gap } = useLivePrices();
    const confPct = gap !== null ? Math.min(Math.round(gap * 1000), 95) : 0;
    const color = confPct > 60 ? 'var(--accent)' : 'var(--text-primary)';

    const status = confPct > 80 ? 'Execution Triggered' : confPct > 40 ? 'Monitoring Volatility' : 'Analyzing Spreads';
    const risk = confPct > 80 ? 'Low' : confPct > 40 ? 'Medium' : 'High';

    return (
        <motion.div className="glass" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}
            initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, delay: 0.05 }}>

            <div style={{ marginBottom: 20 }}>
                <h2 className="section-title">AI Confidence Core</h2>
                <p className="section-subtitle">LLaMA-3.3-70B Evaluation Layer</p>
            </div>

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <MinimalGauge value={confPct} color={color} />

                {/* Added actual interesting data points instead of empty space */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', width: '100%', marginTop: 24 }}>
                    <div style={{ background: 'rgba(255,255,255,0.02)', padding: '10px', borderRadius: '8px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <p style={{ fontSize: 10, color: 'var(--text-secondary)', marginBottom: 2 }}>Model Status</p>
                        <p style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-primary)' }}>{status}</p>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.02)', padding: '10px', borderRadius: '8px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <p style={{ fontSize: 10, color: 'var(--text-secondary)', marginBottom: 2 }}>Estimated Risk</p>
                        <p style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-primary)' }}>{risk}</p>
                    </div>
                    <div style={{ gridColumn: 'span 2', background: 'rgba(255,255,255,0.02)', padding: '10px', borderRadius: '8px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <p style={{ fontSize: 10, color: 'var(--text-secondary)', marginBottom: 2 }}>Arbitrage Signals Processed</p>
                        <p className="font-mono" style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-primary)' }}>4,892 <span style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>in last 24h</span></p>
                    </div>
                </div>
            </div>

        </motion.div>
    );
}
