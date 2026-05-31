interface VarianceColumn {
  header: string;
  accessor: string;
  align?: "left" | "right" | "center";
  isVariance?: boolean;
  isNumber?: boolean;
  render?: (row: Record<string, unknown>) => React.ReactNode;
}

interface VarianceTableProps {
  columns: VarianceColumn[];
  rows: Record<string, unknown>[];
  subtotalRow?: Record<string, unknown>;
  footerNote?: string;
  stickyHeader?: boolean;
}

export function VarianceTable({ columns, rows, subtotalRow, footerNote }: VarianceTableProps) {
  const alignClass = (align?: string) =>
    align === "right" ? "text-right" :
    align === "center" ? "text-center" : "text-left";

  return (
    <div className="border border-gray-200 bg-white overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              {columns.map(col => (
                <th
                  key={col.accessor}
                  className={`px-3 py-2.5 text-[10px] font-bold uppercase tracking-[0.1em] text-gray-400 whitespace-nowrap ${alignClass(col.align ?? (col.isNumber ? "right" : "left"))}`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {rows.map((row, i) => (
              <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                {columns.map(col => {
                  const val = row[col.accessor];
                  const numVal = typeof val === "number" ? val : null;
                  const isPos = numVal !== null && col.isVariance && numVal > 0;
                  const isNeg = numVal !== null && col.isVariance && numVal < 0;
                  return (
                    <td
                      key={col.accessor}
                      className={`px-3 py-2.5 text-xs tabular-nums whitespace-nowrap ${alignClass(col.align ?? (col.isNumber ? "right" : "left"))} ${
                        isPos ? "text-emerald-700 font-semibold" :
                        isNeg ? "text-red-600 font-semibold" :
                        col.isNumber ? "text-gray-700 font-medium" :
                        "text-gray-700"
                      }`}
                    >
                      {col.render ? col.render(row) : (
                        col.isVariance && numVal !== null
                          ? `${numVal > 0 ? "+" : ""}${numVal}`
                          : String(val ?? "—")
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
          {subtotalRow && (
            <tfoot>
              <tr className="border-t-2 border-gray-300 bg-gray-50">
                {columns.map(col => {
                  const val = subtotalRow[col.accessor];
                  return (
                    <td
                      key={col.accessor}
                      className={`px-3 py-2.5 text-xs font-bold tabular-nums ${alignClass(col.align ?? (col.isNumber ? "right" : "left"))} text-gray-900`}
                    >
                      {String(val ?? "")}
                    </td>
                  );
                })}
              </tr>
            </tfoot>
          )}
        </table>
      </div>
      {footerNote && (
        <div className="px-3 py-2 border-t border-gray-100">
          <p className="text-[10px] text-gray-400 italic">{footerNote}</p>
        </div>
      )}
    </div>
  );
}
