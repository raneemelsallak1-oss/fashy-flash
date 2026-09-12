import { View, type DimensionValue } from 'react-native';
import { Image } from 'expo-image';

import { LinearGradient } from '@/components/ui/primitives/LinearGradient';
import type { ImageLayer } from '@/lib/color';
import { imageForKind } from '@/lib/gallery';
import { assetSource, backdropColors, garmentLayers, treatmentLayers } from '@/lib/generation';
import type { GeneratedAsset } from '@/lib/types';
import { cn } from '@/lib/utils';

type AssetImageProps = {
  asset: GeneratedAsset;
  width?: DimensionValue;
  /** Overrides the asset aspect ratio, e.g. for a fixed export crop. */
  aspect?: number;
  rounded?: string;
  className?: string;
};

const FILL = { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 } as const;

/** Scene imagery bleeds past the frame so its blur has no visible soft edge. */
const SCENE_FILL = {
  position: 'absolute',
  top: '-8%',
  left: '-8%',
  right: '-8%',
  bottom: '-8%',
} as const;

function percent(value: number): DimensionValue {
  return `${value * 100}%`;
}

function Layers({ layers }: { layers: ImageLayer[] }) {
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

/**
 * Renders one generated output: the user's own garment photo, recolored to the
 * chosen product color, cropped for its variation and staged on the backdrop
 * that matches the selected style, background and model.
 */
export function AssetImage({
  asset,
  width = '100%',
  aspect,
  rounded = 'rounded-[18px]',
  className,
}: AssetImageProps) {
  const [backdropFrom, backdropTo] = backdropColors(asset);
  const scene = asset.scene ? imageForKind(asset.scene) : null;
  const offset = (asset.zoom - 1) * 100;

  return (
    <View
      className={cn('overflow-hidden', rounded, className)}
      style={{
        width,
        aspectRatio: aspect ?? asset.aspect,
        backgroundColor: backdropFrom,
        isolation: 'isolate',
      }}
    >
      {scene ? (
        <>
          <Image
            source={scene}
            style={SCENE_FILL}
            contentFit="cover"
            blurRadius={22}
            transition={220}
          />
          <View
            pointerEvents="none"
            style={{ ...FILL, backgroundColor: backdropTo, opacity: 0.4 }}
          />
        </>
      ) : (
        <LinearGradient
          colors={[backdropFrom, backdropTo]}
          start={{ x: 0.15, y: 0 }}
          end={{ x: 0.85, y: 1 }}
          style={FILL}
        />
      )}

      {asset.staged && asset.shadow ? (
        <View
          pointerEvents="none"
          className="bg-charcoal/15"
          style={{
            position: 'absolute',
            left: '24%',
            right: '24%',
            bottom: percent(asset.inset * 0.55),
            height: '3%',
            borderRadius: 999,
          }}
        />
      ) : null}

      <View style={{ flex: 1, padding: percent(asset.inset) }}>
        <View
          style={{
            flex: 1,
            overflow: 'hidden',
            borderRadius: asset.inset > 0 ? 10 : 0,
            isolation: 'isolate',
          }}
        >
          <Image
            source={assetSource(asset)}
            style={{
              position: 'absolute',
              width: percent(asset.zoom),
              height: percent(asset.zoom),
              left: percent(-offset / 200),
              top: percent((-offset * asset.focusY) / 100),
            }}
            contentFit="cover"
            transition={260}
          />
          <Layers layers={garmentLayers(asset)} />
        </View>
      </View>

      {!asset.staged && asset.shadow ? (
        <View
          pointerEvents="none"
          className="bg-charcoal/10 absolute right-0 bottom-0 left-0 h-1/5"
        />
      ) : null}

      <Layers layers={treatmentLayers(asset)} />
    </View>
  );
}
