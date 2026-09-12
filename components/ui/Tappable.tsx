import { createContext, useContext } from 'react';
import { Platform, Pressable, type PressableProps, type ViewStyle } from 'react-native';
import {
  createAnimatedComponent,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { withUniwind } from 'uniwind';

const AnimatedPressable = withUniwind(createAnimatedComponent(Pressable));

/**
 * True while rendering inside another Tappable. On web, react-native-web turns
 * `role="button"` into a real <button> element, and HTML forbids a button
 * inside a button, so nested Tappables render as a plain pressable view.
 */
const NestedTappableContext = createContext(false);

/** Roles react-native-web renders as a real interactive HTML element. */
const ELEMENT_MAPPED_ROLES = new Set(['button', 'link']);

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
  const isNested = useContext(NestedTappableContext);
  const pressed = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 - pressed.value * (1 - scaleTo) }],
    opacity: 1 - pressed.value * 0.06,
  }));

  const role = props.role ?? props.accessibilityRole;
  const rendersAsElement = role !== undefined && ELEMENT_MAPPED_ROLES.has(role);
  const dropRole = Platform.OS === 'web' && isNested && rendersAsElement;

  return (
    <NestedTappableContext.Provider value>
      <AnimatedPressable
        {...(className === undefined ? {} : { className })}
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
        // Nested on web: stay a <div> so the DOM keeps a single button per
        // control, while remaining focusable and labelled for screen readers.
        {...(dropRole ? { accessibilityRole: undefined, role: undefined, tabIndex: 0 } : null)}
      >
        {children}
      </AnimatedPressable>
    </NestedTappableContext.Provider>
  );
}
