import { motion } from 'framer-motion';
import { useContractStats } from '../hooks/useContractStats';
import { truncateAddress, formatBps } from '../utils/formatters';
import { FLASHGAP_ADDRESS } from '../config/contracts';

export default function ContractConfig() {
    const { minProfitBps, maxSlippageBps, flashFeeNumerator, owner, factoryA, paused } = useContractStats();

    return (
        <motion.div className="glass" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, delay: 0.2 }}>
            <div style={{ marginBottom: 40 }}>
                <h2 className="section-title">Contract Parameters</h2>
                <p className="section-subtitle">Locked and enforced on-chain</p>
            </div>

            <div className="config-2col" style={{ marginBottom: 40 }}>
                {[
                    { label: 'Min Profit Yield', val: formatBps(minProfitBps) },
                    { label: 'Max DEX Slippage', val: formatBps(maxSlippageBps) },
                    { label: 'Protocol Fee', val: formatBps(flashFeeNumerator) },
                    { label: 'System Status', val: paused ? 'Paused' : 'Active', color: paused ? 'var(--red)' : 'var(--green)' },
                ].map((c, i) => (
                    <div key={i} style={{ padding: '0 0 24px 0', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                        <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 12 }}>{c.label}</p>
                        <p className="font-mono" style={{ fontSize: 24, fontWeight: 500, color: c.color || 'var(--text-primary)', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>{c.val}</p>
                    </div>
                ))}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 20, marginBottom: 40 }}>
                {[
                    { label: 'Router Contract', addr: FLASHGAP_ADDRESS },
                    { label: 'Deployer Owner', addr: owner },
                    { label: 'Pancake Factory', addr: factoryA },
                ].map((r, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)' }}>{r.label}</span>
                        <button onClick={() => r.addr && navigator.clipboard.writeText(r.addr)} className="font-mono"
                            style={{ fontSize: 14, color: 'var(--text-primary)', background: 'rgba(255,255,255,0.03)', padding: '6px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', transition: 'all 0.2s', boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.1)' }}>
                            {truncateAddress(r.addr)}
                        </button>
                    </div>
                ))}
            </div>

            <a href={`https://testnet.bscscan.com/address/${FLASHGAP_ADDRESS}`} target="_blank" rel="noopener noreferrer"
                className="btn-ghost" style={{ width: '100%', padding: '16px', borderRadius: 16, fontSize: 15 }}>
                Verify on BscScan
            </a>
        </motion.div>
    );
}
