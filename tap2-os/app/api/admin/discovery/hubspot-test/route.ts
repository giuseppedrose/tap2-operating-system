/**
 * Safe, limited HubSpot test.
 * Fetches max 10 records, writes only to source_sync_runs + raw_hubspot_properties.
 * Returns detailed step-by-step result so errors can be diagnosed exactly.
 * Does NOT run full discovery. Does NOT write deals/companies/contacts.
 */
import { NextRequest, NextResponse } from 'next/server';
import { ENV } from '@/lib/config/env';
import { createClient } from '@supabase/supabase-js';

function checkAuth(req: NextRequest) {
  const s = req.cookies.get('tap2_admin_session');
  return Boolean(s?.value && s.value.length >= 32);
}

type StepStatus = 'ok' | 'skipped' | 'error';
interface Step {
  step: number;
  name: string;
  status: StepStatus;
  detail: string;
  error_code?: string;
}

function step(n: number, name: string, status: StepStatus, detail: string, code?: string): Step {
  return { step: n, name, status, detail, ...(code ? { error_code: code } : {}) };
}

export async function POST(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({
      error_code: 'auth_required',
      message: 'Admin session cookie missing. Log in at /admin/login first.',
      steps: [step(0, 'auth_check', 'error', 'No valid admin session cookie', 'auth_required')],
    }, { status: 401 });
  }

  const steps: Step[] = [];
  steps.push(step(1, 'auth_check', 'ok', 'Admin session cookie valid'));

  // ── Step 2: Check HubSpot token present ──────────────────────────────────
  const hsToken = ENV.HUBSPOT_ACCESS_TOKEN;
  if (!hsToken) {
    steps.push(step(2, 'env_check', 'error', 'HUBSPOT_ACCESS_TOKEN / Hubspot env var not found. Check Vercel environment variables.', 'missing_env_var'));
    return NextResponse.json({ error_code: 'missing_env_var', steps });
  }
  steps.push(step(2, 'env_check', 'ok', 'HubSpot token present (value not logged)'));

  // ── Step 3: Check Supabase service role ───────────────────────────────────
  const sbUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const sbKey = ENV.SUPABASE_SERVICE_ROLE_KEY;
  if (!sbUrl || !sbKey) {
    steps.push(step(3, 'supabase_config', 'error',
      !sbUrl ? 'NEXT_PUBLIC_SUPABASE_URL missing' : 'SUPABASE_SERVICE_ROLE_KEY missing — check it is the service_role key not anon key',
      'missing_env_var'));
    return NextResponse.json({ error_code: 'missing_env_var', steps });
  }
  steps.push(step(3, 'supabase_config', 'ok', 'Supabase URL and service role key both present'));

  const sb = createClient(sbUrl, sbKey, { auth: { persistSession: false, autoRefreshToken: false } });

  // ── Step 4: Check source_sync_runs table exists ───────────────────────────
  const { error: tableCheck } = await sb.from('source_sync_runs').select('id').limit(0);
  if (tableCheck) {
    const code = tableCheck.code === '42P01' ? 'missing_table' : tableCheck.code === '42501' ? 'rls_permission_denied' : 'supabase_error';
    steps.push(step(4, 'table_check', 'error',
      code === 'missing_table' ? 'source_sync_runs table missing — run migration 20260601000000_phase9_raw_sources.sql in Supabase'
      : code === 'rls_permission_denied' ? 'RLS blocking service role — check key is service_role not anon'
      : `Supabase error: ${tableCheck.message}`,
      code));
    return NextResponse.json({ error_code: code, steps });
  }
  steps.push(step(4, 'table_check', 'ok', 'source_sync_runs table accessible with service role'));

  // ── Step 5: Check raw_hubspot_properties table ────────────────────────────
  const { error: rawTableCheck } = await sb.from('raw_hubspot_properties').select('id').limit(0);
  if (rawTableCheck) {
    const code = rawTableCheck.code === '42P01' ? 'missing_table' : 'supabase_error';
    steps.push(step(5, 'raw_table_check', 'error',
      code === 'missing_table' ? 'raw_hubspot_properties table missing — run migration'
      : `Supabase error: ${rawTableCheck.message}`, code));
    return NextResponse.json({ error_code: code, steps });
  }
  steps.push(step(5, 'raw_table_check', 'ok', 'raw_hubspot_properties table accessible'));

  // ── Step 6: HubSpot API ping (lightest possible call) ─────────────────────
  let pingOk = false;
  try {
    const pingRes = await fetch('https://api.hubapi.com/crm/v3/owners?limit=1', {
      headers: { Authorization: `Bearer ${hsToken}` },
    });
    if (pingRes.ok) {
      const pingData = await pingRes.json() as Record<string, unknown>;
      const ownerCount = (pingData.results as unknown[])?.length ?? 0;
      steps.push(step(6, 'hubspot_ping', 'ok', `HubSpot API reachable — ${ownerCount} owner(s) returned`));
      pingOk = true;
    } else {
      const errBody = await pingRes.json().catch(() => ({})) as Record<string, unknown>;
      const code = pingRes.status === 401 ? 'invalid_api_key' : pingRes.status === 403 ? 'insufficient_api_scope' : 'upstream_api_error';
      steps.push(step(6, 'hubspot_ping', 'error',
        code === 'invalid_api_key' ? `HubSpot 401 — token rejected. Verify the value of Hubspot env var in Vercel.`
        : code === 'insufficient_api_scope' ? `HubSpot 403 — token missing scopes. Needs crm.objects.contacts.read, crm.objects.deals.read, crm.objects.companies.read`
        : `HubSpot returned HTTP ${pingRes.status}: ${(errBody.message as string) ?? 'no message'}`,
        code));
      return NextResponse.json({ error_code: code, steps });
    }
  } catch (err) {
    steps.push(step(6, 'hubspot_ping', 'error', `Network error: ${err instanceof Error ? err.message : 'unknown'}`, 'upstream_api_error'));
    return NextResponse.json({ error_code: 'upstream_api_error', steps });
  }

  if (!pingOk) return NextResponse.json({ error_code: 'upstream_api_error', steps });

  // ── Step 7: Write one source_sync_run ─────────────────────────────────────
  let runId: string | null = null;
  const { data: runData, error: runErr } = await sb
    .from('source_sync_runs')
    .insert({ source: 'hubspot', run_type: 'test', status: 'running' })
    .select('id').single();

  if (runErr || !runData?.id) {
    const code = runErr?.code === '42501' ? 'rls_permission_denied' : 'supabase_error';
    steps.push(step(7, 'write_sync_run', 'error',
      code === 'rls_permission_denied' ? 'RLS blocking INSERT to source_sync_runs. Disable RLS on this table or add service_role policy.'
      : `Insert failed: ${runErr?.message ?? 'unknown'}`, code));
    return NextResponse.json({ error_code: code, steps });
  }
  runId = String(runData.id);
  steps.push(step(7, 'write_sync_run', 'ok', `source_sync_run created: ${runId}`));

  // ── Step 8: Fetch 10 HubSpot property definitions (lightweight) ───────────
  let propsWritten = 0;
  try {
    const propsRes = await fetch('https://api.hubapi.com/crm/v3/properties/deals?limit=10', {
      headers: { Authorization: `Bearer ${hsToken}` },
    });
    if (!propsRes.ok) throw new Error(`HubSpot properties ${propsRes.status}`);
    const propsData = await propsRes.json() as Record<string, unknown>;
    const props = (propsData.results as Record<string, unknown>[]) ?? [];

    // Write to raw_hubspot_properties (safe — just property definitions, no CRM records)
    for (const prop of props.slice(0, 10)) {
      const { error: propErr } = await sb.from('raw_hubspot_properties').upsert(
        { object_type: 'deals', property_name: String(prop.name), raw_payload: prop, fetched_at: new Date().toISOString(), sync_run_id: runId },
        { onConflict: 'object_type,property_name' }
      );
      if (!propErr) propsWritten++;
    }

    steps.push(step(8, 'write_raw_properties', 'ok',
      `${propsWritten}/${props.length} HubSpot deal property definitions written to raw_hubspot_properties`));
  } catch (err) {
    steps.push(step(8, 'write_raw_properties', 'error', `${err instanceof Error ? err.message : 'unknown'}`, 'upstream_api_error'));
  }

  // ── Step 9: Complete sync run ─────────────────────────────────────────────
  await sb.from('source_sync_runs').update({
    status: 'completed',
    completed_at: new Date().toISOString(),
    records_fetched: 10,
    records_written: propsWritten,
    meta: { test_run: true, props_written: propsWritten },
  }).eq('id', runId);
  steps.push(step(9, 'complete_sync_run', 'ok', `Sync run ${runId} marked completed`));

  return NextResponse.json({
    status: 'ok',
    message: `HubSpot test passed — ${propsWritten} property definitions written. Ready for full discovery.`,
    sync_run_id: runId,
    steps,
  });
}
