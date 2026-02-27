import { motion } from 'framer-motion';
import { useTradeHistory } from '../hooks/useTradeHistory';
import { formatBNB, truncateAddress, timeAgo, getBscScanUrl } from '../utils/formatters';

export default function ExecutionLog() {
    const { trades, isLoading } = useTradeHistory();

    return (
        <motion.div className="glass" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, delay: 0.15 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 40 }}>
                <div>
                    <h2 className="section-title">System Activity</h2>
                    <p className="section-subtitle">Real-time detections & execution logs</p>
                </div>
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
                                <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                    <td className="font-mono" style={{ padding: '10px 0', color: 'var(--text-secondary)', fontSize: 12 }}>{t.timestamp ? timeAgo(t.timestamp) : '—'}</td>
                                    <td className="font-mono" style={{ padding: '10px 0', fontSize: 12, color: 'var(--text-primary)' }}>
                                        {t.tokenBorrow?.startsWith('0x') ? truncateAddress(t.tokenBorrow) : t.tokenBorrow}
                                        <span style={{ color: 'var(--text-tertiary)' }}> → </span>
                                        {t.tokenTarget?.startsWith('0x') ? truncateAddress(t.tokenTarget) : t.tokenTarget}
                                    </td>
                                    <td className="font-mono" style={{ padding: '10px 0', textAlign: 'right', color: 'var(--green)', fontSize: 13, fontWeight: 600 }}>+{formatBNB(t.profit)}</td>
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
