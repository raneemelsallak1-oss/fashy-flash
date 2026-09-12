import type { ImageSourcePropType } from 'react-native';

import type {
  AssetCategory,
  BackgroundChoice,
  ContentPurpose,
  GalleryKey,
  GeneratedAsset,
  Lighting,
  ModelChoice,
  StyleSelection,
  VisualStyle,
} from '@/lib/types';

/**
 * Curated fashion imagery standing in for AI output. Generation is simulated,
 * so a look is resolved from the user's style choices instead of a model call.
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

const BACKGROUND_LOOK: Record<BackgroundChoice, GalleryKey> = {
  plain: 'ecommerce',
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

/** Looks whose scene is fixed: a background change cannot restage them. */
const SCENE_LOCKED: GalleryKey[] = ['product', 'detail', 'male', 'diverse'];

export function imageForKind(kind: GalleryKey): ImageSourcePropType {
  return CATALOG[kind];
}

export function imageForAsset(asset: GeneratedAsset): ImageSourcePropType {
  return CATALOG[asset.kind];
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

/** Which source image an asset should use after a background change. */
export function kindForBackground(asset: GeneratedAsset, background: BackgroundChoice): GalleryKey {
  if (SCENE_LOCKED.includes(asset.kind)) return asset.kind;
  return BACKGROUND_LOOK[background];
}

type Overlay = { color: string; opacity: number };

/** Lighting and enhancement are rendered as translucent layers over the image. */
export function lightingOverlay(lighting: Lighting, enhanced: boolean): Overlay[] {
  const layers: Overlay[] = [];

  if (lighting === 'soft') layers.push({ color: '#F6E7DA', opacity: 0.26 });
  if (lighting === 'bright') layers.push({ color: '#FFFFFF', opacity: 0.18 });
  if (enhanced) layers.push({ color: '#231F1C', opacity: 0.07 });

  return layers;
}

const STYLE_LABEL: Record<VisualStyle, string> = {
  minimal: 'Minimal',
  studio: 'Studio',
  street: 'Street',
  luxury: 'Luxury',
  editorial: 'Editorial',
};

type AssetBlueprint = {
  title: string;
  category: AssetCategory;
  kind: GalleryKey;
  aspect: number;
};

/** Model-led looks available for a model choice, ordered by the chosen style. */
function modelLooks(style: StyleSelection): GalleryKey[] {
  if (style.model === 'male') return ['male'];
  if (style.model === 'diverse') return ['diverse', 'street', 'lifestyle', 'studio'];

  const first = STYLE_LOOK[style.visualStyle];
  const rest: GalleryKey[] = ['ecommerce', 'studio', 'street', 'luxury', 'lifestyle'];
  return [first, ...rest.filter((look) => look !== first)];
}

function garmentOnlyBlueprints(): AssetBlueprint[] {
  return [
    { title: 'Ghost mannequin front', category: 'ecommerce', kind: 'product', aspect: 1 },
    { title: 'Fabric detail', category: 'catalog', kind: 'detail', aspect: 1 },
    { title: 'Catalog still life', category: 'catalog', kind: 'product', aspect: 3 / 4 },
    { title: 'Texture close-up', category: 'ecommerce', kind: 'detail', aspect: 4 / 5 },
  ];
}

function modelBlueprints(style: StyleSelection): AssetBlueprint[] {
  const looks = modelLooks(style);
  const pick = (index: number): GalleryKey => looks[index % looks.length] ?? 'studio';
  const purposes = new Set<ContentPurpose>(style.purposes);
  const sceneKind = style.model === 'female' ? BACKGROUND_LOOK[style.background] : pick(0);

  const blueprints: AssetBlueprint[] = [
    { title: 'E-commerce front', category: 'ecommerce', kind: pick(1), aspect: 3 / 4 },
    {
      title: `${STYLE_LABEL[style.visualStyle]} look`,
      category: 'social',
      kind: pick(0),
      aspect: 3 / 4,
    },
    { title: 'Editorial portrait', category: 'catalog', kind: pick(2), aspect: 4 / 5 },
    { title: 'Styled scene', category: 'social', kind: sceneKind, aspect: 3 / 4 },
    { title: 'Ghost mannequin front', category: 'ecommerce', kind: 'product', aspect: 1 },
    { title: 'Fabric detail', category: 'catalog', kind: 'detail', aspect: 1 },
  ];

  if (purposes.has('instagram') || purposes.has('social')) {
    blueprints.push({
      title: 'Social square crop',
      category: 'social',
      kind: pick(3),
      aspect: 1,
    });
  }
  if (purposes.has('lookbook') || purposes.has('showroom')) {
    blueprints.push({
      title: 'Lookbook spread',
      category: 'catalog',
      kind: pick(4),
      aspect: 4 / 5,
    });
  }
  if (purposes.has('catalog')) {
    blueprints.push({
      title: 'Catalog page hero',
      category: 'catalog',
      kind: pick(0),
      aspect: 4 / 5,
    });
  }

  return blueprints;
}

export function buildAssets(style: StyleSelection, projectId: string): GeneratedAsset[] {
  const blueprints = style.model === 'none' ? garmentOnlyBlueprints() : modelBlueprints(style);

  return blueprints.map((blueprint, index) => ({
    id: `${projectId}-a${index}`,
    title: blueprint.title,
    category: blueprint.category,
    kind: blueprint.kind,
    background: style.background,
    lighting: 'balanced' as Lighting,
    enhanced: false,
    shadow: blueprint.kind === 'product',
    aspect: blueprint.aspect,
    isFavorite: false,
    isApproved: false,
  }));
}

const REGENERATE_POOL: Record<AssetCategory, GalleryKey[]> = {
  ecommerce: ['ecommerce', 'studio', 'product'],
  social: ['street', 'lifestyle', 'studio'],
  catalog: ['luxury', 'lifestyle', 'detail'],
};

/** Cycles an asset to the next look, staying inside its scene family. */
export function nextLook(asset: GeneratedAsset): GalleryKey {
  const pool = SCENE_LOCKED.includes(asset.kind)
    ? ([asset.kind, 'product', 'detail'] as GalleryKey[])
    : REGENERATE_POOL[asset.category];
  const current = pool.indexOf(asset.kind);
  return pool[(current + 1) % pool.length] ?? asset.kind;
}
