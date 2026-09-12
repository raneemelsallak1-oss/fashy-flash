import * as ImagePicker from 'expo-image-picker';

export type PickedPhoto = { uri: string; width: number; height: number };

/**
 * Opens the system library for garment photos. Multiple selection is allowed
 * because a product usually needs front, back and a detail shot.
 */
export async function pickGarmentPhotos(limit = 3): Promise<PickedPhoto[]> {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) return [];

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsMultipleSelection: true,
    selectionLimit: limit,
    quality: 0.9,
  });

  if (result.canceled) return [];

  return result.assets.map((asset) => ({
    uri: asset.uri,
    width: asset.width,
    height: asset.height,
  }));
}
