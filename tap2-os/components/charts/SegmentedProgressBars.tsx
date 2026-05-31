"use client";

interface ProgressBarItem {
  label: string;
  value: number;
  maxValue: number;
  formatted?: string;
  color?: string;
  subLabel?: string;
}

interface SegmentedProgressBarsProps {
  items: ProgressBarItem[];
  showValues?: boolean;
}

export function SegmentedProgressBars({ items, showValues = true }: SegmentedProgressBarsProps) {
  return (
    <div className="space-y-3">
      {items.map(item => {
        const pct = Math.min(100, Math.max(0, (item.value / item.maxValue) * 100));
        const color = item.color ?? "#0358F1";
        return (
          <div key={item.label}>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-gray-700">{item.label}</span>
                {item.subLabel && <span className="text-[10px] text-gray-400">{item.subLabel}</span>}
              </div>
              {showValues && (
                <span className="text-xs font-semibold tabular-nums text-gray-800">
                  {item.formatted ?? item.value}
                </span>
              )}
            </div>
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${pct}%`, background: color }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
