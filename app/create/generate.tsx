import { useEffect, useState } from 'react';
import { ScrollView, useWindowDimensions, View } from 'react-native';
import { router } from 'expo-router';
import { Spinner, Text } from 'heroui-native';
import { Check } from 'lucide-react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { ConfigSummary } from '@/components/flow/ConfigSummary';
import { FlowHeader } from '@/components/flow/FlowHeader';
import { NoDraft } from '@/components/flow/NoDraft';
import { GenerationVisual } from '@/components/generate/GenerationVisual';
import { ProgressBar } from '@/components/generate/ProgressBar';
import {
  BACKGROUND_LABEL,
  describeGarment,
  MODEL_LABEL,
  plannedOutputCount,
  PURPOSE_LABEL,
  SLOT_LABEL,
  STYLE_LABEL,
} from '@/lib/generation';
import { useAppStore } from '@/lib/store';
import { palette } from '@/lib/theme';
import type { Project } from '@/lib/types';
import { cn } from '@/lib/utils';

const STAGE_DURATION = 950;

type Stage = { label: string; detail: string };

/** The six stages, each naming the input it is working from. */
function stagesFor(draft: Project): Stage[] {
  const { photos, product, style } = draft;
  const tags = photos.map((photo) => SLOT_LABEL[photo.slot]).join(', ');
  const outputs = plannedOutputCount(style);

  return [
    {
      label: 'Analyzing garment',
      detail:
        photos.length > 0
          ? `${photos.length} photo${photos.length === 1 ? '' : 's'} · ${tags}`
          : 'No photos uploaded',
    },
    {
      label: 'Understanding product details',
      detail: describeGarment(product) || product.category.trim() || 'Product data',
    },
    {
      label: 'Creating model & styling',
      detail: `${MODEL_LABEL[style.model]} · ${STYLE_LABEL[style.visualStyle]}`,
    },
    { label: 'Creating backgrounds', detail: BACKGROUND_LABEL[style.background] },
    { label: 'Enhancing images', detail: 'Fabric texture, lighting and shadow' },
    {
      label: 'Finalizing assets',
      detail:
        style.purposes.length > 0
          ? `${outputs} outputs · ${style.purposes.map((purpose) => PURPOSE_LABEL[purpose]).join(', ')}`
          : `${outputs} outputs`,
    },
  ];
}

export default function GenerateScreen() {
  const draft = useAppStore((state) => state.draft);
  const runGeneration = useAppStore((state) => state.runGeneration);
  const { width } = useWindowDimensions();
  const [stage, setStage] = useState(0);
  const total = 6;

  useEffect(() => {
    if (stage >= total) {
      runGeneration();
      router.replace('/create/review');
      return undefined;
    }

    const timer = setTimeout(() => setStage((value) => value + 1), STAGE_DURATION);
    return () => clearTimeout(timer);
  }, [runGeneration, stage, total]);

  if (!draft) return <NoDraft />;

  const stages = stagesFor(draft);
  const done = Math.min(stage, stages.length);
  const visualSize = Math.min(width - 190, 168);
  const outputs = plannedOutputCount(draft.style);

  return (
    <View className="bg-ivory flex-1">
      <FlowHeader step="generate" showBack={false} />

      <ScrollView
        className="flex-1"
        contentContainerClassName="px-5 pt-6 pb-safe-offset-8 gap-6"
        showsVerticalScrollIndicator={false}
      >
        <View className="items-center">
          <GenerationVisual photo={draft.photos[0]} size={visualSize} />
        </View>

        <View className="gap-2.5">
          <Text className="font-display-medium text-foreground text-center text-[26px] leading-[32px]">
            Creating your fashion content…
          </Text>
          <Text className="text-muted text-center text-[13px]">
            {draft.product.name.trim() || 'Your garment'} · {outputs} outputs from your photos
          </Text>
        </View>

        <View className="gap-2.5">
          <ProgressBar value={done / stages.length} />
          <View className="flex-row justify-between">
            <Text className="text-muted text-[11px] tracking-[1.6px] uppercase">Generating</Text>
            <Text className="text-charcoal-soft text-[11px] tracking-[1.6px] uppercase">
              {Math.round((done / stages.length) * 100)}%
            </Text>
          </View>
        </View>

        <ConfigSummary project={draft} />

        <View className="border-border bg-surface gap-3 rounded-[22px] border px-4 py-4">
          {stages.map((item, index) => {
            const isDone = index < done;
            const isActive = index === done;

            return (
              <Animated.View
                key={item.label}
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

                <View className="flex-1 gap-0.5">
                  <Text
                    className={cn(
                      'text-[14px]',
                      isDone || isActive ? 'text-foreground' : 'text-muted',
                    )}
                  >
                    {item.label}
                  </Text>
                  <Text className="text-muted text-[11px]" numberOfLines={1}>
                    {item.detail}
                  </Text>
                </View>

                {isActive ? <Spinner color={palette.blush} /> : null}
              </Animated.View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}
