import type { ImageSourcePropType } from 'react-native';

import { hexForColorName, hexForColorwayId, type ImageLayer } from '@/lib/color';
import { assetSource, garmentLayers, treatmentLayers } from '@/lib/generation';
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

export type ImageOverlay = ImageLayer;

/** A single image the catalog can place on a page. */
export type CatalogImage = {
  id: string;
  view: CatalogView;
  label: string;
  origin: 'generated' | 'photo';
  source: ImageSourcePropType;
  /** width / height */
  aspect: number;
  overlays: ImageLayer[];
};

/** Which catalog view a generated asset reads as. */
function viewForAsset(asset: GeneratedAsset): CatalogView {
  if (asset.variation === 'detail' || asset.variation === 'close-up') return 'detail';
  if (asset.variation === 'back') return 'back';
  return 'front';
}

/** Every image available to the catalog: generated visuals first, then uploads. */
export function catalogImages(project: Project): CatalogImage[] {
  const generated: CatalogImage[] = project.assets.map((asset) => ({
    id: `asset:${asset.id}`,
    view: viewForAsset(asset),
    label: asset.title,
    origin: 'generated',
    source: assetSource(asset),
    aspect: asset.aspect,
    overlays: [...garmentLayers(asset), ...treatmentLayers(asset)],
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

const CURATED_COLORWAYS: Colorway[] = [
  { id: 'ivory', label: 'Ivory', hex: hexForColorwayId('ivory'), isBase: false },
  { id: 'sand', label: 'Sand', hex: hexForColorwayId('sand'), isBase: false },
  { id: 'rose', label: 'Dusty Rose', hex: hexForColorwayId('rose'), isBase: false },
  { id: 'sage', label: 'Sage', hex: hexForColorwayId('sage'), isBase: false },
  { id: 'navy', label: 'Navy', hex: hexForColorwayId('navy'), isBase: false },
  { id: 'charcoal', label: 'Charcoal', hex: hexForColorwayId('charcoal'), isBase: false },
  { id: 'black', label: 'Black', hex: hexForColorwayId('black'), isBase: false },
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
