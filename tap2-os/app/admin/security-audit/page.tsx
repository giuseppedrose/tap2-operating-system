// Server component — no "use client" needed here
// This page is admin-protected by proxy.ts

const ROUTES = [
  { path: "/investor",              access: "public",    risk: "low",    dataExposed: "Aggregated seed metrics only — no client names, no real financials, no API details", status: "✓ Safe",   action: "Keep public — investor-safe by design" },
  { path: "/admin/login",           access: "public",    risk: "low",    dataExposed: "Login form only", status: "✓ Safe",   action: "None" },
  { path: "/",                      access: "protected", risk: "medium", dataExposed: "MRR, pipeline, runway (seed), action queue with company names", status: "✓ Fixed",  action: "Protected by proxy.ts — requires admin session" },
  { path: "/revenue",               access: "protected", risk: "high",   dataExposed: "Customer names, MRR per client, churn data, revenue by market", status: "✓ Fixed",  action: "Protected by proxy.ts — requires admin session" },
  { path: "/pipeline",              access: "protected", risk: "high",   dataExposed: "All deal names, companies, owners, stage, expected MRR, quality scores", status: "✓ Fixed",  action: "Protected by proxy.ts — requires admin session" },
  { path: "/partners",              access: "protected", risk: "high",   dataExposed: "Partner names, performance grades, deal counts, revenue attribution", status: "✓ Fixed",  action: "Protected by proxy.ts — requires admin session" },
  { path: "/gtm",                   access: "protected", risk: "medium", dataExposed: "GTM channel strategy, close rates, source performance data", status: "✓ Fixed",  action: "Protected by proxy.ts — requires admin session" },
  { path: "/campaigns",             access: "protected", risk: "medium", dataExposed: "Campaign names, email volumes, reply rates, market strategy", status: "✓ Fixed",  action: "Protected by proxy.ts — requires admin session" },
  { path: "/lifecycle",             access: "protected", risk: "medium", dataExposed: "Conversion funnel data, stage counts, source performance", status: "✓ Fixed",  action: "Protected by proxy.ts — requires admin session" },
  { path: "/product",               access: "protected", risk: "medium", dataExposed: "Wallet installs, scan rates, product usage data", status: "✓ Fixed",  action: "Protected by proxy.ts — requires admin session" },
  { path: "/meetings",              access: "protected", risk: "high",   dataExposed: "Meeting notes, objections, company names, deal progress", status: "✓ Fixed",  action: "Protected by proxy.ts — requires admin session" },
  { path: "/cash",                  access: "protected", risk: "critical", dataExposed: "Bank balance, burn rate, runway, transaction categories", status: "✓ Fixed",  action: "Protected by proxy.ts — requires admin session" },
  { path: "/forecast",              access: "protected", risk: "high",   dataExposed: "Growth scenarios, runway projections, funding gap analysis", status: "✓ Fixed",  action: "Protected by proxy.ts — requires admin session" },
  { path: "/board",                 access: "protected", risk: "high",   dataExposed: "Executive summary of all operational metrics", status: "✓ Fixed",  action: "Protected by proxy.ts — requires admin session" },
  { path: "/admin",                 access: "protected", risk: "critical", dataExposed: "Integration status, env var presence, schema, sync controls", status: "✓ Protected", action: "Admin session required since Phase 5" },
  { path: "/admin/data-discovery",  access: "protected", risk: "critical", dataExposed: "Raw API field mappings, discovery profiles, HubSpot property structure", status: "✓ Protected", action: "Admin session required" },
  { path: "/admin/restructure-plan",access: "protected", risk: "high",   dataExposed: "Integration plan details, HubSpot custom property names", status: "✓ Protected", action: "Admin session required" },
  { path: "/admin/security-audit",  access: "protected", risk: "medium", dataExposed: "This page — security configuration overview", status: "✓ Protected", action: "Admin session required" },
];

