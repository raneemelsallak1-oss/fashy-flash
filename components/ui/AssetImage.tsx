import { View, type DimensionValue } from 'react-native';
import { Image } from 'expo-image';

import { FILL, GarmentFill, Layers, percent } from '@/components/ui/GarmentFill';
import { LinearGradient } from '@/components/ui/primitives/LinearGradient';
import { WornFigure } from '@/components/ui/WornFigure';
import { imageForKind } from '@/lib/gallery';
import { assetSource, backdropColors, hasOnModelRender, treatmentLayers } from '@/lib/generation';
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

/** Scene imagery bleeds past the frame so its blur has no visible soft edge. */
const SCENE_FILL = {
  position: 'absolute',
  top: '-8%',
  left: '-8%',
  right: '-8%',
  bottom: '-8%',
} as const;

/**
 * Renders one generated output: the user's own garment photo, recolored to the
 * chosen product color, cropped for its variation and staged in the selected
 * style and background — on the selected model when the output is a worn frame.
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

  // An imported photo is already finished: fill the frame with the file itself
  // and composite nothing over it. A finished on-model render is treated the
  // same way — it is a real photograph, not something to paint over.
  if (asset.origin === 'imported' || hasOnModelRender(asset)) {
    const source =
      hasOnModelRender(asset) && asset.renderUrl ? { uri: asset.renderUrl } : assetSource(asset);

    return (
      <View
        className={cn('bg-sand-soft overflow-hidden', rounded, className)}
        style={{ width, aspectRatio: aspect ?? asset.aspect }}
      >
        <Image source={source} style={FILL} contentFit="cover" transition={220} />
      </View>
    );
  }

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

      {asset.worn ? (
        <View style={{ flex: 1, padding: percent(asset.inset) }}>
          <WornFigure asset={asset} />
        </View>
      ) : (
        <>
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
            <GarmentFill asset={asset} style={{ borderRadius: asset.inset > 0 ? 10 : 0 }} />
          </View>

          {!asset.staged && asset.shadow ? (
            <View
              pointerEvents="none"
              className="bg-charcoal/10 absolute right-0 bottom-0 left-0 h-1/5"
            />
          ) : null}
        </>
      )}

      <Layers layers={treatmentLayers(asset)} />
    </View>
  );
}
