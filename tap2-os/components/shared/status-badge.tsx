import { Badge } from "@/components/ui/badge";

interface StatusBadgeProps {
  status: string;
  className?: string;
}

const statusMap: Record<string, { label: string; variant: "default" | "success" | "warning" | "danger" | "neutral" }> = {
  // Client statuses
  active: { label: "Active", variant: "success" },
  churned: { label: "Churned", variant: "danger" },
  trial: { label: "Trial", variant: "warning" },
  // Deal stages
  lead: { label: "Lead", variant: "neutral" },
  contacted: { label: "Contacted", variant: "neutral" },
  "meeting booked": { label: "Meeting Booked", variant: "warning" },
  "demo completed": { label: "Demo Completed", variant: "warning" },
  "proposal sent": { label: "Proposal Sent", variant: "default" },
  "trial started": { label: "Trial Started", variant: "default" },
  negotiation: { label: "Negotiation", variant: "default" },
  "closed won": { label: "Closed Won", variant: "success" },
  "closed lost": { label: "Closed Lost", variant: "danger" },
  // Campaign statuses (active already defined above)
  paused: { label: "Paused", variant: "warning" },
  completed: { label: "Completed", variant: "neutral" },
  // Transaction categories
  revenue: { label: "Revenue", variant: "success" },
  expense: { label: "Expense", variant: "danger" },
  transfer: { label: "Transfer", variant: "neutral" },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const key = status.toLowerCase();
  const config = statusMap[key] ?? { label: status, variant: "neutral" as const };
  return (
    <Badge variant={config.variant} className={className}>
      {config.label}
    </Badge>
  );
}
