import { View, type DimensionValue, type ViewStyle } from 'react-native';
import { Image } from 'expo-image';

import type { ImageLayer } from '@/lib/types';
import { assetSource } from '@/lib/generation';
import type { GeneratedAsset } from '@/lib/types';

export const FILL = {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
} as const;

export function percent(value: number): DimensionValue {
  return `${value * 100}%`;
}

/** Translucent color passes painted over an image, e.g. lighting or enhancement. */
export function Layers({ layers }: { layers: ImageLayer[] }) {
  return layers.map((layer) => (
    <View
      key={layer.id}
      pointerEvents="none"
      style={{
        ...FILL,
        backgroundColor: layer.color,
        opacity: layer.opacity,
        mixBlendMode: layer.blend,
      }}
    />
  ));
}

type GarmentFillProps = {
  asset: GeneratedAsset;
  /** Crop scale over the source photo; defaults to the asset's own crop. */
  zoom?: number;
  /** Vertical crop focus, 0 = top, 1 = bottom. */
  focusY?: number;
  style?: ViewStyle;
};

/**
 * The user's uploaded garment photo, cropped for its frame. Local previews are
 * built from this surface while the real AI image is on its way.
 */
export function GarmentFill({ asset, zoom, focusY, style }: GarmentFillProps) {
  const crop = zoom ?? asset.zoom;
  const focus = focusY ?? asset.focusY;
  const offset = (crop - 1) * 100;

  return (
    <View style={{ flex: 1, overflow: 'hidden', isolation: 'isolate', ...style }}>
      <Image
        source={assetSource(asset)}
        style={{
          position: 'absolute',
          width: percent(crop),
          height: percent(crop),
          left: percent(-offset / 200),
          top: percent((-offset * focus) / 100),
        }}
        contentFit="cover"
        transition={260}
      />
    </View>
  );
}
