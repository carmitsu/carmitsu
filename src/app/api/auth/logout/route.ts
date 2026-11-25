import { NextResponse } from 'next/server';
import { getSessionCookieOptions, PANEL_SESSION_COOKIE } from '@/lib/api-auth';

export const dynamic = 'force-dynamic';

export async function POST() {
  const response = NextResponse.json({ authenticated: false });
  response.cookies.set(PANEL_SESSION_COOKIE, '', {
    ...getSessionCookieOptions(),
    maxAge: 0,
  });
  return response;
}
