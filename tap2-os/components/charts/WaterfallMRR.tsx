"use client";

interface WaterfallMRRProps {
  previousMRR: number;
  newMRR: number;
  expansionMRR: number;
  churnedMRR: number;
  currentMRR: number;
}

export function WaterfallMRR({
  previousMRR,
  newMRR,
  expansionMRR,
  churnedMRR,
  currentMRR,
}: WaterfallMRRProps) {
  const items = [
    {
      label: "Previous MRR",
      display: `€${previousMRR.toLocaleString()}`,
      color: "text-gray-700",
      border: "border-gray-200",
    },
    {
      label: "+ New",
      display: `+€${newMRR.toLocaleString()}`,
      color: "text-emerald-600",
      border: "border-emerald-100",
    },
    {
      label: "+ Expansion",
      display: `+€${expansionMRR.toLocaleString()}`,
      color: "text-blue-600",
      border: "border-blue-100",
    },
    {
      label: "− Churned",
      display: `-€${churnedMRR.toLocaleString()}`,
      color: "text-red-500",
      border: "border-red-100",
    },
    {
      label: "= Net MRR",
      display: `€${currentMRR.toLocaleString()}`,
      color: "text-[#0358F1] text-lg font-bold",
      border: "border-blue-200",
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
      {items.map((item, i) => (
        <div key={item.label} className="flex items-center gap-2">
          <div
            className={`flex-1 rounded-xl border ${item.border} bg-white p-4 text-center shadow-sm`}
          >
            <p className="text-xs text-gray-400 mb-1">{item.label}</p>
            <p className={`font-semibold ${item.color}`}>{item.display}</p>
          </div>
          {i < items.length - 1 && (
            <span className="hidden sm:block text-gray-300 text-sm font-medium flex-shrink-0">
              →
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
