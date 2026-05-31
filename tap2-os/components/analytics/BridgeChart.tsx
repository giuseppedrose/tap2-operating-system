interface BridgeRow {
  label: string;
  value: number;
  type: "opening" | "add" | "subtract" | "closing" | "subtotal";
  running?: number;
}

interface BridgeChartProps {
  title: string;
  rows: BridgeRow[];
  currency?: boolean;
  note?: string;
}

function fmt(v: number, currency: boolean) {
  if (currency) return `€${Math.abs(v).toLocaleString()}`;
  return String(Math.abs(v));
}

export function BridgeChart({ title, rows, currency = true, note }: BridgeChartProps) {
  return (
    <div className="bg-white border border-gray-200">
      <div className="px-4 py-3 border-b border-gray-100">
        <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-gray-400">{title}</p>
      </div>
      <table className="w-full">
        <tbody>
          {rows.map((row, i) => {
            const isOpening = row.type === "opening";
            const isClosing = row.type === "closing";
            const isSubtotal = row.type === "subtotal";
            const isAdd = row.type === "add";
            const isSubtract = row.type === "subtract";

            const valueColor = isAdd ? "text-emerald-700" :
                               isSubtract ? "text-red-600" :
                               "text-gray-900";
            const sign = isAdd ? "+" : isSubtract ? "−" : "";
            const border = (isClosing || isSubtotal) ? "border-t border-gray-300" : "";
            const weight = (isOpening || isClosing || isSubtotal) ? "font-semibold" : "font-normal";
            const bg = (isClosing || isSubtotal) ? "bg-gray-50" : "bg-white";

            return (
              <tr key={i} className={`${bg} ${border}`}>
                <td className={`px-4 py-2 text-xs text-gray-700 ${weight} ${isOpening || isClosing ? "" : "pl-8"}`}>
                  {row.label}
                </td>
                <td className={`px-4 py-2 text-xs text-right tabular-nums ${valueColor} ${weight}`}>
                  {sign}{fmt(row.value, currency)}
                </td>
                <td className={`px-4 py-2 text-xs text-right tabular-nums text-gray-500 ${weight} w-28`}>
                  {row.running !== undefined ? fmt(row.running, currency) : ""}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {note && <div className="px-4 py-2 border-t border-gray-100"><p className="text-[10px] text-gray-400 italic">{note}</p></div>}
    </div>
  );
}
