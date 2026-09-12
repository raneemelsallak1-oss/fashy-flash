export type PhotoSlot = 'front' | 'back' | 'detail';

export type GarmentPhoto = {
  id: string;
  uri: string;
  slot: PhotoSlot;
  width: number;
  height: number;
};

export type ProductData = {
  name: string;
  category: string;
  color: string;
  material: string;
  fit: string;
  sizeRange: string;
  brand: string;
  sku: string;
  description: string;
};

export type ModelChoice = 'female' | 'male' | 'diverse' | 'none';
export type VisualStyle = 'minimal' | 'studio' | 'street' | 'luxury' | 'editorial';
export type BackgroundChoice = 'plain' | 'studio' | 'lifestyle' | 'outdoor' | 'custom';
export type ContentPurpose =
  | 'ecommerce'
  | 'instagram'
  | 'social'
  | 'catalog'
  | 'lookbook'
  | 'showroom';

export type StyleSelection = {
  model: ModelChoice;
  visualStyle: VisualStyle;
  background: BackgroundChoice;
  purposes: ContentPurpose[];
};

export type AssetCategory = 'ecommerce' | 'social' | 'catalog';
export type Lighting = 'soft' | 'balanced' | 'bright';

/** Key into the curated fashion image catalog in lib/gallery.ts. */
export type GalleryKey =
  | 'studio'
  | 'street'
  | 'luxury'
  | 'ecommerce'
  | 'lifestyle'
  | 'male'
  | 'diverse'
  | 'product'
  | 'detail';

/** The output variations generation produces from one configuration. */
export type OutputVariation =
  | 'front'
  | 'back'
  | 'detail'
  | 'full-body'
  | 'close-up'
  | 'ecommerce'
  | 'social';

/**
 * One generated output. Every field is resolved from the user's uploads,
 * product data and style choices at generation time, so an asset carries the
 * full recipe it was rendered from.
 */
export type GeneratedAsset = {
  id: string;
  title: string;
  variation: OutputVariation;
  category: AssetCategory;
  /** Uploaded garment photo this output was rendered from. */
  sourceUri: string | null;
  /** Tag of the upload that was used. */
  sourceSlot: PhotoSlot;
  /** Tag the variation asked for. */
  requestedSlot: PhotoSlot;
  /** True when no upload carried the requested tag and another one was reused. */
  isDerived: boolean;
  model: ModelChoice;
  visualStyle: VisualStyle;
  background: BackgroundChoice;
  /** Curated environment behind a staged garment; null renders a plain sweep. */
  scene: GalleryKey | null;
  /** Staged outputs sit inside a scene; unstaged ones fill the frame. */
  staged: boolean;
  /** True when the garment is presented on the selected model. */
  worn: boolean;
  colorName: string;
  colorHex: string;
  /** Product data snapshot, e.g. "Pink · Cotton · Relaxed". */
  spec: string;
  /** Crop scale over the source photo, 1 = full frame. */
  zoom: number;
  /** Crop scale the variation was planned with; takes are applied on top. */
  baseZoom: number;
  /** Vertical crop focus, 0 = top, 1 = bottom. */
  focusY: number;
  /** Frame padding as a fraction of width; 0 = full bleed. */
  inset: number;
  /** Regeneration counter — each take restages the same garment. */
  take: number;
  lighting: Lighting;
  enhanced: boolean;
  shadow: boolean;
  /** width / height */
  aspect: number;
  isFavorite: boolean;
  isApproved: boolean;
};

export type ExportFormatId =
  | 'ig-post'
  | 'ig-story'
  | 'ecommerce'
  | 'catalog'
  | 'lookbook'
  | 'catalog-pdf';

/** What the user ticked for the Digital Catalog PDF. */
export type CatalogSelection = {
  /** CatalogImage ids: generated assets and uploaded garment photos. */
  imageIds: string[];
  /** Colorway ids from lib/catalog.ts. */
  colorwayIds: string[];
};

export type Project = {
  id: string;
  name: string;
  createdAt: number;
  photos: GarmentPhoto[];
  product: ProductData;
  style: StyleSelection;
  assets: GeneratedAsset[];
  exportFormats: ExportFormatId[];
  catalog: CatalogSelection;
};

export type FlowStep = 'upload' | 'product' | 'style' | 'generate' | 'review' | 'export';
