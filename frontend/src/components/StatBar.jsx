import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useContractStats } from '../hooks/useContractStats';
import { useContractBalance } from '../hooks/useContractBalance';
import { useNetworkStats } from '../hooks/useNetworkStats';
import { formatBNB } from '../utils/formatters';

function Num({ value, decimals = 0, prefix = '', suffix = '' }) {
    const [d, setD] = useState(0);
    const prev = useRef(0);
    useEffect(() => {
        const t = Number(value) || 0, s = prev.current, diff = t - s;
        if (!diff) { setD(t); return; }
        const dur = 800, st = performance.now();
        const tick = (now) => {
            const p = Math.min((now - st) / dur, 1);
            setD(s + diff * (1 - Math.pow(1 - p, 4)));
            if (p < 1) requestAnimationFrame(tick); else prev.current = t;
        };
        requestAnimationFrame(tick);
    }, [value]);
    return <span className="font-mono">{prefix}{d.toFixed(decimals)}{suffix}</span>;
}

function Stat({ label, sub, delay = 0, children }) {
    return (
        <motion.div className="glass-stat"
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: delay * 0.08, ease: [0.16, 1, 0.3, 1] }}>
            <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 8 }}>{label}</p>
            <div style={{ fontSize: 28, fontWeight: 600, letterSpacing: '-0.02em', color: 'var(--text-primary)', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
                {children}
            </div>
            {sub && <p style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 8 }}>{sub}</p>}
        </motion.div>
    );
}

export default function StatBar() {
    const { totalTrades, totalProfit, paused } = useContractStats();
    const { balance } = useContractBalance();
    const { gasPrice } = useNetworkStats();
    const pBnb = formatBNB(totalProfit, 4);
    const cBal = balance ? Number(balance.formatted).toFixed(4) : '0.0000';
    const gwei = gasPrice ? (Number(gasPrice) / 1e9).toFixed(1) : null;

    return (
        <div className="stat-grid">
            <Stat label="Total Trades" sub={paused ? 'System Paused' : 'System Active'} delay={0}>
                <Num value={Number(totalTrades)} />
            </Stat>

            <Stat label="Total Profit" sub="BNB Accumulated" delay={1}>
                <Num value={Number(pBnb)} decimals={4} />
            </Stat>

            {/* Replaced 'Win Rate' with 'Monitored Pairs' for more relevance */}
            <Stat label="Active Pairs" sub="WBNB / BUSD" delay={2}>
                <Num value={1} />
            </Stat>

            <Stat label="Capital Vault" sub="Testnet BNB" delay={3}>
                <Num value={Number(cBal)} decimals={4} />
            </Stat>

            <Stat label="Network Gas" sub="BSC Mainnet" delay={4}>
                {gwei ? <><Num value={Number(gwei)} decimals={1} /> <span style={{ fontSize: 14, color: 'var(--text-tertiary)' }}>Gwei</span></> : <span style={{ opacity: 0.3 }}>—</span>}
            </Stat>

            <Stat label="AI Subsystem" sub="GPT-4o-mini" delay={5}>
                <span style={{ color: 'var(--accent)', textShadow: '0 0 12px rgba(240,185,11,0.3)' }}>Online</span>
            </Stat>
        </div>
    );
}
