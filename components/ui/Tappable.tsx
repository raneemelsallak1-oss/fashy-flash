import { Pressable, type PressableProps, type ViewStyle } from 'react-native';
import {
  createAnimatedComponent,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { withUniwind } from 'uniwind';

const AnimatedPressable = withUniwind(createAnimatedComponent(Pressable));

type TappableProps = Omit<PressableProps, 'style'> & {
  className?: string;
  /** How far the card scales down while held. */
  scaleTo?: number;
  style?: ViewStyle;
};

/**
 * Pressable with a subtle press-in scale, used for every custom card and tile
 * so interactions stay consistent and quiet.
 */
export function Tappable({ className, scaleTo = 0.975, style, children, ...props }: TappableProps) {
  const pressed = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 - pressed.value * (1 - scaleTo) }],
    opacity: 1 - pressed.value * 0.06,
  }));

  return (
    <AnimatedPressable
      className={className}
      style={[style, animatedStyle]}
      onPressIn={() => {
        // oxlint-disable-next-line react/immutability -- Reanimated's SharedValue is designed to be mutated via `.value`.
        pressed.value = withTiming(1, { duration: 120 });
      }}
      onPressOut={() => {
        // oxlint-disable-next-line react/immutability -- Reanimated's SharedValue is designed to be mutated via `.value`.
        pressed.value = withTiming(0, { duration: 180 });
      }}
      {...props}
    >
      {children}
    </AnimatedPressable>
  );
}
