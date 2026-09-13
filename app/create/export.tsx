import { useEffect, useState } from 'react';
import { Platform, ScrollView, useWindowDimensions, View } from 'react-native';
import { router } from 'expo-router';
import { Spinner, Text } from 'heroui-native';
import { Check, Download } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { FlowHeader } from '@/components/flow/FlowHeader';
import { NoDraft } from '@/components/flow/NoDraft';
import { CatalogBuilder } from '@/components/export/CatalogBuilder';
import { FormatCard } from '@/components/export/FormatCard';
import { AssetImage } from '@/components/ui/AssetImage';
import { PrimaryButton, SecondaryButton } from '@/components/ui/ActionButton';
import { FooterBar } from '@/components/ui/FooterBar';
import { ScreenTitle, SectionLabel } from '@/components/ui/ScreenTitle';
import { Tappable } from '@/components/ui/Tappable';
import {
  buildCatalogDocument,
  catalogImages,
  expandSizeRange,
  groupCatalogImages,
} from '@/lib/catalog';
import { downloadAssetFiles, downloadCatalogPdf } from '@/lib/download';
import { finalSource, isFinalAsset } from '@/lib/generation';
import { EXPORT_FORMATS } from '@/lib/options';
import { useAppStore } from '@/lib/store';
import { palette } from '@/lib/theme';
import { cn, slugify } from '@/lib/utils';

