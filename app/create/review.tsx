import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  useWindowDimensions,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { Spinner, Text } from 'heroui-native';
import { ArrowRight, RefreshCw } from 'lucide-react-native';

import { ConfigChips } from '@/components/flow/ConfigSummary';
import { FlowHeader } from '@/components/flow/FlowHeader';
import { NoDraft } from '@/components/flow/NoDraft';
import { AssetTile } from '@/components/review/AssetTile';
import { FilterTabs, type AssetFilter } from '@/components/review/FilterTabs';
import { ImportPhotos } from '@/components/review/ImportPhotos';
import { RevisionRequest } from '@/components/review/RevisionRequest';
import { PrimaryButton } from '@/components/ui/ActionButton';
import { FooterBar } from '@/components/ui/FooterBar';
import { ScreenTitle } from '@/components/ui/ScreenTitle';
import { Tappable } from '@/components/ui/Tappable';
import { useAppStore } from '@/lib/store';
import { palette } from '@/lib/theme';

export default function ReviewScreen() {
  const draft = useAppStore((state) => state.draft);
  const selection = useAppStore((state) => state.selection);
  const toggleSelection = useAppStore((state) => state.toggleSelection);
  const toggleFavorite = useAppStore((state) => state.toggleFavorite);
  const approveSelected = useAppStore((state) => state.approveSelected);
  const addImportedPhotos = useAppStore((state) => state.addImportedPhotos);
  const revisionStatus = useAppStore((state) => state.revisionStatus);
  const revisionError = useAppStore((state) => state.revisionError);
  const lastRevision = useAppStore((state) => state.lastRevision);
  const submitRevision = useAppStore((state) => state.submitRevision);
  const dismissRevision = useAppStore((state) => state.dismissRevision);
  const renderProgress = useAppStore((state) => state.renderProgress);
  const runRenders = useAppStore((state) => state.runRenders);
  const { width } = useWindowDimensions();
  const [filter, setFilter] = useState<AssetFilter>('all');

  if (!draft) return <NoDraft />;

  const assets = draft.assets;
  const visible = filter === 'all' ? assets : assets.filter((asset) => asset.category === filter);
  const tileWidth = (Math.min(width, 560) - 40 - 10) / 2;
  const importedCount = assets.filter((asset) => asset.origin === 'imported').length;
  const isRevising = revisionStatus === 'working';
  const failedRenders = assets.filter((asset) => asset.renderStatus === 'failed').length;
  const finalAssets = assets.filter(
    (asset) => asset.origin === 'imported' || asset.renderStatus === 'ready',
  );
  const finalIds = new Set(finalAssets.map((asset) => asset.id));
  const selectedFinalCount = selection.filter((id) => finalIds.has(id)).length;
  const finalCount = finalAssets.length;
  const isRendering = renderProgress.active;

  const approveAndContinue = () => {
    approveSelected();
    router.push('/create/export');
  };

  return (
    <View className="bg-ivory flex-1">
      <FlowHeader step="review" />

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          className="flex-1"
          contentContainerClassName="px-5 pt-6 pb-8 gap-5"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <ScreenTitle
            eyebrow="Step five"
            title="Your generated content"
            support={`${finalCount} finished fashion photograph${finalCount === 1 ? '' : 's'}. Pending and failed generations remain status cards until a validated image is ready.`}
          />

          <ConfigChips project={draft} />

          {isRendering || failedRenders > 0 ? (
            <View className="border-border bg-surface flex-row items-center gap-3 rounded-[20px] border px-4 py-3.5">
              {isRendering ? <Spinner color={palette.blush} /> : null}

              <View className="flex-1 gap-0.5">
                <Text className="text-foreground text-[13px]">
                  {isRendering
                    ? `Generating images — ${Math.min(renderProgress.done + 1, renderProgress.total)} of ${renderProgress.total}`
                    : `${failedRenders} image${failedRenders === 1 ? '' : 's'} did not arrive`}
                </Text>
                <Text className="text-muted text-[11px] leading-[16px]">
                  {isRendering
                    ? 'Each image appears here as soon as it is ready.'
                    : 'No placeholder was added. Open the failed item or retry generation.'}
                </Text>
              </View>

              {!isRendering ? (
                <Tappable
                  accessibilityRole="button"
                  accessibilityLabel="Generate the missing images again"
                  onPress={() => void runRenders()}
                  className="border-border bg-ivory h-9 w-9 items-center justify-center rounded-full border"
                >
                  <RefreshCw color={palette.charcoal} size={15} />
                </Tappable>
              ) : null}
            </View>
          ) : null}

          <FilterTabs value={filter} onChange={setFilter} />

          <View className="relative">
            <View className="flex-row flex-wrap gap-2.5">
              {visible.map((asset) => (
                <AssetTile
                  key={asset.id}
                  asset={asset}
                  width={tileWidth}
                  isSelected={selection.includes(asset.id)}
                  onOpen={() =>
                    router.push({ pathname: '/asset/[assetId]', params: { assetId: asset.id } })
                  }
                  onToggleSelect={() => toggleSelection(asset.id)}
                  onToggleFavorite={() => toggleFavorite(asset.id)}
                />
              ))}
            </View>

            {isRevising && visible.length > 0 ? (
              <View className="bg-ivory/75 absolute inset-0 items-center justify-center rounded-[20px]">
                <Text className="text-charcoal-soft text-[12px] tracking-[1.4px] uppercase">
                  Rebuilding this set
                </Text>
              </View>
            ) : null}
          </View>

          {visible.length === 0 ? (
            <View className="border-sand bg-surface items-center rounded-[20px] border border-dashed px-6 py-10">
              <Text className="text-muted text-center text-[13px]">
                No visuals in this category yet. Add the matching content purpose and regenerate.
              </Text>
            </View>
          ) : null}

          <RevisionRequest
            status={revisionStatus}
            error={revisionError}
            applied={lastRevision}
            onSubmit={(request) => void submitRevision(request)}
            onDismiss={dismissRevision}
          />

          <ImportPhotos count={importedCount} onAdd={addImportedPhotos} />
        </ScrollView>
      </KeyboardAvoidingView>

      <FooterBar>
        <Text className="text-muted text-center text-[12px]">
          {selectedFinalCount > 0
            ? `${selectedFinalCount} selected for export`
            : finalCount > 0
              ? 'Nothing selected — all finished photographs will be approved'
              : 'Generate at least one photograph to continue'}
        </Text>
        <PrimaryButton
          label="Approve & Continue"
          onPress={approveAndContinue}
          isDisabled={isRevising || finalCount === 0}
          icon={<ArrowRight color={palette.ivory} size={16} />}
        />
      </FooterBar>
    </View>
  );
}
