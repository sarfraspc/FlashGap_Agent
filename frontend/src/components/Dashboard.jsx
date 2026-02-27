import PriceGapCard from "./PriceGapCard";
import AIConfidenceCard from "./AIConfidenceCard";
import ExecutionLog from "./ExecutionLog";
import ProfitSummary from "./ProfitSummary";

export default function Dashboard() {
    return (
        <div className="space-y-8 animate-fade-in-up">
            {/* ── Top row: key metrics ─────────────────────── */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <ProfitSummary />
            </div>

            {/* ── Middle row: live data ─────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <PriceGapCard />
                <AIConfidenceCard />
            </div>

            {/* ── Bottom: execution log ─────────────────────── */}
            <ExecutionLog />
        </div>
    );
}
