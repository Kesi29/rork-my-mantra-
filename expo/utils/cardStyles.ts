export interface BlobDef {
  color: string;
  x: number; // 0–1 fraction of width
  y: number; // 0–1 fraction of height
  radius: number; // 0–1 fraction of min(width, height)
}

export interface CardStyle {
  id: string;
  name: string;
  baseFill: string;
  blobs: BlobDef[];
  textColor: string;
  watermarkColor: string;
  /** Opacity of the dark vignette overlay that ensures text legibility (0–1) */
  overlayStrength: number;
  /** Shadow color behind text — heavier on bright/light backgrounds */
  textShadowColor: string;
}

export const CARD_STYLES: CardStyle[] = [
  {
    id: 'ember',
    name: 'Ember',
    baseFill: '#d4145a',
    blobs: [
      { color: '#d4145a', x: 0.20, y: 0.15, radius: 0.55 },
      { color: '#ff6a00', x: 0.85, y: 0.10, radius: 0.50 },
      { color: '#c03abc', x: 0.10, y: 0.85, radius: 0.45 },
      { color: '#e8447a', x: 0.70, y: 0.60, radius: 0.40 },
      { color: '#d4145a', x: 0.50, y: 1.00, radius: 0.40 },
    ],
    textColor: '#FFFFFF',
    watermarkColor: 'rgba(255,255,255,0.55)',
    overlayStrength: 0.35,
    textShadowColor: 'rgba(80,0,30,0.6)',
  },
  {
    id: 'ocean',
    name: 'Ocean',
    baseFill: '#0a2463',
    blobs: [
      { color: '#0a2463', x: 0.15, y: 0.10, radius: 0.55 },
      { color: '#1e6091', x: 0.80, y: 0.20, radius: 0.50 },
      { color: '#3a86ff', x: 0.30, y: 0.70, radius: 0.45 },
      { color: '#0a2463', x: 0.85, y: 0.90, radius: 0.40 },
      { color: '#1e6091', x: 0.50, y: 0.50, radius: 0.40 },
    ],
    textColor: '#FFFFFF',
    watermarkColor: 'rgba(255,255,255,0.45)',
    overlayStrength: 0.2,
    textShadowColor: 'rgba(0,10,40,0.5)',
  },
  {
    id: 'forest',
    name: 'Forest',
    baseFill: '#1a4a2e',
    blobs: [
      { color: '#1a4a2e', x: 0.20, y: 0.10, radius: 0.55 },
      { color: '#2d6a4f', x: 0.75, y: 0.30, radius: 0.50 },
      { color: '#40916c', x: 0.15, y: 0.75, radius: 0.45 },
      { color: '#1a4a2e', x: 0.80, y: 0.85, radius: 0.40 },
      { color: '#52b788', x: 0.50, y: 0.50, radius: 0.40 },
    ],
    textColor: '#FFFFFF',
    watermarkColor: 'rgba(255,255,255,0.45)',
    overlayStrength: 0.22,
    textShadowColor: 'rgba(0,20,10,0.5)',
  },
  {
    id: 'dusk',
    name: 'Dusk',
    baseFill: '#2d1b69',
    blobs: [
      { color: '#2d1b69', x: 0.10, y: 0.15, radius: 0.55 },
      { color: '#6c3a8a', x: 0.80, y: 0.20, radius: 0.50 },
      { color: '#e8447a', x: 0.85, y: 0.75, radius: 0.45 },
      { color: '#2d1b69', x: 0.20, y: 0.90, radius: 0.40 },
      { color: '#9b4dca', x: 0.50, y: 0.50, radius: 0.40 },
    ],
    textColor: '#FFFFFF',
    watermarkColor: 'rgba(255,255,255,0.45)',
    overlayStrength: 0.2,
    textShadowColor: 'rgba(20,0,50,0.5)',
  },
  {
    id: 'sand',
    name: 'Sand',
    baseFill: '#d4a574',
    blobs: [
      { color: '#d4a574', x: 0.20, y: 0.10, radius: 0.55 },
      { color: '#c68642', x: 0.80, y: 0.25, radius: 0.50 },
      { color: '#e8c9a0', x: 0.15, y: 0.75, radius: 0.45 },
      { color: '#a0522d', x: 0.85, y: 0.85, radius: 0.40 },
      { color: '#d4a574', x: 0.50, y: 0.50, radius: 0.40 },
    ],
    textColor: '#FFFFFF',
    watermarkColor: 'rgba(255,255,255,0.55)',
    overlayStrength: 0.4,
    textShadowColor: 'rgba(60,30,0,0.65)',
  },
  {
    id: 'midnight',
    name: 'Midnight',
    baseFill: '#0a0a0a',
    blobs: [
      { color: '#0a0a0a', x: 0.20, y: 0.10, radius: 0.55 },
      { color: '#1a1a2e', x: 0.80, y: 0.25, radius: 0.50 },
      { color: '#16213e', x: 0.15, y: 0.75, radius: 0.45 },
      { color: '#0a0a0a', x: 0.85, y: 0.85, radius: 0.40 },
      { color: '#1a1a2e', x: 0.50, y: 0.50, radius: 0.40 },
    ],
    textColor: 'rgba(255,255,255,0.92)',
    watermarkColor: 'rgba(255,255,255,0.3)',
    overlayStrength: 0.0,
    textShadowColor: 'rgba(0,0,0,0.4)',
  },
];

export const DEFAULT_STYLE_ID = 'ember';

export function getStyleById(id: string): CardStyle {
  return CARD_STYLES.find((s) => s.id === id) ?? CARD_STYLES[0];
}
