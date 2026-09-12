import { View, type DimensionValue } from 'react-native';
import { Image } from 'expo-image';

import { imageForAsset, lightingOverlay } from '@/lib/gallery';
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

/**
 * Renders a generated asset with its lighting, enhancement and shadow settings
 * applied as translucent layers over the curated image.
 */
export function AssetImage({
  asset,
  width = '100%',
  aspect,
  rounded = 'rounded-[18px]',
  className,
}: AssetImageProps) {
  const overlays = lightingOverlay(asset.lighting, asset.enhanced);

  return (
    <View
      className={cn('bg-ivory-deep overflow-hidden', rounded, className)}
      style={{ width, aspectRatio: aspect ?? asset.aspect }}
    >
      <Image
        source={imageForAsset(asset)}
        style={{ width: '100%', height: '100%' }}
        contentFit="cover"
        transition={260}
      />
      {overlays.map((overlay) => (
        <View
          key={overlay.color}
          pointerEvents="none"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: overlay.color,
            opacity: overlay.opacity,
          }}
        />
      ))}
      {asset.shadow ? (
        <View
          pointerEvents="none"
          className="bg-charcoal/10 absolute right-0 bottom-0 left-0 h-1/4"
        />
      ) : null}
    </View>
  );
}