export default function ExportScreen() {
  const draft = useAppStore((state) => state.draft);
  const selection = useAppStore((state) => state.selection);
  const toggleSelection = useAppStore((state) => state.toggleSelection);
  const toggleExportFormat = useAppStore((state) => state.toggleExportFormat);
  const toggleCatalogImage = useAppStore((state) => state.toggleCatalogImage);
  const commitProject = useAppStore((state) => state.commitProject);
  const startProject = useAppStore((state) => state.startProject);
  const { width } = useWindowDimensions();
  const [isWorking, setIsWorking] = useState(false);
  const [savedCount, setSavedCount] = useState(0);

  useEffect(() => {
    commitProject();
  }, [commitProject]);

  if (!draft) return <NoDraft />;

  const assets = draft.assets.filter(isFinalAsset);
  const formats = draft.exportFormats;
  const chosen = assets.filter((asset) => selection.includes(asset.id));
  const imageFormats = formats.filter((format) => format !== 'catalog-pdf');
  const wantsCatalog = formats.includes('catalog-pdf');
  const needsAssets = imageFormats.length > 0 && chosen.length === 0;
  const catalogReady = !wantsCatalog || draft.catalog.imageIds.length > 0;
  const canDownload = formats.length > 0 && !needsAssets && catalogReady && !isWorking;
  const contentWidth = Math.min(width, 560) - 40;
  const railTile = Math.min(96, contentWidth / 3.4);
  const catalogTile = Math.min(94, (contentWidth - 32 - 20) / 3);

  const groups = groupCatalogImages(catalogImages(draft));
  const sizes = expandSizeRange(draft.product.sizeRange);
  const dataLines = [
    { label: 'Product name', value: draft.product.name.trim() || 'Untitled piece' },
    { label: 'Category', value: draft.product.category.trim() || 'Not set' },
    { label: 'Material', value: draft.product.material.trim() || 'Not set' },
    {
      label: 'Available sizes',
      value: sizes.length > 0 ? sizes.join(' · ') : draft.product.sizeRange.trim() || 'Not set',
    },
  ];

  const download = async () => {
    setIsWorking(true);
    const slug = slugify(draft.product.name || 'fashy-flash');
    const files = chosen.flatMap((asset) =>
      imageFormats.map((format) => ({
        source: finalSource(asset),
        fileName: `${slug}-${slugify(asset.title)}-${format}.png`,
      })),
    );

    let saved = await downloadAssetFiles(files);

    if (wantsCatalog) {
      const done = await downloadCatalogPdf(buildCatalogDocument(draft), `${slug}-catalog.pdf`);
      if (done) saved += 1;
    }

    commitProject();
    setSavedCount(saved);
    setIsWorking(false);
  };

  const createAnother = () => {
    startProject();
    router.dismissTo('/');
    router.push('/create/upload');
  };

  const footerHint = () => {
    if (formats.length === 0) return 'Select at least one export format.';
    if (needsAssets) return 'Select at least one visual to export.';
    if (!catalogReady) return 'Pick at least one garment image for the catalog PDF.';
    return null;
  };

  return (
    <View className="bg-ivory flex-1">
      <FlowHeader step="export" />

      <ScrollView
        className="flex-1"
        contentContainerClassName="px-5 pt-6 pb-8 gap-6"
        showsVerticalScrollIndicator={false}
      >
        <ScreenTitle
          eyebrow="Step six"
          title="Your content is ready"
          support="Pick where this content will live and download the whole set at once."
        />

        {savedCount > 0 ? (
          <Animated.View
            entering={FadeInDown.duration(260)}
            className="border-blush/35 bg-blush-mist flex-row items-center gap-3 rounded-[20px] border px-4 py-3.5"
          >
            <View className="bg-blush h-7 w-7 items-center justify-center rounded-full">
              <Check color={palette.white} size={14} strokeWidth={3} />
            </View>
            <Text className="text-charcoal-soft flex-1 text-[13px] leading-[19px]">
              {Platform.OS === 'web'
                ? `${savedCount} files downloaded to your device.`
                : `${savedCount} files prepared and saved to your project library.`}
            </Text>
          </Animated.View>
        ) : null}

        <View className="gap-3">
          <SectionLabel label="Assets" hint={`${chosen.length} of ${assets.length} selected`} />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerClassName="gap-2.5 pr-2"
          >
            {assets.map((asset) => {
              const selected = selection.includes(asset.id);
              return (
                <Tappable
                  key={asset.id}
                  accessibilityRole="checkbox"
                  accessibilityLabel={asset.title}
                  accessibilityState={{ checked: selected }}
                  onPress={() => toggleSelection(asset.id)}
                  scaleTo={0.95}
                  className={cn(
                    'overflow-hidden rounded-[16px] border',
                    selected ? 'border-blush' : 'border-border',
                  )}
                >
                  <AssetImage
                    asset={asset}
                    width={railTile}
                    aspect={3 / 4}
                    rounded="rounded-[14px]"
                  />
                  <View
                    className={cn(
                      'absolute top-1.5 right-1.5 h-5 w-5 items-center justify-center rounded-full border',
                      selected ? 'border-blush bg-blush' : 'border-border bg-ivory/90',
                    )}
                  >
                    {selected ? <Check color={palette.white} size={11} strokeWidth={3} /> : null}
                  </View>
                </Tappable>
              );
            })}
          </ScrollView>
        </View>

        <View className="gap-3">
          <SectionLabel label="Export formats" hint="Select all you need" />
          <View className="gap-2.5">
            {EXPORT_FORMATS.map((format) => (
              <FormatCard
                key={format.id}
                label={format.label}
                spec={format.spec}
                hint={format.hint}
                selected={formats.includes(format.id)}
                onPress={() => toggleExportFormat(format.id)}
              />
            ))}
          </View>

          {wantsCatalog ? (
            <Animated.View entering={FadeInDown.duration(240)}>
              <CatalogBuilder
                groups={groups}
                selectedImageIds={draft.catalog.imageIds}
                dataLines={dataLines}
                tileWidth={catalogTile}
                onToggleImage={toggleCatalogImage}
                onPreview={() => router.push('/create/catalog')}
              />
            </Animated.View>
          ) : null}
        </View>
      </ScrollView>

      <FooterBar>
        {!isWorking && footerHint() ? (
          <Text className="text-muted text-center text-[12px]">{footerHint()}</Text>
        ) : null}

        <PrimaryButton
          label={isWorking ? 'Preparing files…' : 'Download Assets'}
          isDisabled={!canDownload}
          onPress={() => void download()}
          icon={
            isWorking ? (
              <Spinner color={palette.ivory} />
            ) : (
              <Download color={palette.ivory} size={16} />
            )
          }
        />
        <SecondaryButton label="Create Another Project" onPress={createAnother} />
      </FooterBar>
    </View>
  );
}
