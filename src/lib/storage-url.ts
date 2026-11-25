const DEFAULT_BUCKET = 'realizations';
const DEFAULT_STORAGE_BASE_URL = 'https://pnxgazfljyrlmsrzdzgm.storage.supabase.co';

export function getPublicUrl(fileName: string): string {
  const bucket = process.env.NEXT_PUBLIC_S3_BUCKET || process.env.S3_BUCKET || DEFAULT_BUCKET;
  const baseUrl =
    process.env.NEXT_PUBLIC_S3_PUBLIC_URL ||
    process.env.S3_PUBLIC_URL ||
    process.env.S3_ENDPOINT?.replace('/storage/v1/s3', '') ||
    DEFAULT_STORAGE_BASE_URL;

  const cleanName = fileName.startsWith(`${bucket}/`)
    ? fileName.replace(`${bucket}/`, '')
    : fileName;

  return `${baseUrl}/storage/v1/object/public/${bucket}/${encodeURIComponent(cleanName)}`;
}
