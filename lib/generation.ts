import type { ImageSourcePropType } from 'react-native';

import { BACKGROUND_SCENE, imageForKind } from '@/lib/gallery';
import type {
  AssetCategory,
  BackgroundChoice,
  ContentPurpose,
  Framing,
  GalleryKey,
  GarmentPhoto,
  GeneratedAsset,
  ImageLayer,
  ModelChoice,
  OutputVariation,
  PhotoSlot,
  ProductData,
  Project,
  StyleSelection,
  TreatmentOverrides,
  VisualStyle,
} from '@/lib/types';

export const MODEL_LABEL: Record<ModelChoice, string> = {
  female: 'Female model',
  male: 'Male model',
  diverse: 'Diverse models',
  none: 'Female model',
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
  'full-body': 'Full body',
  front: 'Front view',
  back: 'Back view',
  detail: 'Detail view',
  'close-up': 'Close-up',
  ecommerce: 'E-commerce',
  social: 'Social media',
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
  /** Stable id, so a purpose never adds an output the core plan already has. */
  id: string;
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
  /** The generated photograph presents the garment on a real human model. */
  worn: boolean;
};

/**
 * Every output is generated as a photorealistic fashion photograph of a real
 * human wearing the uploaded garment. Detail and close-up outputs may use an
 * intentional tighter crop; all other frames keep the model visible head to feet.
 */
function coreVariations(): VariationConfig[] {
  return [
    {
      id: 'full-body',
      variation: 'full-body',
      title: 'Full-body model image',
      category: 'social',
      slot: 'front',
      zoom: 1.02,
      focusY: 0.44,
      inset: 0.05,
      aspect: 2 / 3,
      staged: true,
      worn: true,
    },
    {
      id: 'front',
      variation: 'front',
      title: 'Front view',
      category: 'ecommerce',
      slot: 'front',
      zoom: 1,
      focusY: 0.5,
      inset: 0,
      aspect: 3 / 4,
      staged: false,
      worn: true,
    },
    {
      id: 'back',
      variation: 'back',
      title: 'Back view',
      category: 'ecommerce',
      slot: 'back',
      zoom: 1,
      focusY: 0.5,
      inset: 0,
      aspect: 3 / 4,
      staged: false,
      worn: true,
    },
    {
      id: 'detail',
      variation: 'detail',
      title: 'Detail close-up',
      category: 'catalog',
      slot: 'detail',
      zoom: 1.85,
      focusY: 0.45,
      inset: 0,
      aspect: 1,
      staged: false,
      worn: true,
    },
    {
      id: 'close-up',
      variation: 'close-up',
      title: 'Close-up product image',
      category: 'ecommerce',
      slot: 'detail',
      zoom: 1.4,
      focusY: 0.5,
      inset: 0.13,
      aspect: 1,
      staged: true,
      worn: true,
    },
    {
      id: 'ecommerce',
      variation: 'ecommerce',
      title: 'E-commerce image',
      category: 'ecommerce',
      slot: 'front',
      zoom: 1,
      focusY: 0.5,
      inset: 0.12,
      aspect: 1,
      staged: true,
      worn: true,
    },
    {
      id: 'social',
      variation: 'social',
      title: 'Social media image',
      category: 'social',
      slot: 'front',
      zoom: 1.06,
      focusY: 0.42,
      inset: 0.05,
      aspect: 4 / 5,
      staged: true,
      worn: true,
    },
  ];
}

/**
 * Extra crop a chosen content purpose adds on top of the core plan. Purposes
 * already covered by a core output return null.
 */
