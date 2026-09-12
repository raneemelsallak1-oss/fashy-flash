import { ScrollView, useWindowDimensions, View } from 'react-native';
import { router } from 'expo-router';
import { Text } from 'heroui-native';
import { Sparkles } from 'lucide-react-native';

import { FlowHeader } from '@/components/flow/FlowHeader';
import { NoDraft } from '@/components/flow/NoDraft';
import { PrimaryButton } from '@/components/ui/ActionButton';
import { FooterBar } from '@/components/ui/FooterBar';
import { ScreenTitle, SectionLabel } from '@/components/ui/ScreenTitle';
import { PillToggle, SelectionCard } from '@/components/ui/SelectionCard';
import { imageForBackground, imageForModel, imageForStyle } from '@/lib/gallery';
import { BACKGROUND_OPTIONS, MODEL_OPTIONS, PURPOSE_OPTIONS, STYLE_OPTIONS } from '@/lib/options';
import { useAppStore } from '@/lib/store';
import { palette } from '@/lib/theme';

export default function StyleScreen() {
  const draft = useAppStore((state) => state.draft);
  const updateStyle = useAppStore((state) => state.updateStyle);
  const togglePurpose = useAppStore((state) => state.togglePurpose);
  const { width } = useWindowDimensions();

  if (!draft) return <NoDraft />;

  const style = draft.style;
  const contentWidth = Math.min(width, 560) - 40;
  const modelTile = (contentWidth - 10) / 2;
  const scrollTile = 132;

  return (
    <View className="bg-ivory flex-1">
      <FlowHeader step="style" />

      <ScrollView
        className="flex-1"
        contentContainerClassName="pt-6 pb-8 gap-7"
        showsVerticalScrollIndicator={false}
      >
        <View className="px-5">
          <ScreenTitle
            eyebrow="Step three"
            title="Choose your style"
            support="Pick how your garment should be presented. Every choice changes the visuals you get."
          />
        </View>

        <View className="gap-3 px-5">
          <SectionLabel label="Model" />
          <View className="flex-row flex-wrap gap-2.5">
            {MODEL_OPTIONS.map((option) => (
              <SelectionCard
                key={option.id}
                label={option.label}
                hint={option.hint}
                image={imageForModel(option.id)}
                aspect={4 / 5}
                selected={style.model === option.id}
                onPress={() => updateStyle({ model: option.id })}
                width={modelTile}
              />
            ))}
          </View>
        </View>

        <View className="gap-3">
          <SectionLabel label="Visual Style" className="px-5" />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerClassName="gap-2.5 px-5"
          >
            {STYLE_OPTIONS.map((option) => (
              <SelectionCard
                key={option.id}
                label={option.label}
                hint={option.hint}
                image={imageForStyle(option.id)}
                aspect={3 / 4}
                selected={style.visualStyle === option.id}
                onPress={() => updateStyle({ visualStyle: option.id })}
                width={scrollTile}
              />
            ))}
          </ScrollView>
        </View>

        <View className="gap-3">
          <SectionLabel label="Background" className="px-5" />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerClassName="gap-2.5 px-5"
          >
            {BACKGROUND_OPTIONS.map((option) => (
              <SelectionCard
                key={option.id}
                label={option.label}
                hint={option.hint}
                image={imageForBackground(option.id)}
                aspect={1}
                selected={style.background === option.id}
                onPress={() => updateStyle({ background: option.id })}
                width={scrollTile}
              />
            ))}
          </ScrollView>
        </View>

        <View className="gap-3 px-5">
          <SectionLabel label="Content Purpose" hint="Select all that apply" />
          <View className="flex-row flex-wrap gap-2">
            {PURPOSE_OPTIONS.map((option) => (
              <PillToggle
                key={option.id}
                label={option.label}
                selected={style.purposes.includes(option.id)}
                onPress={() => togglePurpose(option.id)}
              />
            ))}
          </View>
        </View>
      </ScrollView>

      <FooterBar>
        <PrimaryButton
          label="Generate Content"
          isDisabled={style.purposes.length === 0}
          onPress={() => router.push('/create/generate')}
          icon={<Sparkles color={palette.ivory} size={16} />}
        />
        {style.purposes.length === 0 ? (
          <Text className="text-muted text-center text-[12px]">
            Choose at least one place you will use this content.
          </Text>
        ) : null}
      </FooterBar>
    </View>
  );
}
