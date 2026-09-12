import { View } from 'react-native';
import { Text } from 'heroui-native';

import { Tappable } from '@/components/ui/Tappable';
import { cn } from '@/lib/utils';
import type { AssetCategory } from '@/lib/types';

export type AssetFilter = 'all' | AssetCategory;

const FILTERS: { id: AssetFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'ecommerce', label: 'E-commerce' },
  { id: 'social', label: 'Social' },
  { id: 'catalog', label: 'Catalog' },
];

type FilterTabsProps = {
  value: AssetFilter;
  onChange: (value: AssetFilter) => void;
};

export function FilterTabs({ value, onChange }: FilterTabsProps) {
  return (
    <View className="border-border bg-surface flex-row gap-1.5 self-start rounded-full border p-1">
      {FILTERS.map((filter) => {
        const selected = filter.id === value;
        return (
          <Tappable
            key={filter.id}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            onPress={() => onChange(filter.id)}
            scaleTo={0.96}
            className={cn('rounded-full px-3.5 py-2', selected && 'bg-charcoal')}
          >
            <Text className={cn('text-[12px]', selected ? 'text-ivory' : 'text-charcoal-soft')}>
              {filter.label}
            </Text>
          </Tappable>
        );
      })}
    </View>
  );
}
