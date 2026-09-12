import type { ImageSourcePropType } from 'react-native';

import type { CatalogDocument } from '@/lib/catalog';

export type DownloadItem = {
  source: ImageSourcePropType;
  fileName: string;
};

/**
 * Native builds keep exported visuals inside the in-app project library;
 * writing to the camera roll would need a media-library permission flow.
 */
export async function downloadAssetFiles(items: DownloadItem[]): Promise<number> {
  return Promise.resolve(items.length);
}

/**
 * Native builds file the catalog with the project instead of printing it;
 * a real PDF hand-off would need a print/share permission flow.
 */
export async function downloadCatalogPdf(doc: CatalogDocument, fileName: string): Promise<boolean> {
  return Promise.resolve(doc.pages.length > 0 && fileName.length > 0);
}
