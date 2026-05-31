import type { MilestoneState } from "@/lib/operating-model/calculations";

interface MilestoneTrackerProps {
  milestone: MilestoneState;
}

export function MilestoneTracker({ milestone }: MilestoneTrackerProps) {
  const { current, target, targetLabel, pct, monthsAtCurrentPace, requiredMonthlyNew } = milestone;
  const barWidth = Math.min(100, pct);

  return (
    <div className="rounded-xl border border-gray-200 bg-white px-5 py-4">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Path to {targetLabel}</p>
          <p className="mt-1 text-2xl font-semibold text-gray-900 tracking-tight">
            {pct.toFixed(1)}%
            <span className="ml-2 text-sm font-normal text-gray-400">of €{(target / 1000).toFixed(1)}k MRR needed</span>
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-400">Current</p>
          <p className="text-sm font-semibold text-[#0358F1]">€{current.toLocaleString()}/mo</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="relative h-2 rounded-full bg-gray-100 overflow-hidden">
        <div
          className="absolute left-0 top-0 h-full rounded-full bg-[#0358F1] transition-all"
          style={{ width: `${barWidth}%` }}
        />
      </div>

      <div className="flex items-center justify-between mt-2">
        <span className="text-xs text-gray-400">€{current.toLocaleString()}</span>
        <span className="text-xs text-gray-400">€{target.toLocaleString()}</span>
      </div>

      <div className="mt-3 pt-3 border-t border-gray-100 flex flex-wrap gap-x-6 gap-y-1">
        {monthsAtCurrentPace !== null && (
          <p className="text-xs text-gray-500">
            At current pace: <span className="font-semibold text-gray-700">{monthsAtCurrentPace} months</span>
          </p>
        )}
        <p className="text-xs text-gray-500">
          To hit in 12 months: need <span className="font-semibold text-gray-700">+€{requiredMonthlyNew.toLocaleString()}/mo net new</span>
        </p>
      </div>
    </div>
  );
}
