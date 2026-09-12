import { View } from 'react-native';
import { Image } from 'expo-image';
import { Text } from 'heroui-native';
import { X } from 'lucide-react-native';

import { Tappable } from '@/components/ui/Tappable';
import { PHOTO_SLOTS } from '@/lib/options';
import { palette } from '@/lib/theme';
import type { GarmentPhoto, PhotoSlot } from '@/lib/types';
import { cn } from '@/lib/utils';

type PhotoPreviewCardProps = {
  photo: GarmentPhoto;
  index: number;
  onSlotChange: (slot: PhotoSlot) => void;
  onRemove: () => void;
};

/** Uploaded photo with its Front / Back / Detail role. */
export function PhotoPreviewCard({ photo, index, onSlotChange, onRemove }: PhotoPreviewCardProps) {
  return (
    <View className="border-border bg-surface flex-row gap-3.5 rounded-[20px] border p-3">
      <Image
        source={{ uri: photo.uri }}
        style={{ width: 68, height: 88, borderRadius: 14 }}
        contentFit="cover"
        transition={200}
      />

      <View className="flex-1 justify-between gap-2.5">
        <View className="flex-row items-start justify-between">
          <View className="gap-0.5">
            <Text className="text-foreground text-[13px]">Photo {index + 1}</Text>
            <Text className="text-muted text-[11px]">
              {photo.width} × {photo.height}
            </Text>
          </View>

          <Tappable
            accessibilityRole="button"
            accessibilityLabel={`Remove photo ${index + 1}`}
            onPress={onRemove}
            scaleTo={0.9}
            className="bg-ivory-deep h-7 w-7 items-center justify-center rounded-full"
          >
            <X color={palette.charcoalSoft} size={13} />
          </Tappable>
        </View>

        <View className="flex-row gap-1.5">
          {PHOTO_SLOTS.map((slot) => {
            const selected = photo.slot === slot.id;
            return (
              <Tappable
                key={slot.id}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                onPress={() => onSlotChange(slot.id)}
                scaleTo={0.94}
                className={cn(
                  'rounded-full border px-3 py-1.5',
                  selected ? 'border-blush bg-blush-mist' : 'border-border bg-surface',
                )}
              >
                <Text
                  className={cn('text-[11px]', selected ? 'text-foreground' : 'text-charcoal-soft')}
                >
                  {slot.label}
                </Text>
              </Tappable>
            );
          })}
        </View>
      </View>
    </View>
  );
}
