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

export type GeneratedAsset = {
  id: string;
  title: string;
  category: AssetCategory;
  kind: GalleryKey;
  background: BackgroundChoice;
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
