import { z } from 'zod';

export const ALLOWED_IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'avif'] as const;
export const ALLOWED_VIDEO_EXTENSIONS = ['mp4', 'webm', 'mov'] as const;
export const ALLOWED_EXTENSIONS = [...ALLOWED_IMAGE_EXTENSIONS, ...ALLOWED_VIDEO_EXTENSIONS] as const;

export const ALLOWED_IMAGE_MIMES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
  'image/avif',
] as const;

export const ALLOWED_VIDEO_MIMES = [
  'video/mp4',
  'video/webm',
  'video/quicktime',
] as const;

export const ALLOWED_MIME_TYPES = [...ALLOWED_IMAGE_MIMES, ...ALLOWED_VIDEO_MIMES] as const;

export const MAX_IMAGE_SIZE_MB = 20;
export const MAX_VIDEO_SIZE_MB = 100;
export const MAX_IMAGE_SIZE = MAX_IMAGE_SIZE_MB * 1024 * 1024;
export const MAX_VIDEO_SIZE = MAX_VIDEO_SIZE_MB * 1024 * 1024;

export function getMaxSizeForMime(mimeType: string): number {
  if (ALLOWED_VIDEO_MIMES.includes(mimeType as typeof ALLOWED_VIDEO_MIMES[number])) {
    return MAX_VIDEO_SIZE;
  }
  return MAX_IMAGE_SIZE;
}

export function getExtensionFromFilename(filename: string): string {
  return filename.split('.').pop()?.toLowerCase() || '';
}

export function isAllowedExtension(extension: string): boolean {
  return ALLOWED_EXTENSIONS.includes(extension as typeof ALLOWED_EXTENSIONS[number]);
}

export function isAllowedMimeType(mimeType: string): boolean {
  return ALLOWED_MIME_TYPES.includes(mimeType as typeof ALLOWED_MIME_TYPES[number]);
}

export function isImageMimeType(mimeType: string): boolean {
  return ALLOWED_IMAGE_MIMES.includes(mimeType as typeof ALLOWED_IMAGE_MIMES[number]);
}

export function isVideoMimeType(mimeType: string): boolean {
  return ALLOWED_VIDEO_MIMES.includes(mimeType as typeof ALLOWED_VIDEO_MIMES[number]);
}

export function sanitizeFilename(filename: string): string {
  return filename
    .trim()
    .replace(/[<>:"|?*]/g, '')
    .replace(/\s+/g, '_')
    .replace(/_{2,}/g, '_')
    .substring(0, 255);
}

export const uploadFileSchema = z.object({
  name: z
    .string()
    .min(1, 'Nazwa pliku jest wymagana')
    .max(255, 'Nazwa pliku jest zbyt długa')
    .refine(
      (name) => !/[<>:"/\\|?*]/.test(name),
      'Nazwa pliku zawiera niedozwolone znaki (<>:"|?*)'
    )
    .refine(
      (name) => {
        const ext = getExtensionFromFilename(name);
        return isAllowedExtension(ext);
      },
      `Niedozwolone rozszerzenie. Dozwolone: ${ALLOWED_EXTENSIONS.join(', ')}`
    ),
  size: z.number().positive('Rozmiar pliku musi być większy od 0'),
  type: z
    .string()
    .refine(isAllowedMimeType, `Niedozwolony typ pliku. Dozwolone: ${ALLOWED_MIME_TYPES.join(', ')}`),
});

export function createUploadValidation(data: { name: string; size: number; type: string }) {
  const maxSize = getMaxSizeForMime(data.type);
  const maxSizeMB = maxSize / (1024 * 1024);
  
  if (data.size > maxSize) {
    return {
      valid: false,
      error: `Plik "${data.name}" jest zbyt duży. Maksymalny rozmiar: ${maxSizeMB}MB`,
    };
  }
  
  return { valid: true };
}

export const renameFileSchema = z.object({
  oldName: z
    .string()
    .min(1, 'Stara nazwa jest wymagana')
    .max(255, 'Nazwa jest zbyt długa'),
  newName: z
    .string()
    .min(1, 'Nowa nazwa jest wymagana')
    .max(255, 'Nazwa jest zbyt długa')
    .refine(
      (name) => !/[<>:"/\\|?*]/.test(name),
      'Nazwa pliku zawiera niedozwolone znaki'
    )
    .refine(
      (name) => {
        const ext = getExtensionFromFilename(name);
        return isAllowedExtension(ext);
      },
      `Niedozwolone rozszerzenie. Dozwolone: ${ALLOWED_EXTENSIONS.join(', ')}`
    ),
});

export const realizationSchema = z.object({
  title: z.object({
    pl: z.string().min(1, 'Tytuł w języku polskim jest wymagany').max(255),
    en: z.string().min(1, 'Title in English is required').max(255),
  }),
  description: z.object({
    pl: z.string().min(1, 'Opis w języku polskim jest wymagany').max(5000),
    en: z.string().min(1, 'Description in English is required').max(5000),
  }),
  files: z.array(
    z.object({
      name: z.string().min(1),
      type: z.enum(['image', 'video', 'other']),
    })
  ).min(1, 'Wymagany jest przynajmniej jeden plik'),
});

export type AllowedExtension = typeof ALLOWED_EXTENSIONS[number];
export type AllowedMimeType = typeof ALLOWED_MIME_TYPES[number];
