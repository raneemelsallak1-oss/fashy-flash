import { View } from 'react-native';
import { Image } from 'expo-image';
import { Text } from 'heroui-native';

import { hexForColorName } from '@/lib/color';
import { expandSizeRange } from '@/lib/catalog';
import {
  BACKGROUND_LABEL,
  MODEL_LABEL,
  PURPOSE_LABEL,
  SLOT_LABEL,
  STYLE_LABEL,
} from '@/lib/generation';
import type { Project } from '@/lib/types';
import { cn } from '@/lib/utils';

function Swatch({ hex }: { hex: string }) {
  return (
    <View
      className="border-sand rounded-full border"
      style={{ width: 12, height: 12, backgroundColor: hex }}
    />
  );
}

type Row = { label: string; value: string; hex?: string };

function summaryRows(project: Project): Row[] {
  const { product, style } = project;
  const sizes = expandSizeRange(product.sizeRange);

  return [
    { label: 'Product', value: product.name.trim() || 'Untitled piece' },
    { label: 'Category', value: product.category.trim() || 'Not set' },
    {
      label: 'Color',
      value: product.color.trim() || 'As photographed',
      hex: hexForColorName(product.color),
    },
    { label: 'Material', value: product.material.trim() || 'Not set' },
    { label: 'Fit', value: product.fit.trim() || 'Not set' },
    {
      label: 'Sizes',
      value: sizes.length > 0 ? sizes.join(' · ') : product.sizeRange.trim() || 'Not set',
    },
    { label: 'Model', value: MODEL_LABEL[style.model] },
    { label: 'Visual style', value: STYLE_LABEL[style.visualStyle] },
    { label: 'Background', value: BACKGROUND_LABEL[style.background] },
  ];
}

/**
 * The full recipe generation runs on: the tagged uploads, the product data and
 * the style choices. Shown on the generation screen before the outputs exist.
 */
export function ConfigSummary({ project, className }: { project: Project; className?: string }) {
  const rows = summaryRows(project);
  const purposes = project.style.purposes;

  return (
    <View
      className={cn('border-border bg-surface gap-3.5 rounded-[22px] border px-4 py-4', className)}
    >
      <Text className="text-foreground text-[12px] tracking-[1.8px] uppercase">
        Generating with
      </Text>

      {project.photos.length > 0 ? (
        <View className="flex-row gap-2">
          {project.photos.map((photo) => (
            <View key={photo.id} className="gap-1.5">
              <Image
                source={{ uri: photo.uri }}
                style={{ width: 46, height: 58, borderRadius: 10 }}
                contentFit="cover"
                transition={200}
              />
              <Text className="text-muted text-center text-[10px] tracking-[1px] uppercase">
                {SLOT_LABEL[photo.slot]}
              </Text>
            </View>
          ))}
        </View>
      ) : null}

      <View>
        {rows.map((row, index) => (
          <View
            key={row.label}
            className={cn(
              'flex-row items-center justify-between gap-4 py-2',
              index < rows.length - 1 && 'border-sand-soft border-b',
            )}
          >
            <Text className="text-muted text-[11px] tracking-[1.4px] uppercase">{row.label}</Text>
            <View className="flex-1 flex-row items-center justify-end gap-2">
              {row.hex ? <Swatch hex={row.hex} /> : null}
              <Text className="text-foreground flex-1 text-right text-[13px]" numberOfLines={2}>
                {row.value}
              </Text>
            </View>
          </View>
        ))}
      </View>

      {purposes.length > 0 ? (
        <View className="gap-2">
          <Text className="text-muted text-[11px] tracking-[1.4px] uppercase">Content purpose</Text>
          <View className="flex-row flex-wrap gap-1.5">
            {purposes.map((purpose) => (
              <View
                key={purpose}
                className="border-blush/40 bg-blush-mist rounded-full border px-2.5 py-1"
              >
                <Text className="text-charcoal-soft text-[11px]">{PURPOSE_LABEL[purpose]}</Text>
              </View>
            ))}
          </View>
        </View>
      ) : null}
    </View>
  );
}

/** One-line version of the same recipe, shown above the generated results. */
export function ConfigChips({ project, className }: { project: Project; className?: string }) {
  const { product, style } = project;
  const chips = [
    product.color.trim(),
    product.material.trim(),
    product.fit.trim(),
    MODEL_LABEL[style.model],
    STYLE_LABEL[style.visualStyle],
    BACKGROUND_LABEL[style.background],
  ].filter(Boolean);

  return (
    <View className={cn('bg-ivory-deep gap-2.5 rounded-[18px] px-3.5 py-3', className)}>
      <View className="flex-row items-center gap-2">
        <Swatch hex={hexForColorName(product.color)} />
        <Text className="text-charcoal-soft flex-1 text-[12px]" numberOfLines={1}>
          {product.name.trim() || 'Untitled piece'}
          {product.category.trim() ? ` · ${product.category.trim()}` : ''}
        </Text>
      </View>

      <View className="flex-row flex-wrap gap-1.5">
        {chips.map((chip) => (
          <View key={chip} className="border-sand bg-surface rounded-full border px-2.5 py-1">
            <Text className="text-charcoal-soft text-[11px]">{chip}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}
