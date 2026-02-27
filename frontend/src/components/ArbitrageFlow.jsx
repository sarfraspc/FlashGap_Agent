import React from 'react';
import { motion } from 'framer-motion';
import { useLivePrices } from '../hooks/useLivePrices';
import { formatPrice } from '../utils/formatters';

export default function ArbitrageFlow() {
    const { pcsPrice, biswapPrice, gap } = useLivePrices();
    const est = pcsPrice && biswapPrice && gap ? (gap * 0.01 * 600).toFixed(2) : null;
    const hot = gap !== null && gap > 0.1;

    const steps = [
        { name: 'Flash Borrow', sub: 'WBNB Loan', isExchange: false },
        { name: 'PancakeSwap', sub: 'Receive XVS', isExchange: true },
        { name: 'Liquidity Swap', sub: 'Asset Routed', isExchange: false },
        { name: 'BiSwap', sub: 'Execute Sell', isExchange: true },
        { name: 'Repay & Profit', sub: est && est > 0 ? `+$${est} Net` : 'Arbitrage', isExchange: false, highlight: hot },
    ];

    return (
        <motion.div className="glass" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <div>
                    <h2 className="section-title">Atomic Execution Path</h2>
                    <p className="section-subtitle">Step-by-step smart contract routing</p>
                </div>
                {hot && <span className="tag tag-live">Executing</span>}
            </div>

            {/* Ultra Clean Flow Diagram */}
            <div className="flow-grid" style={{
                display: 'flex',
                alignItems: 'stretch',
                justifyContent: 'center',
                padding: '0',
                gap: 8
            }}>
                {steps.map((s, i) => (
                    <React.Fragment key={i}>
                        <div style={{
                            flex: '1 1 auto',
                            minWidth: 120,
                            maxWidth: 160,
                            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                            padding: '12px 10px',
                            background: s.highlight ? 'rgba(240, 185, 11, 0.08)' : 'rgba(255, 255, 255, 0.03)',
                            border: `1px solid ${s.highlight ? 'rgba(240, 185, 11, 0.4)' : 'rgba(255, 255, 255, 0.1)'}`,
                            borderRadius: 8,
                            transition: 'all 0.5s',
                        }}>
                            <p style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 4, textAlign: 'center' }}>{s.name}</p>
                            <p className="font-mono" style={{ fontSize: 13, fontWeight: 600, color: s.highlight ? 'var(--accent)' : 'var(--text-primary)', textAlign: 'center' }}>
                                {s.sub}
                            </p>
                        </div>
                    </React.Fragment>
                ))}
            </div>

        </motion.div>
    );
}
