import { NextRequest, NextResponse } from 'next/server';
import { UnauthorizedError, ForbiddenError } from './errors';
import { logger } from './logger';

const ADMIN_TOKEN = process.env.NEXT_PUBLIC_ADMIN_PANEL_TOKEN;

if (!ADMIN_TOKEN) {
  logger.warn('NEXT_PUBLIC_ADMIN_PANEL_TOKEN nie jest ustawiony w zmiennych środowiskowych');
}

export function getTokenFromRequest(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  return null;
}

export function validateToken(token: string | null): boolean {
  if (!token || !ADMIN_TOKEN) {
    logger.debug('Token walidacja niepowiodła się', {
      reason: !token ? 'brak tokena' : 'brak ADMIN_TOKEN w env',
      hasToken: !!token,
      hasEnvToken: !!ADMIN_TOKEN,
    });
    return false;
  }
  
  const isValid = token === ADMIN_TOKEN;
  logger.debug('Walidacja tokena', {
    tokenLength: token.length,
    envTokenLength: ADMIN_TOKEN.length,
    isValid,
  });
  
  return isValid;
}

export function withAuth<T>(
  handler: (request: NextRequest, context: T) => Promise<NextResponse>
) {
  return async (request: NextRequest, context: T): Promise<NextResponse> => {
    const token = getTokenFromRequest(request);

    if (!validateToken(token)) {
      const clientIp = request.headers.get('x-forwarded-for') || 'unknown';
      logger.warn('Nieautoryzowana próba dostępu do API', {
        path: request.nextUrl.pathname,
        method: request.method,
        ip: clientIp,
      });

      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Brak autoryzacji' } },
        { status: 401 }
      );
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
