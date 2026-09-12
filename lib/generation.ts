import type { ImageSourcePropType } from 'react-native';

import { colorwayLayers, hexForColorName, type ImageLayer } from '@/lib/color';
import { BACKGROUND_SCENE, imageForKind, MODEL_SCENE } from '@/lib/gallery';
import type {
  AssetCategory,
  BackgroundChoice,
  ContentPurpose,
  GalleryKey,
  GarmentPhoto,
  GeneratedAsset,
  ModelChoice,
  OutputVariation,
  PhotoSlot,
  ProductData,
  Project,
  StyleSelection,
  VisualStyle,
} from '@/lib/types';

export const MODEL_LABEL: Record<ModelChoice, string> = {
  female: 'Female model',
  male: 'Male model',
  diverse: 'Diverse models',
  none: 'Product only',
};

export const STYLE_LABEL: Record<VisualStyle, string> = {
  minimal: 'Minimal',
  studio: 'Studio',
  street: 'Street',
  luxury: 'Luxury',
  editorial: 'Editorial',
};

export const BACKGROUND_LABEL: Record<BackgroundChoice, string> = {
  plain: 'Plain backdrop',
  studio: 'Studio sweep',
  lifestyle: 'Lifestyle set',
  outdoor: 'Outdoor light',
  custom: 'Custom set',
};

export const PURPOSE_LABEL: Record<ContentPurpose, string> = {
  ecommerce: 'E-commerce',
  instagram: 'Instagram',
  social: 'Social Media',
  catalog: 'Digital Catalog',
  lookbook: 'Lookbook',
  showroom: 'Digital Showroom',
};

export const VARIATION_LABEL: Record<OutputVariation, string> = {
  front: 'Front view',
  back: 'Back view',
  detail: 'Detail view',
  'full-body': 'Full-body',
  'close-up': 'Close-up',
};

export const SLOT_LABEL: Record<PhotoSlot, string> = {
  front: 'Front',
  back: 'Back',
  detail: 'Detail',
};

/** Backdrop gradient per visual style, used when no scene imagery is staged. */
const STYLE_BACKDROP: Record<VisualStyle, [string, string]> = {
  minimal: ['#FCF9F5', '#EFE7DC'],
  studio: ['#F8F0E7', '#E6D8C8'],
  street: ['#F0EDE8', '#D9D3CB'],
  luxury: ['#F1E7E0', '#DCC7C0'],
  editorial: ['#F9F3EC', '#E7D8CE'],
};

const PLAIN_BACKDROP: [string, string] = ['#FFFFFF', '#F3F0EB'];

/** The two-stop backdrop an output is staged on. */
export function backdropColors(asset: GeneratedAsset): [string, string] {
  if (asset.background === 'plain') return PLAIN_BACKDROP;
  return STYLE_BACKDROP[asset.visualStyle];
}

type VariationConfig = {
  variation: OutputVariation;
  title: string;
  category: AssetCategory;
  /** Photo tag this output wants as its source. */
  slot: PhotoSlot;
  zoom: number;
  focusY: number;
  inset: number;
  aspect: number;
  staged: boolean;
};

/** The five core outputs every configuration produces. */
function coreVariations(style: StyleSelection): VariationConfig[] {
  const productOnly = style.model === 'none';

  return [
    {
      variation: 'front',
      title: 'Front view',
      category: 'ecommerce',
      slot: 'front',
      zoom: 1,
      focusY: 0.5,
      inset: 0,
      aspect: 3 / 4,
      staged: false,
    },
    {
      variation: 'back',
      title: 'Back view',
      category: 'ecommerce',
      slot: 'back',
      zoom: 1,
      focusY: 0.5,
      inset: 0,
      aspect: 3 / 4,
      staged: false,
    },
    {
      variation: 'detail',
      title: 'Detail view',
      category: 'catalog',
      slot: 'detail',
      zoom: 1.85,
      focusY: 0.45,
      inset: 0,
      aspect: 1,
      staged: false,
    },
    {
      variation: 'full-body',
      title: productOnly ? 'Full garment shot' : 'Full-body model image',
      category: 'social',
      slot: 'front',
      zoom: 1.04,
      focusY: 0.5,
      inset: productOnly ? 0.13 : 0.09,
      aspect: 2 / 3,
      staged: true,
    },
    {
      variation: 'close-up',
      title: 'Close-up product image',
      category: 'ecommerce',
      slot: 'detail',
      zoom: 1.4,
      focusY: 0.5,
      inset: 0.13,
      aspect: 1,
      staged: true,
    },
  ];
}

