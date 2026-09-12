import { View } from 'react-native';
import { Text } from 'heroui-native';

import { cn } from '@/lib/utils';

type ScreenTitleProps = {
  eyebrow?: string;
  title: string;
  support?: string;
  className?: string;
};

/** Editorial page title block: small tracked eyebrow, serif heading, quiet support copy. */
export function ScreenTitle({ eyebrow, title, support, className }: ScreenTitleProps) {
  return (
    <View className={cn('gap-2', className)}>
      {eyebrow ? (
        <Text className="text-blush text-[11px] tracking-[2px] uppercase">{eyebrow}</Text>
      ) : null}
      <Text className="font-display-medium text-foreground text-[30px] leading-[36px]">
        {title}
      </Text>
      {support ? (
        <Text className="text-charcoal-soft text-[15px] leading-[22px]">{support}</Text>
      ) : null}
    </View>
  );
}

type SectionLabelProps = {
  label: string;
  hint?: string;
  className?: string;
};

/** Small caps section divider used inside the style and export screens. */
export function SectionLabel({ label, hint, className }: SectionLabelProps) {
  return (
    <View className={cn('flex-row items-end justify-between', className)}>
      <Text className="text-foreground text-[12px] tracking-[1.8px] uppercase">{label}</Text>
      {hint ? <Text className="text-muted text-[12px]">{hint}</Text> : null}
    </View>
  );
}
