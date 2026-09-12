import { useEffect, useState } from 'react';
import { useWindowDimensions, View } from 'react-native';
import { router } from 'expo-router';
import { Spinner, Text } from 'heroui-native';
import { Check } from 'lucide-react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { FlowHeader } from '@/components/flow/FlowHeader';
import { NoDraft } from '@/components/flow/NoDraft';
import { GenerationVisual } from '@/components/generate/GenerationVisual';
import { ProgressBar } from '@/components/generate/ProgressBar';
import { useAppStore } from '@/lib/store';
import { palette } from '@/lib/theme';
import { cn } from '@/lib/utils';

const STAGES = [
  'Analyzing garment',
  'Understanding product details',
  'Creating model & styling',
  'Creating backgrounds',
  'Enhancing images',
  'Finalizing assets',
];

const STAGE_DURATION = 900;

export default function GenerateScreen() {
  const draft = useAppStore((state) => state.draft);
  const runGeneration = useAppStore((state) => state.runGeneration);
  const { width } = useWindowDimensions();
  const [stage, setStage] = useState(0);

  useEffect(() => {
    if (stage >= STAGES.length) {
      runGeneration();
      router.replace('/create/review');
      return undefined;
    }

    const timer = setTimeout(() => setStage((value) => value + 1), STAGE_DURATION);
    return () => clearTimeout(timer);
  }, [runGeneration, stage]);

  if (!draft) return <NoDraft />;

  const done = Math.min(stage, STAGES.length);
  const visualSize = Math.min(width - 140, 210);

  return (
    <View className="bg-ivory flex-1">
      <FlowHeader step="generate" showBack={false} />

      <View className="pb-safe-offset-6 flex-1 gap-8 px-5 pt-8">
        <View className="items-center">
          <GenerationVisual photo={draft.photos[0]} size={visualSize} />
        </View>

        <View className="gap-3">
          <Text className="font-display-medium text-foreground text-center text-[26px] leading-[32px]">
            Creating your fashion content…
          </Text>
          <Text className="text-muted text-center text-[13px]">
            {draft.product.name.trim() || 'Your garment'} · {draft.style.purposes.length} content
            formats
          </Text>
        </View>

        <View className="gap-2.5">
          <ProgressBar value={done / STAGES.length} />
          <View className="flex-row justify-between">
            <Text className="text-muted text-[11px] tracking-[1.6px] uppercase">Generating</Text>
            <Text className="text-charcoal-soft text-[11px] tracking-[1.6px] uppercase">
              {Math.round((done / STAGES.length) * 100)}%
            </Text>
          </View>
        </View>

        <View className="border-border bg-surface gap-3 rounded-[22px] border px-4 py-4">
          {STAGES.map((label, index) => {
            const isDone = index < done;
            const isActive = index === done;

            return (
              <Animated.View
                key={label}
                entering={FadeIn.delay(index * 60).duration(240)}
                className="flex-row items-center gap-3"
              >
                <View
                  className={cn(
                    'h-5 w-5 items-center justify-center rounded-full border',
                    isDone ? 'border-blush bg-blush' : 'border-sand bg-surface',
                  )}
                >
                  {isDone ? <Check color={palette.white} size={11} strokeWidth={3} /> : null}
                </View>

                <Text
                  className={cn(
                    'flex-1 text-[14px]',
                    isDone && 'text-foreground',
                    isActive && 'text-foreground',
                    !isDone && !isActive && 'text-muted',
                  )}
                >
                  {label}
                </Text>

                {isActive ? <Spinner color={palette.blush} /> : null}
              </Animated.View>
            );
          })}
        </View>
      </View>
    </View>
  );
}
