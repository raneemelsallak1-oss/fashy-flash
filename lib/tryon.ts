import { invokeFunction, readString } from '@/lib/functions';
import type { GeneratedAsset, ProductData } from '@/lib/types';

const START_FUNCTION = 'tryon-start';
const STATUS_FUNCTION = 'tryon-status';

const POLL_INTERVAL = 4000;
/** Nothing is ready before this, and polls count against the request budget. */
const FIRST_POLL_DELAY = 6000;
const MAX_WAIT = 180_000;

const UNREACHABLE = 'Could not reach the on-model renderer. Check your connection and try again.';

/** Generation mode and resolution: the cheapest tier, one credit per image. */
const GENERATION_MODE = 'fast';
const RESOLUTION = '1k';

/** Credits one on-model render costs at the tier above. */
export const CREDITS_PER_RENDER = 1;

/** How the renderer should frame the shot. */
export type RenderFrame = 'full' | 'threeQuarter' | 'social' | 'closeUp';

/** Aspect ratios the renderer accepts, as width / height. */
const RATIOS: { ratio: string; value: number }[] = [
  { ratio: '9:16', value: 9 / 16 },
  { ratio: '2:3', value: 2 / 3 },
  { ratio: '3:4', value: 3 / 4 },
  { ratio: '4:5', value: 4 / 5 },
  { ratio: '1:1', value: 1 },
  { ratio: '5:4', value: 5 / 4 },
  { ratio: '4:3', value: 4 / 3 },
  { ratio: '3:2', value: 3 / 2 },
  { ratio: '16:9', value: 16 / 9 },
];

/** The accepted ratio closest to the crop this output was planned with. */
export function renderAspectRatio(aspect: number): string {
  let closest = RATIOS[0];
  for (const candidate of RATIOS) {
    if (Math.abs(candidate.value - aspect) < Math.abs(closest.value - aspect)) {
      closest = candidate;
    }
  }
  return closest.ratio;
}

export function renderFrame(asset: GeneratedAsset): RenderFrame {
  if (asset.variation === 'detail' || asset.variation === 'close-up') return 'closeUp';
  if (asset.variation === 'social') return 'social';
  if (asset.variation === 'back') return 'threeQuarter';
  return 'full';
}

/** Direction only the source photo can tell us, e.g. it shows the back. */
export function renderDirection(asset: GeneratedAsset): string {
  if (asset.sourceSlot === 'back') {
    return 'Photograph the model from behind so the back of the garment faces the camera';
  }
  if (asset.sourceSlot === 'detail') {
    return 'Keep the fabric detail the product image shows clearly visible';
  }
  return '';
}

/** A fresh seed, so asking for another render gives a different photograph. */
export function newRenderSeed(): number {
  return Math.floor(Math.random() * 4294967295);
}

export type RenderRequest = {
  asset: GeneratedAsset;
  /** Public URL of the uploaded garment photo. */
  productImage: string;
  product: ProductData;
  /** Object path the finished render is filed under. */
  storeAs: string;
};

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Renders one output on a real model: submits the uploaded garment photo with
 * the look this output was planned in, then polls until the image is ready and
 * returns its stored URL. Throws an Error carrying a message safe to show.
 */
export async function renderOnModel(request: RenderRequest): Promise<string> {
  const { asset } = request;

  const started = await invokeFunction(
    START_FUNCTION,
    {
      productImage: request.productImage,
      product: request.product,
      style: {
        model: asset.model,
        visualStyle: asset.visualStyle,
        background: asset.background,
      },
      lighting: asset.lighting,
      frame: renderFrame(asset),
      aspectRatio: renderAspectRatio(asset.aspect),
      resolution: RESOLUTION,
      generationMode: GENERATION_MODE,
      seed: asset.renderSeed,
      extraPrompt: renderDirection(asset),
    },
    UNREACHABLE,
  );

  const predictionId = readString(started.predictionId).trim();
  if (predictionId.length === 0) throw new Error(UNREACHABLE);

  const deadline = Date.now() + MAX_WAIT;
  let delay = FIRST_POLL_DELAY;

  while (Date.now() < deadline) {
    await wait(delay);
    delay = POLL_INTERVAL;

    const update = await invokeFunction(
      STATUS_FUNCTION,
      { predictionId, storeAs: request.storeAs },
      UNREACHABLE,
    );

    const status = readString(update.status);

    if (status === 'completed') {
      const imageUrl = readString(update.imageUrl).trim();
      if (imageUrl.length > 0) return imageUrl;
      throw new Error('The renderer finished without an image. Try rendering it again.');
    }

    if (status === 'failed') {
      const message = readString(update.message).trim();
      throw new Error(message.length > 0 ? message : 'The renderer could not finish this image.');
    }
  }

  throw new Error('The renderer is taking longer than usual. Try this image again.');
}
