import Header from './components/Header';
import Footer from './components/Footer';
import Dashboard from './components/Dashboard';

function App() {
    return (
        <div className="relative min-h-screen" style={{ background: 'var(--bg-deep)' }}>
            {/* ── Animated Background ─────────────────────── */}
            <div className="animated-bg" />

            {/* ── Content (above background) ──────────────── */}
            <div className="relative z-10">
                <Header />

                <main className="max-w-[1600px] mx-auto px-6 py-12">
                    <Dashboard />
                </main>

                <Footer />
            </div>
        </div>
    );
}

export default App;