function purposeVariation(purpose: ContentPurpose): VariationConfig | null {
  switch (purpose) {
    case 'ecommerce':
      return null;
    case 'instagram':
      return {
        id: 'ig-square',
        variation: 'social',
        title: 'Instagram square',
        category: 'social',
        slot: 'front',
        zoom: 1.06,
        focusY: 0.42,
        inset: 0.05,
        aspect: 1,
        staged: true,
        worn: true,
      };
    case 'social':
      return {
        id: 'story',
        variation: 'social',
        title: 'Story crop',
        category: 'social',
        slot: 'front',
        zoom: 1.12,
        focusY: 0.4,
        inset: 0.05,
        aspect: 9 / 16,
        staged: true,
        worn: true,
      };
    case 'catalog':
      return {
        id: 'catalog-page',
        variation: 'front',
        title: 'Catalog page image',
        category: 'catalog',
        slot: 'front',
        zoom: 1,
        focusY: 0.5,
        inset: 0.09,
        aspect: 4 / 5,
        staged: true,
        worn: true,
      };
    case 'lookbook':
      return {
        id: 'lookbook',
        variation: 'back',
        title: 'Lookbook spread',
        category: 'catalog',
        slot: 'back',
        zoom: 1.04,
        focusY: 0.46,
        inset: 0.06,
        aspect: 4 / 5,
        staged: true,
        worn: true,
      };
    case 'showroom':
      return {
        id: 'showroom',
        variation: 'detail',
        title: 'Showroom fabric study',
        category: 'catalog',
        slot: 'detail',
        zoom: 1.6,
        focusY: 0.5,
        inset: 0.1,
        aspect: 4 / 5,
        staged: true,
        worn: true,
      };
    default:
      return null;
  }
}

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
  const plan = coreVariations();
  const ids = new Set(plan.map((config) => config.id));
  const chosen = new Set(style.purposes);

  PURPOSE_ORDER.filter((purpose) => chosen.has(purpose)).forEach((purpose) => {
    const extra = purposeVariation(purpose);
    if (!extra || ids.has(extra.id)) return;
    plan.push(extra);
    ids.add(extra.id);
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

/** Environment staged behind an output, from the chosen background. */
function sceneFor(config: VariationConfig, style: StyleSelection): GalleryKey | null {
  if (!config.staged) return null;
  return BACKGROUND_SCENE[style.background];
}

/** Product data snapshot shown under an output. */
export function describeGarment(product: ProductData): string {
  return [product.category.trim(), product.material.trim(), product.fit.trim()]
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
  if (asset.origin === 'imported') return 'Your own photo, kept exactly as imported';
  if (!asset.sourceUri) return 'No garment upload available for generation';

  const base = `${SLOT_LABEL[asset.sourceSlot]} upload`;
  if (hasAiImage(asset)) return `${base}, photographed by the image service`;
  if (!asset.isDerived) return base;
  return `${base}, recropped for the ${VARIATION_LABEL[asset.variation].toLowerCase()}`;
}

/**
 * Plans the output set for a project: one entry per framing the configuration
 * asks for, each pointing at the garment photo it is generated from. Every
 * entry starts in a pending state and becomes visible only after the backend
 * delivers a validated human fashion photograph.
 */
export function buildAssets(project: Project): GeneratedAsset[] {
  const { photos, product, style } = project;
  const spec = describeGarment(product);

  return variationPlan(style).map((config, index) => {
    const photo = sourcePhoto(photos, config.slot);

    return {
      id: `${project.id}-a${index}`,
      title: config.title,
      variation: config.variation,
      category: config.category,
      origin: 'generated',
      sourceUri: photo?.uri ?? null,
      sourceSlot: photo?.slot ?? config.slot,
      requestedSlot: config.slot,
      isDerived: photo ? photo.slot !== config.slot : false,
      model: style.model === 'none' ? 'female' : style.model,
      visualStyle: style.visualStyle,
      background: style.background,
      scene: sceneFor(config, style),
      staged: config.staged,
      worn: config.worn,
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
      renderStatus: photo ? 'pending' : 'none',
      renderUrl: null,
      renderError: null,
      isFavorite: false,
      isApproved: false,
    };
  });
}

/**
 * Wraps a finished photo the user imported from another tool as a project
 * output. Nothing is composited over it — no staging, backdrop or lighting
 * pass — and it is never sent to the image service, so it travels through
 * review, export and the catalog exactly as supplied.
 */
export function buildImportedAsset(
  project: Project,
  photo: { uri: string; width: number; height: number },
  meta: { id: string; ordinal: number },
): GeneratedAsset {
  return {
    id: meta.id,
    title: `Imported photo ${meta.ordinal}`,
    variation: 'front',
    category: 'ecommerce',
    origin: 'imported',
    sourceUri: photo.uri,
    sourceSlot: 'front',
    requestedSlot: 'front',
    isDerived: false,
    model: project.style.model,
    visualStyle: project.style.visualStyle,
    background: project.style.background,
    scene: null,
    staged: false,
    worn: false,
    spec: describeGarment(project.product),
    zoom: 1,
    baseZoom: 1,
    focusY: 0.5,
    inset: 0,
    take: 1,
    lighting: 'balanced',
    enhanced: false,
    shadow: false,
    aspect: photo.width > 0 && photo.height > 0 ? photo.width / photo.height : 3 / 4,
    renderStatus: 'none',
    renderUrl: null,
    renderError: null,
    isFavorite: false,
    isApproved: false,
  };
}

/** Image the output is rendered from: the user's upload, or curated fallback. */
export function assetSource(asset: GeneratedAsset): ImageSourcePropType {
  if (asset.sourceUri) return { uri: asset.sourceUri };
  return imageForKind(asset.variation === 'detail' ? 'detail' : 'product');
}

/** True when the image service delivered a real picture for this output. */
export function hasAiImage(asset: GeneratedAsset): boolean {
  return asset.renderStatus === 'ready' && asset.renderUrl !== null;
}

/**
 * Every generated output is photographed by the image service. One still needs
 * generating when it has a garment photo to work from and no finished image yet.
 * Imported photos are left alone.
 */
export function needsAiImage(asset: GeneratedAsset): boolean {
  return asset.origin === 'generated' && asset.sourceUri !== null && asset.renderStatus !== 'ready';
}

/**
 * A generated output is exportable only after the image service has delivered
 * and validated a real fashion photograph. Imported photos are already final.
 */
export function isFinalAsset(asset: GeneratedAsset): boolean {
  return asset.origin === 'imported' || hasAiImage(asset);
}

/** The final image for a successful generated output or imported photograph. */
export function finalSource(asset: GeneratedAsset): ImageSourcePropType {
  if (hasAiImage(asset) && asset.renderUrl) return { uri: asset.renderUrl };
  if (asset.origin === 'imported' && asset.sourceUri) return { uri: asset.sourceUri };
  throw new Error('This asset does not have a validated final image yet.');
}

/** One line naming how this output was produced. */
export function describeRender(asset: GeneratedAsset): string {
  switch (asset.renderStatus) {
    case 'ready':
      return 'Generated by the AI image service from your garment photo';
    case 'pending':
      return 'Generating…';
    case 'failed':
      return 'Generation failed — no image was added';
    default:
      return asset.origin === 'imported' ? 'Your imported photograph' : 'Waiting to generate';
  }
}

/** Lighting and enhancement layers applied over the whole frame. */
export function treatmentLayers(asset: GeneratedAsset): ImageLayer[] {
  if (asset.origin === 'imported') return [];

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
  return BACKGROUND_SCENE[background];
}

const TAKE_FOCUS = [0.5, 0.36, 0.62];
const TAKE_ZOOM = [1, 1.14, 1.06];

/** How much tighter or wider a revision framing request crops the source. */
const FRAMING_SCALE: Record<Framing, number> = { wider: 0.88, tighter: 1.14, same: 1 };

export const EMPTY_TREATMENT: TreatmentOverrides = {
  lighting: null,
  enhanced: null,
  shadow: null,
  framing: null,
};

/**
 * Applies a shoot-wide treatment from an AI revision over freshly planned
 * outputs. Only the properties the revision actually set are overridden, so
 * every variation keeps the staging generation planned for it. Imported photos
 * are never touched.
 */
export function applyTreatment(
  assets: GeneratedAsset[],
  treatment: TreatmentOverrides,
): GeneratedAsset[] {
  const scale = treatment.framing ? FRAMING_SCALE[treatment.framing] : 1;
  const untouched =
    treatment.lighting === null &&
    treatment.enhanced === null &&
    treatment.shadow === null &&
    scale === 1;
  if (untouched) return assets;

  return assets.map((asset) => {
    if (asset.origin === 'imported') return asset;

    return {
      ...asset,
      lighting: treatment.lighting ?? asset.lighting,
      enhanced: treatment.enhanced ?? asset.enhanced,
      shadow: treatment.shadow ?? asset.shadow,
      baseZoom: asset.baseZoom * scale,
      zoom: asset.zoom * scale,
    };
  });
}

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
