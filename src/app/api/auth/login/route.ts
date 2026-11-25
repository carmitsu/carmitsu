import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {
  createSessionCookieValue,
  getSessionCookieOptions,
  PANEL_SESSION_COOKIE,
  validateAdminToken,
} from '@/lib/api-auth';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

const loginSchema = z.object({
  token: z.string().min(1, 'Token jest wymagany').max(512),
});

const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const MAX_LOGIN_ATTEMPTS = 10;
const loginAttempts = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = loginAttempts.get(ip);

  if (loginAttempts.size > 1000) {
    for (const [key, value] of loginAttempts.entries()) {
      if (value.resetAt <= now) {
        loginAttempts.delete(key);
      }
    }
  }

  if (!entry || entry.resetAt <= now) {
    loginAttempts.set(ip, { count: 1, resetAt: now + LOGIN_WINDOW_MS });
    return false;
  }

  entry.count += 1;
  return entry.count > MAX_LOGIN_ATTEMPTS;
}

export async function POST(request: NextRequest) {
  const clientIp =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown';

  if (isRateLimited(clientIp)) {
    logger.warn('Zbyt wiele prób logowania do panelu', { ip: clientIp });
    return NextResponse.json(
      { error: { code: 'RATE_LIMITED', message: 'Zbyt wiele prób logowania. Spróbuj ponownie później.' } },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: { code: 'VALIDATION_ERROR', message: 'Nieprawidłowy format JSON' } },
      { status: 400 }
    );
  }

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: 'VALIDATION_ERROR', message: 'Wprowadź token dostępowy' } },
      { status: 400 }
    );
  }

  if (!validateAdminToken(parsed.data.token.trim())) {
    logger.warn('Nieudana próba logowania do panelu', { ip: clientIp });
    return NextResponse.json(
      { error: { code: 'UNAUTHORIZED', message: 'Nieprawidłowy token dostępowy' } },
      { status: 401 }
    );
  }

  const sessionValue = createSessionCookieValue();
  if (!sessionValue) {
    logger.error('Brak skonfigurowanego tokena panelu na serwerze');
    return NextResponse.json(
      { error: { code: 'SERVER_ERROR', message: 'Konfiguracja autoryzacji serwera jest niekompletna' } },
      { status: 500 }
    );
  }

  loginAttempts.delete(clientIp);

  const response = NextResponse.json({ authenticated: true });
  response.cookies.set(PANEL_SESSION_COOKIE, sessionValue, getSessionCookieOptions());
  return response;
}
