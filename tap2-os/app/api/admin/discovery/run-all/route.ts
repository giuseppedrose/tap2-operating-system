import { NextRequest, NextResponse } from 'next/server';
import { ENV } from '@/lib/config/env';

function checkAuth(req: NextRequest) { const s = req.cookies.get('tap2_admin_session'); return Boolean(s?.value && s.value.length >= 32); }

export async function POST(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const base = new URL(req.url).origin;
  const sources = ['stripe', 'hubspot', 'instantly', 'fathom'];
  const results: Record<string, unknown> = {};

  for (const source of sources) {
    try {
      const res = await fetch(`${base}/api/admin/discovery/${source}`, {
        method: 'POST',
        headers: { cookie: req.headers.get('cookie') ?? '' },
      });
      results[source] = await res.json();
    } catch (err) {
      results[source] = { status: 'error', message: err instanceof Error ? err.message : 'Failed' };
    }
  }

  const succeeded = Object.values(results).filter((r: unknown) => (r as Record<string, unknown>).status === 'ok').length;
  return NextResponse.json({ status: 'ok', sources_attempted: sources.length, sources_succeeded: succeeded, results });
}
