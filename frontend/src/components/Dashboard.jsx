import StatBar from './StatBar';
import PriceGapCard from './PriceGapCard';
import AIConfidenceCard from './AIConfidenceCard';
import ArbitrageFlow from './ArbitrageFlow';
import ExecutionLog from './ExecutionLog';
import SecurityMonitor from './SecurityMonitor';
import ComingSoonSection from './ComingSoonSection';

export default function Dashboard() {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            {/* Row 1: Stat Bar */}
            <StatBar />

            {/* Row 2: Price Gap + AI Confidence */}
            <div className="main-grid">
                <PriceGapCard />
                <AIConfidenceCard />
            </div>

            {/* Row 3: Arbitrage Flow */}
            <ArbitrageFlow />

            {/* Row 4: Activity & Security Monitoring */}
            <div className="log-grid">
                <ExecutionLog />
                <SecurityMonitor />
            </div>

            {/* Row 5: Vision Roadmap */}
            <div style={{ marginTop: '32px' }}>
                <ComingSoonSection />
            </div>
        </div>
    );
}
