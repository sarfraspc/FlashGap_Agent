import { useAccount, useConnect, useDisconnect, useBalance } from 'wagmi';
import { useContractStats } from '../hooks/useContractStats';
import { useNetworkStats } from '../hooks/useNetworkStats';
import { truncateAddress } from '../utils/formatters';
import { useAutoTrade } from '../contexts/AutoTradeContext';

export default function Header() {
    const { address, isConnected } = useAccount();
    const { connectors, connect } = useConnect();
    const { disconnect } = useDisconnect();
    const { data: wb } = useBalance({ address });
    const { paused } = useContractStats();
    const { blockNumber } = useNetworkStats();
    const { autoTrade, setAutoTrade } = useAutoTrade();

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
                        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" style={{ filter: 'drop-shadow(0 0 6px rgba(240,185,11,0.6))' }}>
                            <polygon points="12 2 22 7.5 22 16.5 12 22 2 16.5 2 7.5 12 2" fill="rgba(240, 185, 11, 0.08)" />
                            <polyline points="2 7.5 12 13 22 7.5" />
                            <polyline points="12 22 12 13" />
                            <polygon points="12 2 7 7.5 12 13 17 7.5 12 2" fill="rgba(240, 185, 11, 0.15)" />
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
                    <button
                        onClick={() => setAutoTrade(!autoTrade)}
                        className="glass"
                        style={{ display: 'flex', alignItems: 'center', gap: 8, marginRight: 8, padding: '8px 16px', borderRadius: 100, cursor: 'pointer', background: autoTrade ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.08)', borderColor: autoTrade ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)', boxShadow: autoTrade ? '0 0 12px rgba(16, 185, 129, 0.1)' : 'none' }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: autoTrade ? 'var(--green)' : 'var(--red)', animation: autoTrade ? 'pulse-dot 2s ease-in-out infinite' : 'none', boxShadow: autoTrade ? '0 0 8px var(--green)' : 'none' }} />
                        <span style={{ fontSize: 12, fontWeight: 600, color: autoTrade ? 'var(--green)' : 'var(--red)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                            Auto-Trade: {autoTrade ? 'ON' : 'OFF'}
                        </span>
                    </button>

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
