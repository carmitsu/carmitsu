import { NextRequest, NextResponse } from 'next/server';
import { uploadFile, getFileUrl } from '@/utils/s3';
import { getTokenFromRequest, validateToken } from '@/lib/api-auth';
import { handleApiError } from '@/lib/errors';
import { logger } from '@/lib/logger';
import { 
  isAllowedMimeType, 
  isAllowedExtension, 
  getExtensionFromFilename,
  getMaxSizeForMime,
  sanitizeFilename,
  MAX_IMAGE_SIZE_MB,
  MAX_VIDEO_SIZE_MB,
} from '@/lib/validators';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const token = getTokenFromRequest(request);
    if (!validateToken(token)) {
      logger.warn('Nieautoryzowana próba uploadu', { path: '/api/storage/upload' });
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Brak autoryzacji' } },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const customName = formData.get('customName') as string | null;
    
    if (!file) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Nie podano pliku' } },
        { status: 400 }
      );
    }

    const originalFileName = file.name;
    const fileSize = file.size;
    const contentType = file.type;

    logger.info('Rozpoczęcie uploadu pliku', {
      operation: 'upload',
      customName: customName || 'none',
      originalFileName,
      fileSize,
      contentType,
    });

    if (!contentType) {
      return NextResponse.json(
        { error: { code: 'INVALID_TYPE', message: 'Nie można określić typu pliku' } },
        { status: 400 }
      );
    }

    if (!isAllowedMimeType(contentType)) {
      logger.warn('Odrzucono plik - niedozwolony typ MIME', {
        operation: 'upload',
        originalFileName,
        contentType,
      });
      return NextResponse.json(
        { 
          error: { 
            code: 'INVALID_TYPE', 
            message: `Niedozwolony typ pliku: ${contentType}. Dozwolone: obrazy (jpg, png, avif, webp, gif) i wideo (mp4, webm, mov)` 
          } 
        },
        { status: 400 }
      );
    }

    const extension = getExtensionFromFilename(originalFileName);
    if (!isAllowedExtension(extension)) {
      logger.warn('Odrzucono plik - niedozwolone rozszerzenie', {
        operation: 'upload',
        originalFileName,
        extension,
      });
      return NextResponse.json(
        { 
          error: { 
            code: 'INVALID_TYPE', 
            message: `Niedozwolone rozszerzenie: .${extension}. Dozwolone: jpg, jpeg, png, avif, webp, gif, mp4, webm, mov` 
          } 
        },
        { status: 400 }
      );
    }

    const maxSize = getMaxSizeForMime(contentType);
    if (fileSize > maxSize) {
      const maxSizeMB = contentType.startsWith('video/') ? MAX_VIDEO_SIZE_MB : MAX_IMAGE_SIZE_MB;
      logger.warn('Odrzucono plik - zbyt duży', {
        operation: 'upload',
        originalFileName,
        fileSize,
        maxSize,
      });
      return NextResponse.json(
        { 
          error: { 
            code: 'INVALID_SIZE', 
            message: `Plik "${originalFileName}" jest zbyt duży. Maksymalny rozmiar: ${maxSizeMB}MB` 
          } 
        },
        { status: 400 }
      );
    }

    let finalFileName: string;
    if (customName) {
      finalFileName = customName.endsWith(`.${extension}`) ? customName : `${customName}.${extension}`;
    } else {
      finalFileName = sanitizeFilename(originalFileName);
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    
    await uploadFile(finalFileName, buffer, contentType);
    const url = await getFileUrl(finalFileName);

    logger.info('Upload zakończony sukcesem', {
      operation: 'upload',
      finalFileName,
      fileSize,
      contentType,
    });

    return NextResponse.json({ 
      success: true, 
      name: finalFileName, 
      url,
      size: fileSize,
      type: contentType
    });
  } catch (error) {
    const { status, body } = handleApiError(error);
    logger.error('Błąd uploadu', { operation: 'upload', error: String(error) });
    return NextResponse.json(body, { status });
  }
}
