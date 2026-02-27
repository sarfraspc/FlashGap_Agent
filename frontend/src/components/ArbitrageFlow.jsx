import React from 'react';
import { motion } from 'framer-motion';
import { useLivePrices } from '../hooks/useLivePrices';
import { formatPrice } from '../utils/formatters';

export default function ArbitrageFlow() {
    const { pcsPrice, biswapPrice, gap } = useLivePrices();
    const est = pcsPrice && biswapPrice && gap ? (gap * 0.01 * 600).toFixed(2) : null;
    const hot = gap !== null && gap > 0.1;

    const steps = [
        { name: 'Flash Borrow', sub: 'BUSD', isExchange: false },
        { name: 'PancakeSwap', sub: 'Receive WBNB', isExchange: true },
        { name: 'Bridge Asset', sub: pcsPrice ? formatPrice(pcsPrice, 6) : 'WBNB', isExchange: false },
        { name: 'BiSwap', sub: 'Receive BUSD', isExchange: true },
        { name: 'Repay & Profit', sub: est ? `+$${est}` : 'BUSD', isExchange: false, highlight: hot },
    ];

    return (
        <motion.div className="glass" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 40 }}>
                <div>
                    <h2 className="section-title">Atomic Execution Path</h2>
                    <p className="section-subtitle">Step-by-step smart contract routing</p>
                </div>
                {hot && <span className="tag tag-live">Executing</span>}
            </div>

            {/* Ultra Clean Flow Diagram */}
            <div style={{ display: 'flex', alignItems: 'stretch', justifyContent: 'space-between', padding: '0', gap: 16 }}>
                {steps.map((s, i) => (
                    <React.Fragment key={i}>
                        <div style={{
                            flex: '0 0 auto',
                            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                            width: s.isExchange ? 180 : 130, /* Slightly wider for better text fit */
                            padding: '28px 16px',
                            background: s.highlight ? 'rgba(240, 185, 11, 0.08)' : 'rgba(255, 255, 255, 0.03)',
                            border: `1px solid ${s.highlight ? 'rgba(240, 185, 11, 0.4)' : 'rgba(255, 255, 255, 0.1)'}`,
                            borderRadius: 20,
                            transition: 'all 0.5s',
                            boxShadow: s.highlight ? '0 0 24px rgba(240, 185, 11, 0.15)' : 'inset 0 1px 1px rgba(255,255,255,0.05), 0 8px 16px rgba(0,0,0,0.2)'
                        }}>
                            <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 8, textAlign: 'center' }}>{s.name}</p>
                            <p className="font-mono" style={{ fontSize: 16, fontWeight: 600, color: s.highlight ? 'var(--accent)' : 'var(--text-primary)', textShadow: '0 2px 4px rgba(0,0,0,0.3)', textAlign: 'center' }}>
                                {s.sub}
                            </p>
                        </div>
                        {i < steps.length - 1 && (
                            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {/* Flow lines with subtle gradient arrow effect */}
                                <div style={{ width: '100%', height: 2, background: 'linear-gradient(90deg, rgba(255,255,255,0.05), rgba(255,255,255,0.2), rgba(255,255,255,0.05))' }} />
                            </div>
                        )}
                    </React.Fragment>
                ))}
            </div>

        </motion.div>
    );
}
