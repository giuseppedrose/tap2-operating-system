import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/integrations/supabase-admin';

function checkAuth(req: NextRequest): boolean {
  const session = req.cookies.get('tap2_admin_session');
  return Boolean(session?.value && session.value.length >= 32);
}

export async function GET(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;

  const configured = Boolean(clientId && clientSecret);

  let lastRun = null;
  try {
    const { data } = await getSupabaseAdmin().from('source_sync_runs').select('*').eq('source', 'google_calendar').order('created_at', { ascending: false }).limit(1).single();
    lastRun = data;
  } catch {}

  return NextResponse.json({
    configured,
    requires_oauth: true,
    message: configured
      ? 'Google OAuth credentials configured. OAuth flow required before calendar data can be fetched.'
      : 'GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET not configured.',
    setup_steps: [
      'Set GOOGLE_CLIENT_ID in Vercel environment variables',
      'Set GOOGLE_CLIENT_SECRET in Vercel environment variables',
      'Set GOOGLE_REDIRECT_URI to: https://tap2-operating-system-pvhm.vercel.app/api/auth/google/callback',
      'Implement OAuth flow at /api/auth/google',
      'Store access/refresh tokens securely (Supabase, not env vars)',
      'Then calendar events can be fetched server-side',
    ],
    last_run: lastRun,
  });
}
