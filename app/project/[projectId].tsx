import { ScrollView, useWindowDimensions, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Text } from 'heroui-native';
import { ArrowLeft, Heart } from 'lucide-react-native';

import { AssetImage } from '@/components/ui/AssetImage';
import { PrimaryButton } from '@/components/ui/ActionButton';
import { SectionLabel } from '@/components/ui/ScreenTitle';
import { Tappable } from '@/components/ui/Tappable';
import { isFinalAsset } from '@/lib/generation';
import { goBackOrReplace } from '@/lib/navigation';
import { EXPORT_FORMATS, MODEL_OPTIONS, STYLE_OPTIONS } from '@/lib/options';
import { useAppStore } from '@/lib/store';
import { palette } from '@/lib/theme';

export default function ProjectDetailScreen() {
  const { projectId } = useLocalSearchParams<{ projectId: string }>();
  const projects = useAppStore((state) => state.projects);
  const startProject = useAppStore((state) => state.startProject);
  const { width } = useWindowDimensions();

  const project = projects.find((item) => item.id === projectId);
  const tileWidth = (Math.min(width, 560) - 40 - 10) / 2;

  const createProject = () => {
    startProject();
    router.replace('/create/upload');
  };

  if (!project) {
    return (
      <View className="bg-ivory flex-1 items-center justify-center gap-4 px-8">
        <Text className="font-display-medium text-foreground text-center text-[20px]">
          This project is no longer available
        </Text>
        <PrimaryButton label="Back to studio" onPress={() => router.replace('/')} />
      </View>
    );
  }

  const model = MODEL_OPTIONS.find((option) => option.id === project.style.model)?.label ?? '';
  const style =
    STYLE_OPTIONS.find((option) => option.id === project.style.visualStyle)?.label ?? '';
  const formats = EXPORT_FORMATS.filter((format) => project.exportFormats.includes(format.id));
  const assets = project.assets.filter(isFinalAsset);

  return (
    <View className="bg-ivory flex-1">
      <View className="pt-safe-offset-2 px-5 pb-2">
        <Tappable
          accessibilityRole="button"
          accessibilityLabel="Go back"
          className="border-border bg-surface h-9 w-9 items-center justify-center rounded-full border"
          onPress={() => goBackOrReplace('/')}
        >
          <ArrowLeft color={palette.charcoal} size={17} />
        </Tappable>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerClassName="px-5 pb-10 gap-6"
        showsVerticalScrollIndicator={false}
      >
        <View className="gap-2">
          <Text className="text-blush text-[11px] tracking-[2px] uppercase">Project</Text>
          <Text className="font-display-medium text-foreground text-[28px] leading-[34px]">
            {project.name}
          </Text>
          <Text className="text-muted text-[13px]">
            {[project.product.category, project.product.material].filter(Boolean).join(' · ') ||
              'No product details added'}
          </Text>
        </View>

        <View className="flex-row flex-wrap gap-2">
          {[model, style, `${project.photos.length} source photos`].filter(Boolean).map((chip) => (
            <View key={chip} className="border-border bg-surface rounded-full border px-3 py-1.5">
              <Text className="text-charcoal-soft text-[12px]">{chip}</Text>
            </View>
          ))}
        </View>

        <View className="gap-3">
          <SectionLabel label="Generated content" hint={`${assets.length} visuals`} />
          <View className="flex-row flex-wrap gap-2.5">
            {assets.map((asset) => (
              <View key={asset.id} className="gap-1.5" style={{ width: tileWidth }}>
                <View className="relative">
                  <AssetImage asset={asset} width={tileWidth} />
                  {asset.isFavorite ? (
                    <View className="bg-ivory/95 absolute top-2 right-2 h-6 w-6 items-center justify-center rounded-full">
                      <Heart color={palette.blush} fill={palette.blush} size={12} />
                    </View>
                  ) : null}
                </View>
                <Text className="text-charcoal-soft text-[12px]">{asset.title}</Text>
              </View>
            ))}
          </View>
        </View>

        {formats.length > 0 ? (
          <View className="gap-3">
            <SectionLabel label="Exported for" />
            <View className="gap-2">
              {formats.map((format) => (
                <View
                  key={format.id}
                  className="border-border bg-surface flex-row items-center justify-between rounded-[16px] border px-4 py-3"
                >
                  <Text className="text-foreground text-[13px]">{format.label}</Text>
                  <Text className="text-muted text-[12px]">{format.spec}</Text>
                </View>
              ))}
            </View>
          </View>
        ) : null}

        <PrimaryButton label="Create Another Project" onPress={createProject} />
      </ScrollView>
    </View>
  );
}
