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
  PURPOSE_LABEL,
  SLOT_LABEL,
  STYLE_LABEL,
} from '@/lib/generation';
import { useAppStore } from '@/lib/store';
import { palette } from '@/lib/theme';
import type { Project } from '@/lib/types';
import { cn } from '@/lib/utils';

const STAGE_DURATION = 850;

/** Stages that run before the request leaves the app. */
const PREP_STAGES = 4;

/** Share of the progress bar the preparation stages account for. */
const PREP_SHARE = 0.3;

type Stage = { label: string; detail: string };

/** The six stages, each naming the input it is working from. */
function stagesFor(draft: Project): Stage[] {
  const { photos, product, style } = draft;
  const tags = photos.map((photo) => SLOT_LABEL[photo.slot]).join(', ');
  const outputs = plannedOutputCount(style);

  return [
    {
      label: 'Reading your garment photos',
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
      label: 'Choosing model & styling',
      detail: `${MODEL_LABEL[style.model]} · ${STYLE_LABEL[style.visualStyle]}`,
    },
    { label: 'Writing the photography brief', detail: BACKGROUND_LABEL[style.background] },
    {
      label: 'Generating images',
      detail: `${outputs} image${outputs === 1 ? '' : 's'} from your garment photos`,
    },
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
  const [isGenerating, setIsGenerating] = useState(false);
  const hasStarted = useRef(false);
  const hasLeft = useRef(false);
  const hasDraft = draft !== null;

  const openResults = () => {
    if (hasLeft.current) return;
    hasLeft.current = true;
    router.replace('/create/review');
  };

  // Generation starts on its own as soon as this screen opens: the preparation
  // stages run, the output set is planned from the draft, then the backend
  // generates a real image for each one and the results screen takes over.
  useEffect(() => {
    if (!hasDraft) return undefined;

    if (stage < PREP_STAGES) {
      const timer = setTimeout(() => setStage((value) => value + 1), STAGE_DURATION);
      return () => clearTimeout(timer);
    }

    if (hasStarted.current) return undefined;
    hasStarted.current = true;
    setIsGenerating(true);
    runGeneration();

    void runRenders().then(() => {
      setIsGenerating(false);
      if (hasLeft.current) return;
      hasLeft.current = true;
      router.replace('/create/review');
    });

    return undefined;
  }, [hasDraft, runGeneration, runRenders, stage]);

  if (!draft) return <NoDraft />;

  const stages = stagesFor(draft);
  const visualSize = Math.min(width - 190, 168);
  const outputs = plannedOutputCount(draft.style);

  const renderShare = renderProgress.total > 0 ? renderProgress.done / renderProgress.total : 0;
  const prepShare = Math.min(stage, PREP_STAGES) / PREP_STAGES;
  const done = isGenerating ? PREP_STAGES : Math.min(stage, stages.length);
  const progress = isGenerating
    ? PREP_SHARE + (1 - PREP_SHARE) * renderShare
    : prepShare * PREP_SHARE;

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
            {isGenerating ? 'Photographing your piece…' : 'Creating your fashion content…'}
          </Text>
          <Text className="text-muted text-center text-[13px]">
            {draft.product.name.trim() || 'Your garment'} · {outputs} outputs from your photos
          </Text>
        </View>

        <View className="gap-2.5">
          <ProgressBar value={progress} />
          <View className="flex-row justify-between">
            <Text className="text-muted text-[11px] tracking-[1.6px] uppercase">
              {isGenerating ? 'Generating' : 'Preparing'}
            </Text>
            <Text className="text-charcoal-soft text-[11px] tracking-[1.6px] uppercase">
              {Math.round(progress * 100)}%
            </Text>
          </View>
        </View>

        {isGenerating ? (
          <Animated.View
            entering={FadeIn.duration(240)}
            className="border-border bg-surface gap-3.5 rounded-[22px] border px-4 py-4"
          >
            <View className="flex-row items-center gap-3">
              <Spinner color={palette.blush} />
              <View className="flex-1 gap-0.5">
                <Text className="text-foreground text-[14px]">
                  {renderProgress.total > 0
                    ? `Image ${Math.min(renderProgress.done + 1, renderProgress.total)} of ${renderProgress.total}`
                    : 'Uploading your garment photos'}
                </Text>
                <Text className="text-muted text-[11px]">
                  Each image is generated by the AI service from your own photo — this takes a
                  moment
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
