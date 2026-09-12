import { View } from 'react-native';
import { Text } from 'heroui-native';
import { Check } from 'lucide-react-native';

import { Tappable } from '@/components/ui/Tappable';
import { palette } from '@/lib/theme';
import { cn } from '@/lib/utils';

type FormatCardProps = {
  label: string;
  spec: string;
  hint: string;
  selected: boolean;
  onPress: () => void;
};

export function FormatCard({ label, spec, hint, selected, onPress }: FormatCardProps) {
  return (
    <Tappable
      accessibilityRole="checkbox"
      accessibilityLabel={label}
      accessibilityState={{ checked: selected }}
      onPress={onPress}
      scaleTo={0.985}
      className={cn(
        'flex-row items-center gap-3.5 rounded-[20px] border px-4 py-4',
        selected ? 'border-blush bg-blush-mist' : 'border-border bg-surface',
      )}
    >
      <View className="flex-1 gap-1">
        <Text className="font-display-medium text-foreground text-[17px] leading-[21px]">
          {label}
        </Text>
        <Text className="text-charcoal-soft text-[12px]">{spec}</Text>
        <Text className="text-muted text-[11px]">{hint}</Text>
      </View>

      <View
        className={cn(
          'h-6 w-6 items-center justify-center rounded-full border',
          selected ? 'border-blush bg-blush' : 'border-border bg-surface',
        )}
      >
        {selected ? <Check color={palette.white} size={13} strokeWidth={3} /> : null}
      </View>
    </Tappable>
  );
}
