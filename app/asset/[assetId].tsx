import { ScrollView, useWindowDimensions, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Spinner, Switch, Text } from 'heroui-native';
import { Heart, RefreshCw, Trash2, X } from 'lucide-react-native';

import { AssetImage } from '@/components/ui/AssetImage';
import { PrimaryButton, SecondaryButton } from '@/components/ui/ActionButton';
import { FooterBar } from '@/components/ui/FooterBar';
import { SectionLabel } from '@/components/ui/ScreenTitle';
import { Tappable } from '@/components/ui/Tappable';
import {
  describeLook,
  describeRender,
  describeSource,
  sceneForBackground,
  VARIATION_LABEL,
} from '@/lib/generation';
import { goBackOrReplace } from '@/lib/navigation';
import { ASSET_CATEGORY_OPTIONS, BACKGROUND_OPTIONS, IMPORT_VIEW_OPTIONS } from '@/lib/options';
import { useAppStore } from '@/lib/store';
import { palette } from '@/lib/theme';
import type { Lighting } from '@/lib/types';
import { cn } from '@/lib/utils';

const LIGHTING_OPTIONS: { id: Lighting; label: string }[] = [
  { id: 'soft', label: 'Soft' },
  { id: 'balanced', label: 'Balanced' },
  { id: 'bright', label: 'Bright' },
];

type ControlPillProps = {
  label: string;
  selected: boolean;
  onPress: () => void;
};

function ControlPill({ label, selected, onPress }: ControlPillProps) {
  return (
    <Tappable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      scaleTo={0.95}
      className={cn(
        'rounded-full border px-3.5 py-2',
        selected ? 'border-blush bg-blush-mist' : 'border-border bg-surface',
      )}
    >
      <Text className={cn('text-[12px]', selected ? 'text-foreground' : 'text-charcoal-soft')}>
        {label}
      </Text>
    </Tappable>
  );
}

type ToggleRowProps = {
  label: string;
  hint: string;
  value: boolean;
  onChange: (value: boolean) => void;
};

function ToggleRow({ label, hint, value, onChange }: ToggleRowProps) {
  return (
    <View className="border-border bg-surface flex-row items-center gap-3 rounded-[18px] border px-4 py-3.5">
      <View className="flex-1 gap-0.5">
        <Text className="text-foreground text-[14px]">{label}</Text>
        <Text className="text-muted text-[12px]">{hint}</Text>
      </View>
      <Switch isSelected={value} onSelectedChange={onChange} />
    </View>
  );
}

type InfoRow = { label: string; value: string };

