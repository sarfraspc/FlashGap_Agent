import { useAccount, useConnect, useDisconnect } from "wagmi";
import Dashboard from "./components/Dashboard";

function App() {
    const { address, isConnected } = useAccount();
    const { connectors, connect } = useConnect();
    const { disconnect } = useDisconnect();

    return (
        <div className="min-h-screen bg-[var(--bg-primary)]">
            {/* ── Header ──────────────────────────────────── */}
            <header className="border-b border-[var(--border-subtle)] bg-[var(--bg-card)] backdrop-blur-xl sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#F0B90B] to-[#F8D12F] flex items-center justify-center text-black font-extrabold text-lg shadow-lg shadow-yellow-500/20">
                            ⚡
                        </div>
                        <div>
                            <h1 className="text-xl font-bold tracking-tight">
                                Flash<span className="text-[var(--accent)]">Gap</span> AI
                            </h1>
                            <p className="text-xs text-[var(--text-secondary)]">
                                Predictive Arbitrage · BNB Chain
                            </p>
                        </div>
                    </div>

                    <div>
                        {isConnected ? (
                            <div className="flex items-center gap-3">
                                <span className="text-sm text-[var(--text-secondary)] font-mono">
                                    {address?.slice(0, 6)}…{address?.slice(-4)}
                                </span>
                                <button
                                    onClick={() => disconnect()}
                                    className="px-4 py-2 rounded-lg bg-red-500/10 text-red-400 text-sm font-medium hover:bg-red-500/20 transition-colors"
                                >
                                    Disconnect
                                </button>
                            </div>
                        ) : (
                            <div className="flex gap-2">
                                {connectors.map((connector) => (
                                    <button
                                        key={connector.uid}
                                        onClick={() => connect({ connector })}
                                        className="px-5 py-2 rounded-lg bg-gradient-to-r from-[#F0B90B] to-[#F8D12F] text-black font-semibold text-sm hover:shadow-lg hover:shadow-yellow-500/25 transition-all duration-200"
                                    >
                                        {connector.name}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {/* ── Main ────────────────────────────────────── */}
            <main className="max-w-7xl mx-auto px-6 py-8">
                <Dashboard />
            </main>

            {/* ── Footer ──────────────────────────────────── */}
            <footer className="border-t border-[var(--border-subtle)] mt-12">
                <div className="max-w-7xl mx-auto px-6 py-6 text-center text-xs text-[var(--text-secondary)]">
                    FlashGap AI © 2026 · Built for BNB Chain x YZi Labs Hack Series
                </div>
            </footer>
        </div>
    );
}

export default App;
