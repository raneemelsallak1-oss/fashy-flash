import type { ImageSourcePropType } from 'react-native';

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