const API_ROUTES = [
  { path: "/api/admin/auth",                   method: "POST", auth: "none (login endpoint)", secret: "ADMIN_USERNAME, ADMIN_PASSWORD", writesDB: true,  risk: "low",      issue: "None — checks credentials, sets httpOnly cookie" },
  { path: "/api/admin/logout",                 method: "POST", auth: "none (clears cookie)", secret: "none",                            writesDB: false, risk: "low",      issue: "None" },
  { path: "/api/admin/integration-status",     method: "GET",  auth: "none",                  secret: "all API keys (presence only)",   writesDB: false, risk: "medium",   issue: "⚠ Currently unauthenticated — returns configured/missing status. Not critical as values are not exposed, but should be admin-only" },
  { path: "/api/admin/discovery/stripe",       method: "POST", auth: "admin cookie",          secret: "STRIPE_SECRET_KEY",              writesDB: true,  risk: "critical", issue: "✓ Protected — checkAuth() validates cookie before using key" },
  { path: "/api/admin/discovery/hubspot",      method: "POST", auth: "admin cookie",          secret: "HUBSPOT_ACCESS_TOKEN",           writesDB: true,  risk: "critical", issue: "✓ Protected — checkAuth() validates cookie before using key" },
  { path: "/api/admin/discovery/instantly",    method: "POST", auth: "admin cookie",          secret: "INSTANTLY_API_KEY",              writesDB: true,  risk: "critical", issue: "✓ Protected — checkAuth() validates cookie before using key" },
  { path: "/api/admin/discovery/fathom",       method: "POST", auth: "admin cookie",          secret: "FATHOM_API_KEY",                 writesDB: true,  risk: "critical", issue: "✓ Protected — checkAuth() validates cookie before using key" },
  { path: "/api/admin/discovery/calendar",     method: "GET",  auth: "admin cookie",          secret: "GOOGLE_CLIENT_ID/SECRET",        writesDB: false, risk: "medium",   issue: "✓ Protected — returns setup instructions only, no OAuth flow yet" },
];

const ENV_VARS = [
  { name: "NEXT_PUBLIC_SUPABASE_URL",    location: "client + server", exposure: "safe",     note: "Intentionally public — anon key is scoped" },
  { name: "NEXT_PUBLIC_SUPABASE_ANON_KEY", location: "client + server", exposure: "safe",   note: "Intentionally public — RLS limits what anon can read" },
  { name: "ADMIN_USERNAME",             location: "server only",       exposure: "safe",     note: "Used only in /api/admin/auth — never logged or returned" },
  { name: "ADMIN_PASSWORD",             location: "server only",       exposure: "safe",     note: "Used only in /api/admin/auth — never logged or returned" },
  { name: "SUPABASE_SERVICE_ROLE_KEY",  location: "server only",       exposure: "safe",     note: "Used only in lib/integrations/supabase-admin.ts — API routes only" },
  { name: "STRIPE_SECRET_KEY",          location: "server only",       exposure: "safe",     note: "Used only in /api/admin/discovery/stripe — admin-protected route" },
  { name: "STRIPE_WEBHOOK_SECRET",      location: "server only",       exposure: "safe",     note: "Not yet used — prepared for webhook verification" },
  { name: "HUBSPOT_ACCESS_TOKEN",       location: "server only",       exposure: "safe",     note: "Used only in /api/admin/discovery/hubspot — admin-protected route" },
  { name: "INSTANTLY_API_KEY",          location: "server only",       exposure: "safe",     note: "Used only in /api/admin/discovery/instantly — admin-protected route" },
  { name: "FATHOM_API_KEY",             location: "server only",       exposure: "safe",     note: "Used only in /api/admin/discovery/fathom — admin-protected route" },
  { name: "GOOGLE_CLIENT_ID",           location: "server only",       exposure: "safe",     note: "Used in /api/admin/discovery/calendar — admin-protected route" },
  { name: "GOOGLE_CLIENT_SECRET",       location: "server only",       exposure: "safe",     note: "Used in /api/admin/discovery/calendar — admin-protected route" },
  { name: "ANTHROPIC_API_KEY",          location: "server only",       exposure: "safe",     note: "Not yet used in any route" },
];

