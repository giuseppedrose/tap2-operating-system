"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  DollarSign,
  GitBranch,
  Users,
  Target,
  Mail,
  RefreshCw,
  Cpu,
  Calendar,
  Wallet,
  TrendingUp,
  BarChart2,
  Settings,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: '/',           label: 'Command Center',        icon: LayoutDashboard },
  { href: '/revenue',    label: 'Revenue Intelligence',  icon: DollarSign },
  { href: '/pipeline',   label: 'Sales Pipeline',        icon: GitBranch },
  { href: '/partners',   label: 'Partner Performance',   icon: Users },
  { href: '/gtm',        label: 'GTM Engine',            icon: Target },
  { href: '/campaigns',  label: 'Outbound Campaigns',    icon: Mail },
  { href: '/lifecycle',  label: 'Customer Lifecycle',    icon: RefreshCw },
  { href: '/product',    label: 'Product Usage',         icon: Cpu },
  { href: '/meetings',   label: 'Meetings & Objections', icon: Calendar },
  { href: '/cash',       label: 'Cash & Runway',         icon: Wallet },
  { href: '/forecast',   label: 'Forecasting',           icon: TrendingUp },
  { href: '/investor',   label: 'Investor View',         icon: BarChart2 },
  { href: '/admin',      label: 'Data Sources',          icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-30 flex w-60 flex-col" style={{ background: "var(--sidebar-bg)" }}>
      {/* Logo */}
      <div className="flex h-16 items-center gap-2.5 px-5 border-b border-white/10">
        <div
          className="flex h-8 w-8 items-center justify-center rounded-lg font-bold text-white text-sm"
          style={{ background: "#0358F1" }}
        >
          <Zap className="h-4 w-4" />
        </div>
        <div>
          <span className="text-sm font-bold text-white tracking-tight">Tap2</span>
          <span className="ml-1 text-xs font-medium" style={{ color: "var(--sidebar-muted)" }}>OS</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 scrollbar-hide">
        <ul className="space-y-0.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "text-white"
                      : "hover:bg-white/5"
                  )}
                  style={
                    isActive
                      ? { background: "var(--sidebar-active-bg)", color: "white" }
                      : { color: "var(--sidebar-muted)" }
                  }
                >
                  <Icon
                    className="h-4 w-4 flex-shrink-0"
                    style={{ color: isActive ? "#0358F1" : undefined }}
                  />
                  <span className="truncate">{item.label}</span>
                  {isActive && (
                    <span
                      className="ml-auto h-1.5 w-1.5 rounded-full flex-shrink-0"
                      style={{ background: "#0358F1" }}
                    />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-white/10">
        <div className="flex items-center gap-2.5 rounded-lg px-2 py-2">
          <div
            className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-white flex-shrink-0"
            style={{ background: "#0358F1" }}
          >
            G
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-white truncate">Giuseppe</p>
            <p className="text-xs truncate" style={{ color: "var(--sidebar-muted)" }}>tap2.ai</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
