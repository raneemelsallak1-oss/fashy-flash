import { useEffect } from 'react';
import { View } from 'react-native';
import { Image } from 'expo-image';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { LinearGradient } from '@/components/ui/primitives/LinearGradient';
import { imageForKind } from '@/lib/gallery';
import type { GarmentPhoto } from '@/lib/types';

type GenerationVisualProps = {
  photo?: GarmentPhoto;
  size: number;
};

/** Source photo under a sweeping light band, suggesting active processing. */
export function GenerationVisual({ photo, size }: GenerationVisualProps) {
  const sweep = useSharedValue(0);
  const glow = useSharedValue(0);

  useEffect(() => {
    // oxlint-disable-next-line react/immutability -- Reanimated's SharedValue is designed to be mutated via `.value`.
    sweep.value = withRepeat(
      withTiming(1, { duration: 2200, easing: Easing.inOut(Easing.quad) }),
      -1,
      false,
    );
    // oxlint-disable-next-line react/immutability -- Reanimated's SharedValue is designed to be mutated via `.value`.
    glow.value = withRepeat(
      withTiming(1, { duration: 1800, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, [glow, sweep]);

  const sweepStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: -size + sweep.value * size * 2 }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: 0.25 + glow.value * 0.35,
    transform: [{ scale: 0.98 + glow.value * 0.05 }],
  }));

  return (
    <View className="items-center justify-center" style={{ width: size, height: size * 1.25 }}>
      <Animated.View
        style={[
          glowStyle,
          {
            position: 'absolute',
            width: size * 1.05,
            height: size * 1.3,
            borderRadius: 32,
            backgroundColor: '#F3E2DF',
          },
        ]}
      />

      <View
        className="border-border bg-ivory-deep overflow-hidden rounded-[26px] border"
        style={{ width: size, height: size * 1.25 }}
      >
        <Image
          source={photo ? { uri: photo.uri } : imageForKind('product')}
          style={{ width: '100%', height: '100%' }}
          contentFit="cover"
          transition={240}
        />

        <Animated.View
          pointerEvents="none"
          style={[sweepStyle, { position: 'absolute', top: 0, bottom: 0, width: size * 0.6 }]}
        >
          <LinearGradient
            colors={['rgba(255,255,255,0)', 'rgba(255,255,255,0.55)', 'rgba(255,255,255,0)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            className="h-full w-full"
          />
        </Animated.View>
      </View>
    </View>
  );
}
