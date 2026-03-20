import { NextRequest, NextResponse } from 'next/server';
import { renameFile } from '@/utils/s3';
import { getTokenFromRequest, validateToken } from '@/lib/api-auth';
import { handleApiError } from '@/lib/errors';
import { logger } from '@/lib/logger';
import { 
  renameFileSchema, 
  isAllowedExtension, 
  getExtensionFromFilename,
  sanitizeFilename 
} from '@/lib/validators';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const token = getTokenFromRequest(request);
    if (!validateToken(token)) {
      logger.warn('Nieautoryzowana próba zmiany nazwy pliku', { path: '/api/storage/rename' });
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Brak autoryzacji' } },
        { status: 401 }
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

    const parsed = renameFileSchema.safeParse(body);
    if (!parsed.success) {
      const errors = parsed.error.issues.map((e: { message: string }) => e.message).join(', ');
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: errors } },
        { status: 400 }
      );
    }

    const { oldName, newName } = parsed.data;
    const sanitizedNewName = sanitizeFilename(newName);

    if (oldName === sanitizedNewName) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Nowa nazwa jest taka sama jak obecna' } },
        { status: 400 }
      );
    }

    const oldExtension = getExtensionFromFilename(oldName);
    const newExtension = getExtensionFromFilename(sanitizedNewName);
    
    if (oldExtension !== newExtension) {
      return NextResponse.json(
        { 
          error: { 
            code: 'VALIDATION_ERROR', 
            message: 'Nie można zmienić rozszerzenia pliku' 
          } 
        },
        { status: 400 }
      );
    }

    if (!isAllowedExtension(newExtension)) {
      return NextResponse.json(
        { 
          error: { 
            code: 'INVALID_TYPE', 
            message: `Niedozwolone rozszerzenie: .${newExtension}` 
          } 
        },
        { status: 400 }
      );
    }

    logger.info('Zmiana nazwy pliku', {
      operation: 'rename',
      oldName,
      newName: sanitizedNewName,
    });

    try {
      await renameFile(oldName, sanitizedNewName);
      
      logger.info('Zmiana nazwy zakończona sukcesem', {
        operation: 'rename',
        oldName,
        newName: sanitizedNewName,
      });
    } catch (renameError) {
      logger.error('Błąd podczas operacji rename', {
        operation: 'rename',
        error: renameError instanceof Error ? renameError.message : String(renameError),
        stack: renameError instanceof Error ? renameError.stack : undefined,
      });
      throw renameError;
    }

    return NextResponse.json({ 
      success: true, 
      oldName, 
      newName: sanitizedNewName 
    });
  } catch (error) {
    const { status, body } = handleApiError(error);
    logger.error('Błąd zmiany nazwy', { operation: 'rename', error: String(error) });
    return NextResponse.json(body, { status });
  }
}
