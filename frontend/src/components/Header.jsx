import { useAccount, useConnect, useDisconnect, useBalance } from 'wagmi';
import { useContractStats } from '../hooks/useContractStats';
import { useNetworkStats } from '../hooks/useNetworkStats';
import { truncateAddress } from '../utils/formatters';

export default function Header() {
    const { address, isConnected } = useAccount();
    const { connectors, connect } = useConnect();
    const { disconnect } = useDisconnect();
    const { data: wb } = useBalance({ address });
    const { paused } = useContractStats();
    const { blockNumber } = useNetworkStats();

    return (
        <header style={{
            position: 'sticky', top: 0, zIndex: 50,
            backdropFilter: 'blur(32px)', WebkitBackdropFilter: 'blur(32px)',
            background: 'rgba(2, 4, 10, 0.4)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
            padding: '16px 0'
        }}>
            <div className="header-container">

                {/* COMPACT LOGO & TITLE */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                        width: 40, height: 40, borderRadius: 10,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
                        background: 'linear-gradient(135deg, rgba(240, 185, 11, 0.2), rgba(240, 185, 11, 0.05))',
                        border: '1px solid rgba(240, 185, 11, 0.3)',
                        boxShadow: '0 0 20px rgba(240, 185, 11, 0.1)',
                        position: 'relative'
                    }}>
                        <svg width="28" height="28" viewBox="0 0 64 64" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ filter: 'drop-shadow(0 0 4px rgba(240,185,11,0.6))' }}>
                            <polygon points="32,4 60,20 60,44 32,60 4,44 4,20" fill="none" />
                            <circle cx="32" cy="4" r="3" fill="var(--accent)" />
                            <circle cx="60" cy="20" r="3" fill="var(--accent)" />
                            <circle cx="60" cy="44" r="3" fill="var(--accent)" />
                            <circle cx="32" cy="60" r="3" fill="var(--accent)" />
                            <circle cx="4" cy="44" r="3" fill="var(--accent)" />
                            <circle cx="4" cy="20" r="3" fill="var(--accent)" />
                        </svg>
                        <div style={{
                            position: 'absolute', bottom: -1, right: -1,
                            width: 8, height: 8, borderRadius: '50%',
                            border: '2px solid var(--bg-deep)',
                            background: paused ? 'var(--red)' : 'var(--green)',
                        }} />
                    </div>
                    <div>
                        <h1 style={{ fontSize: 20, fontWeight: 500, letterSpacing: '-0.01em', lineHeight: 1.1 }}>
                            Flash<span style={{ color: 'var(--accent)' }}>Gap</span>
                        </h1>
                        <p style={{ fontSize: 11, letterSpacing: '0.04em', color: 'var(--text-tertiary)', fontWeight: 400, marginTop: 2 }}>
                            Algorithmic Quant Trading
                            {blockNumber && <span style={{ marginLeft: 6, opacity: 0.6 }}>· #{blockNumber.toLocaleString()}</span>}
                        </p>
                    </div>
                </div>

                {/* WALLET & STATUS */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginRight: 16 }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)', animation: 'pulse-dot 2s ease-in-out infinite' }} />
                        <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)' }}>Scanning Markets</span>
                    </div>

                    {isConnected ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{
                                display: 'flex', alignItems: 'center', gap: 12, padding: '10px 20px', borderRadius: 100,
                                background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)'
                            }}>
                                {wb && <span className="font-mono" style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{Number(wb.formatted).toFixed(3)} BNB</span>}
                                <span className="font-mono" style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>{truncateAddress(address)}</span>
                            </div>
                            <button onClick={() => disconnect()} className="btn-ghost" style={{ padding: '10px 14px', borderRadius: 100, fontSize: 12, color: 'var(--red)' }}>
                                Disconnect
                            </button>
                        </div>
                    ) : (
                        connectors.slice(0, 1).map(c => (
                            <button key={c.uid} onClick={() => connect({ connector: c })}
                                style={{
                                    background: 'var(--accent)', color: '#000', padding: '12px 28px', borderRadius: 100,
                                    fontSize: 14, fontWeight: 600, border: 'none', cursor: 'pointer', transition: 'all 0.3s'
                                }}>
                                Connect Wallet
                            </button>
                        ))
                    )}
                </div>

            </div>
        </header >
    );
}
