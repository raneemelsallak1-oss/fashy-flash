/**
 * Color handling for simulated generation: turns the written product color into
 * a swatch hex and into the translucent layers that recolor a garment photo.
 */

/** A translucent layer painted over an image. `blend` maps to CSS mix-blend-mode. */
export type ImageLayer = {
  id: string;
  color: string;
  opacity: number;
  blend?: 'multiply' | 'color' | 'soft-light' | 'screen';
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
  pink: '#E8A8B4',
  fuchsia: '#C55C86',
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

export const FALLBACK_HEX = '#DCCDB8';

/** Best-effort swatch color for a written color name. */
export function hexForColorName(name: string): string {
  const normalized = name.trim().toLowerCase();
  if (!normalized) return FALLBACK_HEX;

  const direct = COLOR_HEX[normalized];
  if (direct) return direct;

  const match = Object.keys(COLOR_HEX).find((key) => normalized.includes(key));
  return match ? (COLOR_HEX[match] ?? FALLBACK_HEX) : FALLBACK_HEX;
}

export function hexForColorwayId(id: string): string {
  return COLOR_HEX[id] ?? FALLBACK_HEX;
}

/** Perceived brightness of a hex color, 0 (black) to 1 (white). */
export function luminance(hex: string): number {
  const value = hex.replace('#', '');
  if (value.length !== 6) return 0.7;

  const red = Number.parseInt(value.slice(0, 2), 16);
  const green = Number.parseInt(value.slice(2, 4), 16);
  const blue = Number.parseInt(value.slice(4, 6), 16);
  if (Number.isNaN(red) || Number.isNaN(green) || Number.isNaN(blue)) return 0.7;

  return (0.299 * red + 0.587 * green + 0.114 * blue) / 255;
}

/**
 * Layers that push a garment photo towards the chosen color while keeping the
 * fabric's own shading: a hue pass, plus depth for dark shades and a lift for
 * pale ones.
 */
export function colorwayLayers(hex: string, prefix = 'colorway'): ImageLayer[] {
  const light = luminance(hex);

  const layers: ImageLayer[] = [{ id: `${prefix}-hue`, color: hex, opacity: 0.5, blend: 'color' }];

  if (light < 0.45) {
    layers.push({ id: `${prefix}-depth`, color: hex, opacity: 0.42, blend: 'multiply' });
  } else {
    layers.push({ id: `${prefix}-tone`, color: hex, opacity: 0.24, blend: 'soft-light' });
  }

  return layers;
}
