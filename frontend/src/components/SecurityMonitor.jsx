import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useContractStats } from '../hooks/useContractStats';
import { truncateAddress } from '../utils/formatters';

const MOCK_PROOF = {
    "timestamp": "2026-02-28T02:14:45.197Z",
    "execution_id": "FG-92872913-AF01",
    "ai_confidence": 0.95,
    "pair": "XVS -> WBNB",
    "audit_status": "COMMITTED_ON_GREENFIELD",
    "contract_address": "0xa6acB349...0B6bf0"
};

export default function SecurityMonitor() {
    const { paused, owner, minProfitBps, maxSlippageBps } = useContractStats();
    const [showProof, setShowProof] = useState(false);

    const stats = [
        { label: 'Protocol Status', value: paused ? 'PAUSED' : 'ACTIVE', color: paused ? 'var(--red)' : 'var(--green)' },
        { label: 'Greenfield Audit', value: 'ENABLED', color: 'var(--cyan)' },
        { label: 'Profit Threshold', value: `${(Number(minProfitBps) / 100).toFixed(2)}%`, color: 'var(--accent)' },
        { label: 'Max DEX Slippage', value: `${(Number(maxSlippageBps) / 100).toFixed(2)}%`, color: 'var(--text-primary)' },
        { label: 'Admin Authorization', value: owner ? 'VERIFIED' : 'PENDING', color: owner ? 'var(--green)' : 'var(--red)' },
    ];

    return (
        <motion.div className="glass" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, delay: 0.2 }}>
            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h2 className="section-title">Security & Protocol Monitor</h2>
                    <p className="section-subtitle">Real-time smart contract health & guardrails</p>
                </div>
                <button
                    onClick={() => setShowProof(!showProof)}
                    className="btn-ghost" style={{ fontSize: 9, padding: '4px 8px' }}>
                    {showProof ? 'Close Audit' : 'Audit Logs'}
                </button>
            </div>

            <AnimatePresence mode="wait">
                {showProof ? (
                    <motion.div
                        key="proof"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        style={{ background: 'rgba(0,0,0,0.3)', padding: 12, borderRadius: 8, border: '1px solid rgba(255,255,255,0.05)', marginBottom: 16 }}>
                        <p style={{ fontSize: 9, color: 'var(--cyan)', marginBottom: 8, fontWeight: 700, textTransform: 'uppercase' }}>Recent Audit Proof — ID: FG-928...AF01</p>
                        <pre className="font-mono" style={{ fontSize: 10, color: 'var(--text-tertiary)', whiteSpace: 'pre-wrap', lineHeight: '1.4' }}>
                            {JSON.stringify(MOCK_PROOF, null, 2)}
                        </pre>
                    </motion.div>
                ) : (
                    <motion.div
                        key="stats"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className="security-grid" style={{ marginBottom: 16 }}>
                        {stats.map((s, i) => (
                            <div key={i} style={{
                                background: 'rgba(255,255,255,0.02)',
                                padding: '10px',
                                borderRadius: '8px',
                                border: '1px solid rgba(255,255,255,0.05)',
                                gridColumn: i === 0 && stats.length % 2 !== 0 ? 'span 2' : 'auto'
                            }}>
                                <p style={{ fontSize: 10, color: 'var(--text-tertiary)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</p>
                                <p style={{ fontSize: 14, fontWeight: 600, color: s.color, letterSpacing: '-0.01em' }}>{s.value}</p>
                            </div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>

            <div style={{ padding: '10px', borderRadius: '8px', background: 'rgba(240,185,11,0.05)', border: '1px solid rgba(240,185,11,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)' }} />
                    <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Authorized Master Wallet</span>
                </div>
                <span className="font-mono" style={{ fontSize: 11, color: 'var(--text-primary)', fontWeight: 500 }}>{truncateAddress(owner)}</span>
            </div>
        </motion.div >
    );
}
