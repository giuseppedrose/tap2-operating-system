import { NextRequest, NextResponse } from 'next/server';
import { ENV } from '@/lib/config/env';
import { getSupabaseAdmin } from '@/lib/integrations/supabase-admin';

function checkAuth(req: NextRequest) { const s = req.cookies.get('tap2_admin_session'); return Boolean(s?.value && s.value.length >= 32); }

export async function GET(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const configured = Boolean(ENV.GOOGLE_CLIENT_ID && ENV.GOOGLE_CLIENT_SECRET);
  let lastRun = null;
  try { const { data } = await getSupabaseAdmin().from('source_sync_runs').select('*').eq('source', 'google_calendar').order('created_at', { ascending: false }).limit(1).single(); lastRun = data; } catch {}

  return NextResponse.json({
    configured,
    requires_oauth: true,
    vercel_names_detected: {
      client_id: Boolean(ENV.GOOGLE_CLIENT_ID) ? 'ClientIDgoogle' : 'missing',
      client_secret: Boolean(ENV.GOOGLE_CLIENT_SECRET) ? 'GoogleClientSecret' : 'missing',
      redirect_uri: Boolean(ENV.GOOGLE_REDIRECT_URI) ? (process.env.GoogleRedirect2 ? 'GoogleRedirect2' : 'GoogleRedirect') : 'missing',
    },
    message: configured
      ? 'Google OAuth credentials found. OAuth flow required — implement /api/auth/google to get access token.'
      : 'Google credentials not found.',
    setup_steps: [
      'Credentials detected from: ClientIDgoogle, GoogleClientSecret, GoogleRedirect/GoogleRedirect2',
      'Implement OAuth flow at /api/auth/google',
      'Store access + refresh tokens in Supabase (not env vars)',
      'Use refresh token to fetch calendar events server-side',
    ],
    last_run: lastRun,
  });
}
