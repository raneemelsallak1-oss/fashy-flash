import type { ImageSourcePropType } from 'react-native';

import type { BackgroundChoice, GalleryKey, ModelChoice, VisualStyle } from '@/lib/types';

/**
 * Curated fashion imagery used for the style pickers and as the blurred scene
 * behind a staged garment. Generated outputs themselves are always rendered
 * from the user's own uploads — see lib/generation.ts.
 */
const CATALOG: Record<GalleryKey, ImageSourcePropType> = {
  studio: require('@/assets/fashion/studio-female.png'),
  street: require('@/assets/fashion/street-female.png'),
  luxury: require('@/assets/fashion/luxury-editorial.png'),
  ecommerce: require('@/assets/fashion/ecommerce-front.png'),
  lifestyle: require('@/assets/fashion/lifestyle-outdoor.png'),
  male: require('@/assets/fashion/model-male.png'),
  diverse: require('@/assets/fashion/models-diverse.png'),
  product: require('@/assets/fashion/product-only.png'),
  detail: require('@/assets/fashion/detail-macro.png'),
};

/** Scene that stands in for each background choice. `plain` needs no imagery. */
export const BACKGROUND_SCENE: Record<BackgroundChoice, GalleryKey | null> = {
  plain: null,
  studio: 'studio',
  lifestyle: 'lifestyle',
  outdoor: 'street',
  custom: 'luxury',
};

const STYLE_LOOK: Record<VisualStyle, GalleryKey> = {
  minimal: 'ecommerce',
  studio: 'studio',
  street: 'street',
  luxury: 'luxury',
  editorial: 'lifestyle',
};

const MODEL_LOOK: Record<ModelChoice, GalleryKey> = {
  female: 'studio',
  male: 'male',
  diverse: 'diverse',
  none: 'product',
};

const BACKGROUND_LOOK: Record<BackgroundChoice, GalleryKey> = {
  plain: 'ecommerce',
  studio: 'studio',
  lifestyle: 'lifestyle',
  outdoor: 'street',
  custom: 'luxury',
};

export function imageForKind(kind: GalleryKey): ImageSourcePropType {
  return CATALOG[kind];
}

export function imageForStyle(style: VisualStyle): ImageSourcePropType {
  return CATALOG[STYLE_LOOK[style]];
}

export function imageForBackground(background: BackgroundChoice): ImageSourcePropType {
  return CATALOG[BACKGROUND_LOOK[background]];
}

export function imageForModel(model: ModelChoice): ImageSourcePropType {
  return CATALOG[MODEL_LOOK[model]];
}
