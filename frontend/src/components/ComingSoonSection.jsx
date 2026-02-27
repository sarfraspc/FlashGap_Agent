import { motion } from 'framer-motion';

const FEATURES = [
    { title: 'AI Auto-Pilot', desc: 'GPT-4 evaluates every gap with sentiment analysis before triggering capital.' },
    { title: 'MEV Shield', desc: 'Secure mempool RPC submission to prevent front-running and sandwich attacks.' },
    { title: 'Multi-Chain', desc: 'Expand routing logic organically to Ethereum, Polygon, and Arbitrum.' },
    { title: 'Greenfield', desc: 'Immutable, decentralized execution logs stored on BNB Greenfield.' },
    { title: 'Smart Alerts', desc: 'Direct Telegram/Discord webhooks for high-confidence structural opportunities.' },
    { title: 'Strategy Lab', desc: 'Sandbox environment for backtesting complex B-tree multi-hop arbitrage paths.' },
];

export default function ComingSoonSection() {
    return (
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.3 }}>
            <div style={{ marginBottom: 40, textAlign: 'center' }}>
                <h2 style={{ fontSize: 32, fontWeight: 300, letterSpacing: '-0.04em', color: 'var(--text-primary)' }}>Vision Roadmap</h2>
                <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 8 }}>Capabilities actively being architected for Q4 2026</p>
            </div>

            <div className="soon-grid">
                {FEATURES.map((f, i) => (
                    <motion.div key={i} className="glass" style={{ padding: 40 }}
                        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, delay: 0.4 + i * 0.05 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                            <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--text-tertiary)' }} />
                        </div>
                        <h3 style={{ fontSize: 20, fontWeight: 400, color: 'var(--text-primary)', marginBottom: 12, letterSpacing: '-0.02em' }}>{f.title}</h3>
                        <p style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--text-secondary)' }}>{f.desc}</p>
                    </motion.div>
                ))}
            </div>
        </motion.div>
    );
}
