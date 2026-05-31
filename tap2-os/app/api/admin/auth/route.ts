import { NextRequest, NextResponse } from 'next/server';

const ADMIN_COOKIE = 'tap2_admin_session';
const COOKIE_MAX_AGE = 60 * 60 * 8; // 8 hours

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const { username, password } = body as { username?: string; password?: string };

  const expectedUsername = process.env.ADMIN_USERNAME;
  const expectedPassword = process.env.ADMIN_PASSWORD;

  // If env vars not set, deny access entirely
  if (!expectedUsername || !expectedPassword) {
    return NextResponse.json(
      { error: 'Admin credentials not configured. Set ADMIN_USERNAME and ADMIN_PASSWORD in environment variables.' },
      { status: 503 }
    );
  }

  if (!username || !password) {
    return NextResponse.json({ error: 'Username and password required.' }, { status: 400 });
  }

  if (username !== expectedUsername || password !== expectedPassword) {
    // Constant-time comparison would be better in production, but fine for internal tool
    return NextResponse.json({ error: 'Invalid credentials.' }, { status: 401 });
  }

  // Create a simple session token (hash of username+password+timestamp)
  const tokenData = `${username}:${Date.now()}:tap2os`;
  const encoder = new TextEncoder();
  const data = encoder.encode(tokenData);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const token = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

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
