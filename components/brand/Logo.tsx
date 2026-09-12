import { View } from 'react-native';
import { Text } from 'heroui-native';
import Svg, { Path } from 'react-native-svg';

import { cn } from '@/lib/utils';
import { palette } from '@/lib/theme';

type SparkProps = {
  size?: number;
  color?: string;
};

/** Minimal four-point flash/spark used as the Fashy Flash identity mark. */
export function Spark({ size = 14, color = palette.blush }: SparkProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M12 0.8c0.5 5.2 2.4 8.5 6.5 10.2 0.7 0.3 0.7 1.7 0 2C14.4 14.7 12.5 18 12 23.2c-0.5-5.2-2.4-8.5-6.5-10.2-0.7-0.3-0.7-1.7 0-2C9.6 9.3 11.5 6 12 0.8z"
        fill={color}
      />
    </Svg>
  );
}

type LogoProps = {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
};

const SIZES = {
  sm: { text: 'text-lg', spark: 9, gap: 'gap-1' },
  md: { text: 'text-2xl', spark: 12, gap: 'gap-1.5' },
  lg: { text: 'text-4xl', spark: 18, gap: 'gap-2' },
} as const;

/** Wordmark: editorial "Fashy" + spark + tracked "Flash". */
export function Logo({ size = 'md', className }: LogoProps) {
  const config = SIZES[size];

  return (
    <View className={cn('flex-row items-baseline', config.gap, className)}>
      <Text className={cn('font-display-medium text-foreground', config.text)}>Fashy</Text>
      <View className="self-center pb-0.5">
        <Spark size={config.spark} />
      </View>
      <Text className={cn('font-display text-foreground', config.text)}>Flash</Text>
    </View>
  );
}
