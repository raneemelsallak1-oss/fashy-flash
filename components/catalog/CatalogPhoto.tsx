import { View, type DimensionValue } from 'react-native';
import { Image } from 'expo-image';

import type { CatalogImage } from '@/lib/catalog';
import { cn } from '@/lib/utils';

type CatalogPhotoProps = {
  image: CatalogImage;
  width?: DimensionValue;
  /** Overrides the image aspect ratio to keep catalog pages even. */
  aspect?: number;
  /** Fills the remaining space of a flex column instead of using an aspect ratio. */
  fill?: boolean;
  /** Colorway hex laid over the image to simulate a color variation. */
  tint?: string;
  rounded?: string;
  className?: string;
};

/** Shared renderer for catalog imagery: generated assets and raw uploads alike. */
export function CatalogPhoto({
  image,
  width = '100%',
  aspect,
  fill = false,
  tint,
  rounded = 'rounded-[6px]',
  className,
}: CatalogPhotoProps) {
  return (
    <View
      className={cn('bg-ivory-deep overflow-hidden', rounded, className)}
      style={
        fill
          ? { flex: 1, width, isolation: 'isolate' }
          : { width, aspectRatio: aspect ?? image.aspect, isolation: 'isolate' }
      }
    >
      <Image
        source={image.source}
        style={{ width: '100%', height: '100%' }}
        contentFit="cover"
        transition={220}
      />
      {image.overlays.map((overlay) => (
        <View
          key={overlay.id}
          pointerEvents="none"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: overlay.color,
            opacity: overlay.opacity,
            mixBlendMode: overlay.blend,
          }}
        />
      ))}
      {tint ? (
        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: tint,
            opacity: 0.34,
          }}
        />
      ) : null}
    </View>
  );
}
