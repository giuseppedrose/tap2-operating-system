"use client";
import { AlertTriangle, TrendingUp, Info, CheckCircle } from "lucide-react";

type InsightType = 'warning' | 'positive' | 'info' | 'action';

const ICONS = {
  warning:  { Icon: AlertTriangle, bg: 'bg-amber-50',  border: 'border-amber-200',  text: 'text-amber-700',  icon: 'text-amber-500' },
  positive: { Icon: TrendingUp,    bg: 'bg-green-50',  border: 'border-green-200',  text: 'text-green-700',  icon: 'text-green-500' },
  info:     { Icon: Info,          bg: 'bg-blue-50',   border: 'border-blue-200',   text: 'text-blue-700',   icon: 'text-blue-500' },
  action:   { Icon: CheckCircle,   bg: 'bg-gray-50',   border: 'border-gray-200',   text: 'text-gray-700',   icon: 'text-gray-500' },
};

export function InsightCard({ type, title, description }: { type: InsightType; title: string; description: string }) {
  const { Icon, bg, border, text, icon } = ICONS[type];
  return (
    <div className={`rounded-xl border ${border} ${bg} p-4 flex gap-3`}>
      <Icon className={`h-4 w-4 mt-0.5 flex-shrink-0 ${icon}`} />
      <div>
        <p className={`text-sm font-semibold ${text}`}>{title}</p>
        <p className={`text-xs mt-0.5 ${text} opacity-80`}>{description}</p>
      </div>
    </div>
  );
}
