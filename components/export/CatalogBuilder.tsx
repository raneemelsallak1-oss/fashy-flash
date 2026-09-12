import { View } from 'react-native';
import { Text } from 'heroui-native';
import { Check, Eye } from 'lucide-react-native';

import { CatalogPhoto } from '@/components/catalog/CatalogPhoto';
import { SecondaryButton } from '@/components/ui/ActionButton';
import { CheckBadge } from '@/components/ui/SelectionCard';
import { Tappable } from '@/components/ui/Tappable';
import type { CatalogGroup, Colorway } from '@/lib/catalog';
import { palette } from '@/lib/theme';
import { cn } from '@/lib/utils';

type ColorwayChipProps = {
  colorway: Colorway;
  selected: boolean;
  onPress: () => void;
};

function ColorwayChip({ colorway, selected, onPress }: ColorwayChipProps) {
  return (
    <Tappable
      accessibilityRole="checkbox"
      accessibilityLabel={`${colorway.label} colorway`}
      accessibilityState={{ checked: selected }}
      onPress={onPress}
      scaleTo={0.96}
      className={cn(
        'bg-surface flex-row items-center gap-2 rounded-full border py-2 pr-3.5 pl-2',
        selected ? 'border-blush' : 'border-border',
      )}
    >
      <View
        className="border-border h-6 w-6 items-center justify-center rounded-full border"
        style={{ backgroundColor: colorway.hex }}
      >
        {selected ? <Check color={palette.white} size={12} strokeWidth={3} /> : null}
      </View>
      <Text className={cn('text-[13px]', selected ? 'text-foreground' : 'text-charcoal-soft')}>
        {colorway.label}
      </Text>
      {colorway.isBase ? <Text className="text-muted text-[10px]">photographed</Text> : null}
    </Tappable>
  );
}

type CatalogBuilderProps = {
  groups: CatalogGroup[];
  selectedImageIds: string[];
  colorways: Colorway[];
  selectedColorwayIds: string[];
  /** Product fields printed on the specification page. */
  dataLines: { label: string; value: string }[];
  tileWidth: number;
  onToggleImage: (imageId: string) => void;
  onToggleColorway: (colorwayId: string) => void;
  onPreview: () => void;
};

/**
 * Content picker shown once Digital Catalog PDF is selected: which garment
 * views and color variations go into the catalog, plus the preview entry point.
 */
export function CatalogBuilder({
  groups,
  selectedImageIds,
  colorways,
  selectedColorwayIds,
  dataLines,
  tileWidth,
  onToggleImage,
  onToggleColorway,
  onPreview,
}: CatalogBuilderProps) {
  const imageCount = selectedImageIds.length;

  return (
    <View className="border-blush/30 bg-blush-mist/70 gap-5 rounded-[22px] border p-4">
      <View className="gap-1">
        <Text className="text-blush text-[10px] tracking-[2px] uppercase">Catalog contents</Text>
        <Text className="text-charcoal-soft text-[13px] leading-[19px]">
          Choose the garment views and color variations to include. Product data is added
          automatically.
        </Text>
      </View>

      {groups.map((group) => (
        <View key={group.id} className="gap-2.5">
          <View className="flex-row items-end justify-between gap-3">
            <Text className="text-foreground text-[11px] tracking-[1.6px] uppercase">
              {group.label}
            </Text>
            <Text numberOfLines={1} className="text-muted shrink text-[11px]">
              {group.hint}
            </Text>
          </View>

          {group.images.length === 0 ? (
            <View className="border-border bg-surface/70 rounded-[14px] border border-dashed px-3.5 py-3">
              <Text className="text-muted text-[12px] leading-[17px]">{group.empty}</Text>
            </View>
          ) : (
            <View className="flex-row flex-wrap gap-2.5">
              {group.images.map((image) => {
                const selected = selectedImageIds.includes(image.id);
                return (
                  <Tappable
                    key={image.id}
                    accessibilityRole="checkbox"
                    accessibilityLabel={image.label}
                    accessibilityState={{ checked: selected }}
                    onPress={() => onToggleImage(image.id)}
                    scaleTo={0.95}
                    style={{ width: tileWidth }}
                    className={cn(
                      'bg-surface overflow-hidden rounded-[14px] border',
                      selected ? 'border-blush' : 'border-border',
                    )}
                  >
                    <View className="relative">
                      <CatalogPhoto image={image} aspect={3 / 4} rounded="rounded-none" />
                      <CheckBadge
                        selected={selected}
                        className="absolute top-1.5 right-1.5 h-5 w-5"
                      />
                    </View>
                    <Text
                      numberOfLines={1}
                      className={cn(
                        'px-2 py-1.5 text-[11px]',
                        selected ? 'text-foreground' : 'text-muted',
                      )}
                    >
                      {image.label}
                    </Text>
                  </Tappable>
                );
              })}
            </View>
          )}
        </View>
      ))}

      <View className="gap-2.5">
        <View className="flex-row items-end justify-between">
          <Text className="text-foreground text-[11px] tracking-[1.6px] uppercase">
            Color variations
          </Text>
          <Text className="text-muted text-[11px]">{selectedColorwayIds.length} included</Text>
        </View>
        <View className="flex-row flex-wrap gap-2">
          {colorways.map((colorway) => (
            <ColorwayChip
              key={colorway.id}
              colorway={colorway}
              selected={selectedColorwayIds.includes(colorway.id)}
              onPress={() => onToggleColorway(colorway.id)}
            />
          ))}
        </View>
      </View>

      <View className="border-border/70 bg-surface/80 gap-2 rounded-[16px] border px-3.5 py-3">
        <Text className="text-foreground text-[11px] tracking-[1.6px] uppercase">
          Product data included
        </Text>
        {dataLines.map((line) => (
          <View key={line.label} className="flex-row items-center justify-between gap-3">
            <Text className="text-muted text-[12px]">{line.label}</Text>
            <Text numberOfLines={1} className="text-charcoal-soft max-w-[62%] text-[12px]">
              {line.value}
            </Text>
          </View>
        ))}
      </View>

      <View className="gap-2">
        <SecondaryButton
          label="Preview Catalog"
          isDisabled={imageCount === 0}
          onPress={onPreview}
          icon={<Eye color={palette.charcoal} size={16} />}
        />
        {imageCount === 0 ? (
          <Text className="text-muted text-center text-[11px]">
            Pick at least one garment image for the catalog.
          </Text>
        ) : null}
      </View>
    </View>
  );
}
