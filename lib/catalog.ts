import type { ImageSourcePropType } from 'react-native';

import { imageForAsset, lightingOverlay } from '@/lib/gallery';
import type {
  CatalogSelection,
  GeneratedAsset,
  PhotoSlot,
  ProductData,
  Project,
} from '@/lib/types';

/** The three garment views a digital catalog is laid out around. */
export type CatalogView = PhotoSlot;

export const CATALOG_VIEWS: { id: CatalogView; label: string; hint: string; empty: string }[] = [
  {
    id: 'front',
    label: 'Front view',
    hint: 'Opens the catalog and carries the cover',
    empty: 'No front image yet — tag an upload as Front.',
  },
  {
    id: 'back',
    label: 'Back view',
    hint: 'Shows the full garment from behind',
    empty: 'No back image yet — tag an upload as Back.',
  },
  {
    id: 'detail',
    label: 'Detail shots',
    hint: 'Fabric, seams and finishing',
    empty: 'No detail image yet — tag an upload as Detail.',
  },
];

const VIEW_LABEL: Record<CatalogView, string> = {
  front: 'Front',
  back: 'Back',
  detail: 'Detail',
};

export type ImageOverlay = { color: string; opacity: number };

/** A single image the catalog can place on a page. */
export type CatalogImage = {
  id: string;
  view: CatalogView;
  label: string;
  origin: 'generated' | 'photo';
  source: ImageSourcePropType;
  /** width / height */
  aspect: number;
  overlays: ImageOverlay[];
};

/** Which catalog view a generated asset reads as. */
function viewForAsset(asset: GeneratedAsset): CatalogView {
  if (asset.kind === 'detail') return 'detail';

  const title = asset.title.toLowerCase();
  if (title.includes('back')) return 'back';
  if (title.includes('detail') || title.includes('close-up')) return 'detail';
  return 'front';
}

/** Every image available to the catalog: generated visuals first, then uploads. */
export function catalogImages(project: Project): CatalogImage[] {
  const generated: CatalogImage[] = project.assets.map((asset) => ({
    id: `asset:${asset.id}`,
    view: viewForAsset(asset),
    label: asset.title,
    origin: 'generated',
    source: imageForAsset(asset),
    aspect: asset.aspect,
    overlays: lightingOverlay(asset.lighting, asset.enhanced),
  }));

  const uploads: CatalogImage[] = project.photos.map((photo, index) => ({
    id: `photo:${photo.id}`,
    view: photo.slot,
    label: `${VIEW_LABEL[photo.slot]} upload ${index + 1}`,
    origin: 'photo',
    source: { uri: photo.uri },
    aspect: photo.width > 0 && photo.height > 0 ? photo.width / photo.height : 3 / 4,
    overlays: [],
  }));

  return [...generated, ...uploads];
}

export type CatalogGroup = {
  id: CatalogView;
  label: string;
  hint: string;
  empty: string;
  images: CatalogImage[];
};

/** Catalog images bucketed into Front / Back / Detail for the picker. */
export function groupCatalogImages(images: CatalogImage[]): CatalogGroup[] {
  return CATALOG_VIEWS.map((view) => ({
    ...view,
    images: images.filter((image) => image.view === view.id),
  }));
}

export type Colorway = {
  id: string;
  label: string;
  hex: string;
  /** True for the colorway the garment was photographed in. */
  isBase: boolean;
};

const COLOR_HEX: Record<string, string> = {
  ivory: '#F1EAE0',
  white: '#FAFAF8',
  'off-white': '#F4F1EA',
  cream: '#F0E7D8',
  ecru: '#EDE3D2',
  sand: '#DCCDB8',
  beige: '#E2D5C2',
  stone: '#D3C7B6',
  taupe: '#B9A895',
  camel: '#C49A6C',
  tan: '#C9A484',
  brown: '#7A5A44',
  chocolate: '#4A342A',
  black: '#1A1A1A',
  charcoal: '#3A3A3C',
  graphite: '#4C4A48',
  grey: '#9A9793',
  gray: '#9A9793',
  silver: '#C6C4C0',
  navy: '#26324A',
  blue: '#4A6D9B',
  denim: '#5A7699',
  sky: '#9EC0DA',
  teal: '#3F6E6C',
  green: '#4E6B4A',
  sage: '#A8B29C',
  olive: '#77714B',
  mint: '#BBD3C0',
  pink: '#E3B8BC',
  blush: '#E6C7C4',
  rose: '#C08A85',
  red: '#A93226',
  burgundy: '#6B2536',
  wine: '#5E2A34',
  purple: '#6B5B85',
  lilac: '#C3B4D1',
  lavender: '#CFC6DD',
  yellow: '#E3C05C',
  mustard: '#C89A34',
  orange: '#D4834A',
  terracotta: '#B96F52',
  rust: '#A65B3A',
};

