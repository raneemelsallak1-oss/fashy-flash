import { useEffect, useRef, useState } from 'react';
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
import { SecondaryButton } from '@/components/ui/ActionButton';
import {
  BACKGROUND_LABEL,
  describeGarment,
  MODEL_LABEL,
  plannedOutputCount,
  plannedRenderCount,
  PURPOSE_LABEL,
  SLOT_LABEL,
  STYLE_LABEL,
} from '@/lib/generation';
import { useAppStore } from '@/lib/store';
import { palette } from '@/lib/theme';
import { CREDITS_PER_RENDER } from '@/lib/tryon';
import type { Project } from '@/lib/types';
import { cn } from '@/lib/utils';

const STAGE_DURATION = 950;

type Stage = { label: string; detail: string };

/** The six stages, each naming the input it is working from. */
function stagesFor(draft: Project): Stage[] {
  const { photos, product, style } = draft;
  const tags = photos.map((photo) => SLOT_LABEL[photo.slot]).join(', ');
  const outputs = plannedOutputCount(style);
  const renders = plannedRenderCount(style);

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
      detail:
        renders > 0
          ? `${MODEL_LABEL[style.model]} · ${renders} on-model render${renders === 1 ? '' : 's'}`
          : `${MODEL_LABEL[style.model]} · ${STYLE_LABEL[style.visualStyle]}`,
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
  const runRenders = useAppStore((state) => state.runRenders);
  const renderProgress = useAppStore((state) => state.renderProgress);
  const { width } = useWindowDimensions();
  const [stage, setStage] = useState(0);
  const hasStarted = useRef(false);
  const hasLeft = useRef(false);
  const total = 6;
  const hasDraft = draft !== null;

  const openResults = () => {
    if (hasLeft.current) return;
    hasLeft.current = true;
    router.replace('/create/review');
  };

  // Generation starts on its own as soon as this screen opens: the stages run,
  // the outputs are built from the draft, the model images are photographed by
  // the try-on service, then the results screen takes over.
  useEffect(() => {
    if (!hasDraft) return undefined;

    if (stage < total) {
      const timer = setTimeout(() => setStage((value) => value + 1), STAGE_DURATION);
      return () => clearTimeout(timer);
    }

    if (hasStarted.current) return undefined;
    hasStarted.current = true;
    runGeneration();

    void runRenders().then(() => {
      if (hasLeft.current) return;
      hasLeft.current = true;
      router.replace('/create/review');
    });

    return undefined;
  }, [hasDraft, runGeneration, runRenders, stage, total]);

  if (!draft) return <NoDraft />;

  const stages = stagesFor(draft);
  const done = Math.min(stage, stages.length);
  const visualSize = Math.min(width - 190, 168);
  const outputs = plannedOutputCount(draft.style);
  const plannedRenders = plannedRenderCount(draft.style);

  const isRendering = done === stages.length && plannedRenders > 0;
  const renderShare = renderProgress.total > 0 ? renderProgress.done / renderProgress.total : 0;
  const progress = isRendering ? renderShare : done / stages.length;

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
            {isRendering ? 'Photographing your piece…' : 'Creating your fashion content…'}
          </Text>
          <Text className="text-muted text-center text-[13px]">
            {draft.product.name.trim() || 'Your garment'} · {outputs} outputs from your photos
          </Text>
        </View>

        <View className="gap-2.5">
          <ProgressBar value={progress} />
          <View className="flex-row justify-between">
            <Text className="text-muted text-[11px] tracking-[1.6px] uppercase">
              {isRendering ? 'Rendering' : 'Generating'}
            </Text>
            <Text className="text-charcoal-soft text-[11px] tracking-[1.6px] uppercase">
              {Math.round(progress * 100)}%
            </Text>
          </View>
        </View>

        {isRendering ? (
          <Animated.View
            entering={FadeIn.duration(240)}
            className="border-border bg-surface gap-3.5 rounded-[22px] border px-4 py-4"
          >
            <View className="flex-row items-center gap-3">
              <Spinner color={palette.blush} />
              <View className="flex-1 gap-0.5">
                <Text className="text-foreground text-[14px]">
                  {renderProgress.total > 0
                    ? `On a model — ${Math.min(renderProgress.done + 1, renderProgress.total)} of ${renderProgress.total}`
                    : 'Uploading your garment photos'}
                </Text>
                <Text className="text-muted text-[11px]">
                  Your garment is being worn by a generated model ·{' '}
                  {plannedRenders * CREDITS_PER_RENDER} render credits
                </Text>
              </View>
            </View>

            <SecondaryButton label="Skip to results" onPress={openResults} />
          </Animated.View>
        ) : null}

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
