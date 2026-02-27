const MOCK_LOGS = [
    {
        ts: "2026-02-27T16:55:12Z",
        pair: "BUSD → WBNB",
        gap: "0.18%",
        confidence: "87%",
        profit: "+$1.24",
        tx: "0xabc1…ef23",
        status: "success",
        ipfs: "Qm…abc1",
    },
    {
        ts: "2026-02-27T16:48:03Z",
        pair: "BUSD → WBNB",
        gap: "0.22%",
        confidence: "91%",
        profit: "+$2.05",
        tx: "0xdef4…ab56",
        status: "success",
        ipfs: "Qm…def4",
    },
    {
        ts: "2026-02-27T16:40:58Z",
        pair: "USDT → WBNB",
        gap: "0.09%",
        confidence: "74%",
        profit: "—",
        tx: "—",
        status: "skipped",
        ipfs: "—",
    },
    {
        ts: "2026-02-27T16:33:21Z",
        pair: "BUSD → WBNB",
        gap: "0.31%",
        confidence: "94%",
        profit: "+$3.80",
        tx: "0x789a…cd01",
        status: "success",
        ipfs: "Qm…789a",
    },
    {
        ts: "2026-02-27T16:25:09Z",
        pair: "BUSD → WBNB",
        gap: "0.14%",
        confidence: "82%",
        profit: "+$0.95",
        tx: "0xbbb2…ee34",
        status: "reverted",
        ipfs: "Qm…bbb2",
    },
];

export default function ExecutionLog() {
    return (
        <div className="glass-card">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                    <span className="text-2xl">📋</span> Execution Log
                </h2>
                <span className="text-xs text-[var(--text-secondary)]">
                    Last {MOCK_LOGS.length} entries
                </span>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="text-[var(--text-secondary)] text-xs border-b border-white/10">
                            <th className="py-2 text-left">Timestamp</th>
                            <th className="py-2 text-left">Pair</th>
                            <th className="py-2 text-right">Gap</th>
                            <th className="py-2 text-right">AI Conf.</th>
                            <th className="py-2 text-right">Profit</th>
                            <th className="py-2 text-center">Status</th>
                            <th className="py-2 text-right">TX Hash</th>
                            <th className="py-2 text-right">IPFS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {MOCK_LOGS.map((log, i) => (
                            <tr
                                key={i}
                                className="border-b border-white/5 hover:bg-white/5 transition-colors"
                            >
                                <td className="py-2 font-mono text-xs">
                                    {new Date(log.ts).toLocaleTimeString()}
                                </td>
                                <td className="py-2 text-xs">{log.pair}</td>
                                <td className="py-2 text-right font-mono text-xs">{log.gap}</td>
                                <td className="py-2 text-right font-mono text-xs">{log.confidence}</td>
                                <td className={`py-2 text-right font-mono text-xs font-semibold ${log.profit.startsWith("+") ? "text-[var(--green)]" : ""
                                    }`}>
                                    {log.profit}
                                </td>
                                <td className="py-2 text-center">
                                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${log.status === "success"
                                            ? "bg-green-500/10 text-green-400"
                                            : log.status === "reverted"
                                                ? "bg-red-500/10 text-red-400"
                                                : "bg-white/10 text-[var(--text-secondary)]"
                                        }`}>
                                        {log.status}
                                    </span>
                                </td>
                                <td className="py-2 text-right font-mono text-xs text-[var(--accent)]">
                                    {log.tx}
                                </td>
                                <td className="py-2 text-right font-mono text-xs text-blue-400">
                                    {log.ipfs}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