const FALLBACK_HEX = '#DCCDB8';

/** Best-effort swatch color for a written color name. */
export function hexForColorName(name: string): string {
  const normalized = name.trim().toLowerCase();
  if (!normalized) return FALLBACK_HEX;

  const direct = COLOR_HEX[normalized];
  if (direct) return direct;

  const match = Object.keys(COLOR_HEX).find((key) => normalized.includes(key));
  return match ? (COLOR_HEX[match] ?? FALLBACK_HEX) : FALLBACK_HEX;
}

const CURATED_COLORWAYS: Colorway[] = [
  { id: 'ivory', label: 'Ivory', hex: COLOR_HEX.ivory ?? FALLBACK_HEX, isBase: false },
  { id: 'sand', label: 'Sand', hex: COLOR_HEX.sand ?? FALLBACK_HEX, isBase: false },
  { id: 'rose', label: 'Dusty Rose', hex: COLOR_HEX.rose ?? FALLBACK_HEX, isBase: false },
  { id: 'sage', label: 'Sage', hex: COLOR_HEX.sage ?? FALLBACK_HEX, isBase: false },
  { id: 'navy', label: 'Navy', hex: COLOR_HEX.navy ?? FALLBACK_HEX, isBase: false },
  { id: 'charcoal', label: 'Charcoal', hex: COLOR_HEX.charcoal ?? FALLBACK_HEX, isBase: false },
  { id: 'black', label: 'Black', hex: COLOR_HEX.black ?? FALLBACK_HEX, isBase: false },
];

/**
 * Colorways offered for a product: the photographed color first, then the
 * curated seasonal range the same garment can be published in.
 */
export function colorwaysForProduct(product: ProductData): Colorway[] {
  const name = product.color.trim();
  const base: Colorway = {
    id: 'base',
    label: name || 'As photographed',
    hex: hexForColorName(name),
    isBase: true,
  };

  const curated = CURATED_COLORWAYS.filter(
    (colorway) => colorway.label.toLowerCase() !== name.toLowerCase(),
  );

  return [base, ...curated];
}

const ALPHA_SIZES = ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];

function normalizeAlphaSize(value: string): string {
  const upper = value.trim().toUpperCase().replace(/\s+/g, '');
  const numeric = /^([234])XL$/.exec(upper);
  if (numeric?.[1]) return 'X'.repeat(Number(numeric[1])) + 'L';
  return upper;
}

/** Turns "XS – XL" or "EU 34 – 44" into the individual available sizes. */
export function expandSizeRange(range: string): string[] {
  const value = range.trim();
  if (!value) return [];
  if (/one\s?size/i.test(value)) return ['One size'];

  const parts = value
    .split(/\s*(?:–|—|-|to|\/)\s*/i)
    .map((part) => part.trim())
    .filter(Boolean);

  if (parts.length !== 2) {
    return value
      .split(/\s*,\s*/)
      .map((part) => part.trim())
      .filter(Boolean);
  }

  const [rawStart, rawEnd] = parts;
  const start = normalizeAlphaSize(rawStart ?? '');
  const end = normalizeAlphaSize(rawEnd ?? '');
  const startIndex = ALPHA_SIZES.indexOf(start);
  const endIndex = ALPHA_SIZES.indexOf(end);

  if (startIndex >= 0 && endIndex > startIndex) {
    return ALPHA_SIZES.slice(startIndex, endIndex + 1);
  }

  const startNumber = /(\d+)\s*$/.exec(rawStart ?? '');
  const endNumber = /(\d+)\s*$/.exec(rawEnd ?? '');
  if (startNumber?.[1] && endNumber?.[1]) {
    const from = Number(startNumber[1]);
    const to = Number(endNumber[1]);
    const prefix = (rawStart ?? '').slice(0, startNumber.index).trim();
    const step = from % 2 === 0 && to % 2 === 0 && to - from >= 4 ? 2 : 1;
    const sizes: string[] = [];
    for (let size = from; size <= to; size += step) {
      sizes.push(prefix ? `${prefix} ${size}` : String(size));
    }
    return sizes;
  }

  return [value];
}

