"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";

export interface Column<T> {
  header: string;
  accessor: keyof T | string;
  cell?: (row: T) => React.ReactNode;
  sortable?: boolean;
  className?: string;
  headerClassName?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  emptyMessage?: string;
  className?: string;
}

function getValue<T>(row: T, accessor: string): unknown {
  return accessor.split(".").reduce((obj: unknown, key) => {
    if (obj && typeof obj === "object") return (obj as Record<string, unknown>)[key];
    return undefined;
  }, row);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function DataTable<T extends Record<string, any>>({
  columns,
  data,
  loading = false,
  emptyMessage = "No data available",
  className,
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  function handleSort(accessor: string) {
    if (sortKey === accessor) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(accessor);
      setSortDir("asc");
    }
  }

  const sorted = sortKey
    ? [...data].sort((a, b) => {
        const av = getValue(a, sortKey);
        const bv = getValue(b, sortKey);
        if (av === undefined || av === null) return 1;
        if (bv === undefined || bv === null) return -1;
        if (typeof av === "number" && typeof bv === "number") {
          return sortDir === "asc" ? av - bv : bv - av;
        }
        const as = String(av).toLowerCase();
        const bs = String(bv).toLowerCase();
        if (sortDir === "asc") return as < bs ? -1 : as > bs ? 1 : 0;
        return as > bs ? -1 : as < bs ? 1 : 0;
      })
    : data;

  return (
    <div className={cn("overflow-x-auto rounded-xl border border-gray-200 bg-white", className)}>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50">
            {columns.map((col) => {
              const accessor = String(col.accessor);
              const isSorted = sortKey === accessor;
              return (
                <th
                  key={accessor}
                  className={cn(
                    "px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap",
                    col.headerClassName,
                    col.sortable !== false && "cursor-pointer select-none hover:text-gray-900"
                  )}
                  onClick={() => col.sortable !== false && handleSort(accessor)}
                >
                  <div className="flex items-center gap-1">
                    {col.header}
                    {col.sortable !== false && (
                      <span className="text-gray-400">
                        {isSorted ? (
                          sortDir === "asc" ? (
                            <ChevronUp className="h-3.5 w-3.5" />
                          ) : (
                            <ChevronDown className="h-3.5 w-3.5" />
                          )
                        ) : (
                          <ChevronsUpDown className="h-3.5 w-3.5" />
                        )}
                      </span>
                    )}
                  </div>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <tr key={i} className="animate-pulse">
                {columns.map((col) => (
                  <td key={String(col.accessor)} className="px-4 py-3">
                    <div className="h-4 rounded bg-gray-200" />
                  </td>
                ))}
              </tr>
            ))
          ) : sorted.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-4 py-12 text-center text-gray-400"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            sorted.map((row, idx) => (
              <tr
                key={row.id ?? idx}
                className="hover:bg-gray-50 transition-colors"
              >
                {columns.map((col) => {
                  const accessor = String(col.accessor);
                  return (
                    <td
                      key={accessor}
                      className={cn("px-4 py-3 text-gray-700", col.className)}
                    >
                      {col.cell
                        ? col.cell(row)
                        : String(getValue(row, accessor) ?? "")}
                    </td>
                  );
                })}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
