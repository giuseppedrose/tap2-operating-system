import type { ActionItem } from "@/lib/operating-model/calculations";

interface ActionQueueProps {
  actions: ActionItem[];
  title?: string;
}

const URGENCY_CONFIG = {
  now: { dot: "bg-red-500", label: "Now", text: "text-red-600" },
  this_week: { dot: "bg-amber-500", label: "This week", text: "text-amber-600" },
  this_month: { dot: "bg-gray-300", label: "This month", text: "text-gray-400" },
};

export function ActionQueue({ actions, title = "Action Queue" }: ActionQueueProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
      <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between">
        <p className="text-sm font-semibold text-gray-900">{title}</p>
        <span className="text-xs text-gray-400">{actions.length} pending</span>
      </div>
      <div className="divide-y divide-gray-50">
        {actions.map((item) => {
          const cfg = URGENCY_CONFIG[item.urgency];
          return (
            <div key={item.deal_id} className="flex items-start gap-3 px-5 py-3 hover:bg-gray-50/50 transition-colors">
              <span className={`mt-1.5 h-2 w-2 rounded-full flex-shrink-0 ${cfg.dot}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2 flex-wrap">
                  <span className="text-sm font-semibold text-gray-900">{item.company}</span>
                  <span className="text-xs text-gray-400">{item.stage}</span>
                  <span className="text-xs font-semibold text-[#0358F1]">€{item.mrr}/mo</span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5 truncate">{item.action}</p>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0 pt-0.5">
                <span className="text-xs text-gray-400">{item.owner}</span>
                <span className={`text-xs font-medium ${cfg.text}`}>{cfg.label}</span>
              </div>
            </div>
          );
        })}
        {actions.length === 0 && (
          <div className="px-5 py-4 text-center text-xs text-gray-400">No pending actions.</div>
        )}
      </div>
    </div>
  );
}
