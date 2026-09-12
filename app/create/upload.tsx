import { ScrollView, View } from 'react-native';
import { router } from 'expo-router';
import { Text } from 'heroui-native';
import { Check } from 'lucide-react-native';

import { FlowHeader } from '@/components/flow/FlowHeader';
import { NoDraft } from '@/components/flow/NoDraft';
import { PrimaryButton } from '@/components/ui/ActionButton';
import { FooterBar } from '@/components/ui/FooterBar';
import { ScreenTitle } from '@/components/ui/ScreenTitle';
import { DropZone } from '@/components/upload/DropZone';
import { PhotoPreviewCard } from '@/components/upload/PhotoPreviewCard';
import { pickGarmentPhotos } from '@/lib/picker';
import { useAppStore } from '@/lib/store';
import { palette } from '@/lib/theme';

const TIPS = [
  'Shoot on a plain, light background',
  'Use daylight or soft even light',
  'Include one detail shot of the fabric',
];

const MAX_PHOTOS = 3;

export default function UploadScreen() {
  const draft = useAppStore((state) => state.draft);
  const addPhotos = useAppStore((state) => state.addPhotos);
  const setPhotoSlot = useAppStore((state) => state.setPhotoSlot);
  const removePhoto = useAppStore((state) => state.removePhoto);

  if (!draft) return <NoDraft />;

  const photos = draft.photos;
  const remaining = MAX_PHOTOS - photos.length;
  const isFull = remaining <= 0;

  const browse = async () => {
    if (isFull) return;
    const picked = await pickGarmentPhotos(remaining);
    if (picked.length > 0) addPhotos(picked.slice(0, remaining));
  };

  return (
    <View className="bg-ivory flex-1">
      <FlowHeader step="upload" />

      <ScrollView
        className="flex-1"
        contentContainerClassName="px-5 pt-6 pb-8 gap-6"
        showsVerticalScrollIndicator={false}
      >
        <ScreenTitle
          eyebrow="Step one"
          title="Upload your garment"
          support="Upload 2–3 clear photos for the best results."
        />

        <DropZone
          onBrowse={() => void browse()}
          onDropFiles={(picked) => addPhotos(picked.slice(0, remaining))}
          isDisabled={isFull}
        />

        {photos.length > 0 ? (
          <View className="gap-3">
            <View className="flex-row items-center justify-between">
              <Text className="text-foreground text-[12px] tracking-[1.8px] uppercase">
                Your photos
              </Text>
              <Text className="text-muted text-[12px]">
                {photos.length} of {MAX_PHOTOS}
              </Text>
            </View>

            <Text className="text-charcoal-soft text-[13px] leading-[19px]">
              Tag each photo so the AI knows what it is looking at.
            </Text>

            <View className="gap-2.5">
              {photos.map((photo, index) => (
                <PhotoPreviewCard
                  key={photo.id}
                  photo={photo}
                  index={index}
                  onSlotChange={(slot) => setPhotoSlot(photo.id, slot)}
                  onRemove={() => removePhoto(photo.id)}
                />
              ))}
            </View>
          </View>
        ) : null}

        <View className="bg-ivory-deep gap-2.5 rounded-[20px] px-4 py-4">
          <Text className="text-charcoal-soft text-[12px] tracking-[1.8px] uppercase">
            What works best
          </Text>
          {TIPS.map((tip) => (
            <View key={tip} className="flex-row items-center gap-2.5">
              <Check color={palette.blush} size={13} strokeWidth={2.4} />
              <Text className="text-charcoal-soft text-[13px]">{tip}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      <FooterBar>
        {photos.length === 1 ? (
          <Text className="text-muted pb-1 text-center text-[12px]">
            Add one more photo for noticeably better results.
          </Text>
        ) : null}
        <PrimaryButton
          label="Continue"
          isDisabled={photos.length === 0}
          onPress={() => router.push('/create/product')}
        />
      </FooterBar>
    </View>
  );
}
