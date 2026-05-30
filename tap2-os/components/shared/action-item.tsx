"use client";
import { AlertTriangle, TrendingUp, Users, DollarSign, Database, Mail } from "lucide-react";

type ActionType = 'deal' | 'campaign' | 'partner' | 'customer' | 'cash' | 'data';

const ICONS: Record<ActionType, { Icon: React.ComponentType<{className?: string}>; color: string }> = {
  deal:     { Icon: TrendingUp,    color: 'text-blue-500' },
  campaign: { Icon: Mail,          color: 'text-purple-500' },
  partner:  { Icon: Users,         color: 'text-green-500' },
  customer: { Icon: AlertTriangle, color: 'text-amber-500' },
  cash:     { Icon: DollarSign,    color: 'text-red-500' },
  data:     { Icon: Database,      color: 'text-gray-500' },
};

const PRIORITY: Record<string, string> = {
  high:   'bg-red-100 text-red-700',
  medium: 'bg-amber-100 text-amber-700',
  low:    'bg-gray-100 text-gray-600',
};

export function ActionItem({
  type, priority, text, owner
}: {
  type: ActionType; priority: string; text: string; owner: string;
}) {
  const { Icon, color } = ICONS[type];
  return (
    <div className="flex items-start gap-3 py-3 border-b border-gray-50 last:border-0">
      <Icon className={`h-4 w-4 mt-0.5 flex-shrink-0 ${color}`} />
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-800">{text}</p>
        <p className="text-xs text-gray-400 mt-0.5">{owner}</p>
      </div>
      <span className={`text-xs rounded-full px-2 py-0.5 font-medium flex-shrink-0 ${PRIORITY[priority]}`}>
        {priority}
      </span>
    </div>
  );
}
