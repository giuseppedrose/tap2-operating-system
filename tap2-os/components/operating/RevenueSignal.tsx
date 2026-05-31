interface RevenueSignalProps {
  mrr: number;
  newMRR: number;
  expansionMRR: number;
  churnedMRR: number;
  growthRate: number;
  arpa: number;
  churnRate: number;
  activeClients: number;
}

export function RevenueSignal({
  mrr, newMRR, expansionMRR, churnedMRR, growthRate, arpa, churnRate, activeClients,
}: RevenueSignalProps) {
  const netNew = newMRR + expansionMRR - churnedMRR;

  return (
    <div className="rounded-xl border border-gray-200 bg-white px-5 py-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">Revenue Signal</p>
      
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 mb-4">
        {[
          { label: "MRR", value: `€${mrr.toLocaleString()}`, sub: `+${growthRate}% MoM` },
          { label: "New MRR", value: `+€${newMRR}`, sub: "this month", color: "text-emerald-600" },
          { label: "Net New", value: `+€${netNew}`, sub: `after €${churnedMRR} churn`, color: netNew > 0 ? "text-emerald-600" : "text-red-500" },
          { label: "ARPA", value: `€${arpa}/mo`, sub: `${activeClients} clients` },
        ].map(m => (
          <div key={m.label}>
            <p className="text-xs text-gray-400">{m.label}</p>
            <p className={`text-lg font-semibold tracking-tight ${m.color ?? "text-gray-900"}`}>{m.value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{m.sub}</p>
          </div>
        ))}
      </div>

      {/* MRR movement bar */}
      <div className="rounded-lg bg-gray-50 border border-gray-100 px-4 py-3 flex flex-wrap items-center gap-4 text-xs">
        <span className="text-gray-500">This month:</span>
        <span className="font-semibold text-gray-700">
          €{(mrr - netNew).toLocaleString()} prev
        </span>
        <span className="text-gray-300">→</span>
        <span className="text-emerald-600 font-semibold">+€{newMRR} new</span>
        <span className="text-gray-300">+</span>
        <span className="text-blue-600 font-semibold">+€{expansionMRR} expansion</span>
        <span className="text-gray-300">−</span>
        <span className="text-red-500 font-semibold">€{churnedMRR} churn</span>
        <span className="text-gray-300">=</span>
        <span className="text-gray-900 font-bold">€{mrr.toLocaleString()} MRR</span>
        <span className="ml-auto text-gray-400">{churnRate}% monthly churn</span>
      </div>
    </div>
  );
}