const SUPABASE_TABLES = [
  { table: "customers",                  sensitivity: "high",     rls: "recommended", note: "Contains client company names, MRR, partner attribution" },
  { table: "deals",                      sensitivity: "high",     rls: "recommended", note: "Contains pipeline details, deal values, stage, owner" },
  { table: "subscriptions",             sensitivity: "high",     rls: "recommended", note: "Contains Stripe subscription data and MRR" },
  { table: "bank_transactions",         sensitivity: "critical", rls: "required",    note: "Financial transaction data — must never be publicly readable" },
  { table: "cash_snapshots",            sensitivity: "critical", rls: "required",    note: "Cash balance and runway data" },
  { table: "meetings",                  sensitivity: "high",     rls: "recommended", note: "Meeting notes, attendees, deal context" },
  { table: "objections",                sensitivity: "high",     rls: "recommended", note: "Sales objection data — internal only" },
  { table: "raw_stripe_*",             sensitivity: "critical", rls: "required",    note: "Raw Stripe API payloads — must never be publicly readable" },
  { table: "raw_hubspot_*",            sensitivity: "critical", rls: "required",    note: "Raw HubSpot CRM data — must never be publicly readable" },
  { table: "raw_instantly_*",          sensitivity: "high",     rls: "required",    note: "Raw campaign data" },
  { table: "raw_fathom_*",             sensitivity: "critical", rls: "required",    note: "Meeting transcripts/summaries — private by nature" },
  { table: "raw_google_calendar_*",    sensitivity: "high",     rls: "required",    note: "Calendar event data" },
  { table: "source_sync_runs",         sensitivity: "medium",   rls: "recommended", note: "Sync metadata — reveals integration structure" },
  { table: "source_data_profiles",     sensitivity: "medium",   rls: "recommended", note: "API field analysis — internal only" },
  { table: "partners",                 sensitivity: "medium",   rls: "recommended", note: "Partner roster" },
  { table: "investor_metrics_snapshots", sensitivity: "high",   rls: "required",    note: "Investor-facing metrics snapshots" },
  { table: "gtm_sources",              sensitivity: "low",      rls: "optional",    note: "GTM source reference data" },
];

const ISSUES_FOUND = [
  { severity: "critical", issue: "ALL operational dashboards were publicly accessible",                         status: "FIXED",   fix: "proxy.ts now requires admin session for /, /revenue, /pipeline, /partners, /gtm, /campaigns, /lifecycle, /product, /meetings, /cash, /forecast, /board" },
  { severity: "high",     issue: "Instantly client was appending API key as URL query parameter",               status: "FIXED",   fix: "Changed to Authorization header in lib/integrations/instantly/client.ts" },
  { severity: "medium",   issue: ".env.example contained fake-looking key formats (sk_live_..., whsec_...)",   status: "FIXED",   fix: "Replaced with clearly non-secret placeholders in .env.example" },
  { severity: "medium",   issue: "HubSpot/Fathom/Instantly error handlers returned raw API response text",     status: "FIXED",   fix: "Errors now return safe status codes only" },
  { severity: "medium",   issue: "/api/admin/integration-status is unauthenticated",                           status: "OPEN",    fix: "Returns configured/missing only (no values). Low priority — add auth in next pass" },
  { severity: "medium",   issue: "Supabase RLS not confirmed enabled on sensitive tables",                     status: "OPEN",    fix: "Run RLS migration in Supabase SQL editor — migration file needed" },
  { severity: "low",      issue: "No Supabase RLS migration generated yet",                                    status: "OPEN",    fix: "Recommended: generate and apply RLS policy migration before real data sync" },
];

const RISK_COLOR: Record<string, string> = {
  critical: "text-red-700 bg-red-50 border-red-200",
  high:     "text-orange-700 bg-orange-50 border-orange-200",
  medium:   "text-amber-700 bg-amber-50 border-amber-200",
  low:      "text-gray-600 bg-gray-50 border-gray-200",
};

const STATUS_COLOR: Record<string, string> = {
  FIXED:     "text-emerald-700 bg-emerald-50 border-emerald-200",
  OPEN:      "text-amber-700 bg-amber-50 border-amber-200",
  PROTECTED: "text-blue-700 bg-blue-50 border-blue-200",
  SAFE:      "text-gray-600 bg-gray-50 border-gray-100",
};

