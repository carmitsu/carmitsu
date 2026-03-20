import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase';
import { getTokenFromRequest, validateToken } from '@/lib/api-auth';
import { handleApiError } from '@/lib/errors';
import { logger } from '@/lib/logger';
import { deleteFile } from '@/utils/s3';
import { realizationSchema } from '@/lib/validators';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    if (!id) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Brak ID realizacji' } },
        { status: 400 }
      );
    }

    logger.debug('Pobieranie realizacji', { operation: 'get-realization', id });

    const { data, error } = await supabase
      .from('realizations')
      .select('id, created_at, title, description, files')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: { code: 'NOT_FOUND', message: `Realizacja o ID "${id}" nie została znaleziona` } },
          { status: 404 }
        );
      }
      logger.error('Błąd pobierania realizacji', { 
        operation: 'get-realization', 
        id, 
        error: error.message 
      });
      return NextResponse.json(
        { error: { code: 'DATABASE_ERROR', message: error.message } },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    const { status, body } = handleApiError(error);
    logger.error('Nieoczekiwany błąd', { operation: 'get-realization', error: String(error) });
    return NextResponse.json(body, { status });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = getTokenFromRequest(request);
    if (!validateToken(token)) {
      logger.warn('Nieautoryzowana próba aktualizacji realizacji', { path: '/api/realizations/[id]' });
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Brak autoryzacji' } },
        { status: 401 }
      );
    }

    const { id } = await params;
    
    if (!id) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Brak ID realizacji' } },
        { status: 400 }
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

    const parsed = realizationSchema.safeParse(body);
    if (!parsed.success) {
      const errors = parsed.error.issues.map((e: { message: string }) => e.message).join(', ');
      logger.warn('Błąd walidacji realizacji', { 
        operation: 'update-realization', 
        id,
        errors 
      });
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: errors } },
        { status: 400 }
      );
    }

    const { title, description, files } = parsed.data;

    logger.info('Aktualizacja realizacji', {
      operation: 'update-realization',
      id,
      title,
    });

    const { data, error } = await supabase
      .from('realizations')
      .update({
        title,
        description,
        files,
      })
      .eq('id', id)
      .select('id, created_at, title, description, files')
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: { code: 'NOT_FOUND', message: `Realizacja o ID "${id}" nie została znaleziona` } },
          { status: 404 }
        );
      }
      logger.error('Błąd aktualizacji realizacji', {
        operation: 'update-realization',
        id,
        error: error.message,
      });
      return NextResponse.json(
        { error: { code: 'DATABASE_ERROR', message: error.message } },
        { status: 500 }
      );
    }

    logger.info('Realizacja zaktualizowana', {
      operation: 'update-realization',
      id,
    });

    return NextResponse.json(data);
  } catch (error) {
    const { status, body } = handleApiError(error);
    logger.error('Nieoczekiwany błąd', { operation: 'update-realization', error: String(error) });
    return NextResponse.json(body, { status });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = getTokenFromRequest(request);
    if (!validateToken(token)) {
      logger.warn('Nieautoryzowana próba usunięcia realizacji', { path: '/api/realizations/[id]' });
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Brak autoryzacji' } },
        { status: 401 }
      );
    }

    const { id } = await params;
    
    if (!id) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Brak ID realizacji' } },
        { status: 400 }
      );
    }

    logger.info('Pobieranie realizacji przed usunięciem', {
      operation: 'delete-realization',
      id,
    });

    const { data: realization, error: fetchError } = await supabase
      .from('realizations')
      .select('files')
      .eq('id', id)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return NextResponse.json(
          { error: { code: 'NOT_FOUND', message: `Realizacja o ID "${id}" nie została znaleziona` } },
          { status: 404 }
        );
      }
      logger.error('Błąd pobierania realizacji', {
        operation: 'delete-realization',
        id,
        error: fetchError.message,
      });
      return NextResponse.json(
        { error: { code: 'DATABASE_ERROR', message: fetchError.message } },
        { status: 500 }
      );
    }

    const filesToDelete = (realization?.files || []) as Array<{ name: string }>;
    const deletedFiles: string[] = [];
    const failedFiles: Array<{ name: string; error: string }> = [];

    for (const file of filesToDelete) {
      try {
        await deleteFile(file.name);
        deletedFiles.push(file.name);
        logger.debug(`Usunięto plik: ${file.name}`, { operation: 'delete-realization' });
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        failedFiles.push({ name: file.name, error: errorMessage });
        logger.warn(`Nie udało się usunąć pliku ${file.name}`, { 
          operation: 'delete-realization',
          file: file.name,
          error: errorMessage,
        });
      }
    }

    logger.info('Usuwanie realizacji z bazy', {
      operation: 'delete-realization',
      id,
      deletedFiles: deletedFiles.length,
      failedFiles: failedFiles.length,
    });

    const { error: deleteError } = await supabase
      .from('realizations')
      .delete()
      .eq('id', id);

    if (deleteError) {
      logger.error('Błąd usuwania realizacji z Supabase', {
        operation: 'delete-realization',
        id,
        error: deleteError.message,
      });
      return NextResponse.json(
        { error: { code: 'DATABASE_ERROR', message: deleteError.message } },
        { status: 500 }
      );
    }

    logger.info('Realizacja usunięta', {
      operation: 'delete-realization',
      id,
    });

    return NextResponse.json({
      success: true,
      deletedFiles,
      failedFiles: failedFiles.length > 0 ? failedFiles : undefined,
    });
  } catch (error) {
    const { status, body } = handleApiError(error);
    logger.error('Nieoczekiwany błąd', { operation: 'delete-realization', error: String(error) });
    return NextResponse.json(body, { status });
  }
}
