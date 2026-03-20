import { NextRequest, NextResponse } from 'next/server';
import { deleteFile } from '@/utils/s3';
import { getTokenFromRequest, validateToken } from '@/lib/api-auth';
import { handleApiError } from '@/lib/errors';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

export async function DELETE(request: NextRequest) {
  try {
    const token = getTokenFromRequest(request);
    if (!validateToken(token)) {
      logger.warn('Nieautoryzowana próba usunięcia pliku', { path: '/api/storage/delete' });
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Brak autoryzacji' } },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const name = searchParams.get('name');
    const names = searchParams.get('names');

    if (!name && !names) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Nie podano nazwy pliku do usunięcia' } },
        { status: 400 }
      );
    }

    const results: {
      deleted: string[];
      failed: Array<{ name: string; error: string }>;
    } = {
      deleted: [],
      failed: [],
    };

    const fileNames = names 
      ? names.split(',').map(n => decodeURIComponent(n.trim())).filter(Boolean)
      : [decodeURIComponent(name!)];
    
    logger.info('Rozpoczęcie usuwania plików', {
      operation: 'delete',
      count: fileNames.length,
      files: fileNames,
    });

    for (const fileName of fileNames) {
      if (!fileName) continue;

      try {
        await deleteFile(fileName);
        results.deleted.push(fileName);
        logger.debug(`Usunięto plik: ${fileName}`, { operation: 'delete', fileName });
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        
        if (errorMessage.includes('NoSuchKey') || errorMessage.includes('NotFound')) {
          results.failed.push({ name: fileName, error: 'Plik nie istnieje' });
          logger.warn(`Plik nie istnieje: ${fileName}`, { operation: 'delete', fileName });
        } else if (errorMessage.includes('AccessDenied')) {
          results.failed.push({ name: fileName, error: 'Brak uprawnień do usunięcia' });
          logger.error(`Brak uprawnień do usunięcia: ${fileName}`, { operation: 'delete', fileName });
        } else {
          results.failed.push({ name: fileName, error: errorMessage });
          logger.error(`Błąd usuwania ${fileName}: ${errorMessage}`, { operation: 'delete', fileName });
        }
      }
    }

    if (results.deleted.length === 0 && results.failed.length > 0) {
      return NextResponse.json({
        success: false,
        ...results,
        message: 'Nie udało się usunąć żadnego pliku',
      }, { status: 400 });
    }

    logger.info('Usuwanie plików zakończone', {
      operation: 'delete',
      deletedCount: results.deleted.length,
      failedCount: results.failed.length,
    });

    return NextResponse.json({
      success: results.failed.length === 0,
      ...results,
    });
  } catch (error) {
    const { status, body } = handleApiError(error);
    logger.error('Błąd operacji delete', { operation: 'delete', error: String(error) });
    return NextResponse.json(body, { status });
  }
}
