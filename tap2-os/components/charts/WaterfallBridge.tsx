"use client";

interface WaterfallRow {
  label: string;
  value: number;
  type: "base" | "add" | "subtract" | "total";
  running?: number;
}

interface WaterfallBridgeProps {
  rows: WaterfallRow[];
  currency?: boolean;
  compact?: boolean;
}

function fmt(v: number, currency: boolean): string {
  if (currency) {
    if (Math.abs(v) >= 1000) return `€${(Math.abs(v) / 1000).toFixed(1)}k`;
    return `€${Math.abs(v)}`;
  }
  return String(Math.abs(v));
}

export function WaterfallBridge({ rows, currency = true, compact = false }: WaterfallBridgeProps) {
  const max = Math.max(...rows.map(r => r.running ?? r.value), 1);

  return (
    <div className="space-y-0.5">
      {rows.map((row, i) => {
        const isBase  = row.type === "base";
        const isTotal = row.type === "total";
        const isAdd   = row.type === "add";
        const isSub   = row.type === "subtract";
        const sign    = isAdd ? "+" : isSub ? "−" : "";
        const barPct  = Math.min(100, ((row.running ?? row.value) / max) * 100);
        const barColor = isTotal || isBase ? "#0358F1" : isAdd ? "#10b981" : "#ef4444";

        return (
          <div
            key={i}
            className={`flex items-center gap-3 ${isTotal || isBase ? "pt-1 border-t border-gray-200 mt-1" : ""} ${compact ? "py-0.5" : "py-1"}`}
          >
            <span className={`${compact ? "w-36" : "w-44"} text-xs flex-shrink-0 ${isBase || isTotal ? "font-semibold text-gray-900" : "pl-3 text-gray-600"}`}>
              {row.label}
            </span>
            {/* Bar visual */}
            <div className="flex-1 relative h-4 bg-gray-50 rounded-sm overflow-hidden">
              <div
                className="absolute left-0 top-0 h-full rounded-sm"
                style={{ width: `${barPct}%`, background: barColor, opacity: isBase || isTotal ? 1 : 0.6 }}
              />
            </div>
            {/* Value */}
            <span className={`${compact ? "w-14" : "w-16"} text-right text-xs font-semibold tabular-nums flex-shrink-0 ${
              isAdd ? "text-emerald-600" : isSub ? "text-red-500" : "text-gray-900"
            }`}>
              {sign}{fmt(row.value, currency)}
            </span>
            {/* Running total */}
            <span className={`${compact ? "w-14" : "w-16"} text-right text-xs tabular-nums text-gray-400 flex-shrink-0`}>
              {row.running !== undefined ? fmt(row.running, currency) : ""}
            </span>
          </div>
        );
      })}
    </div>
  );
}
