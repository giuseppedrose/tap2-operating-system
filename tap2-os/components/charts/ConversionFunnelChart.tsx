"use client";

interface FunnelStep {
  label: string;
  count: number;
  pctOfTop: number;
  pctOfPrev: number | null;
  isMRR?: boolean;
}

interface ConversionFunnelChartProps {
  steps: FunnelStep[];
  color?: string;
}

export function ConversionFunnelChart({ steps, color = "#0358F1" }: ConversionFunnelChartProps) {
  const max = steps[0]?.count ?? 1;

  return (
    <div className="space-y-1">
      {steps.map((step, i) => {
        const barWidth = Math.max(8, Math.round((step.count / max) * 100));
        const isDropoff = step.pctOfPrev !== null && step.pctOfPrev < 50;

        return (
          <div key={step.label} className="group">
            <div className="flex items-center gap-3">
              {/* Stage label */}
              <div className="w-32 flex-shrink-0">
                <p className="text-[11px] font-medium text-gray-700 leading-tight">{step.label}</p>
              </div>
              {/* Bar */}
              <div className="flex-1 h-6 bg-gray-50 rounded-sm overflow-hidden relative">
                <div
                  className="h-full rounded-sm transition-all duration-300"
                  style={{
                    width: `${barWidth}%`,
                    background: isDropoff
                      ? `rgba(239,68,68,${0.5 + i * 0.02})`
                      : `rgba(3,88,241,${0.25 + (barWidth / 100) * 0.55})`,
                  }}
                />
              </div>
              {/* Count */}
              <div className="w-20 text-right flex-shrink-0">
                <span className="text-xs font-semibold tabular-nums text-gray-800">
                  {step.isMRR ? `€${step.count}/mo` : step.count.toLocaleString()}
                </span>
              </div>
              {/* Conversion */}
              <div className="w-12 text-right flex-shrink-0">
                {step.pctOfPrev !== null ? (
                  <span className={`text-[11px] font-medium tabular-nums ${
                    step.pctOfPrev >= 60 ? "text-emerald-600" :
                    step.pctOfPrev >= 30 ? "text-amber-600" :
                    "text-red-500"
                  }`}>
                    {step.pctOfPrev.toFixed(0)}%
                  </span>
                ) : (
                  <span className="text-[11px] text-gray-300">—</span>
                )}
              </div>
            </div>
            {/* Drop arrow */}
            {i < steps.length - 1 && step.pctOfPrev !== null && step.pctOfPrev < 40 && (
              <div className="ml-32 pl-3 py-0.5">
                <span className="text-[10px] text-red-400">
                  ↓ {(100 - step.pctOfPrev).toFixed(0)}% drop-off
                </span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
