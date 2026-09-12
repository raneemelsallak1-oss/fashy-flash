export type PhotoSlot = 'front' | 'back' | 'detail';

export type GarmentPhoto = {
  id: string;
  uri: string;
  slot: PhotoSlot;
  width: number;
  height: number;
  /** Public URL once the photo is in storage, so the renderer can fetch it. */
  remoteUrl: string | null;
};

export type ProductData = {
  name: string;
  category: string;
  material: string;
  fit: string;
  sizeRange: string;
  brand: string;
  sku: string;
  /** Short product description the generation prompt is written from. */
  description: string;
};

/** A translucent layer painted over an image. `blend` maps to CSS mix-blend-mode. */
export type ImageLayer = {
  id: string;
  color: string;
  opacity: number;
  blend?: 'multiply' | 'color' | 'soft-light' | 'screen';
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
export type Framing = 'wider' | 'tighter' | 'same';

/**
 * Shoot-wide image treatment. Null means "leave each variation on the value
 * generation planned for it" — a revision only fills in what it asked to change.
 */
export type TreatmentOverrides = {
  lighting: Lighting | null;
  enhanced: boolean | null;
  shadow: boolean | null;
  framing: Framing | null;
};

/** One property a revision changed, ready to show as "Label: from → to". */
export type RevisionChange = {
  field: string;
  label: string;
  from: string;
  to: string;
};

/** A revision request the backend interpreted and the app applied. */
export type AppliedRevision = {
  id: string;
  /** What the user typed. */
  request: string;
  /** One-line description of what changed. */
  summary: string;
  changes: RevisionChange[];
  /** Labels of the settings the revision left exactly as they were. */
  preserved: string[];
  /** Parts of the request this pipeline cannot act on. */
  unsupported: string[];
  /** Full generation recipe the outputs were rebuilt from. */
  instructions: string;
  createdAt: number;
};

/**
 * Where an output came from: built by the simulated generation pass, or a
 * finished photo the user imported from another tool.
 */
export type AssetOrigin = 'generated' | 'imported';

/**
 * State of the AI image for an output.
 * - `none`: nothing is generated for this output (an imported photo).
 * - `pending`: sent to the image service, waiting for the picture.
 * - `ready`: the generated image is stored and shown as the output.
 * - `failed`: the service could not deliver it; the preview composite stands in.
 */
export type RenderStatus = 'none' | 'pending' | 'ready' | 'failed';

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
  /** Imported photos are shown exactly as supplied — no staging or treatment. */
  origin: AssetOrigin;
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
  /** Product data snapshot, e.g. "Cotton · Relaxed". */
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
  renderStatus: RenderStatus;
  /** Stored URL of the image the AI service produced. */
  renderUrl: string | null;
  /** Why the image did not arrive, ready to show the user. */
  renderError: string | null;
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
};

export type Project = {
  id: string;
  name: string;
  createdAt: number;
  photos: GarmentPhoto[];
  product: ProductData;
  style: StyleSelection;
  /** Shoot-wide treatment set by AI revisions; empty until one is applied. */
  treatment: TreatmentOverrides;
  assets: GeneratedAsset[];
  exportFormats: ExportFormatId[];
  catalog: CatalogSelection;
  /** Applied revisions, newest first. */
  revisions: AppliedRevision[];
};

export type FlowStep = 'upload' | 'product' | 'style' | 'generate' | 'review' | 'export';
