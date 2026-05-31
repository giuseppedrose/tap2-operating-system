import { NextRequest, NextResponse } from 'next/server';

const ADMIN_COOKIE = 'tap2_admin_session';

// Routes that require admin session — all internal operational pages
const PROTECTED_PATHS = [
  '/',
  '/revenue',
  '/pipeline',
  '/partners',
  '/gtm',
  '/campaigns',
  '/lifecycle',
  '/product',
  '/meetings',
  '/cash',
  '/forecast',
  '/board',
];

// Routes that are always public — no auth required
const PUBLIC_PATHS = [
  '/investor',
  '/admin/login',
];

function isProtected(pathname: string): boolean {
  // Exact protected paths
  if (PROTECTED_PATHS.includes(pathname)) return true;
  // All /admin/** except /admin/login
  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) return true;
  return false;
}

function isPublic(pathname: string): boolean {
  if (PUBLIC_PATHS.some(p => pathname === p || pathname.startsWith(p + '/'))) return true;
  // Next.js internals, static assets, API routes handle their own auth
  if (pathname.startsWith('/_next')) return true;
  if (pathname.startsWith('/api/')) return true;
  if (pathname.startsWith('/brand/')) return true;
  if (pathname.startsWith('/favicon')) return true;
  return false;
}

function hasValidSession(request: NextRequest): boolean {
  const session = request.cookies.get(ADMIN_COOKIE);
  return Boolean(session?.value && session.value.length >= 32);
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public paths — always allow through
  if (isPublic(pathname)) return NextResponse.next();

  // Protected paths — require admin session
  if (isProtected(pathname)) {
    if (!hasValidSession(request)) {
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('from', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all paths except static files and Next.js internals.
     * This lets the proxy() function decide what's protected.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