export default function AssetPreviewScreen() {
  const { assetId } = useLocalSearchParams<{ assetId: string }>();
  const draft = useAppStore((state) => state.draft);
  const updateAsset = useAppStore((state) => state.updateAsset);
  const rerenderAsset = useAppStore((state) => state.rerenderAsset);
  const restyleAsset = useAppStore((state) => state.restyleAsset);
  const toggleFavorite = useAppStore((state) => state.toggleFavorite);
  const removeAsset = useAppStore((state) => state.removeAsset);
  const { width } = useWindowDimensions();

  const asset = draft?.assets.find((item) => item.id === assetId);

  /** Generated outputs with a garment photo are produced by the image service. */
  const isAiImage = asset?.origin === 'generated' && asset.sourceUri !== null;

  if (!asset) {
    return (
      <View className="bg-ivory flex-1 items-center justify-center gap-4 px-8">
        <Text className="font-display-medium text-foreground text-center text-[20px]">
          This visual is no longer available
        </Text>
        <PrimaryButton label="Close" onPress={() => router.back()} />
      </View>
    );
  }

  const contentWidth = Math.min(width, 560) - 40;
  const previewWidth = Math.min(contentWidth, 400 * asset.aspect);
  const isImported = asset.origin === 'imported';
  const isGenerating = asset.renderStatus === 'pending';

  const infoRows: InfoRow[] = isImported
    ? [
        { label: 'Output', value: `Imported · ${VARIATION_LABEL[asset.variation]}` },
        { label: 'Source', value: describeSource(asset) },
        ...(asset.spec ? [{ label: 'Product', value: asset.spec }] : []),
      ]
    : [
        { label: 'Output', value: `${VARIATION_LABEL[asset.variation]} · Take ${asset.take}` },
        { label: 'Built from', value: describeSource(asset) },
        { label: 'Image', value: describeRender(asset) },
        { label: 'Look', value: describeLook(asset) },
        ...(asset.spec ? [{ label: 'Product', value: asset.spec }] : []),
      ];

  const removeImported = () => {
    goBackOrReplace('/create/review');
    removeAsset(asset.id);
  };

  return (
    <View className="bg-ivory flex-1">
      <View className="flex-row items-center justify-between px-5 pt-4 pb-2">
        <Tappable
          accessibilityRole="button"
          accessibilityLabel="Close preview"
          onPress={() => router.back()}
          className="border-border bg-surface h-9 w-9 items-center justify-center rounded-full border"
        >
          <X color={palette.charcoal} size={17} />
        </Tappable>

        <Text className="text-charcoal-soft text-[12px] tracking-[1.6px] uppercase">
          {asset.title}
        </Text>

        <Tappable
          accessibilityRole="button"
          accessibilityLabel="Favorite this visual"
          accessibilityState={{ selected: asset.isFavorite }}
          onPress={() => toggleFavorite(asset.id)}
          className="border-border bg-surface h-9 w-9 items-center justify-center rounded-full border"
        >
          <Heart
            color={asset.isFavorite ? palette.blush : palette.charcoalSoft}
            fill={asset.isFavorite ? palette.blush : 'transparent'}
            size={15}
          />
        </Tappable>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerClassName="px-5 pt-2 pb-8 gap-6"
        showsVerticalScrollIndicator={false}
      >
        <View className="items-center">
          <View className="relative">
            <AssetImage asset={asset} width={previewWidth} rounded="rounded-[24px]" />
            {isGenerating ? (
              <View className="bg-ivory/80 absolute inset-0 items-center justify-center gap-3 rounded-[24px]">
                <Spinner color={palette.blush} />
                <Text className="text-charcoal-soft text-[12px] tracking-[1.4px] uppercase">
                  Generating
                </Text>
              </View>
            ) : null}
          </View>
        </View>

        <View className="border-border bg-surface gap-2.5 rounded-[20px] border px-4 py-3.5">
          {infoRows.map((row) => (
            <View key={row.label} className="flex-row items-center justify-between gap-4">
              <Text className="text-muted text-[11px] tracking-[1.4px] uppercase">{row.label}</Text>
              <View className="flex-1 flex-row items-center justify-end gap-2">
                <Text className="text-charcoal-soft flex-1 text-right text-[12px]">
                  {row.value}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {isImported ? (
          <>
            <View className="gap-3">
              <SectionLabel label="Catalog view" hint="Where this photo belongs" />
              <View className="flex-row flex-wrap gap-2">
                {IMPORT_VIEW_OPTIONS.map((option) => (
                  <ControlPill
                    key={option.id}
                    label={option.label}
                    selected={asset.variation === option.id}
                    onPress={() => updateAsset(asset.id, { variation: option.id })}
                  />
                ))}
              </View>
            </View>

            <View className="gap-3">
              <SectionLabel label="Content type" hint="Groups it under the review filters" />
              <View className="flex-row flex-wrap gap-2">
                {ASSET_CATEGORY_OPTIONS.map((option) => (
                  <ControlPill
                    key={option.id}
                    label={option.label}
                    selected={asset.category === option.id}
                    onPress={() => updateAsset(asset.id, { category: option.id })}
                  />
                ))}
              </View>
            </View>

            <View className="border-border bg-surface gap-1 rounded-[18px] border px-4 py-3.5">
              <Text className="text-foreground text-[14px]">Shown exactly as imported</Text>
              <Text className="text-muted text-[12px] leading-[18px]">
                Staging and lighting passes are skipped for your own photos, so nothing is painted
                over the file you brought in.
              </Text>
            </View>

            <SecondaryButton
              label="Remove photo"
              onPress={removeImported}
              icon={<Trash2 color={palette.charcoal} size={15} />}
            />
          </>
        ) : (
          <>
            <View className="gap-3">
              <SectionLabel
                label="Change background"
                hint={isAiImage ? 'Generates this image again in the new setting' : undefined}
              />
              <View className="flex-row flex-wrap gap-2">
                {BACKGROUND_OPTIONS.map((option) => (
                  <ControlPill
                    key={option.id}
                    label={option.label}
                    selected={asset.background === option.id}
                    onPress={() => {
                      const background = option.id;
                      const patch = {
                        background,
                        scene: sceneForBackground(asset, background),
                      };

                      if (isAiImage) {
                        void restyleAsset(asset.id, patch);
                        return;
                      }
                      updateAsset(asset.id, patch);
                    }}
                  />
                ))}
              </View>
            </View>

            <View className="gap-3">
              <SectionLabel label="Adjust lighting" />
              <View className="flex-row flex-wrap gap-2">
                {LIGHTING_OPTIONS.map((option) => (
                  <ControlPill
                    key={option.id}
                    label={option.label}
                    selected={asset.lighting === option.id}
                    onPress={() => {
                      if (isAiImage) {
                        void restyleAsset(asset.id, { lighting: option.id });
                        return;
                      }
                      updateAsset(asset.id, { lighting: option.id });
                    }}
                  />
                ))}
              </View>
            </View>

            {isAiImage ? (
              <View className="border-border bg-surface gap-1 rounded-[18px] border px-4 py-3.5">
                <Text className="text-foreground text-[14px]">
                  Generated by the AI image service
                </Text>
                <Text className="text-muted text-[12px] leading-[18px]">
                  {asset.renderError
                    ? asset.renderError
                    : 'Your garment photo, product details and style choices are sent to the image service, which photographs the piece. Changing a setting generates it again.'}
                </Text>
              </View>
            ) : (
              <View className="gap-2.5">
                <ToggleRow
                  label="Enhance details"
                  hint="Deeper contrast and crisper fabric texture"
                  value={asset.enhanced}
                  onChange={(value) => updateAsset(asset.id, { enhanced: value })}
                />
                <ToggleRow
                  label="Shadow"
                  hint="Grounds the garment with a soft cast shadow"
                  value={asset.shadow}
                  onChange={(value) => updateAsset(asset.id, { shadow: value })}
                />
              </View>
            )}

            {isAiImage ? (
              <SecondaryButton
                label={isGenerating ? 'Generating…' : 'Generate again'}
                isDisabled={isGenerating}
                onPress={() => void rerenderAsset(asset.id)}
                icon={<RefreshCw color={palette.charcoal} size={15} />}
              />
            ) : null}
          </>
        )}
      </ScrollView>

      <FooterBar>
        <PrimaryButton
          label={asset.isApproved ? 'Approved' : 'Approve'}
          isDisabled={asset.isApproved || isGenerating}
          onPress={() => {
            updateAsset(asset.id, { isApproved: true });
            router.back();
          }}
        />
      </FooterBar>
    </View>
  );
}
