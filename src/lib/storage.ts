import { s3Client, BUCKET, uploadFile as s3Upload, deleteFile as s3Delete, listFiles, getFileUrl, getPublicUrl as s3GetPublicUrl, renameFile as s3RenameFile, fileExists as s3FileExists } from '@/utils/s3';
import { logger } from './logger';
import { ALLOWED_EXTENSIONS, ALLOWED_MIME_TYPES, MAX_IMAGE_SIZE, MAX_VIDEO_SIZE, isAllowedMimeType, isAllowedExtension, getExtensionFromFilename, sanitizeFilename } from './validators';

export interface StorageFile {
  name: string;
  url: string;
  size?: number;
  lastModified?: Date;
  type?: 'image' | 'video' | 'other';
}

export interface UploadOptions {
  normalizeName?: boolean;
  overwrite?: boolean;
}

export interface UploadResult {
  success: boolean;
  name: string;
  url: string;
  size: number;
  type: string;
  error?: string;
}

export interface DeleteResult {
  success: boolean;
  deleted: string[];
  failed: Array<{ name: string; error: string }>;
}

function getFileType(mimeType: string): 'image' | 'video' | 'other' {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'video';
  return 'other';
}

function getMaxSizeForType(mimeType: string): number {
  if (mimeType.startsWith('video/')) return MAX_VIDEO_SIZE;
  return MAX_IMAGE_SIZE;
}

function generateUniqueFileName(originalName: string): string {
  const ext = getExtensionFromFilename(originalName);
  const baseName = originalName.replace(`.${ext}`, '');
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `${baseName}_${timestamp}_${random}.${ext}`;
}

