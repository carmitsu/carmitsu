import { NextRequest, NextResponse } from 'next/server';
import { listFiles, getFileUrl } from '@/utils/s3';
import { getTokenFromRequest, validateToken } from '@/lib/api-auth';
import { handleApiError } from '@/lib/errors';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

function getFileType(fileName: string): 'image' | 'video' | 'other' {
  const ext = fileName.split('.').pop()?.toLowerCase() || '';
  const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'avif', 'svg'];
  const videoExts = ['mp4', 'webm', 'mov'];
  
  if (imageExts.includes(ext)) return 'image';
  if (videoExts.includes(ext)) return 'video';
  return 'other';
}

export async function GET(request: NextRequest) {
  try {
    const token = getTokenFromRequest(request);
    if (!validateToken(token)) {
      logger.warn('Nieautoryzowana próba listowania plików', { path: '/api/storage/list' });
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Brak autoryzacji' } },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const refresh = searchParams.get('refresh') === 'true';

    logger.debug('Pobieranie listy plików', { operation: 'list', refresh });

    const files = await listFiles();
    
    const fileList = await Promise.all(
      files.map(async (file) => {
        const name = file.name || file.Key!;
        const type = getFileType(name);
        try {
          const url = await getFileUrl(name);
          return {
            name,
            type,
            size: file.Size,
            lastModified: file.LastModified,
            url,
          };
        } catch (err) {
          logger.warn(`Nie można pobrać URL dla ${name}`, { operation: 'list', fileName: name });
          return null;
        }
      })
    );

    const validFiles = fileList.filter(f => f !== null);

    logger.info('Lista plików pobrana', {
      operation: 'list',
      count: validFiles.length,
    });

    return NextResponse.json(validFiles, {
      headers: {
        'Cache-Control': 'no-store, must-revalidate, max-age=0',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (error) {
    const { status, body } = handleApiError(error);
    logger.error('Błąd pobierania listy plików', { operation: 'list', error: String(error) });
    return NextResponse.json(body, { status });
  }
}
