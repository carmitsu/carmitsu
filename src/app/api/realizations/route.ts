import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase';
import { getTokenFromRequest, validateToken } from '@/lib/api-auth';
import { handleApiError } from '@/lib/errors';
import { logger } from '@/lib/logger';
import { realizationSchema } from '@/lib/validators';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    logger.debug('Pobieranie listy realizacji', { operation: 'get-realizations' });

    const { data, error } = await supabase
      .from('realizations')
      .select('id, created_at, title, description, files')
      .order('created_at', { ascending: false });

    if (error) {
      logger.error('Błąd pobierania realizacji z Supabase', { 
        operation: 'get-realizations', 
        error: error.message 
      });
      return NextResponse.json(
        { error: { code: 'DATABASE_ERROR', message: error.message } },
        { status: 500 }
      );
    }

    logger.info('Lista realizacji pobrana', {
      operation: 'get-realizations',
      count: data?.length || 0,
    });

    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'no-store, must-revalidate',
      },
    });
  } catch (error) {
    const { status, body } = handleApiError(error);
    logger.error('Nieoczekiwany błąd', { operation: 'get-realizations', error: String(error) });
    return NextResponse.json(body, { status });
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = getTokenFromRequest(request);
    if (!validateToken(token)) {
      logger.warn('Nieautoryzowana próba utworzenia realizacji', { path: '/api/realizations' });
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

    const parsed = realizationSchema.safeParse(body);
    if (!parsed.success) {
      const errors = parsed.error.issues.map((e: { message: string }) => e.message).join(', ');
      logger.warn('Błąd walidacji realizacji', { 
        operation: 'create-realization', 
        errors 
      });
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: errors } },
        { status: 400 }
      );
    }

    const { title, description, files } = parsed.data;

    logger.info('Tworzenie nowej realizacji', {
      operation: 'create-realization',
      title,
      filesCount: files.length,
    });

    const { data, error } = await supabase
      .from('realizations')
      .insert([{
        title,
        description,
        files,
      }])
      .select('id, created_at, title, description, files')
      .single();

    if (error) {
      logger.error('Błąd tworzenia realizacji w Supabase', {
        operation: 'create-realization',
        error: error.message,
      });
      return NextResponse.json(
        { error: { code: 'DATABASE_ERROR', message: error.message } },
        { status: 500 }
      );
    }

    logger.info('Realizacja utworzona', {
      operation: 'create-realization',
      id: data.id,
    });

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    const { status, body } = handleApiError(error);
    logger.error('Nieoczekiwany błąd', { operation: 'create-realization', error: String(error) });
    return NextResponse.json(body, { status });
  }
}
