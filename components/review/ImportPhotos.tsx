import { View } from 'react-native';
import { Text } from 'heroui-native';

import { SectionLabel } from '@/components/ui/ScreenTitle';
import { DropZone } from '@/components/upload/DropZone';
import { pickGarmentPhotos, type PickedPhoto } from '@/lib/picker';

type ImportPhotosProps = {
  /** How many photos have already been imported into this project. */
  count: number;
  onAdd: (photos: PickedPhoto[]) => void;
};

const IMPORT_LIMIT = 10;

/**
 * Brings finished photos made outside the app into the project. They join the
 * generated set untouched, so review, favorites, export and the catalog all
 * treat them like any other visual.
 */
export function ImportPhotos({ count, onAdd }: ImportPhotosProps) {
  const browse = async () => {
    const picked = await pickGarmentPhotos(IMPORT_LIMIT);
    if (picked.length > 0) onAdd(picked);
  };

  return (
    <View className="gap-3">
      <SectionLabel label="Your own photos" hint={count > 0 ? `${count} imported` : 'Optional'} />

      <Text className="text-muted text-[13px] leading-[19px]">
        Shot or generated something elsewhere? Add it here and it joins this set as-is — ready to
        favorite, export and place in the catalog.
      </Text>

      <DropZone
        onBrowse={() => void browse()}
        onDropFiles={onAdd}
        title="Drop finished photos here"
        hint="JPG or PNG · added exactly as supplied"
        actionLabel="Choose Photos"
      />
    </View>
  );
}
