const STATS = [
    {
        label: "Total Trades",
        value: "47",
        icon: "⚡",
        change: "+3 today",
        changeColor: "text-[var(--green)]",
    },
    {
        label: "Total Profit",
        value: "$128.45",
        icon: "💰",
        change: "+$12.30 today",
        changeColor: "text-[var(--green)]",
    },
    {
        label: "Win Rate",
        value: "89.4%",
        icon: "🎯",
        change: "42/47 trades",
        changeColor: "text-[var(--text-secondary)]",
    },
    {
        label: "Avg Confidence",
        value: "84.2%",
        icon: "🤖",
        change: "AI gated",
        changeColor: "text-[var(--accent)]",
    },
];

export default function ProfitSummary() {
    return (
        <>
            {STATS.map((stat, i) => (
                <div
                    key={i}
                    className="glass-card flex flex-col justify-between"
                    style={{ animationDelay: `${i * 100}ms` }}
                >
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-2xl">{stat.icon}</span>
                        <span className={`text-xs font-medium ${stat.changeColor}`}>
                            {stat.change}
                        </span>
                    </div>
                    <div>
                        <p className="text-xs text-[var(--text-secondary)] mb-1">{stat.label}</p>
                        <p className="text-2xl font-extrabold tracking-tight">{stat.value}</p>
                    </div>
                </div>
            ))}
        </>
    );
}
