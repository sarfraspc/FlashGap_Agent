import Header from './components/Header';
import Footer from './components/Footer';
import Dashboard from './components/Dashboard';
import { AutoTradeProvider } from './contexts/AutoTradeContext';

function App() {
    return (
        <AutoTradeProvider>
            <div className="relative min-h-screen" style={{ background: 'var(--bg-deep)' }}>
                {/* ── Animated Background ─────────────────────── */}
                <div className="animated-bg" />

                {/* ── Content (above background) ──────────────── */}
                <div className="relative z-10">
                    <Header />

                    <main className="app-container">
                        <Dashboard />
                    </main>

                    <Footer />
                </div>
            </div>
        </AutoTradeProvider>
    );
}

export default App;
