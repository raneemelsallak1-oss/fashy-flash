import { bilt } from '@/lib/bilt';
import { EMPTY_TREATMENT } from '@/lib/generation';
import type {
  BackgroundChoice,
  ContentPurpose,
  Framing,
  Lighting,
  ModelChoice,
  PhotoSlot,
  ProductData,
  Project,
  RevisionChange,
  StyleSelection,
  TreatmentOverrides,
  VisualStyle,
} from '@/lib/types';

const FUNCTION_NAME = 'revise-generation';

/** What one uploaded garment photo contributes to the request context. */
type GarmentReferencePayload = {
  id: string;
  slot: PhotoSlot;
  width: number;
  height: number;
};

/** Everything the backend needs to interpret a revision in context. */
export type RevisionRequestPayload = {
  revision: string;
  product: ProductData;
  style: StyleSelection;
  treatment: TreatmentOverrides;
  garmentReferences: GarmentReferencePayload[];
};

/** The updated generation instructions the backend returns. */
export type RevisionResult = {
  revisionId: string;
  summary: string;
  product: ProductData;
  style: StyleSelection;
  treatment: TreatmentOverrides;
  changes: RevisionChange[];
  preserved: string[];
  unsupported: string[];
  instructions: string;
};

const MODEL_VALUES: ModelChoice[] = ['female', 'male', 'diverse', 'none'];
const STYLE_VALUES: VisualStyle[] = ['minimal', 'studio', 'street', 'luxury', 'editorial'];
const BACKGROUND_VALUES: BackgroundChoice[] = ['plain', 'studio', 'lifestyle', 'outdoor', 'custom'];
const PURPOSE_VALUES: ContentPurpose[] = [
  'ecommerce',
  'instagram',
  'social',
  'catalog',
  'lookbook',
  'showroom',
];
const LIGHTING_VALUES: Lighting[] = ['soft', 'balanced', 'bright'];
const FRAMING_VALUES: Framing[] = ['wider', 'tighter', 'same'];

const GENERIC_FAILURE =
  'Could not reach the revision service. Check your connection and try again.';

/**
 * Collects the current garment information and every earlier selection, so the
 * backend can change only what the request names and keep the rest.
 */
export function buildRevisionPayload(project: Project, revision: string): RevisionRequestPayload {
  return {
    revision: revision.trim(),
    product: { ...project.product },
    style: { ...project.style, purposes: [...project.style.purposes] },
    treatment: { ...project.treatment },
    garmentReferences: project.photos.map((photo) => ({
      id: photo.id,
      slot: photo.slot,
      width: photo.width,
      height: photo.height,
    })),
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function readString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback;
}

function readOption<T extends string>(value: unknown, allowed: T[], fallback: T): T {
  return allowed.find((option) => option === value) ?? fallback;
}

function readNullableOption<T extends string>(value: unknown, allowed: T[]): T | null {
  return allowed.find((option) => option === value) ?? null;
}

function readNullableBool(value: unknown): boolean | null {
  return typeof value === 'boolean' ? value : null;
}

function readStringList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0);
}

function readProduct(value: unknown, fallback: ProductData): ProductData {
  if (!isRecord(value)) return fallback;
  return {
    name: readString(value.name, fallback.name),
    category: readString(value.category, fallback.category),
    color: readString(value.color, fallback.color),
    material: readString(value.material, fallback.material),
    fit: readString(value.fit, fallback.fit),
    sizeRange: readString(value.sizeRange, fallback.sizeRange),
    brand: readString(value.brand, fallback.brand),
    sku: readString(value.sku, fallback.sku),
    description: readString(value.description, fallback.description),
  };
}

function readStyle(value: unknown, fallback: StyleSelection): StyleSelection {
  if (!isRecord(value)) return fallback;

  const purposes = Array.isArray(value.purposes)
    ? value.purposes.filter((item): item is ContentPurpose =>
        PURPOSE_VALUES.some((purpose) => purpose === item),
      )
    : [];

  return {
    model: readOption(value.model, MODEL_VALUES, fallback.model),
    visualStyle: readOption(value.visualStyle, STYLE_VALUES, fallback.visualStyle),
    background: readOption(value.background, BACKGROUND_VALUES, fallback.background),
    purposes: purposes.length > 0 ? [...new Set(purposes)] : fallback.purposes,
  };
}

function readTreatment(value: unknown): TreatmentOverrides {
  if (!isRecord(value)) return { ...EMPTY_TREATMENT };
  return {
    lighting: readNullableOption(value.lighting, LIGHTING_VALUES),
    enhanced: readNullableBool(value.enhanced),
    shadow: readNullableBool(value.shadow),
    framing: readNullableOption(value.framing, FRAMING_VALUES),
  };
}

function readChanges(value: unknown): RevisionChange[] {
  if (!Array.isArray(value)) return [];

  const changes: RevisionChange[] = [];
  for (const item of value) {
    if (!isRecord(item)) continue;
    const label = readString(item.label).trim();
    if (label.length === 0) continue;
    changes.push({
      field: readString(item.field),
      label,
      from: readString(item.from),
      to: readString(item.to),
    });
  }

  return changes;
}

/** Pulls the human-readable message out of a function error response. */
async function messageFromError(error: unknown): Promise<string> {
  const context = isRecord(error) ? error.context : null;

  const jsonFn = isRecord(context) ? context.json : undefined;

  if (typeof jsonFn === 'function') {
    try {
      const body: unknown = await jsonFn.call(context);
      if (isRecord(body)) {
        const message = readString(body.message).trim();
        if (message.length > 0) return message;
      }
    } catch {
      // The error body was not JSON — fall back to the generic message.
    }
  }

  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message.includes('Edge Function') ? GENERIC_FAILURE : error.message;
  }

  return GENERIC_FAILURE;
}

/**
 * Sends the revision text plus the current settings to the backend, which asks
 * the AI service what to change and returns the merged instructions. Throws an
 * Error carrying a message that is safe to show the user.
 */
export async function requestRevision(project: Project, revision: string): Promise<RevisionResult> {
  const payload = buildRevisionPayload(project, revision);

  const { data, error } = await bilt.functions.invoke(FUNCTION_NAME, { body: payload });
  if (error) throw new Error(await messageFromError(error));

  if (!isRecord(data)) throw new Error(GENERIC_FAILURE);

  if (data.ok !== true) {
    const message = readString(data.message).trim();
    throw new Error(message.length > 0 ? message : GENERIC_FAILURE);
  }

  const summary = readString(data.summary).trim();

  return {
    revisionId: readString(data.revisionId) || `rev-${Date.now().toString(36)}`,
    summary: summary.length > 0 ? summary : 'Applied the requested changes.',
    product: readProduct(data.product, payload.product),
    style: readStyle(data.style, payload.style),
    treatment: readTreatment(data.treatment),
    changes: readChanges(data.changes),
    preserved: readStringList(data.preserved),
    unsupported: readStringList(data.unsupported),
    instructions: readString(data.instructions),
  };
}
