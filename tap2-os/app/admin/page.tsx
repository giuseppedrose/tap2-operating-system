"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CreditCard,
  Users,
  Mail,
  Building,
  Calendar,
  BarChart3,
  Inbox,
  Database,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
} from "lucide-react";

const BLUE = "#0358F1";

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  status: "connected" | "not_configured" | "error";
  lastSync?: string;
  dataPoints?: string;
  envVar: string;
}

const integrations: Integration[] = [
  {
    id: "stripe",
    name: "Stripe",
    description: "Revenue, subscriptions, and payment data",
    icon: <CreditCard className="h-5 w-5" />,
    status: "not_configured",
    envVar: "STRIPE_SECRET_KEY",
    dataPoints: "MRR, Invoices, Customers",
  },
  {
    id: "hubspot",
    name: "HubSpot",
    description: "CRM deals, contacts, and pipeline data",
    icon: <Users className="h-5 w-5" />,
    status: "not_configured",
    envVar: "HUBSPOT_ACCESS_TOKEN",
    dataPoints: "Deals, Contacts, Pipeline",
  },
  {
    id: "instantly",
    name: "Instantly.ai",
    description: "Outbound email campaign metrics",
    icon: <Mail className="h-5 w-5" />,
    status: "not_configured",
    envVar: "INSTANTLY_API_KEY",
    dataPoints: "Campaigns, Open/Reply Rates",
  },
  {
    id: "rabobank",
    name: "Rabobank",
    description: "Bank account balance and transactions",
    icon: <Building className="h-5 w-5" />,
    status: "not_configured",
    envVar: "RABOBANK_API_KEY",
    dataPoints: "Balance, Transactions",
  },
  {
    id: "google-calendar",
    name: "Google Calendar",
    description: "Meeting and demo scheduling data",
    icon: <Calendar className="h-5 w-5" />,
    status: "not_configured",
    envVar: "GOOGLE_CLIENT_ID",
    dataPoints: "Meetings, Demos, Follow-ups",
  },
  {
    id: "fathom",
    name: "Fathom",
    description: "Meeting transcripts and summaries",
    icon: <BarChart3 className="h-5 w-5" />,
    status: "not_configured",
    envVar: "FATHOM_API_KEY",
    dataPoints: "Transcripts, Action Items",
  },
  {
    id: "gmail",
    name: "Gmail",
    description: "Email communication tracking",
    icon: <Inbox className="h-5 w-5" />,
    status: "not_configured",
    envVar: "GOOGLE_CLIENT_ID",
    dataPoints: "Threads, Labels, Attachments",
  },
  {
    id: "supabase",
    name: "Supabase",
    description: "Database for storing all Tap2 OS data",
    icon: <Database className="h-5 w-5" />,
    status: "not_configured",
    envVar: "NEXT_PUBLIC_SUPABASE_URL",
    dataPoints: "All tables: clients, deals, campaigns…",
  },
];

function StatusIcon({ status }: { status: Integration["status"] }) {
  if (status === "connected") return <CheckCircle className="h-4 w-4 text-green-500" />;
  if (status === "error") return <XCircle className="h-4 w-4 text-red-500" />;
  return <Clock className="h-4 w-4 text-gray-400" />;
}

function StatusBadgeLocal({ status }: { status: Integration["status"] }) {
  if (status === "connected") return <Badge variant="success">Connected</Badge>;
  if (status === "error") return <Badge variant="danger">Error</Badge>;
  return <Badge variant="neutral">Not Configured</Badge>;
}

export default function AdminPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-xl border border-blue-100 bg-blue-50 p-5">
        <h2 className="text-sm font-semibold" style={{ color: BLUE }}>Phase 1 — Mock Data Mode</h2>
        <p className="mt-1 text-sm text-gray-600">
          All dashboards are currently powered by mock data. Connect integrations below to stream live data into Tap2 OS.
          Each integration requires environment variables set in <code className="rounded bg-white px-1 py-0.5 text-xs font-mono border">.env.local</code>.
        </p>
      </div>

      {/* Integration Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {integrations.map((integration) => (
          <Card key={integration.id}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-lg"
                  style={{ background: "#e8effd", color: BLUE }}
                >
                  {integration.icon}
                </div>
                <StatusBadgeLocal status={integration.status} />
              </div>
              <CardTitle className="text-sm mt-3">{integration.name}</CardTitle>
              <CardDescription>{integration.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-400 mb-1">Data Points</p>
                  <p className="text-xs text-gray-600">{integration.dataPoints}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Required Env Var</p>
                  <code className="text-xs font-mono rounded bg-gray-50 px-2 py-1 border border-gray-200 block truncate">
                    {integration.envVar}
                  </code>
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <StatusIcon status={integration.status} />
                  <span className="text-xs text-gray-500">
                    {integration.status === "connected"
                      ? `Last sync: ${integration.lastSync}`
                      : "Awaiting configuration"}
                  </span>
                </div>
                <Button
                  variant={integration.status === "connected" ? "outline" : "default"}
                  size="sm"
                  className="w-full"
                  disabled={integration.status !== "connected"}
                >
                  {integration.status === "connected" ? (
                    <>
                      <RefreshCw className="h-3.5 w-3.5" />
                      Sync Now
                    </>
                  ) : (
                    "Configure"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Database Schema */}
      <Card>
        <CardHeader>
          <CardTitle>Database Schema</CardTitle>
          <CardDescription>Supabase tables for Tap2 OS — run schema.sql to initialize</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
            {[
              "clients", "deals", "partners", "gtm_channels", "campaigns",
              "campaign_sends", "transactions", "product_metrics", "wallet_installs",
              "integrations", "sync_logs", "users", "settings"
            ].map((table) => (
              <div key={table} className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
                <Database className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                <span className="text-xs font-mono text-gray-700 truncate">{table}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Environment Variables Reference */}
      <Card>
        <CardHeader>
          <CardTitle>Environment Variables</CardTitle>
          <CardDescription>Copy this to your .env.local and fill in your credentials</CardDescription>
        </CardHeader>
        <CardContent>
          <pre className="text-xs font-mono bg-gray-900 text-green-400 rounded-xl p-4 overflow-x-auto leading-relaxed">
{`NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

STRIPE_SECRET_KEY=sk_live_...
HUBSPOT_ACCESS_TOKEN=pat-...
INSTANTLY_API_KEY=...

GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...

FATHOM_API_KEY=...
ANTHROPIC_API_KEY=sk-ant-...`}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}
