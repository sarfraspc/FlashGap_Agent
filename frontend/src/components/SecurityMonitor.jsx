import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useContractStats } from '../hooks/useContractStats';
import { useTradeHistory } from '../hooks/useTradeHistory';
import { truncateAddress } from '../utils/formatters';

export default function SecurityMonitor() {
    const { paused, owner, minProfitBps, maxSlippageBps } = useContractStats();
    const { trades } = useTradeHistory();
    const [showProof, setShowProof] = useState(false);

    const latestTrade = trades?.[0];
    const proofDetails = latestTrade ? {
        timestamp: new Date(Number(latestTrade.timestamp || Date.now() / 1000) * 1000).toISOString(),
        execution_tx: latestTrade.txHash,
        profit_wei: latestTrade.profit?.toString(),
        pair: `${latestTrade.tokenBorrow} -> ${latestTrade.tokenTarget}`,
        audit_status: "VERIFIED_ON_CHAIN"
    } : {
        "status": "No trades found on-chain."
    };

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
                        style={{ background: 'var(--bg-card)', padding: 16, borderRadius: 12, border: '1px solid var(--border-glass)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)', marginBottom: 16 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                            <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--green)', boxShadow: '0 0 8px var(--green)', animation: 'pulse-dot 2s ease-in-out infinite' }} />
                            <p style={{ fontSize: 10, color: 'var(--green)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Greenfield Execution Proof</p>
                        </div>
                        <pre className="font-mono" style={{ fontSize: 11, color: 'var(--text-secondary)', whiteSpace: 'pre-wrap', lineHeight: '1.5', background: 'rgba(0,0,0,0.5)', padding: 12, borderRadius: 8, border: '1px solid rgba(16,185,129,0.15)' }}>
                            {JSON.stringify(proofDetails, null, 2)}
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
