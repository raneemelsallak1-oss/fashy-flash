import { useState } from 'react';
import { Platform, ScrollView, useWindowDimensions, View } from 'react-native';
import { Spinner, Text } from 'heroui-native';
import { ArrowLeft, Check, Download } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { CatalogPageView } from '@/components/catalog/CatalogPageView';
import { NoDraft } from '@/components/flow/NoDraft';
import { PrimaryButton, SecondaryButton } from '@/components/ui/ActionButton';
import { FooterBar } from '@/components/ui/FooterBar';
import { ScreenTitle } from '@/components/ui/ScreenTitle';
import { Tappable } from '@/components/ui/Tappable';
import { buildCatalogDocument } from '@/lib/catalog';
import { downloadCatalogPdf } from '@/lib/download';
import { goBackOrReplace } from '@/lib/navigation';
import { useAppStore } from '@/lib/store';
import { palette } from '@/lib/theme';
import { slugify } from '@/lib/utils';

export default function CatalogPreviewScreen() {
  const draft = useAppStore((state) => state.draft);
  const commitProject = useAppStore((state) => state.commitProject);
  const { width } = useWindowDimensions();
  const [isWorking, setIsWorking] = useState(false);
  const [exported, setExported] = useState(false);

  if (!draft) return <NoDraft />;

  const doc = buildCatalogDocument(draft);
  const pageWidth = Math.min(width, 560) - 40;

  const download = async () => {
    setIsWorking(true);
    const done = await downloadCatalogPdf(doc, `${slugify(doc.title)}-catalog.pdf`);
    commitProject();
    setExported(done);
    setIsWorking(false);
  };

  return (
    <View className="bg-ivory-deep flex-1">
      <View className="border-border/70 bg-ivory pt-safe-offset-2 flex-row items-center gap-3 border-b px-5 pb-3">
        <Tappable
          accessibilityRole="button"
          accessibilityLabel="Back to export"
          className="bg-surface border-border h-9 w-9 items-center justify-center rounded-full border"
          onPress={() => goBackOrReplace('/create/export')}
        >
          <ArrowLeft color={palette.charcoal} size={17} />
        </Tappable>
        <View className="flex-1">
          <Text className="text-foreground text-[15px]">Catalog preview</Text>
          <Text className="text-muted text-[12px]">
            {doc.pages.length} pages · A4 portrait · {doc.imageCount} images
          </Text>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerClassName="px-5 pt-6 pb-8 gap-5"
        showsVerticalScrollIndicator={false}
      >
        <ScreenTitle
          eyebrow="Digital catalog PDF"
          title={doc.title}
          support="This is exactly how the catalog will be laid out. Scroll through the pages, then download the PDF."
        />

        {exported ? (
          <Animated.View
            entering={FadeInDown.duration(240)}
            className="border-blush/35 bg-blush-mist flex-row items-center gap-3 rounded-[20px] border px-4 py-3.5"
          >
            <View className="bg-blush h-7 w-7 items-center justify-center rounded-full">
              <Check color={palette.white} size={14} strokeWidth={3} />
            </View>
            <Text className="text-charcoal-soft flex-1 text-[13px] leading-[19px]">
              {Platform.OS === 'web'
                ? 'Your catalog opened in the print view — choose Save as PDF to finish the download.'
                : 'Catalog PDF prepared and saved to your project library.'}
            </Text>
          </Animated.View>
        ) : null}

        {doc.pages.map((page, index) => (
          <Animated.View
            key={page.id}
            entering={FadeInDown.delay(Math.min(index, 5) * 60).duration(280)}
            className="gap-2"
          >
            <Text className="text-muted text-[10px] tracking-[1.8px] uppercase">
              {page.label} · Page {index + 1}
            </Text>
            <CatalogPageView
              doc={doc}
              page={page}
              index={index}
              total={doc.pages.length}
              width={pageWidth}
            />
          </Animated.View>
        ))}
      </ScrollView>

      <FooterBar>
        <PrimaryButton
          label={isWorking ? 'Preparing PDF…' : 'Download PDF'}
          isDisabled={isWorking}
          onPress={() => void download()}
          icon={
            isWorking ? (
              <Spinner color={palette.ivory} />
            ) : (
              <Download color={palette.ivory} size={16} />
            )
          }
        />
        <SecondaryButton
          label="Edit catalog contents"
          onPress={() => goBackOrReplace('/create/export')}
        />
      </FooterBar>
    </View>
  );
}
