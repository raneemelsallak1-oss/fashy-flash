import { View } from 'react-native';
import { Text } from 'heroui-native';
import { Check, Heart } from 'lucide-react-native';

import { AssetImage } from '@/components/ui/AssetImage';
import { Tappable } from '@/components/ui/Tappable';
import { palette } from '@/lib/theme';
import type { GeneratedAsset } from '@/lib/types';
import { cn } from '@/lib/utils';

const CATEGORY_LABEL: Record<GeneratedAsset['category'], string> = {
  ecommerce: 'E-commerce',
  social: 'Social',
  catalog: 'Catalog',
};

type AssetTileProps = {
  asset: GeneratedAsset;
  width: number;
  isSelected: boolean;
  onOpen: () => void;
  onToggleSelect: () => void;
  onToggleFavorite: () => void;
};

export function AssetTile({
  asset,
  width,
  isSelected,
  onOpen,
  onToggleSelect,
  onToggleFavorite,
}: AssetTileProps) {
  return (
    <View style={{ width }} className="gap-2">
      <Tappable
        accessibilityRole="button"
        accessibilityLabel={`Preview ${asset.title}`}
        onPress={onOpen}
        scaleTo={0.98}
        className={cn(
          'overflow-hidden rounded-[20px] border',
          isSelected ? 'border-blush' : 'border-border',
        )}
      >
        <AssetImage asset={asset} width={width - 2} aspect={3 / 4} rounded="rounded-[18px]" />

        <Tappable
          accessibilityRole="checkbox"
          accessibilityLabel={`Select ${asset.title}`}
          accessibilityState={{ checked: isSelected }}
          onPress={onToggleSelect}
          scaleTo={0.88}
          className="absolute top-2 left-2 h-7 w-7 items-center justify-center rounded-full"
        >
          <View
            className={cn(
              'h-6 w-6 items-center justify-center rounded-full border',
              isSelected ? 'border-blush bg-blush' : 'border-border bg-ivory/90',
            )}
          >
            {isSelected ? <Check color={palette.white} size={13} strokeWidth={3} /> : null}
          </View>
        </Tappable>

        <Tappable
          accessibilityRole="button"
          accessibilityLabel={`Favorite ${asset.title}`}
          accessibilityState={{ selected: asset.isFavorite }}
          onPress={onToggleFavorite}
          scaleTo={0.88}
          className="bg-ivory/90 absolute top-2 right-2 h-7 w-7 items-center justify-center rounded-full"
        >
          <Heart
            color={asset.isFavorite ? palette.blush : palette.charcoalSoft}
            fill={asset.isFavorite ? palette.blush : 'transparent'}
            size={13}
          />
        </Tappable>

        {asset.isApproved ? (
          <View className="bg-charcoal/85 absolute bottom-2 left-2 rounded-full px-2.5 py-1">
            <Text className="text-ivory text-[10px] tracking-[1.2px] uppercase">Approved</Text>
          </View>
        ) : null}
      </Tappable>

      <View className="gap-0.5">
        <Text className="text-foreground text-[13px] leading-[17px]">{asset.title}</Text>
        <Text className="text-muted text-[11px]">{CATEGORY_LABEL[asset.category]}</Text>
      </View>
    </View>
  );
}
