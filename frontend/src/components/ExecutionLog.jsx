import { motion } from 'framer-motion';
import { useTradeHistory } from '../hooks/useTradeHistory';
import { formatBNB, truncateAddress, timeAgo, getBscScanUrl } from '../utils/formatters';

import { useAutoTrade } from '../contexts/AutoTradeContext';

export default function ExecutionLog() {
    const { trades: blockchainTrades, isLoading, isDemo } = useTradeHistory();
    const { aiState } = useAutoTrade();

    // Merge recent AI results into the log view
    const aiTx = aiState?.transactions?.arb_tx;
    const trades = [...blockchainTrades];

    // If there's a live AI transaction that isn't in blockchain yet (e.g. reverted or pending)
    if (aiTx && aiTx.hash && !trades.some(t => t.txHash === aiTx.hash)) {
        trades.unshift({
            timestamp: aiState.timestamp ? Math.floor(new Date(aiState.timestamp).getTime() / 1000) : null,
            tokenBorrow: aiState.best_pair ? aiState.best_pair.split('/')[0] : 'Arbitrage',
            tokenTarget: aiState.best_pair ? aiState.best_pair.split('/')[1] : 'WBNB',
            profit: 0n, // Reverts don't emit profit events
            txHash: aiTx.hash,
            status: aiTx.status || 'Attempting',
            isAttempt: true
        });
    }

    return (
        <motion.div className="glass" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, delay: 0.15 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 40 }}>
                <div>
                    <h2 className="section-title">System Activity</h2>
                    <p className="section-subtitle">Real-time detections & execution logs</p>
                </div>
                {isDemo && (
                    <div style={{ background: 'rgba(240, 185, 11, 0.1)', border: '1px solid rgba(240, 185, 11, 0.3)', padding: '6px 12px', borderRadius: 8 }}>
                        <p style={{ fontSize: 11, color: 'var(--accent)', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Demo Simulation Active</p>
                    </div>
                )}
            </div>

            {isLoading ? (
                <div style={{ textAlign: 'center', padding: '60px 0' }}>
                    <p style={{ fontSize: 16, fontWeight: 500, color: 'var(--text-secondary)' }}>Syncing events from chain…</p>
                </div>
            ) : trades.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 0' }}>
                    <h3 style={{ fontSize: 22, fontWeight: 400, marginBottom: 12, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>Awaiting Signals</h3>
                    <p style={{ fontSize: 15, color: 'var(--text-secondary)' }}>
                        System is initialized and monitoring mempools.
                    </p>
                </div>
            ) : (
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ color: 'var(--text-tertiary)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                <th style={{ padding: '16px 0', fontWeight: 600, fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Time Age</th>
                                <th style={{ padding: '16px 0', fontWeight: 600, fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Token Pair</th>
                                <th style={{ padding: '16px 0', fontWeight: 600, fontSize: 13, textAlign: 'right', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Profit (BNB)</th>
                                <th style={{ padding: '16px 0', fontWeight: 600, fontSize: 13, textAlign: 'right', textTransform: 'uppercase', letterSpacing: '0.05em' }}>TX Receipt</th>
                            </tr>
                        </thead>
                        <tbody>
                            {trades.map((t, i) => (
                                <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: t.isAttempt ? 'rgba(255,255,255,0.02)' : 'transparent' }}>
                                    <td className="font-mono" style={{ padding: '10px 0', color: 'var(--text-secondary)', fontSize: 12 }}>
                                        {t.timestamp ? timeAgo(t.timestamp) : '—'}
                                        {t.isAttempt && <span style={{ marginLeft: 8, fontSize: 10, padding: '1px 4px', borderRadius: 4, background: 'rgba(240, 185, 11, 0.1)', color: 'var(--accent)' }}>LIVE</span>}
                                    </td>
                                    <td className="font-mono" style={{ padding: '10px 0', fontSize: 12, color: 'var(--text-primary)' }}>
                                        {t.tokenBorrow?.startsWith('0x') ? truncateAddress(t.tokenBorrow) : t.tokenBorrow}
                                        <span style={{ color: 'var(--text-tertiary)' }}> → </span>
                                        {t.tokenTarget?.startsWith('0x') ? truncateAddress(t.tokenTarget) : t.tokenTarget}
                                    </td>
                                    <td className="font-mono" style={{ padding: '10px 0', textAlign: 'right', color: t.isAttempt ? 'var(--text-muted)' : 'var(--green)', fontSize: 13, fontWeight: 600 }}>
                                        {t.isAttempt ? (t.status || 'Attempting') : `+${formatBNB(t.profit)}`}
                                    </td>
                                    <td style={{ padding: '10px 0', textAlign: 'right' }}>
                                        <a href={getBscScanUrl(t.txHash)} target="_blank" rel="noopener noreferrer" className="font-mono"
                                            style={{ color: 'var(--accent)', textDecoration: 'none', borderBottom: '1px dashed var(--accent)', fontSize: 12 }}>{t.txHash ? `${t.txHash.slice(0, 8)}…` : '—'}</a>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </motion.div>
    );
}
