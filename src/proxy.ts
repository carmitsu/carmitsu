import { NextRequest, NextResponse } from 'next/server';
import { PANEL_SESSION_COOKIE, validateSessionCookie } from '@/lib/api-auth';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get(PANEL_SESSION_COOKIE)?.value;
  const isAuthenticated = validateSessionCookie(sessionCookie);

  if (pathname === '/panel') {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL('/panel/realizations', request.url));
    }
    return NextResponse.next();
  }

  if (pathname.startsWith('/panel/')) {
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL('/panel', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/panel', '/panel/:path*'],
};