/** Extra crops requested by the chosen content purposes. */
const PURPOSE_VARIATIONS: Record<ContentPurpose, VariationConfig> = {
  ecommerce: {
    variation: 'front',
    title: 'E-commerce main image',
    category: 'ecommerce',
    slot: 'front',
    zoom: 1,
    focusY: 0.5,
    inset: 0.12,
    aspect: 1,
    staged: true,
  },
  instagram: {
    variation: 'full-body',
    title: 'Instagram square',
    category: 'social',
    slot: 'front',
    zoom: 1.06,
    focusY: 0.42,
    inset: 0.07,
    aspect: 1,
    staged: true,
  },
  social: {
    variation: 'full-body',
    title: 'Story crop',
    category: 'social',
    slot: 'front',
    zoom: 1.12,
    focusY: 0.4,
    inset: 0.06,
    aspect: 9 / 16,
    staged: true,
  },
  catalog: {
    variation: 'front',
    title: 'Catalog page image',
    category: 'catalog',
    slot: 'front',
    zoom: 1,
    focusY: 0.5,
    inset: 0.09,
    aspect: 4 / 5,
    staged: true,
  },
  lookbook: {
    variation: 'back',
    title: 'Lookbook spread',
    category: 'catalog',
    slot: 'back',
    zoom: 1.04,
    focusY: 0.46,
    inset: 0.1,
    aspect: 4 / 5,
    staged: true,
  },
  showroom: {
    variation: 'detail',
    title: 'Showroom fabric study',
    category: 'catalog',
    slot: 'detail',
    zoom: 1.6,
    focusY: 0.5,
    inset: 0.1,
    aspect: 4 / 5,
    staged: true,
  },
};

const PURPOSE_ORDER: ContentPurpose[] = [
  'ecommerce',
  'instagram',
  'social',
  'catalog',
  'lookbook',
  'showroom',
];

/** Every output the current configuration will generate, in order. */
export function variationPlan(style: StyleSelection): VariationConfig[] {
  const plan = coreVariations(style);
  const chosen = new Set(style.purposes);

  PURPOSE_ORDER.filter((purpose) => chosen.has(purpose)).forEach((purpose) => {
    plan.push(PURPOSE_VARIATIONS[purpose]);
  });

  return plan;
}

export function plannedOutputCount(style: StyleSelection): number {
  return variationPlan(style).length;
}

/** Fallback order when the requested photo tag was never uploaded. */
const SLOT_FALLBACK: Record<PhotoSlot, PhotoSlot[]> = {
  front: ['front', 'back', 'detail'],
  back: ['back', 'front', 'detail'],
  detail: ['detail', 'front', 'back'],
};

function sourcePhoto(photos: GarmentPhoto[], slot: PhotoSlot): GarmentPhoto | null {
  for (const candidate of SLOT_FALLBACK[slot]) {
    const photo = photos.find((item) => item.slot === candidate);
    if (photo) return photo;
  }
  return null;
}

/** Scene staged behind an output, from the model and background choices. */
function sceneFor(config: VariationConfig, style: StyleSelection): GalleryKey | null {
  if (!config.staged) return null;
  if (config.variation === 'full-body' && style.model !== 'none') {
    return MODEL_SCENE[style.model] ?? BACKGROUND_SCENE[style.background];
  }
  return BACKGROUND_SCENE[style.background];
}

/** Product data snapshot shown under an output. */
export function describeGarment(product: ProductData): string {
  return [product.color.trim(), product.material.trim(), product.fit.trim()]
    .filter(Boolean)
    .join(' · ');
}

/** The look an output was staged in, e.g. "Female model · Minimal · Studio sweep". */
export function describeLook(asset: GeneratedAsset): string {
  return [
    MODEL_LABEL[asset.model],
    STYLE_LABEL[asset.visualStyle],
    BACKGROUND_LABEL[asset.background],
  ].join(' · ');
}

