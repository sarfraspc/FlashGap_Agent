import { motion } from 'framer-motion';
import { useLivePrices } from '../hooks/useLivePrices';
import { formatPrice } from '../utils/formatters';

export default function PriceGapCard() {
    const { pcsPrice, biswapPrice, gap, history, pcsError, biswapError } = useLivePrices();
    const isOpp = gap !== null && gap > 0.1;
    const gapColor = gap !== null ? (isOpp ? 'var(--accent)' : 'var(--text-primary)') : 'var(--text-muted)';
    const maxGap = Math.max(...history.map(h => h.gap || 0), 0.01);

    return (
        <motion.div className="glass" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <div>
                    <h2 className="section-title">Price Divergence</h2>
                    <p className="section-subtitle">Multi-pair arbitrage monitoring</p>
                </div>
            </div>

            {/* Minimalist Gap Hero */}
            <div style={{ textAlign: 'center', padding: '12px 0 20px', marginBottom: 16 }}>
                <p style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 8 }}>Primary Opportunity (Price Gap)</p>
                <div className={`font-mono ${isOpp ? 'glow-text' : ''}`} style={{ fontSize: 40, fontWeight: 500, letterSpacing: '-0.04em', color: gapColor, lineHeight: 1, textShadow: isOpp ? '' : '0 4px 12px rgba(0,0,0,0.5)' }}>
                    {gap !== null ? `${gap.toFixed(4)}%` : '—'}
                </div>
            </div>

            {/* Elegant Price Readings */}
            <div className="price-2col" style={{ marginBottom: 28, background: 'var(--bg-card)', padding: '16px 20px', borderRadius: '16px', border: '1px solid var(--border-glass)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05), 0 4px 12px rgba(0,0,0,0.15)' }}>
                <PriceItem label="PancakeSwap" price={pcsPrice} error={pcsError} />
                <PriceItem label="BiSwap" price={biswapPrice} error={biswapError} />
            </div>

            {/* Subdued History Chart */}
            {history.length > 0 && (
                <div style={{ height: 60, display: 'flex', alignItems: 'flex-end', gap: '4px', width: '100%', paddingBottom: 4, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    {history.map((h, i) => {
                        const isHigh = h.gap > 0.1;
                        return (
                            <motion.div key={i}
                                initial={{ height: 0 }}
                                animate={{ height: `${Math.max((h.gap / maxGap) * 100, 4)}%` }}
                                style={{
                                    flex: 1, minWidth: 4, borderRadius: '4px 4px 0 0',
                                    background: isHigh ? 'var(--accent)' : 'var(--text-secondary)',
                                    opacity: isHigh ? 0.6 + (i / history.length) * 0.4 : 0.2 + (i / history.length) * 0.4,
                                    borderTop: isHigh ? '1px solid rgba(255,255,255,0.8)' : 'none',
                                }} />
                        );
                    })}
                </div>
            )}
        </motion.div>
    );
}

function PriceItem({ label, price, error }) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <p style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</p>
            <p className="font-mono" style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-primary)', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
                {error ? <span style={{ color: 'var(--red)' }}>Fault</span> : price !== null ? formatPrice(price, 8) : <span style={{ opacity: 0.3, fontSize: 14 }}>Syncing...</span>}
            </p>
        </div>
    );
}
