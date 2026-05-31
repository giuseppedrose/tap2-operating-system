import type { DataStatus } from "@/lib/analytics/metric-definitions";
import { DATA_STATUS_LABELS } from "@/lib/analytics/metric-definitions";

interface BoardMetricCardProps {
  label: string;
  value: string;
  variance?: string;
  variancePositive?: boolean;
  sub?: string;
  dataStatus?: DataStatus;
  source?: string;
  flag?: string;
}

export function BoardMetricCard({
  label, value, variance, variancePositive, sub, dataStatus, source, flag,
}: BoardMetricCardProps) {
  const statusCfg = dataStatus ? DATA_STATUS_LABELS[dataStatus] : null;

  return (
    <div className="bg-white border border-gray-200 px-4 py-4 space-y-1">
      <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-gray-400">{label}</p>
      <div className="flex items-baseline gap-2">
        <p className="text-2xl font-semibold tabular-nums text-gray-900 tracking-tight">{value}</p>
        {variance && (
          <span className={`text-xs font-semibold tabular-nums ${variancePositive ? "text-emerald-700" : "text-red-600"}`}>
            {variance}
          </span>
        )}
      </div>
      {sub && <p className="text-[11px] text-gray-400">{sub}</p>}
      <div className="flex items-center gap-2 pt-1">
        {statusCfg && (
          <span className={`text-[10px] font-medium ${statusCfg.color}`}>{statusCfg.label}</span>
        )}
        {source && <span className="text-[10px] text-gray-300">· {source}</span>}
        {flag && <span className="text-[10px] font-medium text-amber-600">· {flag}</span>}
      </div>
    </div>
  );
}

export function BoardMetricRow({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-2 gap-px sm:grid-cols-4 bg-gray-200 border border-gray-200">
      {children}
    </div>
  );
}