/** Where an output's imagery came from, e.g. "Front upload · reused for Back view". */
export function describeSource(asset: GeneratedAsset): string {
  if (!asset.sourceUri) return 'No upload available — placeholder imagery';

  const base = `${SLOT_LABEL[asset.sourceSlot]} upload`;
  if (!asset.isDerived) return base;
  return `${base}, recropped for the ${VARIATION_LABEL[asset.variation].toLowerCase()}`;
}

/**
 * Builds the output set for a project. Every output is a treatment of the
 * user's own garment photos, recolored to the product color and staged in the
 * chosen model, style and background.
 */
export function buildAssets(project: Project): GeneratedAsset[] {
  const { photos, product, style } = project;
  const colorName = product.color.trim();
  const colorHex = hexForColorName(colorName);
  const spec = describeGarment(product);

  return variationPlan(style).map((config, index) => {
    const photo = sourcePhoto(photos, config.slot);

    return {
      id: `${project.id}-a${index}`,
      title: config.title,
      variation: config.variation,
      category: config.category,
      sourceUri: photo?.uri ?? null,
      sourceSlot: photo?.slot ?? config.slot,
      requestedSlot: config.slot,
      isDerived: photo ? photo.slot !== config.slot : false,
      model: style.model,
      visualStyle: style.visualStyle,
      background: style.background,
      scene: sceneFor(config, style),
      staged: config.staged,
      colorName,
      colorHex,
      spec,
      zoom: config.zoom,
      baseZoom: config.zoom,
      focusY: config.focusY,
      inset: config.inset,
      take: 1,
      lighting: 'balanced',
      enhanced: false,
      shadow: config.staged,
      aspect: config.aspect,
      isFavorite: false,
      isApproved: false,
    };
  });
}

/** Image the output is rendered from: the user's upload, or curated fallback. */
export function assetSource(asset: GeneratedAsset): ImageSourcePropType {
  if (asset.sourceUri) return { uri: asset.sourceUri };
  return imageForKind(asset.variation === 'detail' ? 'detail' : 'product');
}

/** Recolor layers applied to the garment itself. */
export function garmentLayers(asset: GeneratedAsset): ImageLayer[] {
  if (!asset.colorName) return [];
  return colorwayLayers(asset.colorHex);
}

/** Lighting and enhancement layers applied over the whole frame. */
export function treatmentLayers(asset: GeneratedAsset): ImageLayer[] {
  const layers: ImageLayer[] = [];

  if (asset.lighting === 'soft') {
    layers.push({ id: 'light-soft', color: '#F6E7DA', opacity: 0.26 });
  }
  if (asset.lighting === 'bright') {
    layers.push({ id: 'light-bright', color: '#FFFFFF', opacity: 0.18 });
  }
  if (asset.enhanced) {
    layers.push({ id: 'enhance', color: '#231F1C', opacity: 0.07, blend: 'soft-light' });
  }

  return layers;
}

/** Scene behind an output after the user picks a different background. */
export function sceneForBackground(
  asset: GeneratedAsset,
  background: BackgroundChoice,
): GalleryKey | null {
  if (!asset.staged) return null;
  if (asset.variation === 'full-body' && asset.model !== 'none' && background !== 'plain') {
    return MODEL_SCENE[asset.model] ?? BACKGROUND_SCENE[background];
  }
  return BACKGROUND_SCENE[background];
}

const TAKE_FOCUS = [0.5, 0.36, 0.62];
const TAKE_ZOOM = [1, 1.14, 1.06];

/**
 * Restages the same garment for another take: the source photo, color, product
 * data and staging stay fixed, only the framing shifts.
 */
export function nextTake(asset: GeneratedAsset): Partial<GeneratedAsset> {
  const take = (asset.take % TAKE_ZOOM.length) + 1;

  return {
    take,
    focusY: TAKE_FOCUS[take - 1] ?? 0.5,
    zoom: asset.baseZoom * (TAKE_ZOOM[take - 1] ?? 1),
    isApproved: false,
  };
}
