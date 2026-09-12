import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { Spinner, Text } from 'heroui-native';
import { Sparkles } from 'lucide-react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { Tappable } from '@/components/ui/Tappable';
import { palette } from '@/lib/theme';

type AutoDetectCardProps = {
  isDone: boolean;
  onDetect: () => void;
};

const DETECTED_TAGS = ['Shirts & Blouses', 'Ivory', 'Linen blend', 'Oversized', 'Solid weave'];

/** AI shortcut that reads the uploaded photos and fills the form. */
export function AutoDetectCard({ isDone, onDetect }: AutoDetectCardProps) {
  const [isWorking, setIsWorking] = useState(false);

  useEffect(() => {
    if (!isWorking) return undefined;
    const timer = setTimeout(() => {
      setIsWorking(false);
      onDetect();
    }, 1500);
    return () => clearTimeout(timer);
  }, [isWorking, onDetect]);

  return (
    <Tappable
      accessibilityRole="button"
      accessibilityLabel="Auto-detect product details"
      onPress={() => {
        if (!isWorking) setIsWorking(true);
      }}
      scaleTo={0.99}
      className="border-blush/35 bg-blush-mist gap-3 overflow-hidden rounded-[22px] border px-4 py-4"
    >
      <View className="flex-row items-center gap-2.5">
        {isWorking ? (
          <Spinner color={palette.blush} />
        ) : (
          <Sparkles color={palette.blush} size={17} strokeWidth={1.8} />
        )}
        <Text className="font-display-medium text-foreground flex-1 text-[17px]">
          Auto-detect product details
        </Text>
      </View>

      <Text className="text-charcoal-soft text-[13px] leading-[19px]">
        {isWorking
          ? 'Reading your garment photos…'
          : 'Fashy Flash analyses your photos and fills in category, color, material, fit and pattern.'}
      </Text>

      {isDone && !isWorking ? (
        <Animated.View entering={FadeIn.duration(280)} className="flex-row flex-wrap gap-1.5">
          {DETECTED_TAGS.map((tag) => (
            <View key={tag} className="bg-surface/90 rounded-full px-2.5 py-1">
              <Text className="text-charcoal-soft text-[11px]">{tag}</Text>
            </View>
          ))}
        </Animated.View>
      ) : (
        <Text className="text-blush text-[12px] tracking-[1.4px] uppercase">
          {isWorking ? 'Analyzing' : 'Tap to analyze'}
        </Text>
      )}
    </Tappable>
  );
}
