interface FunnelRow {
  stage: string;
  deals: number;
  value: number;
  expectedMRR: number;
  weightedMRR: number;
  conversionToNext: number | null;
  avgDays: number | null;
  stalePct: number;
}

interface FunnelTableProps {
  rows: FunnelRow[];
  footerNote?: string;
}

function StaleBar({ pct }: { pct: number }) {
  if (pct === 0) return <span className="text-gray-300 text-[11px]">—</span>;
  return (
    <span className={`text-[11px] font-medium ${pct > 30 ? "text-red-600" : pct > 10 ? "text-amber-600" : "text-gray-500"}`}>
      {pct}%
    </span>
  );
}

export function FunnelTable({ rows, footerNote }: FunnelTableProps) {
  const totalDeals = rows.reduce((s, r) => s + r.deals, 0);
  const totalValue = rows.reduce((s, r) => s + r.value, 0);
  const totalExpMRR = rows.reduce((s, r) => s + r.expectedMRR, 0);
  const totalWMRR = rows.reduce((s, r) => s + r.weightedMRR, 0);

  return (
    <div className="border border-gray-200 bg-white overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              {["Stage", "Deals", "Gross Value", "Exp. MRR", "W. MRR", "→ Conv.", "Avg Days", "Stale %"].map((h, i) => (
                <th key={h} className={`px-3 py-2.5 text-[10px] font-bold uppercase tracking-[0.1em] text-gray-400 whitespace-nowrap ${i === 0 ? "text-left" : "text-right"}`}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {rows.map((row) => (
              <tr key={row.stage} className="hover:bg-gray-50/40">
                <td className="px-3 py-2.5 text-xs font-medium text-gray-800 whitespace-nowrap">{row.stage}</td>
                <td className="px-3 py-2.5 text-xs text-right tabular-nums text-gray-700">{row.deals}</td>
                <td className="px-3 py-2.5 text-xs text-right tabular-nums text-gray-600">€{row.value.toLocaleString()}</td>
                <td className="px-3 py-2.5 text-xs text-right tabular-nums text-gray-700 font-medium">€{row.expectedMRR}</td>
                <td className="px-3 py-2.5 text-xs text-right tabular-nums font-semibold text-[#0358F1]">€{row.weightedMRR}</td>
                <td className="px-3 py-2.5 text-xs text-right tabular-nums text-gray-500">
                  {row.conversionToNext !== null ? `${row.conversionToNext}%` : "—"}
                </td>
                <td className="px-3 py-2.5 text-xs text-right tabular-nums text-gray-500">
                  {row.avgDays !== null ? `${row.avgDays}d` : "—"}
                </td>
                <td className="px-3 py-2.5 text-right">
                  <StaleBar pct={row.stalePct} />
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-gray-300 bg-gray-50">
              <td className="px-3 py-2.5 text-xs font-bold text-gray-900">TOTAL</td>
              <td className="px-3 py-2.5 text-xs text-right tabular-nums font-bold text-gray-900">{totalDeals}</td>
              <td className="px-3 py-2.5 text-xs text-right tabular-nums font-bold text-gray-900">€{totalValue.toLocaleString()}</td>
              <td className="px-3 py-2.5 text-xs text-right tabular-nums font-bold text-gray-900">€{totalExpMRR}</td>
              <td className="px-3 py-2.5 text-xs text-right tabular-nums font-bold text-[#0358F1]">€{totalWMRR}</td>
              <td colSpan={3} />
            </tr>
          </tfoot>
        </table>
      </div>
      {footerNote && (
        <div className="px-3 py-2 border-t border-gray-100">
          <p className="text-[10px] text-gray-400 italic">{footerNote}</p>
        </div>
      )}
    </div>
  );
}
