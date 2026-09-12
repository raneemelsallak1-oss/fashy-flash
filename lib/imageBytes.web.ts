import type { ImageBytes } from '@/lib/imageBytes';

const UNREADABLE = 'That photo could not be read. Try choosing it again.';

/** Web: object URLs, data URLs and remote URLs all read back through fetch. */
export async function readImageBytes(uri: string): Promise<ImageBytes> {
  const response = await fetch(uri);
  if (!response.ok) throw new Error(UNREADABLE);

  const blob = await response.blob();
  if (blob.size === 0) throw new Error(UNREADABLE);

  return {
    data: await blob.arrayBuffer(),
    contentType: blob.type || 'image/jpeg',
  };
}
