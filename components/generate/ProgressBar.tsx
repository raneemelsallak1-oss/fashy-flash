import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

type ProgressBarProps = {
  /** 0 – 1 */
  value: number;
};

/** Thin blush progress track used on the generation screen. */
export function ProgressBar({ value }: ProgressBarProps) {
  const progress = useSharedValue(0);

  useEffect(() => {
    // oxlint-disable-next-line react/immutability -- Reanimated's SharedValue is designed to be mutated via `.value`.
    progress.value = withTiming(value, { duration: 700, easing: Easing.out(Easing.cubic) });
  }, [progress, value]);

  const barStyle = useAnimatedStyle(() => ({
    width: `${Math.max(progress.value, 0.02) * 100}%`,
  }));

  return (
    <View className="bg-sand-soft h-1.5 w-full overflow-hidden rounded-full">
      <Animated.View style={barStyle} className="bg-blush h-full rounded-full" />
    </View>
  );
}