export type CatalogPage =
  | { id: string; kind: 'cover'; label: string; hero: CatalogImage | null }
  | { id: string; kind: 'views'; label: string; images: CatalogImage[] }
  | {
      id: string;
      kind: 'colorways';
      label: string;
      hero: CatalogImage | null;
      colorways: Colorway[];
    }
  | { id: string; kind: 'spec'; label: string };

export type CatalogDocument = {
  title: string;
  brand: string;
  category: string;
  color: string;
  material: string;
  fit: string;
  sku: string;
  description: string;
  sizeRange: string;
  sizes: string[];
  issue: string;
  colorways: Colorway[];
  pages: CatalogPage[];
  imageCount: number;
};

function chunk<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }
  return chunks;
}

function issueLabel(createdAt: number): string {
  return new Date(createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

/** Sensible first selection: one front, one back, up to two details, base color. */
export function defaultCatalogSelection(project: Project): CatalogSelection {
  const images = catalogImages(project);
  const pick = (view: CatalogView, count: number) =>
    images
      .filter((image) => image.view === view)
      .slice(0, count)
      .map((image) => image.id);

  return {
    imageIds: [...pick('front', 1), ...pick('back', 1), ...pick('detail', 2)],
    colorwayIds: ['base'],
  };
}

/** Lays the selected images, colorways and product data out into catalog pages. */
export function buildCatalogDocument(project: Project): CatalogDocument {
  const available = catalogImages(project);
  const selected = available.filter((image) => project.catalog.imageIds.includes(image.id));
  const byView = (view: CatalogView) => selected.filter((image) => image.view === view);

  const front = byView('front');
  const back = byView('back');
  const detail = byView('detail');
  const hero = front[0] ?? selected[0] ?? null;

  const colorways = colorwaysForProduct(project.product).filter((colorway) =>
    project.catalog.colorwayIds.includes(colorway.id),
  );

  const pages: CatalogPage[] = [{ id: 'cover', kind: 'cover', label: 'Cover', hero }];

  const viewPages: { label: string; images: CatalogImage[] }[] = [
    ...chunk(front, 2).map((images) => ({ label: 'Front view', images })),
    ...chunk(back, 2).map((images) => ({ label: 'Back view', images })),
    ...chunk(detail, 2).map((images) => ({ label: 'Detail shots', images })),
  ];

  viewPages.forEach((page, index) => {
    pages.push({
      id: `views-${index}`,
      kind: 'views',
      label: page.label,
      images: page.images,
    });
  });

  if (colorways.length > 0) {
    chunk(colorways, 4).forEach((group, index) => {
      pages.push({
        id: `colorways-${index}`,
        kind: 'colorways',
        label: 'Colorways',
        hero,
        colorways: group,
      });
    });
  }

  pages.push({ id: 'spec', kind: 'spec', label: 'Product specification' });

  return {
    title: project.product.name.trim() || 'Untitled piece',
    brand: project.product.brand.trim(),
    category: project.product.category.trim(),
    color: project.product.color.trim(),
    material: project.product.material.trim(),
    fit: project.product.fit.trim(),
    sku: project.product.sku.trim(),
    description: project.product.description.trim(),
    sizeRange: project.product.sizeRange.trim(),
    sizes: expandSizeRange(project.product.sizeRange),
    issue: issueLabel(project.createdAt),
    colorways,
    pages,
    imageCount: selected.length,
  };
}
