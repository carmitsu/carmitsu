import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, ListObjectsV2Command, HeadObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { logger } from '@/lib/logger';

const s3Client = new S3Client({
  region: 'eu-west-1',
  endpoint: process.env.S3_ENDPOINT,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY!,
    secretAccessKey: process.env.S3_SECRET_KEY!,
  },
  forcePathStyle: true,
});

const BUCKET = process.env.S3_BUCKET || 'realizations';

export { s3Client, BUCKET };

function buildS3Key(fileName: string): string {
  if (fileName.startsWith(`${BUCKET}/`)) {
    return fileName.replace(`${BUCKET}/`, '');
  }
  return fileName;
}

export async function listFiles() {
  const command = new ListObjectsV2Command({
    Bucket: BUCKET,
  });
  const response = await s3Client.send(command);
  const files = response.Contents || [];
  
  return files
    .filter((file) => {
      const key = file.Key || '';
      const size = file.Size || 0;
      return size > 0 && !key.endsWith('/');
    })
    .map((file) => {
      const fullKey = file.Key!;
      const cleanName = fullKey.startsWith(`${BUCKET}/`) 
        ? fullKey.replace(`${BUCKET}/`, '')
        : fullKey;
      return {
        ...file,
        Key: cleanName,
        name: cleanName,
      };
    });
}

export async function uploadFile(fileName: string, file: Buffer | Blob, contentType?: string) {
  const key = buildS3Key(fileName);
  logger.debug('Uploading file', { operation: 's3-upload', key, fileName });
  
  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    Body: file,
    ContentType: contentType,
  });
  await s3Client.send(command);
  return getFileUrl(fileName);
}

export async function fileExists(fileName: string): Promise<boolean> {
  const key = buildS3Key(fileName);
  try {
    const command = new HeadObjectCommand({ Bucket: BUCKET, Key: key });
    await s3Client.send(command);
    return true;
  } catch (error: any) {
    if (error.name === 'NotFound' || error.$metadata?.httpStatusCode === 404) {
      return false;
    }
    throw error;
  }
}

export async function deleteFile(fileName: string): Promise<void> {
  const key = buildS3Key(fileName);
  logger.debug('Deleting file', { operation: 's3-delete', key, fileName });
  
  const command = new DeleteObjectCommand({
    Bucket: BUCKET,
    Key: key,
  });
  await s3Client.send(command);
}

export async function deleteFiles(fileNames: string[]) {
  for (const fileName of fileNames) {
    try {
      await deleteFile(fileName);
    } catch (err) {
      logger.error(`Error deleting ${fileName}:`, { error: String(err) });
    }
  }
}

export async function getFileUrl(fileName: string): Promise<string> {
  const key = buildS3Key(fileName);
  const command = new GetObjectCommand({
    Bucket: BUCKET,
    Key: key,
  });
  return getSignedUrl(s3Client, command, { expiresIn: 3600 });
}

export function getPublicUrl(fileName: string): string {
  const baseUrl = process.env.S3_PUBLIC_URL || 
    process.env.S3_ENDPOINT?.replace('/storage/v1/s3', '') || 
    'https://pnxgazfljyrlmsrzdzgm.storage.supabase.co';
  
  if (fileName.startsWith(`${BUCKET}/`)) {
    fileName = fileName.replace(`${BUCKET}/`, '');
  }
  
  return `${baseUrl}/storage/v1/object/public/${BUCKET}/${encodeURIComponent(fileName)}`;
}

export async function renameFile(oldName: string, newName: string): Promise<void> {
  const oldKey = buildS3Key(oldName);
  const newKey = buildS3Key(newName);
  
  logger.debug('Starting rename', { operation: 's3-rename', oldKey, newKey });
  
  const getCommand = new GetObjectCommand({ Bucket: BUCKET, Key: oldKey });
  const response = await s3Client.send(getCommand);
  
  const bodyContents = await response.Body?.transformToByteArray();
  if (!bodyContents) throw new Error('Failed to download file contents');
  
  const putCommand = new PutObjectCommand({
    Bucket: BUCKET,
    Key: newKey,
    Body: bodyContents,
    ContentType: response.ContentType,
  });
  await s3Client.send(putCommand);
  
  logger.debug('New file created, deleting old', { operation: 's3-rename', oldKey });
  
  const deleteCommand = new DeleteObjectCommand({ Bucket: BUCKET, Key: oldKey });
  await s3Client.send(deleteCommand);
  
  logger.info('Rename completed', { operation: 's3-rename', oldName, newName });
}
