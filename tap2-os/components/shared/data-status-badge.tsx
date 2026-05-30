"use client";

import { useState } from "react";

export type DataStatus =
  | "live"
  | "connected"
  | "seed"
  | "mock"
  | "pending"
  | "manual"
  | "csv";

interface DataStatusConfig {
  label: string;
  color: string;
  bg: string;
  border: string;
  dot: string;
  pulse: boolean;
}

const statusConfig: Record<DataStatus, DataStatusConfig> = {
  live: {
    label: "Live",
    color: "text-green-700",
    bg: "bg-green-50",
    border: "border-green-200",
    dot: "bg-green-500",
    pulse: true,
  },
  connected: {
    label: "Connected",
    color: "text-blue-700",
    bg: "bg-blue-50",
    border: "border-blue-200",
    dot: "bg-blue-500",
    pulse: false,
  },
  seed: {
    label: "Seed Data",
    color: "text-amber-700",
    bg: "bg-amber-50",
    border: "border-amber-200",
    dot: "bg-amber-500",
    pulse: false,
  },
  mock: {
    label: "Mock",
    color: "text-gray-600",
    bg: "bg-gray-50",
    border: "border-gray-200",
    dot: "bg-gray-400",
    pulse: false,
  },
  pending: {
    label: "Pending",
    color: "text-orange-700",
    bg: "bg-orange-50",
    border: "border-orange-200",
    dot: "bg-orange-400",
    pulse: false,
  },
  manual: {
    label: "Manual / CSV",
    color: "text-purple-700",
    bg: "bg-purple-50",
    border: "border-purple-200",
    dot: "bg-purple-400",
    pulse: false,
  },
  csv: {
    label: "CSV Upload",
    color: "text-purple-700",
    bg: "bg-purple-50",
    border: "border-purple-200",
    dot: "bg-purple-400",
    pulse: false,
  },
};

interface DataStatusBadgeProps {
  status: DataStatus;
  integration?: string;
  tooltip?: string;
}

export function DataStatusBadge({ status, integration, tooltip }: DataStatusBadgeProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const cfg = statusConfig[status];
  const label = integration ? `${cfg.label} / ${integration}` : cfg.label;
  const tip = tooltip ?? defaultTooltip(status, integration);

  return (
    <div className="relative inline-flex">
      <span
        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium border cursor-help ${cfg.color} ${cfg.bg} ${cfg.border}`}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <span className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${cfg.dot} ${cfg.pulse ? "animate-pulse" : ""}`} />
        {label}
      </span>
      {showTooltip && tip && (
        <div className="absolute bottom-full left-0 mb-2 z-50 w-56 rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-lg text-xs text-gray-600 leading-relaxed">
          {tip}
        </div>
      )}
    </div>
  );
}

function defaultTooltip(status: DataStatus, integration?: string): string {
  switch (status) {
    case "live":
      return `Real-time data from ${integration ?? "live integration"}.`;
    case "connected":
      return `Integration is configured and syncing data.`;
    case "seed":
      return integration
        ? `Structured seed data. ${integration} integration is pending — connect to replace with live data.`
        : `Structured seed data used for demo and development purposes.`;
    case "mock":
      return `Placeholder example data. Not representative of real business metrics.`;
    case "pending":
      return `Integration is prepared but not yet connected. Configure the required API key to activate.`;
    case "manual":
    case "csv":
      return `Data must be uploaded manually via CSV file. No live API connection exists yet.`;
  }
}

interface DataStatusBarProps {
  items: { label: string; status: DataStatus; integration?: string }[];
}

export function DataStatusBar({ items }: DataStatusBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-1.5">
          <span className="text-xs text-gray-400">{item.label}:</span>
          <DataStatusBadge status={item.status} integration={item.integration} />
        </div>
      ))}
    </div>
  );
}
