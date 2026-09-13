import { create } from 'zustand';

import { defaultCatalogSelection } from '@/lib/catalog';
import {
  applyTreatment,
  buildAssets,
  buildImportedAsset,
  EMPTY_TREATMENT,
  isFinalAsset,
  needsAiImage,
  nextTake,
} from '@/lib/generation';
import { generateImage } from '@/lib/imagegen';
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
import { uploadGarmentPhoto } from '@/lib/uploads';

const EMPTY_PRODUCT: ProductData = {
  name: '',
  category: '',
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
  material: 'Linen Blend',
  fit: 'Oversized',
  sizeRange: 'XS – XL',
  description:
    'Oversized ivory linen-blend shirt with a relaxed drop shoulder, mother-of-pearl buttons and a solid, texture-forward weave.',
};

const SLOT_ORDER: PhotoSlot[] = ['front', 'back', 'detail'];

type Draft = Project;

/** Whether an AI revision request is in flight. */
export type RevisionStatus = 'idle' | 'working';

/** Progress of the AI image generation for the current output set. */
export type RenderProgress = {
  total: number;
  done: number;
  failed: number;
  active: boolean;
};

const IDLE_RENDERS: RenderProgress = { total: 0, done: 0, failed: 0, active: false };

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
  /** Progress of the AI images for the current output set. */
  renderProgress: RenderProgress;

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
  runRenders: () => Promise<void>;

  submitRevision: (request: string) => Promise<void>;
  dismissRevision: () => void;

  addImportedPhotos: (photos: { uri: string; width: number; height: number }[]) => void;
  removeAsset: (assetId: string) => void;

  toggleSelection: (assetId: string) => void;
  clearSelection: () => void;
  toggleFavorite: (assetId: string) => void;
  updateAsset: (assetId: string, patch: Partial<GeneratedAsset>) => void;
  rerenderAsset: (assetId: string) => Promise<void>;
  restyleAsset: (assetId: string, patch: Partial<GeneratedAsset>) => Promise<void>;
  approveSelected: () => void;

  setExportFormats: (formats: ExportFormatId[]) => void;
  toggleExportFormat: (format: ExportFormatId) => void;
  toggleCatalogImage: (imageId: string) => void;
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
 * `keepRenders` carries finished AI images over as well, for a rebuild that did
 * not change how anything is presented.
 */
function rebuildAssets(draft: Draft, keepRenders = false): GeneratedAsset[] {
  const favorites = new Set(
    draft.assets.filter((asset) => asset.isFavorite).map((asset) => asset.id),
  );
  const renders = new Map(
    draft.assets
      .filter((asset) => asset.renderStatus === 'ready' && asset.renderUrl !== null)
      .map((asset) => [asset.id, asset]),
  );
  const imported = draft.assets.filter((asset) => asset.origin === 'imported');

  const generated = applyTreatment(buildAssets(draft), draft.treatment).map((asset) => {
    const kept = keepRenders ? renders.get(asset.id) : undefined;

    return {
      ...asset,
      isFavorite: favorites.has(asset.id) ? true : asset.isFavorite,
      ...(kept
        ? {
            renderStatus: kept.renderStatus,
            renderUrl: kept.renderUrl,
            renderError: null,
            take: kept.take,
          }
        : {}),
    };
  });

  return [...generated, ...imported];
}

type Getter = () => AppState;
type Setter = (partial: Partial<AppState>) => void;

/** Writes a patch onto one asset, but only while the same draft is open. */
function patchAsset(
  get: Getter,
  set: Setter,
  projectId: string,
  assetId: string,
  patch: Partial<GeneratedAsset>,
) {
  const draft = get().draft;
  if (!draft || draft.id !== projectId) return;
  set({ draft: mapAssets(draft, assetId, (asset) => ({ ...asset, ...patch })) });
}

/**
 * Generates one output for real: the garment photo goes to storage (once per
 * photo), the backend composes the prompt from the product data and the selected
 * model, style and background, and the finished image is written back onto the
 * asset. A failure leaves the local preview in place with a message to read.
 */
async function renderAsset(assetId: string, get: Getter, set: Setter): Promise<boolean> {
  const draft = get().draft;
  if (!draft) return false;

  const projectId = draft.id;
  const asset = draft.assets.find((item) => item.id === assetId);
  if (!asset?.sourceUri) return false;

  const photo = draft.photos.find((item) => item.uri === asset.sourceUri);
  if (!photo) {
    patchAsset(get, set, projectId, assetId, {
      renderStatus: 'failed',
      renderError: 'The garment photo this image was built from is no longer available.',
    });
    return false;
  }

  try {
    const garmentImage = photo.remoteUrl ?? (await uploadGarmentPhoto(projectId, photo));

    if (photo.remoteUrl !== garmentImage) {
      const withUrl = get().draft;
      if (withUrl && withUrl.id === projectId) {
        set({
          draft: {
            ...withUrl,
            photos: withUrl.photos.map((item) =>
              item.id === photo.id ? { ...item, remoteUrl: garmentImage } : item,
            ),
          },
        });
      }
    }

    const latest = get().draft;
    const target = latest?.assets.find((item) => item.id === assetId);
    if (!latest || latest.id !== projectId || !target) return false;

    const imageUrl = await generateImage({
      asset: target,
      garmentImage,
      product: latest.product,
      storeAs: `${projectId}/${assetId}-t${target.take}`,
    });

    patchAsset(get, set, projectId, assetId, {
      renderStatus: 'ready',
      renderUrl: imageUrl,
      renderError: null,
    });
    return true;
  } catch (error) {
    patchAsset(get, set, projectId, assetId, {
      renderStatus: 'failed',
      renderError:
        error instanceof Error ? error.message : 'The image service could not finish this picture.',
    });
    return false;
  }
}

