import { View } from 'react-native';
import { Text } from 'heroui-native';
import { UploadCloud } from 'lucide-react-native';

import { SecondaryButton } from '@/components/ui/ActionButton';
import { palette } from '@/lib/theme';
import { cn } from '@/lib/utils';

type DropZoneSurfaceProps = {
  isActive?: boolean;
  onBrowse: () => void;
  isDisabled?: boolean;
};

/** Shared visual for the native and web drop zones. */
export function DropZoneSurface({ isActive, onBrowse, isDisabled }: DropZoneSurfaceProps) {
  return (
    <View
      className={cn(
        'items-center gap-4 rounded-[24px] border border-dashed px-6 py-11',
        isActive ? 'border-blush bg-blush-mist' : 'border-sand bg-surface',
        isDisabled && 'opacity-50',
      )}
    >
      <View className="bg-blush-mist h-14 w-14 items-center justify-center rounded-full">
        <UploadCloud color={palette.blush} size={22} strokeWidth={1.7} />
      </View>

      <View className="gap-1.5">
        <Text className="font-display-medium text-foreground text-center text-[19px]">
          Drag &amp; drop your images here
        </Text>
        <Text className="text-muted text-center text-[13px]">JPG or PNG · up to 3 photos</Text>
      </View>

      <SecondaryButton
        label="Browse Files"
        onPress={onBrowse}
        isDisabled={isDisabled}
        className="px-7"
      />
    </View>
  );
}
