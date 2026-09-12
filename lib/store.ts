import { create } from 'zustand';

import { defaultCatalogSelection } from '@/lib/catalog';
import {
  applyTreatment,
  buildAssets,
  buildImportedAsset,
  EMPTY_TREATMENT,
  nextTake,
} from '@/lib/generation';
import { requestRevision } from '@/lib/revision';
import type {
  AppliedRevision,
  ContentPurpose,
  ExportFormatId,
  GarmentPhoto,
  GeneratedAsset,
  PhotoSlot,
  ProductData,
  Project,
  StyleSelection,
} from '@/lib/types';

const EMPTY_PRODUCT: ProductData = {
  name: '',
  category: '',
  color: '',
  material: '',
  fit: '',
  sizeRange: '',
  brand: '',
  sku: '',
  description: '',
};

const DEFAULT_STYLE: StyleSelection = {
  model: 'female',
  visualStyle: 'minimal',
  background: 'studio',
  purposes: ['ecommerce', 'instagram'],
};

/** Values the simulated vision pass "reads" from the uploaded garment photos. */
const AUTO_DETECTED: Partial<ProductData> = {
  category: 'Shirts & Blouses',
  color: 'Ivory',
  material: 'Linen blend',
  fit: 'Oversized',
  sizeRange: 'XS – XL',
  description:
    'Oversized ivory linen-blend shirt with a relaxed drop shoulder, mother-of-pearl buttons and a solid, texture-forward weave.',
};

const SLOT_ORDER: PhotoSlot[] = ['front', 'back', 'detail'];

type Draft = Project;

/** Whether an AI revision request is in flight. */
export type RevisionStatus = 'idle' | 'working';

type AppState = {
  projects: Project[];
  draft: Draft | null;
  /** Assets ticked in review, carried into export. */
  selection: string[];
  autoDetected: boolean;
  revisionStatus: RevisionStatus;
  revisionError: string | null;
  /** The revision the current outputs were rebuilt from, if any. */
  lastRevision: AppliedRevision | null;

  startProject: () => void;
  discardDraft: () => void;

  addPhotos: (photos: { uri: string; width: number; height: number }[]) => void;
  setPhotoSlot: (photoId: string, slot: PhotoSlot) => void;
  removePhoto: (photoId: string) => void;

  updateProduct: (patch: Partial<ProductData>) => void;
  autoDetectProduct: () => void;

  updateStyle: (patch: Partial<StyleSelection>) => void;
  togglePurpose: (purpose: ContentPurpose) => void;

  runGeneration: () => void;

  submitRevision: (request: string) => Promise<void>;
  dismissRevision: () => void;

  addImportedPhotos: (photos: { uri: string; width: number; height: number }[]) => void;
  removeAsset: (assetId: string) => void;

  toggleSelection: (assetId: string) => void;
  clearSelection: () => void;
  toggleFavorite: (assetId: string) => void;
  updateAsset: (assetId: string, patch: Partial<GeneratedAsset>) => void;
  regenerateAsset: (assetId: string) => void;
  approveSelected: () => void;

  setExportFormats: (formats: ExportFormatId[]) => void;
  toggleExportFormat: (format: ExportFormatId) => void;
  toggleCatalogImage: (imageId: string) => void;
  toggleCatalogColorway: (colorwayId: string) => void;
  commitProject: () => void;
};

