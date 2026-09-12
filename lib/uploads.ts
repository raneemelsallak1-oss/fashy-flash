import { bilt } from '@/lib/bilt';
import { readImageBytes } from '@/lib/imageBytes';

const BUCKET = 'garments';
const MAX_BYTES = 20 * 1024 * 1024;

const EXTENSION_BY_MIME: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/heic': 'heic',
};

/**
 * Uploads in flight or finished, keyed by local photo URI. The renderer needs a
 * URL it can fetch, and several outputs are built from the same photo, so each
 * file is only ever sent once per session.
 */
const uploads = new Map<string, Promise<string>>();

function friendlyUploadError(message: string): string {
  const detail = message.toLowerCase();

  if (detail.includes('exceeded the maximum allowed size') || detail.includes('too large')) {
    return 'That photo is larger than 20 MB. Use a smaller version.';
  }
  if (detail.includes('mime type') || detail.includes('content type')) {
    return 'That file type is not supported. Use a JPEG, PNG or WebP photo.';
  }
  return 'Your photo could not be uploaded. Check your connection and try again.';
}

async function performUpload(projectId: string, photoId: string, uri: string): Promise<string> {
  const { data: bytes, contentType } = await readImageBytes(uri);

  if (bytes.byteLength > MAX_BYTES) {
    throw new Error('That photo is larger than 20 MB. Use a smaller version.');
  }

  const extension = EXTENSION_BY_MIME[contentType.split(';')[0]?.trim() ?? ''] ?? 'jpg';
  const path = `${projectId}/${photoId}.${extension}`;

  const { error } = await bilt.storage.from(BUCKET).upload(path, bytes, {
    contentType,
    upsert: true,
  });
  if (error) throw new Error(friendlyUploadError(error.message));

  const { data } = bilt.storage.from(BUCKET).getPublicUrl(path);
  if (!data.publicUrl) {
    throw new Error('Your photo was uploaded but could not be shared with the renderer.');
  }

  return data.publicUrl;
}

/**
 * Puts one uploaded garment photo in storage and returns its public URL, which
 * is what the on-model renderer fetches. Repeat calls for the same photo share
 * the first upload; a failed upload is forgotten so a retry can start over.
 */
export function uploadGarmentPhoto(
  projectId: string,
  photo: { id: string; uri: string },
): Promise<string> {
  if (/^https?:\/\//i.test(photo.uri)) return Promise.resolve(photo.uri);

  const existing = uploads.get(photo.uri);
  if (existing) return existing;

  const task = performUpload(projectId, photo.id, photo.uri).catch((error: unknown) => {
    uploads.delete(photo.uri);
    throw error;
  });

  uploads.set(photo.uri, task);
  return task;
}