export default function SecurityAuditPage() {
  const criticalOpen = ISSUES_FOUND.filter(i => i.severity === "critical" && i.status !== "FIXED").length;
  const totalFixed = ISSUES_FOUND.filter(i => i.status === "FIXED").length;
  const totalOpen = ISSUES_FOUND.filter(i => i.status === "OPEN").length;

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Status overview */}
      <div className={`rounded-xl border px-5 py-4 ${criticalOpen > 0 ? "border-red-200 bg-red-50" : "border-emerald-200 bg-emerald-50"}`}>
        <p className={`text-sm font-semibold ${criticalOpen > 0 ? "text-red-800" : "text-emerald-800"}`}>
          {criticalOpen > 0
            ? `⚠ ${criticalOpen} critical issue${criticalOpen > 1 ? "s" : ""} still open`
            : "✓ All critical issues resolved"
          }
        </p>
        <p className={`text-xs mt-1 ${criticalOpen > 0 ? "text-red-700" : "text-emerald-700"}`}>
          {totalFixed} fixed · {totalOpen} open (medium or lower) · Last audit: Phase 10
        </p>
      </div>

      {/* Issues matrix */}
      <section>
        <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-gray-400 mb-3">Issues Found & Fixed</p>
        <div className="border border-gray-200 bg-white overflow-hidden">
          <table className="board-table">
            <thead><tr>
              <th className="text-left">Severity</th>
              <th className="text-left">Issue</th>
              <th className="text-left">Status</th>
              <th className="text-left">Fix Applied</th>
            </tr></thead>
            <tbody>
              {ISSUES_FOUND.map((issue, i) => (
                <tr key={i}>
                  <td><span className={`text-[10px] font-bold border rounded px-1.5 py-0.5 ${RISK_COLOR[issue.severity]}`}>{issue.severity.toUpperCase()}</span></td>
                  <td className="text-left text-xs text-gray-800">{issue.issue}</td>
                  <td><span className={`text-[10px] font-bold border rounded px-1.5 py-0.5 ${STATUS_COLOR[issue.status]}`}>{issue.status}</span></td>
                  <td className="text-left text-xs text-gray-500">{issue.fix}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Route exposure matrix */}
      <section>
        <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-gray-400 mb-3">Route Exposure Matrix</p>
        <div className="border border-gray-200 bg-white overflow-x-auto">
          <table className="board-table min-w-[700px]">
            <thead><tr>
              <th className="text-left">Route</th>
              <th className="text-left">Access Level</th>
              <th className="text-left">Risk</th>
              <th className="text-left">Data Exposed</th>
              <th className="text-left">Status</th>
            </tr></thead>
            <tbody>
              {ROUTES.map(r => (
                <tr key={r.path}>
                  <td className="text-left font-mono text-[11px]">{r.path}</td>
                  <td className="text-left"><span className={`text-[10px] font-semibold border rounded px-1.5 py-0.5 ${r.access === "public" ? "bg-blue-50 text-blue-700 border-blue-200" : "bg-gray-50 text-gray-600 border-gray-200"}`}>{r.access}</span></td>
                  <td><span className={`text-[10px] font-bold border rounded px-1.5 py-0.5 ${RISK_COLOR[r.risk]}`}>{r.risk}</span></td>
                  <td className="text-left text-[11px] text-gray-600 max-w-[280px]">{r.dataExposed}</td>
                  <td className="text-left text-[11px] text-emerald-700 font-medium">{r.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* API route security */}
      <section>
        <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-gray-400 mb-3">API Route Security Matrix</p>
        <div className="border border-gray-200 bg-white overflow-x-auto">
          <table className="board-table min-w-[800px]">
            <thead><tr>
              <th className="text-left">Route</th>
              <th className="text-left">Auth</th>
              <th className="text-left">Secret Used</th>
              <th>Writes DB</th>
              <th className="text-left">Risk</th>
              <th className="text-left">Status</th>
            </tr></thead>
            <tbody>
              {API_ROUTES.map(r => (
                <tr key={r.path}>
                  <td className="text-left font-mono text-[11px]">{r.path}</td>
                  <td className="text-left text-[11px] text-gray-600">{r.auth}</td>
                  <td className="text-left font-mono text-[10px] text-gray-500">{r.secret}</td>
                  <td className="text-center">{r.writesDB ? "✓" : "—"}</td>
                  <td><span className={`text-[10px] font-bold border rounded px-1.5 py-0.5 ${RISK_COLOR[r.risk]}`}>{r.risk}</span></td>
                  <td className="text-left text-[11px] text-gray-600">{r.issue}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Env var safety */}
      <section>
        <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-gray-400 mb-3">Environment Variable Safety</p>
        <div className="border border-gray-200 bg-white overflow-hidden">
          <table className="board-table">
            <thead><tr>
              <th className="text-left">Variable</th>
              <th className="text-left">Location</th>
              <th className="text-left">Exposure</th>
              <th className="text-left">Notes</th>
            </tr></thead>
            <tbody>
              {ENV_VARS.map(v => (
                <tr key={v.name}>
                  <td className="text-left font-mono text-[11px]">{v.name}</td>
                  <td className="text-left text-[11px] text-gray-600">{v.location}</td>
                  <td><span className={`text-[10px] font-bold border rounded px-1.5 py-0.5 ${v.exposure === "safe" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-red-50 text-red-700 border-red-200"}`}>{v.exposure}</span></td>
                  <td className="text-left text-[11px] text-gray-500">{v.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Supabase table sensitivity */}
      <section>
        <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-gray-400 mb-3">Supabase Table Sensitivity Matrix</p>
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 mb-3">
          <p className="text-xs font-semibold text-amber-800">Action Required: Enable Row Level Security</p>
          <p className="text-xs text-amber-700 mt-1">
            All sensitive tables below should have RLS enabled in Supabase before any real data is synced.
            Go to Supabase Dashboard → Authentication → Policies → enable RLS on each table.
            The anon key should have read access to zero sensitive tables.
          </p>
        </div>
        <div className="border border-gray-200 bg-white overflow-hidden">
          <table className="board-table">
            <thead><tr>
              <th className="text-left">Table</th>
              <th className="text-left">Sensitivity</th>
              <th className="text-left">RLS Status</th>
              <th className="text-left">Notes</th>
            </tr></thead>
            <tbody>
              {SUPABASE_TABLES.map(t => (
                <tr key={t.table}>
                  <td className="text-left font-mono text-[11px]">{t.table}</td>
                  <td><span className={`text-[10px] font-bold border rounded px-1.5 py-0.5 ${RISK_COLOR[t.sensitivity]}`}>{t.sensitivity}</span></td>
                  <td className="text-left"><span className={`text-[10px] font-semibold border rounded px-1.5 py-0.5 ${t.rls === "required" ? "bg-red-50 text-red-700 border-red-200" : t.rls === "recommended" ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-gray-50 text-gray-500 border-gray-200"}`}>{t.rls}</span></td>
                  <td className="text-left text-[11px] text-gray-500">{t.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Remaining risks */}
      <section>
        <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-gray-400 mb-3">Remaining Risks — Action Required</p>
        <div className="space-y-2">
          {[
            { risk: "Supabase RLS not verified", action: "Enable RLS on all sensitive tables in Supabase Dashboard before syncing real data. Block anon key from reading customers, deals, bank_transactions, raw_* tables.", priority: "critical" },
            { risk: "/api/admin/integration-status is unauthenticated", action: "Returns only configured/missing status — no values exposed. Add admin cookie check in next pass if you want it fully locked down.", priority: "medium" },
            { risk: "No data room implemented yet", action: "If investor data room is added, ensure all files go through private Supabase Storage with server-side signed URLs only.", priority: "future" },
            { risk: "ADMIN_USERNAME + ADMIN_PASSWORD must be set in Vercel", action: "Add these two env vars in Vercel → Settings → Environment Variables. Without them, /admin/login will return 503 and all protected routes will be inaccessible.", priority: "critical" },
          ].map((r, i) => (
            <div key={i} className={`flex items-start gap-3 rounded-lg border px-4 py-3 ${RISK_COLOR[r.priority]}`}>
              <span className={`text-[10px] font-bold border rounded px-1.5 py-0.5 flex-shrink-0 ${RISK_COLOR[r.priority]}`}>{r.priority.toUpperCase()}</span>
              <div>
                <p className="text-xs font-semibold text-gray-900">{r.risk}</p>
                <p className="text-xs text-gray-600 mt-0.5">{r.action}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
