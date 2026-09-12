import { View } from 'react-native';
import { Text } from 'heroui-native';

import { FLOW_STEPS } from '@/lib/options';
import type { FlowStep } from '@/lib/types';
import { cn } from '@/lib/utils';

type StepProgressProps = {
  current: FlowStep;
  className?: string;
};

/** Segmented indicator: Upload → Product Data → Style → Generate → Review → Export. */
export function StepProgress({ current, className }: StepProgressProps) {
  const index = FLOW_STEPS.findIndex((step) => step.id === current);
  const step = FLOW_STEPS[index];

  return (
    <View className={cn('gap-2', className)}>
      <View className="flex-row items-center gap-1.5">
        {FLOW_STEPS.map((item, itemIndex) => (
          <View
            key={item.id}
            className={cn(
              'h-[3px] flex-1 rounded-full',
              itemIndex < index && 'bg-blush/45',
              itemIndex === index && 'bg-blush',
              itemIndex > index && 'bg-sand',
            )}
          />
        ))}
      </View>
      <View className="flex-row items-center justify-between">
        <Text className="text-muted text-[11px] tracking-[1.6px] uppercase">
          Step {index + 1} of {FLOW_STEPS.length}
        </Text>
        <Text className="text-charcoal-soft text-[11px] tracking-[1.6px] uppercase">
          {step?.label ?? ''}
        </Text>
      </View>
    </View>
  );
}
