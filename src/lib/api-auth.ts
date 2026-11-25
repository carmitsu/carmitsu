import { createHash, createHmac, timingSafeEqual } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { logger } from './logger';

export const PANEL_SESSION_COOKIE = 'carmitsu_panel_session';

function getAdminToken(): string | undefined {
  return process.env.ADMIN_PANEL_TOKEN || process.env.NEXT_PUBLIC_ADMIN_PANEL_TOKEN;
}

function safeCompare(a: string, b: string): boolean {
  const hashA = createHash('sha256').update(a).digest();
  const hashB = createHash('sha256').update(b).digest();
  return timingSafeEqual(hashA, hashB);
}

export function createSessionCookieValue(): string | null {
  const adminToken = getAdminToken();
  if (!adminToken) return null;
  return createHmac('sha256', adminToken)
    .update('carmitsu-panel-session-v1')
    .digest('hex');
}

export function getSessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: 60 * 60 * 8,
  };
}

export function validateAdminToken(token: string | null): boolean {
  const adminToken = getAdminToken();
  if (!token || !adminToken) {
    logger.debug('Walidacja tokena admina nie powiodła się', {
      reason: !token ? 'brak tokena' : 'brak tokena w env',
    });
    return false;
  }

  return safeCompare(token, adminToken);
}

export function validateSessionCookie(cookieValue: string | null | undefined): boolean {
  const expected = createSessionCookieValue();
  if (!cookieValue || !expected) {
    return false;
  }

  return safeCompare(cookieValue, expected);
}

export function getTokenFromRequest(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    const bearer = authHeader.substring(7).trim();
    if (bearer) return bearer;
  }

  const sessionCookie = request.cookies.get(PANEL_SESSION_COOKIE)?.value;
  if (sessionCookie) {
    return sessionCookie;
  }

  return null;
}

export function validateToken(token: string | null): boolean {
  if (!token) return false;
  return validateAdminToken(token) || validateSessionCookie(token);
}

export function isRequestAuthenticated(request: NextRequest): boolean {
  const sessionCookie = request.cookies.get(PANEL_SESSION_COOKIE)?.value;
  if (validateSessionCookie(sessionCookie)) {
    return true;
  }

  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    const bearer = authHeader.substring(7).trim();
    if (validateAdminToken(bearer)) {
      return true;
    }
  }

  return false;
}

export function withAuth<T>(
  handler: (request: NextRequest, context: T) => Promise<NextResponse>
) {
  return async (request: NextRequest, context: T): Promise<NextResponse> => {
    if (!isRequestAuthenticated(request)) {
      const clientIp = request.headers.get('x-forwarded-for') || 'unknown';
      logger.warn('Nieautoryzowana próba dostępu do API', {
        path: request.nextUrl.pathname,
        method: request.method,
        ip: clientIp,
      });

      return createAuthResponse();
    }

    return handler(request, context);
  };
}

export function createAuthResponse(message = 'Brak autoryzacji'): NextResponse {
  return NextResponse.json(
    { error: { code: 'UNAUTHORIZED', message } },
    { status: 401 }
  );
}

export function createForbiddenResponse(message = 'Brak uprawnień'): NextResponse {
  return NextResponse.json(
    { error: { code: 'FORBIDDEN', message } },
    { status: 403 }
  );
}
