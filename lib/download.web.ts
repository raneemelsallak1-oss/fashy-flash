import { Image } from 'react-native';

import type { DownloadItem } from '@/lib/download';

/** Web: hand each generated file to the browser as a real download. */
export async function downloadAssetFiles(items: DownloadItem[]): Promise<number> {
  let saved = 0;

  for (const item of items) {
    const resolved = Image.resolveAssetSource(item.source);
    if (!resolved?.uri) continue;

    const link = document.createElement('a');
    link.href = resolved.uri;
    link.download = item.fileName;
    link.rel = 'noopener';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    saved += 1;

    await new Promise((resolve) => setTimeout(resolve, 180));
  }

  return saved;
}
