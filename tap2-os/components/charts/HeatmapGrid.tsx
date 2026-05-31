"use client";

interface HeatmapCell {
  row: string;
  col: string;
  value: number;
  label?: string;
}

interface HeatmapGridProps {
  cells: HeatmapCell[];
  rows: string[];
  cols: string[];
  colorScale?: "blue" | "redgreen" | "amber";
  cellSize?: number;
}

function cellColor(value: number, max: number, scale: string): string {
  const t = max > 0 ? value / max : 0;
  if (scale === "redgreen") {
    const r = Math.round(239 - t * (239 - 16));
    const g = Math.round(68 + t * (185 - 68));
    const b = Math.round(68 - t * 68);
    return `rgb(${r},${g},${b})`;
  }
  if (scale === "amber") {
    return `rgba(245,158,11,${0.08 + t * 0.72})`;
  }
  // blue
  return `rgba(3,88,241,${0.06 + t * 0.74})`;
}

export function HeatmapGrid({ cells, rows, cols, colorScale = "blue", cellSize = 40 }: HeatmapGridProps) {
  const max = Math.max(...cells.map(c => c.value), 1);
  const cellMap: Record<string, HeatmapCell> = {};
  cells.forEach(c => { cellMap[`${c.row}:::${c.col}`] = c; });

  return (
    <div className="overflow-x-auto">
      <table className="border-collapse">
        <thead>
          <tr>
            <th className="pr-3 pb-2 text-[10px] text-gray-400 font-medium text-right w-24" />
            {cols.map(col => (
              <th key={col} className="pb-2 text-center text-[10px] text-gray-400 font-medium whitespace-nowrap"
                style={{ minWidth: cellSize }}>
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map(row => (
            <tr key={row}>
              <td className="pr-3 text-right text-[11px] text-gray-600 font-medium whitespace-nowrap py-0.5">{row}</td>
              {cols.map(col => {
                const cell = cellMap[`${row}:::${col}`];
                const v = cell?.value ?? 0;
                return (
                  <td key={col} className="p-0.5" style={{ height: cellSize, width: cellSize }}>
                    <div
                      className="w-full h-full flex items-center justify-center text-[10px] font-semibold rounded-sm transition-all"
                      style={{
                        background: v > 0 ? cellColor(v, max, colorScale) : "#f8fafc",
                        color: v > max * 0.6 && colorScale !== "blue" ? "white" : "#374151",
                        height: cellSize - 4,
                        minWidth: cellSize - 4,
                      }}
                      title={cell?.label ?? `${row} / ${col}: ${v}`}
                    >
                      {v > 0 ? (cell?.label ?? v) : ""}
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
