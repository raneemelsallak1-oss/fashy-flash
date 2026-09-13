import type {
  AssetCategory,
  BackgroundChoice,
  ContentPurpose,
  ExportFormatId,
  FlowStep,
  ModelChoice,
  OutputVariation,
  PhotoSlot,
  VisualStyle,
} from '@/lib/types';

export const FLOW_STEPS: { id: FlowStep; label: string }[] = [
  { id: 'upload', label: 'Upload' },
  { id: 'product', label: 'Product Data' },
  { id: 'style', label: 'Style' },
  { id: 'generate', label: 'Generate' },
  { id: 'review', label: 'Review' },
  { id: 'export', label: 'Export' },
];

export const PHOTO_SLOTS: { id: PhotoSlot; label: string }[] = [
  { id: 'front', label: 'Front' },
  { id: 'back', label: 'Back' },
  { id: 'detail', label: 'Detail' },
];

export const MODEL_OPTIONS: { id: ModelChoice; label: string; hint: string }[] = [
  { id: 'female', label: 'Female', hint: 'Womenswear fit and posing' },
  { id: 'male', label: 'Male', hint: 'Menswear fit and posing' },
  { id: 'diverse', label: 'Diverse Models', hint: 'Mixed ages, bodies and skin tones' },
  { id: 'none', label: 'No Model / Product Only', hint: 'Ghost mannequin and flat shots' },
];

export const STYLE_OPTIONS: { id: VisualStyle; label: string; hint: string }[] = [
  { id: 'minimal', label: 'Minimal', hint: 'Clean, quiet, product first' },
  { id: 'studio', label: 'Studio', hint: 'Controlled light, soft shadow' },
  { id: 'street', label: 'Street', hint: 'Candid, urban, natural light' },
  { id: 'luxury', label: 'Luxury', hint: 'Rich texture, dramatic light' },
  { id: 'editorial', label: 'Editorial', hint: 'Magazine styling and mood' },
];

export const BACKGROUND_OPTIONS: { id: BackgroundChoice; label: string; hint: string }[] = [
  { id: 'plain', label: 'Plain', hint: 'Seamless white' },
  { id: 'studio', label: 'Studio', hint: 'Warm beige sweep' },
  { id: 'lifestyle', label: 'Lifestyle', hint: 'Sunlit interior' },
  { id: 'outdoor', label: 'Outdoor', hint: 'City and daylight' },
  { id: 'custom', label: 'Custom', hint: 'Curated set design' },
];

export const PURPOSE_OPTIONS: { id: ContentPurpose; label: string }[] = [
  { id: 'ecommerce', label: 'E-commerce' },
  { id: 'instagram', label: 'Instagram' },
  { id: 'social', label: 'Social Media' },
  { id: 'catalog', label: 'Digital Catalog' },
  { id: 'lookbook', label: 'Lookbook' },
  { id: 'showroom', label: 'Digital Showroom' },
];

export const EXPORT_FORMATS: {
  id: ExportFormatId;
  label: string;
  spec: string;
  hint: string;
}[] = [
  {
    id: 'ig-post',
    label: 'Instagram Post',
    spec: '1080 × 1080',
    hint: 'Square feed crop',
  },
  {
    id: 'ig-story',
    label: 'Instagram Story',
    spec: '1080 × 1920',
    hint: 'Full-screen vertical',
  },
  {
    id: 'ecommerce',
    label: 'E-commerce',
    spec: 'High-resolution product image',
    hint: 'Shop-ready, white background',
  },
  {
    id: 'catalog',
    label: 'Digital Catalog',
    spec: 'PDF / catalog format',
    hint: 'Multi-page layout with product data',
  },
  {
    id: 'lookbook',
    label: 'Lookbook',
    spec: 'Fashion presentation format',
    hint: 'Editorial spreads for buyers',
  },
  {
    id: 'catalog-pdf',
    label: 'Digital Catalog PDF',
    spec: 'Multi-page A4 PDF',
    hint: 'Front, back and detail pages with product data',
  },
];

/** Views an imported photo can be tagged as, so the catalog places it right. */
export const IMPORT_VIEW_OPTIONS: { id: OutputVariation; label: string }[] = [
  { id: 'front', label: 'Front view' },
  { id: 'back', label: 'Back view' },
  { id: 'detail', label: 'Detail view' },
  { id: 'full-body', label: 'Full body' },
];

/** Content types the review filters group visuals by. */
export const ASSET_CATEGORY_OPTIONS: { id: AssetCategory; label: string }[] = [
  { id: 'ecommerce', label: 'E-commerce' },
  { id: 'social', label: 'Social' },
  { id: 'catalog', label: 'Catalog' },
];

export const CATEGORY_SUGGESTIONS = [
  'Shirts & Blouses',
  'Dresses',
  'Knitwear',
  'Outerwear',
  'Trousers',
  'Skirts',
  'Denim',
  'Accessories',
];

export const MATERIAL_OPTIONS = [
  'Cotton',
  'Organic Cotton',
  'Linen',
  'Linen Blend',
  'Denim',
  'Leather',
  'Faux Leather',
  'Suede',
  'Wool',
  'Merino Wool',
  'Cashmere',
  'Silk',
  'Satin',
  'Chiffon',
  'Velvet',
  'Polyester',
  'Nylon',
  'Viscose',
  'Rayon',
  'Modal',
  'Jersey',
  'Knit',
  'Fleece',
  'Tweed',
  'Corduroy',
  'Canvas',
  'Lace',
  'Mesh',
  'Tulle',
  'Spandex/Elastane',
  'Acrylic',
  'Fabric Blend',
] as const;

export const FIT_SUGGESTIONS = ['Slim', 'Regular', 'Relaxed', 'Oversized', 'Tailored'];

export const SIZE_RANGE_SUGGESTIONS = ['XS – L', 'XS – XL', 'S – XXL', 'One size', 'EU 34 – 44'];
