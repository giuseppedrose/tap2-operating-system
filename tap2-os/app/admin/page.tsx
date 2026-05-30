"use client";

import { DataSourceBadge } from "@/components/shared/data-source-badge";
import { DATA_SOURCES } from "@/lib/mock-data/connected";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Database, Upload } from "lucide-react";

const TABLE_DESCRIPTIONS: Record<string, string> = {
  customers: 'Active clients and their subscription status',
  deals: 'Sales pipeline deals with stages',
  partners: 'Partner accounts and metrics',
  campaigns: 'Outbound email campaigns',
  cash_snapshots: 'Monthly cash and burn snapshots',
  product_metrics: 'Wallet installs, scans, redemptions',
  subscriptions: 'Stripe subscription records',
  campaign_leads: 'Leads from outbound campaigns',
  outbound_campaigns: 'Instantly AI campaign data',
  bank_transactions: 'Rabobank CSV imports',
  meetings: 'Google Calendar + Fathom meetings',
  call_insights: 'AI-extracted call insights',
};

export default function AdminPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-xl border border-blue-100 bg-blue-50 p-5">
        <h2 className="text-sm font-semibold text-blue-700">Phase 2 — Connected Mock Data Mode</h2>
        <p className="mt-1 text-sm text-gray-600">
          All dashboards are powered by the connected mock data layer (15 real customers as source of truth).
          Connect integrations below to stream live data into Tap2 OS.
          Each integration requires environment variables set in{' '}
          <code className="rounded bg-white px-1 py-0.5 text-xs font-mono border">.env.local</code>.
        </p>
      </div>

      {/* Integration Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {DATA_SOURCES.map((ds) => (
          <Card key={ds.id}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ background: '#e8effd', color: '#0358F1' }}>
                  <Database className="h-5 w-5" />
                </div>
                <DataSourceBadge status={ds.status} />
              </div>
              <CardTitle className="text-sm mt-3">{ds.name}</CardTitle>
              <CardDescription>
                {ds.status === 'connected'
                  ? `Connected · ${ds.records} records imported · Last sync ${ds.lastSync}`
                  : ds.status === 'csv'
                  ? 'Manual CSV import — no API required'
                  : 'Not yet connected — awaiting API credentials'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {ds.tables.length > 0 && (
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Tables / Data</p>
                    <div className="flex flex-wrap gap-1">
                      {ds.tables.map(t => (
                        <span key={t} className="text-xs bg-gray-50 border border-gray-200 rounded px-1.5 py-0.5 font-mono text-gray-600">
                          {t}
                        </span>
                      ))}
                    </div>
                    <div className="mt-1 space-y-0.5">
                      {ds.tables.slice(0, 2).map(t => TABLE_DESCRIPTIONS[t] ? (
                        <p key={t} className="text-xs text-gray-400">{t}: {TABLE_DESCRIPTIONS[t]}</p>
                      ) : null)}
                    </div>
                  </div>
                )}

                {ds.envVars.length > 0 && (
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Required Env Vars</p>
                    <div className="space-y-1">
                      {ds.envVars.map(v => (
                        <code key={v} className="text-xs font-mono rounded bg-gray-50 px-2 py-0.5 border border-gray-200 block truncate text-gray-700">
                          {v}
                        </code>
                      ))}
                    </div>
                  </div>
                )}

                <div className="rounded-lg bg-gray-50 p-2">
                  <p className="text-xs text-gray-500">
                    {ds.id === 'supabase'
                      ? 'Service role key never exposed client-side. Use server routes only.'
                      : ds.id === 'stripe'
                      ? 'Secret key stays server-side. Webhook validation required.'
                      : ds.status === 'csv'
                      ? 'CSV files processed server-side. Raw data never stored in browser.'
                      : 'API key stored in .env.local only. Never committed to git.'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* CSV Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle>CSV Import</CardTitle>
          <CardDescription>Upload bank transaction CSV files from Rabobank</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-xl border-2 border-dashed border-gray-200 p-8 text-center">
            <Upload className="h-8 w-8 text-gray-300 mx-auto mb-3" />
            <p className="text-sm font-medium text-gray-500">Drop Rabobank CSV here</p>
            <p className="text-xs text-gray-400 mt-1">or click to browse — supports MT940 and CSV export formats</p>
            <button className="mt-3 rounded-lg px-4 py-2 text-xs font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors">
              Choose File
            </button>
          </div>
        </CardContent>
      </Card>

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
              "integrations", "sync_logs", "users", "settings",
              "customer_lifecycle_events", "objections", "sales_activities",
              "data_source_status", "investor_metrics_snapshots",
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
STRIPE_WEBHOOK_SECRET=whsec_...

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
