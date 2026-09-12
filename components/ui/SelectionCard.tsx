import type { ReactNode } from 'react';
import { View } from 'react-native';
import { Image } from 'expo-image';
import { Text } from 'heroui-native';
import { Check } from 'lucide-react-native';
import type { ImageSourcePropType } from 'react-native';

import { Tappable } from '@/components/ui/Tappable';
import { palette } from '@/lib/theme';
import { cn } from '@/lib/utils';

type CheckBadgeProps = {
  selected: boolean;
  className?: string;
};

export function CheckBadge({ selected, className }: CheckBadgeProps) {
  return (
    <View
      className={cn(
        'h-6 w-6 items-center justify-center rounded-full border',
        selected ? 'border-blush bg-blush' : 'border-border bg-surface/90',
        className,
      )}
    >
      {selected ? <Check color={palette.white} size={14} strokeWidth={2.6} /> : null}
    </View>
  );
}

type SelectionCardProps = {
  label: string;
  hint?: string;
  image?: ImageSourcePropType;
  icon?: ReactNode;
  aspect?: number;
  selected: boolean;
  onPress: () => void;
  className?: string;
  /** Fixed tile width, used inside grids and horizontal rails. */
  width?: number;
};

/**
 * Image-led selection tile used for model, style and background choices.
 * Falls back to an icon plate when no preview image is supplied.
 */
export function SelectionCard({
  label,
  hint,
  image,
  icon,
  aspect = 3 / 4,
  selected,
  onPress,
  className,
  width,
}: SelectionCardProps) {
  return (
    <Tappable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected }}
      onPress={onPress}
      style={width === undefined ? undefined : { width }}
      className={cn(
        'bg-surface overflow-hidden rounded-[20px] border',
        selected ? 'border-blush' : 'border-border',
        className,
      )}
    >
      <View className="bg-ivory-deep relative" style={{ aspectRatio: aspect }}>
        {image ? (
          <Image
            source={image}
            style={{ width: '100%', height: '100%' }}
            contentFit="cover"
            transition={220}
          />
        ) : (
          <View className="flex-1 items-center justify-center">{icon}</View>
        )}
        {selected ? <CheckBadge selected className="absolute top-2 right-2" /> : null}
      </View>

      <View className="gap-0.5 px-3 py-2.5">
        <Text
          className={cn(
            'text-[13px] leading-[17px]',
            selected ? 'text-foreground' : 'text-charcoal-soft',
          )}
        >
          {label}
        </Text>
        {hint ? <Text className="text-muted text-[11px] leading-[15px]">{hint}</Text> : null}
      </View>
    </Tappable>
  );
}

type PillToggleProps = {
  label: string;
  selected: boolean;
  onPress: () => void;
};

/** Multi-select pill, used for content purpose and asset filters. */
export function PillToggle({ label, selected, onPress }: PillToggleProps) {
  return (
    <Tappable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      scaleTo={0.96}
      className={cn(
        'flex-row items-center gap-2 rounded-full border px-4 py-2.5',
        selected ? 'border-blush bg-blush-mist' : 'border-border bg-surface',
      )}
    >
      {selected ? (
        <View className="bg-blush h-4 w-4 items-center justify-center rounded-full">
          <Check color={palette.white} size={11} strokeWidth={3} />
        </View>
      ) : null}
      <Text className={cn('text-[13px]', selected ? 'text-foreground' : 'text-charcoal-soft')}>
        {label}
      </Text>
    </Tappable>
  );
}
