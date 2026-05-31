import { NextRequest, NextResponse } from 'next/server';
import { ENV } from '@/lib/config/env';

const ADMIN_COOKIE = 'tap2_admin_session';
const COOKIE_MAX_AGE = 60 * 60 * 8; // 8 hours

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({})) as { username?: string; password?: string };
  const { username, password } = body;

  const expectedUsername = ENV.ADMIN_USERNAME;
  const expectedPassword = ENV.ADMIN_PASSWORD;

  if (!expectedUsername || !expectedPassword) {
    return NextResponse.json(
      { error: 'Admin credentials not configured. Set ADMIN_USERNAME and ADMIN_PASSWORD in Vercel environment variables.' },
      { status: 503 }
    );
  }

  if (!username || !password) {
    return NextResponse.json({ error: 'Username and password required.' }, { status: 400 });
  }

  if (username !== expectedUsername || password !== expectedPassword) {
    return NextResponse.json({ error: 'Invalid credentials.' }, { status: 401 });
  }

  const tokenData = `${username}:${Date.now()}:tap2os`;
  const encoder = new TextEncoder();
  const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(tokenData));
  const token = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');

  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: COOKIE_MAX_AGE,
    path: '/',
  });
  return response;
}