function createId(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

function nextSlot(existing: GarmentPhoto[], offset: number): PhotoSlot {
  const index = existing.length + offset;
  return SLOT_ORDER[Math.min(index, SLOT_ORDER.length - 1)] ?? 'detail';
}

function mapAssets(
  draft: Draft,
  assetId: string,
  update: (asset: GeneratedAsset) => GeneratedAsset,
): Draft {
  return {
    ...draft,
    assets: draft.assets.map((asset) => (asset.id === assetId ? update(asset) : asset)),
  };
}

/**
 * Plans the generated outputs for a draft and applies its shoot-wide treatment.
 * Imported photos are carried over untouched, and favorites survive a rebuild
 * because generated asset ids are derived from the project id and plan position.
 */
function rebuildAssets(draft: Draft): GeneratedAsset[] {
  const favorites = new Set(
    draft.assets.filter((asset) => asset.isFavorite).map((asset) => asset.id),
  );
  const imported = draft.assets.filter((asset) => asset.origin === 'imported');
  const generated = applyTreatment(buildAssets(draft), draft.treatment).map((asset) =>
    favorites.has(asset.id) ? { ...asset, isFavorite: true } : asset,
  );

  return [...generated, ...imported];
}

export const useAppStore = create<AppState>((set, get) => ({
  projects: [],
  draft: null,
  selection: [],
  autoDetected: false,
  revisionStatus: 'idle',
  revisionError: null,
  lastRevision: null,

  startProject: () => {
    set({
      draft: {
        id: createId('p'),
        name: '',
        createdAt: Date.now(),
        photos: [],
        product: { ...EMPTY_PRODUCT },
        style: { ...DEFAULT_STYLE, purposes: [...DEFAULT_STYLE.purposes] },
        treatment: { ...EMPTY_TREATMENT },
        assets: [],
        exportFormats: ['ig-post', 'ecommerce'],
        catalog: { imageIds: [], colorwayIds: ['base'] },
        revisions: [],
      },
      selection: [],
      autoDetected: false,
      revisionStatus: 'idle',
      revisionError: null,
      lastRevision: null,
    });
  },

  discardDraft: () =>
    set({
      draft: null,
      selection: [],
      autoDetected: false,
      revisionStatus: 'idle',
      revisionError: null,
      lastRevision: null,
    }),

  addPhotos: (photos) => {
    const draft = get().draft;
    if (!draft) return;

    const added: GarmentPhoto[] = photos.map((photo, index) => ({
      id: createId('img'),
      uri: photo.uri,
      width: photo.width,
      height: photo.height,
      slot: nextSlot(draft.photos, index),
    }));

    set({ draft: { ...draft, photos: [...draft.photos, ...added] } });
  },

  setPhotoSlot: (photoId, slot) => {
    const draft = get().draft;
    if (!draft) return;
    set({
      draft: {
        ...draft,
        photos: draft.photos.map((photo) => (photo.id === photoId ? { ...photo, slot } : photo)),
      },
    });
  },

  removePhoto: (photoId) => {
    const draft = get().draft;
    if (!draft) return;
    set({
      draft: { ...draft, photos: draft.photos.filter((photo) => photo.id !== photoId) },
    });
  },

  updateProduct: (patch) => {
    const draft = get().draft;
    if (!draft) return;
    const product = { ...draft.product, ...patch };
    set({ draft: { ...draft, product, name: product.name } });
  },

  autoDetectProduct: () => {
    const draft = get().draft;
    if (!draft) return;
    const product = { ...draft.product, ...AUTO_DETECTED };
    set({
      draft: { ...draft, product, name: product.name },
      autoDetected: true,
    });
  },

  updateStyle: (patch) => {
    const draft = get().draft;
    if (!draft) return;
    set({ draft: { ...draft, style: { ...draft.style, ...patch } } });
  },

  togglePurpose: (purpose) => {
    const draft = get().draft;
    if (!draft) return;
    const active = draft.style.purposes.includes(purpose);
    const purposes = active
      ? draft.style.purposes.filter((item) => item !== purpose)
      : [...draft.style.purposes, purpose];
    set({ draft: { ...draft, style: { ...draft.style, purposes } } });
  },

  runGeneration: () => {
    const draft = get().draft;
    if (!draft) return;
    const generated: Draft = { ...draft, assets: rebuildAssets(draft) };
    set({
      draft: { ...generated, catalog: defaultCatalogSelection(generated) },
      selection: [],
      revisionError: null,
      lastRevision: null,
    });
  },

  /**
   * Sends a plain-language change request to the backend, which asks the AI
   * service which properties it names, then rebuilds the outputs from the merged
   * settings. Everything the request did not mention stays as it was.
   */
  submitRevision: async (request) => {
    const { draft, revisionStatus } = get();
    const text = request.trim();
    if (!draft || text.length === 0 || revisionStatus === 'working') return;

    set({ revisionStatus: 'working', revisionError: null });

    try {
      const result = await requestRevision(draft, text);
      const current = get().draft;
      if (!current || current.id !== draft.id) {
        set({ revisionStatus: 'idle' });
        return;
      }

      const revision: AppliedRevision = {
        id: result.revisionId,
        request: text,
        summary: result.summary,
        changes: result.changes,
        preserved: result.preserved,
        unsupported: result.unsupported,
        instructions: result.instructions,
        createdAt: Date.now(),
      };

      const revised: Draft = {
        ...current,
        product: result.product,
        name: result.product.name,
        style: result.style,
        treatment: result.treatment,
        revisions: [revision, ...current.revisions],
      };

      const assets = rebuildAssets(revised);
      const rebuilt: Draft = { ...revised, assets };
      const ids = new Set(assets.map((asset) => asset.id));

      set({
        draft: { ...rebuilt, catalog: defaultCatalogSelection(rebuilt) },
        selection: get().selection.filter((id) => ids.has(id)),
        revisionStatus: 'idle',
        revisionError: null,
        lastRevision: revision,
      });
    } catch (error) {
      set({
        revisionStatus: 'idle',
        revisionError:
          error instanceof Error ? error.message : 'Could not apply that revision. Try again.',
      });
    }
  },

  dismissRevision: () => set({ lastRevision: null, revisionError: null }),

  /** Adds finished photos the user made elsewhere to the current output set. */
  addImportedPhotos: (photos) => {
    const draft = get().draft;
    if (!draft || photos.length === 0) return;

    const imported = draft.assets.filter((asset) => asset.origin === 'imported').length;
    const added = photos.map((photo, index) =>
      buildImportedAsset(draft, photo, {
        id: createId('imp'),
        ordinal: imported + index + 1,
      }),
    );

    set({ draft: { ...draft, assets: [...draft.assets, ...added] } });
  },

  /** Drops an output and every reference to it in the selection and catalog. */
  removeAsset: (assetId) => {
    const { draft, selection } = get();
    if (!draft) return;

    set({
      draft: {
        ...draft,
        assets: draft.assets.filter((asset) => asset.id !== assetId),
        catalog: {
          ...draft.catalog,
          imageIds: draft.catalog.imageIds.filter((imageId) => imageId !== `asset:${assetId}`),
        },
      },
      selection: selection.filter((id) => id !== assetId),
    });
  },

  toggleSelection: (assetId) => {
    const selection = get().selection;
    set({
      selection: selection.includes(assetId)
        ? selection.filter((id) => id !== assetId)
        : [...selection, assetId],
    });
  },

  clearSelection: () => set({ selection: [] }),

  toggleFavorite: (assetId) => {
    const draft = get().draft;
    if (!draft) return;
    set({
      draft: mapAssets(draft, assetId, (asset) => ({ ...asset, isFavorite: !asset.isFavorite })),
    });
  },

  updateAsset: (assetId, patch) => {
    const draft = get().draft;
    if (!draft) return;
    set({ draft: mapAssets(draft, assetId, (asset) => ({ ...asset, ...patch })) });
  },

  regenerateAsset: (assetId) => {
    const draft = get().draft;
    if (!draft) return;
    set({
      draft: mapAssets(draft, assetId, (asset) => ({
        ...asset,
        ...nextTake(asset),
      })),
    });
  },

  approveSelected: () => {
    const { draft, selection } = get();
    if (!draft) return;
    const approveAll = selection.length === 0;
    const assets = draft.assets.map((asset) =>
      approveAll || selection.includes(asset.id) ? { ...asset, isApproved: true } : asset,
    );
    set({
      draft: { ...draft, assets },
      selection: assets.filter((asset) => asset.isApproved).map((asset) => asset.id),
    });
  },

  setExportFormats: (formats) => {
    const draft = get().draft;
    if (!draft) return;
    set({ draft: { ...draft, exportFormats: formats } });
  },

  toggleExportFormat: (format) => {
    const draft = get().draft;
    if (!draft) return;
    const active = draft.exportFormats.includes(format);
    set({
      draft: {
        ...draft,
        exportFormats: active
          ? draft.exportFormats.filter((item) => item !== format)
          : [...draft.exportFormats, format],
      },
    });
  },

  toggleCatalogImage: (imageId) => {
    const draft = get().draft;
    if (!draft) return;
    const active = draft.catalog.imageIds.includes(imageId);
    set({
      draft: {
        ...draft,
        catalog: {
          ...draft.catalog,
          imageIds: active
            ? draft.catalog.imageIds.filter((item) => item !== imageId)
            : [...draft.catalog.imageIds, imageId],
        },
      },
    });
  },

  toggleCatalogColorway: (colorwayId) => {
    const draft = get().draft;
    if (!draft) return;
    const active = draft.catalog.colorwayIds.includes(colorwayId);
    set({
      draft: {
        ...draft,
        catalog: {
          ...draft.catalog,
          colorwayIds: active
            ? draft.catalog.colorwayIds.filter((item) => item !== colorwayId)
            : [...draft.catalog.colorwayIds, colorwayId],
        },
      },
    });
  },

  /** Stores the finished draft in the in-memory project list (newest first). */
  commitProject: () => {
    const { draft, projects } = get();
    if (!draft || draft.assets.length === 0) return;

    const project: Project = {
      ...draft,
      name: draft.product.name.trim() || 'Untitled project',
    };
    const existing = projects.findIndex((item) => item.id === project.id);
    const next =
      existing >= 0
        ? projects.map((item) => (item.id === project.id ? project : item))
        : [project, ...projects];

    set({ projects: next });
  },
}));
