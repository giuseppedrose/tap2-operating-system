import type { BusinessStatus } from "@/lib/operating-model/calculations";

interface OperatingBriefProps {
  status: BusinessStatus;
  headline: string;
  signals: string[];
  dataLabel?: string;
}

const STATUS_CONFIG = {
  on_track: {
    bar: "bg-emerald-500",
    badge: "bg-emerald-50 border-emerald-200 text-emerald-700",
    label: "On Track",
    dot: "bg-emerald-500",
  },
  behind: {
    bar: "bg-amber-500",
    badge: "bg-amber-50 border-amber-200 text-amber-700",
    label: "Behind Schedule",
    dot: "bg-amber-500",
  },
  critical: {
    bar: "bg-red-500",
    badge: "bg-red-50 border-red-200 text-red-700",
    label: "Critical",
    dot: "bg-red-500 animate-pulse",
  },
};

export function OperatingBrief({ status, headline, signals, dataLabel }: OperatingBriefProps) {
  const cfg = STATUS_CONFIG[status];
  return (
    <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
      <div className={`h-1 w-full ${cfg.bar}`} />
      <div className="px-5 py-4 flex items-start gap-4">
        <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold flex-shrink-0 mt-0.5 ${cfg.badge}`}>
          <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
          {cfg.label}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 leading-snug">{headline}</p>
          <ul className="mt-2 flex flex-wrap gap-x-6 gap-y-1">
            {signals.map((s, i) => (
              <li key={i} className="flex items-center gap-1.5 text-xs text-gray-500">
                <span className="h-1 w-1 rounded-full bg-gray-300 flex-shrink-0" />
                {s}
              </li>
            ))}
          </ul>
        </div>
        {dataLabel && (
          <span className="text-xs text-gray-300 flex-shrink-0">{dataLabel}</span>
        )}
      </div>
    </div>
  );
}
