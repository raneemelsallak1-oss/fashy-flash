import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { router } from 'expo-router';
import { Text } from 'heroui-native';
import { Check, ChevronDown, ChevronUp } from 'lucide-react-native';

import { FlowHeader } from '@/components/flow/FlowHeader';
import { NoDraft } from '@/components/flow/NoDraft';
import { AutoDetectCard } from '@/components/product/AutoDetectCard';
import { ProductField } from '@/components/product/ProductField';
import { PrimaryButton } from '@/components/ui/ActionButton';
import { FooterBar } from '@/components/ui/FooterBar';
import { ScreenTitle } from '@/components/ui/ScreenTitle';
import { PillToggle } from '@/components/ui/SelectionCard';
import { Tappable } from '@/components/ui/Tappable';
import {
  CATEGORY_SUGGESTIONS,
  FIT_SUGGESTIONS,
  MATERIAL_OPTIONS,
  SIZE_RANGE_SUGGESTIONS,
} from '@/lib/options';
import { useAppStore } from '@/lib/store';
import { palette } from '@/lib/theme';

export default function ProductScreen() {
  const draft = useAppStore((state) => state.draft);
  const autoDetected = useAppStore((state) => state.autoDetected);
  const updateProduct = useAppStore((state) => state.updateProduct);
  const autoDetectProduct = useAppStore((state) => state.autoDetectProduct);
  const [showOptional, setShowOptional] = useState(false);

  if (!draft) return <NoDraft />;

  const product = draft.product;
  const selectedMaterials = product.material
    .split(',')
    .map((material) => material.trim())
    .filter(Boolean);
  const toggleMaterial = (material: string) => {
    const isSelected = selectedMaterials.includes(material);
    const nextMaterials = isSelected
      ? selectedMaterials.filter((selected) => selected !== material)
      : [...selectedMaterials, material];

    updateProduct({ material: nextMaterials.join(', ') });
  };
  const canContinue =
    product.name.trim().length > 0 &&
    product.category.trim().length > 0 &&
    product.description.trim().length > 0;

  return (
    <View className="bg-ivory flex-1">
      <FlowHeader step="product" />

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          className="flex-1"
          contentContainerClassName="px-5 pt-6 pb-8 gap-6"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <ScreenTitle
            eyebrow="Step two"
            title="Tell us about your product"
            support="These details are written into the photography brief, so be specific."
          />

          <AutoDetectCard isDone={autoDetected} onDetect={autoDetectProduct} />

          <View className="gap-5">
            <ProductField
              label="Product Name"
              value={product.name}
              onChangeText={(value) => updateProduct({ name: value })}
              placeholder="Oversized linen shirt"
            />
            <View className="gap-2.5">
              <Text className="text-charcoal-soft text-[12px] tracking-[1.4px] uppercase">
                Category
              </Text>
              <Text className="text-muted text-[12px]">Choose the closest match.</Text>
              <View className="flex-row flex-wrap gap-2">
                {CATEGORY_SUGGESTIONS.map((category) => {
                  const selected = product.category === category;

                  return (
                    <Tappable
                      key={category}
                      accessibilityRole="radio"
                      accessibilityLabel={category}
                      accessibilityState={{ checked: selected }}
                      onPress={() => updateProduct({ category })}
                      scaleTo={0.96}
                      className={`flex-row items-center gap-2 rounded-full border px-3.5 py-2.5 ${
                        selected ? 'border-blush bg-blush-mist' : 'border-border bg-surface'
                      }`}
                    >
                      {selected ? (
                        <View className="bg-blush h-4 w-4 items-center justify-center rounded-full">
                          <Check color={palette.white} size={11} strokeWidth={3} />
                        </View>
                      ) : null}
                      <Text
                        className={`text-[13px] ${
                          selected ? 'text-foreground' : 'text-charcoal-soft'
                        }`}
                      >
                        {category}
                      </Text>
                    </Tappable>
                  );
                })}
              </View>
            </View>
            <ProductField
              label="Details"
              value={product.description}
              onChangeText={(value) => updateProduct({ description: value })}
              placeholder="Oversized ivory linen shirt, relaxed drop shoulder, mother-of-pearl buttons, breathable weave."
              hint="A short description of the piece — colour, cut and finish."
              multiline
            />
            <View className="gap-2.5">
              <Text className="text-charcoal-soft text-[12px] tracking-[1.4px] uppercase">
                Material
              </Text>
              <Text className="text-muted text-[12px]">
                Swipe to explore. Select one or more materials.
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerClassName="gap-2 pr-5"
                keyboardShouldPersistTaps="handled"
              >
                {MATERIAL_OPTIONS.map((material) => (
                  <PillToggle
                    key={material}
                    label={material}
                    selected={selectedMaterials.includes(material)}
                    onPress={() => toggleMaterial(material)}
                  />
                ))}
              </ScrollView>
            </View>
            <ProductField
              label="Fit"
              value={product.fit}
              onChangeText={(value) => updateProduct({ fit: value })}
              placeholder="Oversized"
              suggestions={FIT_SUGGESTIONS}
            />
            <ProductField
              label="Size Range"
              value={product.sizeRange}
              onChangeText={(value) => updateProduct({ sizeRange: value })}
              placeholder="XS – XL"
              suggestions={SIZE_RANGE_SUGGESTIONS}
            />
          </View>

          <Tappable
            accessibilityRole="button"
            accessibilityState={{ expanded: showOptional }}
            onPress={() => setShowOptional((value) => !value)}
            scaleTo={0.99}
            className="border-border bg-surface flex-row items-center justify-between rounded-[18px] border px-4 py-3.5"
          >
            <Text className="text-foreground text-[13px]">
              {showOptional ? 'Hide optional details' : 'Add optional details'}
            </Text>
            {showOptional ? (
              <ChevronUp color={palette.charcoalSoft} size={16} />
            ) : (
              <ChevronDown color={palette.charcoalSoft} size={16} />
            )}
          </Tappable>

          {showOptional ? (
            <View className="gap-5">
              <ProductField
                label="Brand"
                value={product.brand}
                onChangeText={(value) => updateProduct({ brand: value })}
                placeholder="Studio Maren"
                optional
              />
              <ProductField
                label="SKU"
                value={product.sku}
                onChangeText={(value) => updateProduct({ sku: value })}
                placeholder="SM-LN-001"
                optional
              />
            </View>
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>

      <FooterBar>
        <PrimaryButton
          label="Continue"
          isDisabled={!canContinue}
          onPress={() => router.push('/create/style')}
        />
      </FooterBar>
    </View>
  );
}
