import { useState } from 'react';
import { ScrollView, useWindowDimensions, View } from 'react-native';
import { router } from 'expo-router';
import { Text } from 'heroui-native';
import { ArrowRight } from 'lucide-react-native';

import { ConfigChips } from '@/components/flow/ConfigSummary';
import { FlowHeader } from '@/components/flow/FlowHeader';
import { NoDraft } from '@/components/flow/NoDraft';
import { AssetTile } from '@/components/review/AssetTile';
import { FilterTabs, type AssetFilter } from '@/components/review/FilterTabs';
import { PrimaryButton } from '@/components/ui/ActionButton';
import { FooterBar } from '@/components/ui/FooterBar';
import { ScreenTitle } from '@/components/ui/ScreenTitle';
import { useAppStore } from '@/lib/store';
import { palette } from '@/lib/theme';

export default function ReviewScreen() {
  const draft = useAppStore((state) => state.draft);
  const selection = useAppStore((state) => state.selection);
  const toggleSelection = useAppStore((state) => state.toggleSelection);
  const toggleFavorite = useAppStore((state) => state.toggleFavorite);
  const approveSelected = useAppStore((state) => state.approveSelected);
  const { width } = useWindowDimensions();
  const [filter, setFilter] = useState<AssetFilter>('all');

  if (!draft) return <NoDraft />;

  const assets = draft.assets;
  const visible = filter === 'all' ? assets : assets.filter((asset) => asset.category === filter);
  const tileWidth = (Math.min(width, 560) - 40 - 10) / 2;

  const approveAndContinue = () => {
    approveSelected();
    router.push('/create/export');
  };

  return (
    <View className="bg-ivory flex-1">
      <FlowHeader step="review" />

      <ScrollView
        className="flex-1"
        contentContainerClassName="px-5 pt-6 pb-8 gap-5"
        showsVerticalScrollIndicator={false}
      >
        <ScreenTitle
          eyebrow="Step five"
          title="Your generated content"
          support={`${assets.length} visuals built from your photos and settings. Tap any image to preview and refine it.`}
        />

        <ConfigChips project={draft} />

        <FilterTabs value={filter} onChange={setFilter} />

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

        {visible.length === 0 ? (
          <View className="border-sand bg-surface items-center rounded-[20px] border border-dashed px-6 py-10">
            <Text className="text-muted text-center text-[13px]">
              No visuals in this category yet. Add the matching content purpose and regenerate.
            </Text>
          </View>
        ) : null}
      </ScrollView>

      <FooterBar>
        <Text className="text-muted text-center text-[12px]">
          {selection.length > 0
            ? `${selection.length} selected for export`
            : 'Nothing selected — all visuals will be approved'}
        </Text>
        <PrimaryButton
          label="Approve & Continue"
          onPress={approveAndContinue}
          icon={<ArrowRight color={palette.ivory} size={16} />}
        />
      </FooterBar>
    </View>
  );
}