export const storageService = {
  async upload(file: File | Blob, options?: UploadOptions): Promise<UploadResult> {
    const fileName = file instanceof File ? file.name : 'unknown';
    const fileSize = file instanceof File ? file.size : 0;
    const contentType = file instanceof File ? file.type : 'application/octet-stream';

    logger.info('Rozpoczęcie uploadu pliku', {
      operation: 'storage-upload',
      fileName,
      fileSize,
      contentType,
    });

    if (!contentType || !isAllowedMimeType(contentType)) {
      const error = `Niedozwolony typ pliku: ${contentType}. Dozwolone: ${ALLOWED_MIME_TYPES.join(', ')}`;
      logger.warn('Odrzucono plik - niedozwolony typ', { operation: 'storage-upload', fileName, contentType });
      return { success: false, name: fileName, url: '', size: fileSize, type: contentType, error };
    }

    const extension = getExtensionFromFilename(fileName);
    if (!isAllowedExtension(extension)) {
      const error = `Niedozwolone rozszerzenie: .${extension}. Dozwolone: ${ALLOWED_EXTENSIONS.join(', ')}`;
      logger.warn('Odrzucono plik - niedozwolone rozszerzenie', { operation: 'storage-upload', fileName, extension });
      return { success: false, name: fileName, url: '', size: fileSize, type: contentType, error };
    }

    const maxSize = getMaxSizeForType(contentType);
    if (fileSize > maxSize) {
      const maxSizeMB = maxSize / (1024 * 1024);
      const error = `Plik jest zbyt duży. Maksymalny rozmiar: ${maxSizeMB}MB`;
      logger.warn('Odrzucono plik - zbyt duży', { operation: 'storage-upload', fileName, fileSize, maxSize });
      return { success: false, name: fileName, url: '', size: fileSize, type: contentType, error };
    }

    let finalName = fileName;
    if (options?.normalizeName) {
      finalName = sanitizeFilename(fileName);
    }

    try {
      const buffer = Buffer.from(await (file as File).arrayBuffer());
      const url = await s3Upload(finalName, buffer, contentType);

      logger.info('Upload zakończony sukcesem', {
        operation: 'storage-upload',
        fileName: finalName,
        fileSize,
      });

      return {
        success: true,
        name: finalName,
        url,
        size: fileSize,
        type: contentType,
      };
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Upload failed';
      logger.error('Błąd uploadu', { operation: 'storage-upload', fileName, error });
      return { success: false, name: fileName, url: '', size: fileSize, type: contentType, error };
    }
  },

  async uploadUnique(file: File | Blob): Promise<UploadResult> {
    const fileName = file instanceof File ? file.name : 'unknown';
    const ext = getExtensionFromFilename(fileName);
    const baseName = fileName.replace(`.${ext}`, '');
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const uniqueName = `${baseName}_${timestamp}_${random}.${ext}`;

    const blob = file.slice(0, file.size, file instanceof File ? file.type : 'application/octet-stream');
    const renamedFile = new File([blob], uniqueName, { type: file instanceof File ? file.type : 'application/octet-stream' });

    return this.upload(renamedFile);
  },

  async delete(key: string): Promise<{ success: boolean; error?: string }> {
    logger.info('Usuwanie pliku', { operation: 'storage-delete', key });

    try {
      await s3Delete(key);
      logger.info('Plik usunięty', { operation: 'storage-delete', key });
      return { success: true };
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Delete failed';
      
      if (error.includes('NotFound') || error.includes('NoSuchKey')) {
        logger.warn('Plik nie istnieje', { operation: 'storage-delete', key });
        return { success: false, error: 'Plik nie istnieje' };
      }
      
      logger.error('Błąd usuwania pliku', { operation: 'storage-delete', key, error });
      return { success: false, error };
    }
  },

  async deleteMany(keys: string[]): Promise<DeleteResult> {
    const result: DeleteResult = {
      success: true,
      deleted: [],
      failed: [],
    };

    logger.info('Usuwanie wielu plików', {
      operation: 'storage-delete-many',
      count: keys.length,
    });

    for (const key of keys) {
      const { success, error } = await this.delete(key);
      if (success) {
        result.deleted.push(key);
      } else {
        result.failed.push({ name: key, error: error || 'Unknown error' });
        result.success = false;
      }
    }

    logger.info('Usuwanie plików zakończone', {
      operation: 'storage-delete-many',
      deleted: result.deleted.length,
      failed: result.failed.length,
    });

    return result;
  },

  async rename(oldKey: string, newKey: string): Promise<{ success: boolean; error?: string; newName?: string }> {
    logger.info('Zmiana nazwy pliku', { operation: 'storage-rename', oldKey, newKey });

    if (oldKey === newKey) {
      return { success: false, error: 'Nowa nazwa jest taka sama jak obecna' };
    }

    const oldExt = getExtensionFromFilename(oldKey);
    const newExt = getExtensionFromFilename(newKey);

    if (oldExt !== newExt) {
      return { success: false, error: 'Nie można zmienić rozszerzenia pliku' };
    }

    if (!isAllowedExtension(newExt)) {
      return { success: false, error: `Niedozwolone rozszerzenie: .${newExt}` };
    }

    const sanitizedNewKey = sanitizeFilename(newKey);

    try {
      await s3RenameFile(oldKey, sanitizedNewKey);
      logger.info('Zmiana nazwy zakończona', { operation: 'storage-rename', oldKey, newKey: sanitizedNewKey });
      return { success: true, newName: sanitizedNewKey };
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Rename failed';
      logger.error('Błąd zmiany nazwy', { operation: 'storage-rename', oldKey, error });
      return { success: false, error };
    }
  },

  async list(): Promise<StorageFile[]> {
    logger.debug('Pobieranie listy plików', { operation: 'storage-list' });

    try {
      const files = await listFiles();
      
      const fileList = await Promise.all(
        files.map(async (file) => {
          const name = file.name || file.Key!;
          try {
            const url = await getFileUrl(name);
            return {
              name,
              url,
              size: file.Size,
              lastModified: file.LastModified,
              type: getFileType(getMimeTypeFromExtension(getExtensionFromFilename(name))),
            };
          } catch {
            return null;
          }
        })
      );

      const validFiles = fileList.filter((f): f is NonNullable<typeof f> => f !== null);

      logger.info('Lista plików pobrana', { operation: 'storage-list', count: validFiles.length });

      return validFiles;
    } catch (err) {
      logger.error('Błąd pobierania listy plików', { operation: 'storage-list' });
      return [];
    }
  },

  async getUrl(key: string): Promise<string> {
    return getFileUrl(key);
  },

  getPublicUrl(key: string): string {
    return s3GetPublicUrl(key);
  },

  async exists(key: string): Promise<boolean> {
    return s3FileExists(key);
  },
};

function getMimeTypeFromExtension(ext: string): string {
  const mimeTypes: Record<string, string> = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    webp: 'image/webp',
    avif: 'image/avif',
    svg: 'image/svg+xml',
    mp4: 'video/mp4',
    webm: 'video/webm',
    mov: 'video/quicktime',
  };
  return mimeTypes[ext.toLowerCase()] || 'application/octet-stream';
}

export type { StorageFile as FileInfo, UploadOptions as StorageUploadOptions, UploadResult as StorageUploadResult };
