import { View, type DimensionValue } from 'react-native';

import { GarmentFill } from '@/components/ui/GarmentFill';
import type { GeneratedAsset, ModelChoice } from '@/lib/types';

type Tone = { skin: string; hair: string; bottoms: string };

/** Figures per model choice — "Diverse models" stages two together. */
const FIGURES: Record<Exclude<ModelChoice, 'none'>, Tone[]> = {
  female: [{ skin: '#E0C3AE', hair: '#3B2C25', bottoms: '#DED4C6' }],
  male: [{ skin: '#D6B192', hair: '#2E2621', bottoms: '#D6CBBC' }],
  diverse: [
    { skin: '#B07E5C', hair: '#241C18', bottoms: '#DAD0C2' },
    { skin: '#E7CDB6', hair: '#4A3428', bottoms: '#D3C8B9' },
  ],
};

const SHADOW = 'rgba(35, 33, 32, 0.14)';

/** One sleeve: garment fabric down the upper arm, skin below it. */
function Arm({ asset, tone, side }: { asset: GeneratedAsset; tone: Tone; side: 'left' | 'right' }) {
  return (
    <View
      style={{
        position: 'absolute',
        top: '17%',
        height: '34%',
        width: '12%',
        borderRadius: 999,
        overflow: 'hidden',
        ...(side === 'left' ? { left: '6%' } : { right: '6%' }),
      }}
    >
      <GarmentFill asset={asset} zoom={2.4} focusY={0.45} style={{ height: '62%' }} />
      <View style={{ flex: 1, backgroundColor: tone.skin }} />
    </View>
  );
}

type FigureProps = { asset: GeneratedAsset; tone: Tone; height: DimensionValue };

/**
 * A quiet editorial figure the garment is styled onto: the uploaded photo is
 * mapped across the body and sleeves, so the output reads as the user's own
 * garment worn by the selected model type.
 */
function Figure({ asset, tone, height }: FigureProps) {
  return (
    <View style={{ height, aspectRatio: 0.42 }}>
      {asset.shadow ? (
        <View
          style={{
            position: 'absolute',
            bottom: 0,
            left: '12%',
            right: '12%',
            height: '2.2%',
            borderRadius: 999,
            backgroundColor: SHADOW,
          }}
        />
      ) : null}

      <View
        style={{
          position: 'absolute',
          top: '51%',
          bottom: '2.5%',
          left: '29%',
          width: '17%',
          borderRadius: 999,
          backgroundColor: tone.bottoms,
        }}
      />
      <View
        style={{
          position: 'absolute',
          top: '51%',
          bottom: '2.5%',
          right: '29%',
          width: '17%',
          borderRadius: 999,
          backgroundColor: tone.bottoms,
        }}
      />

      <Arm asset={asset} tone={tone} side="left" />
      <Arm asset={asset} tone={tone} side="right" />

      <View
        style={{
          position: 'absolute',
          top: 0,
          left: '33%',
          width: '34%',
          height: '9%',
          borderRadius: 999,
          backgroundColor: tone.hair,
        }}
      />
      <View
        style={{
          position: 'absolute',
          top: '1.5%',
          left: '35%',
          width: '30%',
          height: '12%',
          borderRadius: 999,
          backgroundColor: tone.skin,
        }}
      />
      <View
        style={{
          position: 'absolute',
          top: '12.5%',
          left: '45%',
          width: '10%',
          height: '4%',
          backgroundColor: tone.skin,
        }}
      />

      <View
        style={{
          position: 'absolute',
          top: '15.5%',
          left: '18%',
          right: '18%',
          height: '37%',
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          borderBottomLeftRadius: 12,
          borderBottomRightRadius: 12,
          overflow: 'hidden',
          backgroundColor: asset.colorHex,
        }}
      >
        <GarmentFill asset={asset} zoom={Math.max(asset.zoom, 1.3)} focusY={0.42} />
      </View>

      <View
        style={{
          position: 'absolute',
          top: '15.5%',
          left: '42%',
          width: '16%',
          height: '4.5%',
          borderBottomLeftRadius: 999,
          borderBottomRightRadius: 999,
          backgroundColor: tone.skin,
        }}
      />
    </View>
  );
}

/** The garment presented on the model type the user selected. */
export function WornFigure({ asset }: { asset: GeneratedAsset }) {
  const figures = FIGURES[asset.model === 'none' ? 'female' : asset.model];
  const isPair = figures.length > 1;

  return (
    <View className="flex-1 flex-row items-end justify-center overflow-hidden">
      {figures.map((tone, index) => (
        <View key={tone.skin} style={{ height: '100%', marginLeft: index > 0 ? 8 : 0 }}>
          <Figure asset={asset} tone={tone} height={isPair && index === 0 ? '92%' : '100%'} />
        </View>
      ))}
    </View>
  );
}
