/**
 * Safe diagnostics endpoint.
 * Checks prerequisites step by step.
 * Never exposes secret values — only configured/missing/error status.
 */
import { NextRequest, NextResponse } from 'next/server';
import { ENV, getEnvStatus } from '@/lib/config/env';
import { createClient } from '@supabase/supabase-js';

function checkAuth(req: NextRequest) {
  const s = req.cookies.get('tap2_admin_session');
  return Boolean(s?.value && s.value.length >= 32);
}

const REQUIRED_TABLES = [
  'source_sync_runs',
  'source_data_profiles',
  'source_field_mappings',
  'raw_hubspot_deals',
  'raw_hubspot_companies',
  'raw_hubspot_contacts',
  'raw_hubspot_owners',
  'raw_hubspot_properties',
  'raw_stripe_customers',
  'raw_stripe_subscriptions',
  'raw_instantly_campaigns',
  'raw_fathom_meetings',
  'raw_google_calendar_events',
];

export async function GET(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({
      error_code: 'auth_required',
      message: 'Admin session cookie missing or invalid. Log in at /admin/login.',
    }, { status: 401 });
  }

  const results: Record<string, unknown> = {};

  // ── 1. ENV var presence ────────────────────────────────────────────────────
  const envStatus = getEnvStatus();
  results.env_vars = {
    SUPABASE_SERVICE_ROLE_KEY: envStatus.SUPABASE_SERVICE_ROLE_KEY,
    HUBSPOT_ACCESS_TOKEN:      envStatus.HUBSPOT_ACCESS_TOKEN,
    STRIPE_SECRET_KEY:         envStatus.STRIPE_SECRET_KEY,
    INSTANTLY_API_KEY:         envStatus.INSTANTLY_API_KEY,
    FATHOM_API_KEY:            envStatus.FATHOM_API_KEY,
    GOOGLE_CLIENT_ID:          envStatus.GOOGLE_CLIENT_ID,
    ANTHROPIC_API_KEY:         envStatus.ANTHROPIC_API_KEY,
    ADMIN_USERNAME:            envStatus.ADMIN_USERNAME,
    ADMIN_PASSWORD:            envStatus.ADMIN_PASSWORD,
  };

  // Also check which Vercel custom names resolved
  results.vercel_name_resolution = {
    stripe:    process.env.SS ? 'SS → resolved' : (process.env.STRIPE_SECRET_KEY ? 'STRIPE_SECRET_KEY → resolved' : 'not found'),
    hubspot:   process.env.Hubspot ? 'Hubspot → resolved' : (process.env.HUBSPOT_ACCESS_TOKEN ? 'HUBSPOT_ACCESS_TOKEN → resolved' : 'not found'),
    instantly: process.env.instantl ? 'instantl → resolved' : (process.env.instantly ? 'instantly → resolved' : (process.env.INSTANTLY_API_KEY ? 'INSTANTLY_API_KEY → resolved' : 'not found')),
    fathom:    process.env.Fathom ? 'Fathom → resolved' : (process.env.FATHOM_API_KEY ? 'FATHOM_API_KEY → resolved' : 'not found'),
    google_id: process.env.ClientIDgoogle ? 'ClientIDgoogle → resolved' : (process.env.GOOGLE_CLIENT_ID ? 'GOOGLE_CLIENT_ID → resolved' : 'not found'),
    anthropic: process.env.AnthropicClaudeKey ? 'AnthropicClaudeKey → resolved' : (process.env.ANTHROPIC_API_KEY ? 'ANTHROPIC_API_KEY → resolved' : 'not found'),
  };

  // ── 2. Supabase admin connection ───────────────────────────────────────────
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = ENV.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    results.supabase = {
      error_code: 'missing_env_var',
      message: !supabaseUrl ? 'NEXT_PUBLIC_SUPABASE_URL missing' : 'SUPABASE_SERVICE_ROLE_KEY missing',
    };
  } else {
    try {
      const sb = createClient(supabaseUrl, serviceKey, {
        auth: { persistSession: false, autoRefreshToken: false },
      });

      // Test read access (no writes in diagnostics)
      const { error: pingError } = await sb
        .from('source_sync_runs')
        .select('id')
        .limit(1);

      if (pingError) {
        const code = pingError.message?.includes('relation') || pingError.code === '42P01'
          ? 'missing_table'
          : pingError.message?.includes('permission') || pingError.code === '42501'
          ? 'rls_permission_denied'
          : 'supabase_error';
        results.supabase = {
          error_code: code,
          message: pingError.message,
          hint: code === 'missing_table'
            ? 'Run supabase/migrations/20260601000000_phase9_raw_sources.sql in Supabase SQL Editor'
            : code === 'rls_permission_denied'
            ? 'Service role key should bypass RLS — check the key is the service_role key, not anon key'
            : 'Unexpected Supabase error',
        };
      } else {
        results.supabase = { status: 'ok', message: 'source_sync_runs readable with service role' };
      }

      // ── 3. Table existence check ─────────────────────────────────────────
      const tableChecks: Record<string, string> = {};
      for (const table of REQUIRED_TABLES) {
        const { error: tErr } = await sb.from(table).select('id').limit(0);
        tableChecks[table] = tErr
          ? (tErr.code === '42P01' ? 'missing' : `error: ${tErr.code}`)
          : 'exists';
      }
      results.table_check = tableChecks;
      const missingTables = Object.entries(tableChecks).filter(([, v]) => v === 'missing').map(([k]) => k);
      results.missing_tables = missingTables;

    } catch (err) {
      results.supabase = {
        error_code: 'supabase_error',
        message: err instanceof Error ? err.message : 'Connection failed',
      };
    }
  }

  // ── 4. HubSpot lightweight ping (no writes, no data stored) ───────────────
  const hsToken = ENV.HUBSPOT_ACCESS_TOKEN;
  if (!hsToken) {
    results.hubspot_ping = { error_code: 'missing_env_var', message: 'HUBSPOT_ACCESS_TOKEN / Hubspot not configured' };
  } else {
    try {
      const res = await fetch('https://api.hubapi.com/crm/v3/owners?limit=1', {
        headers: { Authorization: `Bearer ${hsToken}` },
      });
      if (res.ok) {
        const data = await res.json() as Record<string, unknown>;
        results.hubspot_ping = {
          status: 'ok',
          message: `HubSpot API reachable. ${(data.results as unknown[])?.length ?? 0} owner(s) returned.`,
          http_status: res.status,
        };
      } else {
        const body = await res.json().catch(() => ({})) as Record<string, unknown>;
        const code = res.status === 401 ? 'invalid_api_key'
          : res.status === 403 ? 'insufficient_api_scope'
          : 'upstream_api_error';
        results.hubspot_ping = {
          error_code: code,
          http_status: res.status,
          message: code === 'invalid_api_key'
            ? 'HubSpot returned 401 — API token is invalid or expired. Check Hubspot env var.'
            : code === 'insufficient_api_scope'
            ? 'HubSpot returned 403 — token lacks required scopes (needs crm.objects.deals.read)'
            : `HubSpot returned ${res.status}`,
          hubspot_category: (body.category as string) ?? undefined,
        };
      }
    } catch (err) {
      results.hubspot_ping = {
        error_code: 'upstream_api_error',
        message: `Network error reaching HubSpot: ${err instanceof Error ? err.message : 'unknown'}`,
      };
    }
  }

  // ── 5. Auth cookie check ───────────────────────────────────────────────────
  const cookie = req.cookies.get('tap2_admin_session');
  results.auth = {
    cookie_present: Boolean(cookie?.value),
    cookie_length: cookie?.value?.length ?? 0,
    valid: Boolean(cookie?.value && cookie.value.length >= 32),
  };

  // ── Summary ────────────────────────────────────────────────────────────────
  const issues: string[] = [];
  if (envStatus.SUPABASE_SERVICE_ROLE_KEY === 'missing') issues.push('SUPABASE_SERVICE_ROLE_KEY missing');
  if (envStatus.HUBSPOT_ACCESS_TOKEN === 'missing') issues.push('HubSpot token missing');
  if ((results.supabase as Record<string, unknown>)?.error_code) issues.push(`Supabase: ${(results.supabase as Record<string, unknown>).error_code}`);
  if ((results.hubspot_ping as Record<string, unknown>)?.error_code) issues.push(`HubSpot: ${(results.hubspot_ping as Record<string, unknown>).error_code}`);
  if ((results.missing_tables as string[])?.length > 0) issues.push(`Missing tables: ${(results.missing_tables as string[]).join(', ')}`);

  results.summary = {
    ready_for_discovery: issues.length === 0,
    issue_count: issues.length,
    issues,
  };

  return NextResponse.json(results);
}
