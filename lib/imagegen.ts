import { invokeFunction, readString } from '@/lib/functions';
import type { GeneratedAsset, ProductData } from '@/lib/types';

const FUNCTION_NAME = 'generate-image';

const UNREACHABLE = 'Could not reach the image service. Check your connection and try again.';

export type ImageRequest = {
  /** The output being generated; carries its framing and style choices. */
  asset: GeneratedAsset;
  /** Public URL of the uploaded garment photo the image is generated from. */
  garmentImage: string;
  product: ProductData;
  /** Object path the finished image is filed under, without an extension. */
  storeAs: string;
};

/**
 * Generates one real image for an output. The backend composes the photography
 * prompt from the product data and the selected model, style and background,
 * calls the image-generation service and returns the stored image URL. Throws
 * an Error carrying a message that is safe to show the user.
 */
export async function generateImage(request: ImageRequest): Promise<string> {
  const { asset, product } = request;

  const data = await invokeFunction(
    FUNCTION_NAME,
    {
      garmentImage: request.garmentImage,
      product: {
        name: product.name,
        category: product.category,
        details: product.description,
        description: product.description,
        material: product.material,
        fit: product.fit,
        sizeRange: product.sizeRange,
      },
      style: {
        model: asset.model,
        visualStyle: asset.visualStyle,
        background: asset.background,
      },
      lighting: asset.lighting,
      variation: asset.variation,
      view: asset.sourceSlot,
      take: asset.take,
      aspect: asset.aspect,
      storeAs: request.storeAs,
    },
    UNREACHABLE,
  );

  const imageUrl = readString(data.imageUrl).trim();
  if (imageUrl.length === 0) {
    throw new Error('The image service finished without a picture. Try generating it again.');
  }

  return imageUrl;
}
