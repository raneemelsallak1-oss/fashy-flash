import { ActivityIndicator, View, type DimensionValue } from 'react-native';
import { Image } from 'expo-image';
import { Text } from 'heroui-native';
import { AlertCircle } from 'lucide-react-native';

import { FILL } from '@/components/ui/GarmentFill';
import { assetSource, hasAiImage } from '@/lib/generation';
import { palette } from '@/lib/theme';
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
 * Shows only final photographs. Generated assets remain an explicit progress or
 * error state until the backend returns a validated fashion photograph.
 */
export function AssetImage({
  asset,
  width = '100%',
  aspect,
  rounded = 'rounded-[18px]',
  className,
}: AssetImageProps) {
  const frameStyle = { width, aspectRatio: aspect ?? asset.aspect };

  if (asset.origin === 'imported' || hasAiImage(asset)) {
    const source =
      hasAiImage(asset) && asset.renderUrl ? { uri: asset.renderUrl } : assetSource(asset);

    return (
      <View className={cn('bg-sand-soft overflow-hidden', rounded, className)} style={frameStyle}>
        <Image source={source} style={FILL} contentFit="cover" transition={220} />
      </View>
    );
  }

  const failed = asset.renderStatus === 'failed';

  return (
    <View
      className={cn(
        'border-border bg-ivory-deep items-center justify-center gap-2 border px-4',
        rounded,
        className,
      )}
      style={frameStyle}
    >
      {failed ? (
        <AlertCircle color={palette.blush} size={22} />
      ) : (
        <ActivityIndicator color={palette.blush} />
      )}
      <Text className="text-foreground text-center text-[12px]">
        {failed ? 'Image not generated' : 'Generating photograph…'}
      </Text>
      <Text className="text-muted text-center text-[10px] leading-[14px]">
        {failed ? 'Open to see the error and retry.' : 'Only the finished photograph will appear.'}
      </Text>
    </View>
  );
}