export const useAppStore = create<AppState>((set, get) => ({
  projects: [],
  draft: null,
  selection: [],
  autoDetected: false,
  revisionStatus: 'idle',
  revisionError: null,
  lastRevision: null,
  renderProgress: { ...IDLE_RENDERS },

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
        catalog: { imageIds: [] },
        revisions: [],
      },
      selection: [],
      autoDetected: false,
      revisionStatus: 'idle',
      revisionError: null,
      lastRevision: null,
      renderProgress: { ...IDLE_RENDERS },
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
      renderProgress: { ...IDLE_RENDERS },
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
      remoteUrl: null,
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
      renderProgress: { ...IDLE_RENDERS },
    });
  },

  /**
   * Generates every planned output for real, two at a time so the first images
   * land quickly without flooding the service. Imported photos are left alone.
   */
  runRenders: async () => {
    const draft = get().draft;
    if (!draft) return;

    const queue = draft.assets.filter(needsAiImage);
    if (queue.length === 0) {
      set({ renderProgress: { ...IDLE_RENDERS } });
      return;
    }

    const projectId = draft.id;
    set({
      draft: {
        ...draft,
        assets: draft.assets.map((asset) =>
          needsAiImage(asset) ? { ...asset, renderStatus: 'pending', renderError: null } : asset,
        ),
      },
      renderProgress: { total: queue.length, done: 0, failed: 0, active: true },
    });

    const pending = queue.map((asset) => asset.id);

    const worker = async (): Promise<void> => {
      for (;;) {
        const assetId = pending.shift();
        if (assetId === undefined) return;
        if (get().draft?.id !== projectId) return;

        const rendered = await renderAsset(assetId, get, set);

        const progress = get().renderProgress;
        set({
          renderProgress: {
            ...progress,
            done: progress.done + 1,
            failed: progress.failed + (rendered ? 0 : 1),
          },
        });
      }
    };

    await Promise.all([worker(), worker()]);

    set({ renderProgress: { ...get().renderProgress, active: false } });
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

      const assets = rebuildAssets(revised, result.changes.length === 0);
      const rebuilt: Draft = { ...revised, assets };
      const ids = new Set(assets.map((asset) => asset.id));

      set({
        draft: { ...rebuilt, catalog: defaultCatalogSelection(rebuilt) },
        selection: get().selection.filter((id) => ids.has(id)),
        revisionStatus: 'idle',
        revisionError: null,
        lastRevision: revision,
      });

      // The revised look has to be generated again.
      void get().runRenders();
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
    const state = get();
    const asset = state.draft?.assets.find((item) => item.id === assetId);
    if (!asset || (asset.origin === 'generated' && asset.renderStatus !== 'ready')) return;

    const selection = state.selection;
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

  /**
   * Asks the service for another picture of the same look: a fresh take, so the
   * pose and framing differ while the garment, product data and staging stay as
   * configured.
   */
  rerenderAsset: async (assetId) => {
    const draft = get().draft;
    const asset = draft?.assets.find((item) => item.id === assetId);
    if (!draft || !asset || asset.origin !== 'generated' || !asset.sourceUri) return;

    set({
      draft: mapAssets(draft, assetId, (item) => ({
        ...item,
        ...nextTake(item),
        renderStatus: 'pending',
        renderUrl: null,
        renderError: null,
      })),
    });

    await renderAsset(assetId, get, set);
  },

  /**
   * Changes how one output is presented and has the service generate it again in
   * the new look. Imported photos keep whatever the user supplied.
   */
  restyleAsset: async (assetId, patch) => {
    const draft = get().draft;
    const asset = draft?.assets.find((item) => item.id === assetId);
    if (!draft || !asset) return;

    const regenerates = asset.origin === 'generated' && asset.sourceUri !== null;

    set({
      draft: mapAssets(draft, assetId, (item) => ({
        ...item,
        ...patch,
        ...(regenerates
          ? {
              renderStatus: 'pending' as const,
              renderUrl: null,
              renderError: null,
              isApproved: false,
            }
          : {}),
      })),
    });

    if (!regenerates) return;
    await renderAsset(assetId, get, set);
  },

  approveSelected: () => {
    const { draft, selection } = get();
    if (!draft) return;
    const eligible = draft.assets.filter(
      (asset) => asset.origin === 'imported' || asset.renderStatus === 'ready',
    );
    const eligibleIds = new Set(eligible.map((asset) => asset.id));
    const approveAll = selection.length === 0;
    const assets = draft.assets.map((asset) =>
      eligibleIds.has(asset.id) && (approveAll || selection.includes(asset.id))
        ? { ...asset, isApproved: true }
        : asset,
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

  /** Stores the finished draft in the in-memory project list (newest first). */
  commitProject: () => {
    const { draft, projects } = get();
    if (
      !draft?.assets.some((asset) => asset.origin === 'imported' || asset.renderStatus === 'ready')
    )
      return;

    const project: Project = {
      ...draft,
      assets: draft.assets.filter(isFinalAsset),
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
