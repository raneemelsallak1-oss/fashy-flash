import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { router } from 'expo-router';
import { Text } from 'heroui-native';
import { ChevronDown, ChevronUp } from 'lucide-react-native';

import { FlowHeader } from '@/components/flow/FlowHeader';
import { NoDraft } from '@/components/flow/NoDraft';
import { AutoDetectCard } from '@/components/product/AutoDetectCard';
import { ProductField } from '@/components/product/ProductField';
import { PrimaryButton } from '@/components/ui/ActionButton';
import { FooterBar } from '@/components/ui/FooterBar';
import { ScreenTitle } from '@/components/ui/ScreenTitle';
import { Tappable } from '@/components/ui/Tappable';
import { CATEGORY_SUGGESTIONS, FIT_SUGGESTIONS, SIZE_RANGE_SUGGESTIONS } from '@/lib/options';
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
  const canContinue = product.name.trim().length > 0;

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
            support="A few essentials are enough. You can refine anything later."
          />

          <AutoDetectCard isDone={autoDetected} onDetect={autoDetectProduct} />

          <View className="gap-5">
            <ProductField
              label="Product Name"
              value={product.name}
              onChangeText={(value) => updateProduct({ name: value })}
              placeholder="Oversized linen shirt"
            />
            <ProductField
              label="Category"
              value={product.category}
              onChangeText={(value) => updateProduct({ category: value })}
              placeholder="Shirts & Blouses"
              suggestions={CATEGORY_SUGGESTIONS}
            />
            <ProductField
              label="Color"
              value={product.color}
              onChangeText={(value) => updateProduct({ color: value })}
              placeholder="Ivory"
            />
            <ProductField
              label="Material"
              value={product.material}
              onChangeText={(value) => updateProduct({ material: value })}
              placeholder="Linen blend"
            />
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
              <ProductField
                label="Product Description"
                value={product.description}
                onChangeText={(value) => updateProduct({ description: value })}
                placeholder="Relaxed drop shoulder, mother-of-pearl buttons, breathable weave."
                optional
                multiline
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
