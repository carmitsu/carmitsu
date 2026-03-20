import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase';
import { getTokenFromRequest, validateToken } from '@/lib/api-auth';
import { handleApiError } from '@/lib/errors';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const token = getTokenFromRequest(request);
    if (!validateToken(token)) {
      logger.warn('Nieautoryzowany dostęp do sprawdzania użycia pliku', { path: '/api/storage/file-usage' });
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Brak autoryzacji' } },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const fileName = searchParams.get('fileName');

    if (!fileName) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Brak nazwy pliku' } },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('realizations')
      .select('id, title, files')
      .contains('files', [{ name: fileName }]);

    if (error) {
      logger.error('Błąd sprawdzania użycia pliku', {
        operation: 'check-file-usage',
        fileName,
        error: error.message,
      });
      return NextResponse.json(
        { error: { code: 'DATABASE_ERROR', message: error.message } },
        { status: 500 }
      );
    }

    const realizations = data?.map(r => ({
      id: r.id,
      title: r.title,
    })) || [];

    logger.info('Sprawdzono użycie pliku', {
      operation: 'check-file-usage',
      fileName,
      usedIn: realizations.length,
    });

    return NextResponse.json({
      fileName,
      usedIn: realizations,
      count: realizations.length,
    });
  } catch (error) {
    const { status, body } = handleApiError(error);
    logger.error('Nieoczekiwany błąd', { operation: 'check-file-usage', error: String(error) });
    return NextResponse.json(body, { status });
  }
}
