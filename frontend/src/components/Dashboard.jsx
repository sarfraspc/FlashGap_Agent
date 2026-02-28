import StatBar from './StatBar';
import PriceGapCard from './PriceGapCard';
import AIConfidenceCard from './AIConfidenceCard';
import ArbitrageFlow from './ArbitrageFlow';
import ExecutionLog from './ExecutionLog';
import SecurityMonitor from './SecurityMonitor';
import ComingSoonSection from './ComingSoonSection';

export default function Dashboard() {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <StatBar />

            <div className="main-grid">
                <PriceGapCard />
                <AIConfidenceCard />
            </div>

            <ArbitrageFlow />

            <div className="log-grid">
                <ExecutionLog />
                <SecurityMonitor />
            </div>

            <div style={{ marginTop: '16px' }}>
                <ComingSoonSection />
            </div>
        </div>
    );
}
