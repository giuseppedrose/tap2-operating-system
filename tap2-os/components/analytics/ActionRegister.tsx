export interface ActionEntry {
  id: string;
  company: string;
  owner: string;
  stage: string;
  mrr: number;
  risk: "high" | "medium" | "low";
  nextStep: string;
  dueDate: string;
  urgency: "now" | "this_week" | "this_month";
}

const RISK_CFG = {
  high:   { label: "High",   color: "text-red-600",   bg: "bg-red-50" },
  medium: { label: "Medium", color: "text-amber-600", bg: "bg-amber-50" },
  low:    { label: "Low",    color: "text-gray-400",  bg: "bg-gray-50" },
};

const URGENCY_CFG = {
  now:        { label: "Now",        color: "text-red-600 font-semibold" },
  this_week:  { label: "This week",  color: "text-amber-600 font-medium" },
  this_month: { label: "This month", color: "text-gray-400" },
};

interface ActionRegisterProps {
  entries: ActionEntry[];
  title?: string;
}

export function ActionRegister({ entries, title = "Founder Attention Register" }: ActionRegisterProps) {
  return (
    <div className="border border-gray-200 bg-white overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-200">
        <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-gray-400">{title}</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              {["Company", "Stage", "Owner", "MRR/mo", "Risk", "Next Step", "Due", "Action"].map((h, i) => (
                <th key={h} className={`px-3 py-2.5 text-[10px] font-bold uppercase tracking-[0.1em] text-gray-400 whitespace-nowrap ${i >= 3 ? "text-right" : "text-left"}`}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {entries.map(entry => {
              const risk = RISK_CFG[entry.risk];
              const urgency = URGENCY_CFG[entry.urgency];
              return (
                <tr key={entry.id} className="hover:bg-gray-50/50">
                  <td className="px-3 py-2.5 text-xs font-semibold text-gray-900 whitespace-nowrap">{entry.company}</td>
                  <td className="px-3 py-2.5 text-xs text-gray-500 whitespace-nowrap">{entry.stage}</td>
                  <td className="px-3 py-2.5 text-xs text-gray-600">{entry.owner}</td>
                  <td className="px-3 py-2.5 text-xs text-right tabular-nums font-semibold text-[#0358F1]">€{entry.mrr}</td>
                  <td className="px-3 py-2.5 text-right">
                    <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold ${risk.color} ${risk.bg}`}>
                      {risk.label}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-xs text-gray-600 max-w-[200px] truncate">{entry.nextStep}</td>
                  <td className="px-3 py-2.5 text-xs text-right tabular-nums text-gray-500 whitespace-nowrap">{entry.dueDate}</td>
                  <td className={`px-3 py-2.5 text-xs text-right whitespace-nowrap ${urgency.color}`}>
                    {urgency.label}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
