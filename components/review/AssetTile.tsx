import { View } from 'react-native';
import { Spinner, Text } from 'heroui-native';
import { Check, Heart, Sparkles } from 'lucide-react-native';

import { AssetImage } from '@/components/ui/AssetImage';
import { Tappable } from '@/components/ui/Tappable';
import { hasAiImage, VARIATION_LABEL } from '@/lib/generation';
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
  const isGenerating = asset.renderStatus === 'pending';
  const isAiImage = hasAiImage(asset);

  return (
    <View style={{ width }} className="gap-2">
      {/* The card and its overlay controls are siblings so no pressable nests
          inside another pressable (invalid <button> nesting on web). */}
      <View
        className={cn(
          'relative overflow-hidden rounded-[20px] border',
          isSelected ? 'border-blush' : 'border-border',
        )}
      >
        <Tappable
          accessibilityRole="button"
          accessibilityLabel={`Preview ${asset.title}`}
          onPress={onOpen}
          scaleTo={0.98}
        >
          <AssetImage asset={asset} width={width - 2} aspect={3 / 4} rounded="rounded-[18px]" />

          {isGenerating ? (
            <View className="bg-ivory/80 absolute inset-0 items-center justify-center gap-2">
              <Spinner color={palette.blush} />
              <Text className="text-charcoal-soft text-[10px] tracking-[1.2px] uppercase">
                Generating
              </Text>
            </View>
          ) : null}

          {isAiImage && !asset.isApproved ? (
            <View className="bg-ivory/90 absolute bottom-2 left-2 flex-row items-center gap-1 rounded-full px-2 py-1">
              <Sparkles color={palette.blush} size={10} />
              <Text className="text-charcoal-soft text-[10px] tracking-[1.2px] uppercase">
                AI image
              </Text>
            </View>
          ) : null}

          {asset.isApproved ? (
            <View className="bg-charcoal/85 absolute bottom-2 left-2 rounded-full px-2.5 py-1">
              <Text className="text-ivory text-[10px] tracking-[1.2px] uppercase">Approved</Text>
            </View>
          ) : null}
        </Tappable>

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
      </View>

      <View className="gap-0.5">
        <Text className="text-muted text-[10px] tracking-[1.4px] uppercase">
          {asset.origin === 'imported'
            ? `Imported · ${VARIATION_LABEL[asset.variation]}`
            : VARIATION_LABEL[asset.variation]}
        </Text>
        <Text className="text-foreground text-[13px] leading-[17px]">{asset.title}</Text>
        <Text className="text-muted text-[11px]" numberOfLines={1}>
          {asset.renderStatus === 'failed'
            ? 'Preview — the AI image did not arrive'
            : asset.spec || CATEGORY_LABEL[asset.category]}
        </Text>
      </View>
    </View>
  );
}
