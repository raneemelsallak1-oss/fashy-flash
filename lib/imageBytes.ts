import { File } from 'expo-file-system';

/**
 * Raw image data ready to upload. React Native's fetch cannot send a Blob or
 * FormData body reliably, so storage uploads carry an ArrayBuffer.
 */
export type ImageBytes = { data: ArrayBuffer; contentType: string };

const MIME_BY_EXTENSION: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.heic': 'image/heic',
  '.heif': 'image/heic',
};

const UNREADABLE = 'That photo could not be read from your device. Try picking it again.';

/**
 * Native: reads a picked photo off the file system. The picker hands back a
 * `file://` URI, which `fetch` cannot turn into bytes on React Native.
 */
export async function readImageBytes(uri: string): Promise<ImageBytes> {
  if (/^https?:\/\//i.test(uri)) {
    const response = await fetch(uri);
    if (!response.ok) throw new Error(UNREADABLE);
    return {
      data: await response.arrayBuffer(),
      contentType: response.headers.get('content-type') ?? 'image/jpeg',
    };
  }

  try {
    const file = new File(uri);
    return {
      data: await file.arrayBuffer(),
      contentType: MIME_BY_EXTENSION[file.extension.toLowerCase()] ?? 'image/jpeg',
    };
  } catch {
    throw new Error(UNREADABLE);
  }
}
