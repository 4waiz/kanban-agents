/**
 * Seeded determinism for the sketch-brutalist system.
 *
 * Every rotation, wobble, roughjs seed, and accent color is derived from a
 * string seed (usually the element's text) so server/first render and client
 * agree and nothing jitters between renders. Never use Math.random() for these.
 */
import type { ReactNode } from 'react';

/** djb2-ish string hash → unsigned 32-bit int. */
export function hashString(str: string): number {
  let h = 5381;
  for (let i = 0; i < str.length; i++) {
    h = (h * 33) ^ str.charCodeAt(i);
  }
  return h >>> 0;
}

/** Stable rotation in [-maxDeg, +maxDeg] derived from the seed. */
export function seededRotation(seed: string, maxDeg = 0.4): number {
  const h = hashString(seed);
  const norm = (h % 1000) / 1000; // 0..1
  return (norm * 2 - 1) * maxDeg;
}

/** Stable integer in [0, n) from the seed. */
export function seededInt(seed: string, n: number): number {
  if (n <= 0) return 0;
  return hashString(seed) % n;
}

/** Stable float in [0, 1) from the seed (with an optional salt). */
export function seededFloat(seed: string, salt = ''): number {
  return (hashString(seed + salt) % 100000) / 100000;
}

/** Pull a usable string seed out of arbitrary React children. */
export function seedFromChildren(children: ReactNode): string {
  if (children == null) return 'seed';
  if (typeof children === 'string' || typeof children === 'number') {
    return String(children);
  }
  if (Array.isArray(children)) {
    return children.map(seedFromChildren).join('');
  }
  // Object/element — fall back to a constant so it is still deterministic.
  try {
    return JSON.stringify(children).slice(0, 64);
  } catch {
    return 'seed';
  }
}

/* ------------------------------------------------------------------ */
/* Neon accents (dark-mode seeded color)                               */
/* ------------------------------------------------------------------ */

export const ACCENTS = [
  'electric',
  'pink',
  'acid',
  'sun',
  'orange',
  'violet',
] as const;

export type Accent = (typeof ACCENTS)[number];

export const ACCENT_HEX: Record<Accent, string> = {
  electric: '#00E0FF',
  pink: '#FF4D9E',
  acid: '#B8FF3D',
  sun: '#FFE34D',
  orange: '#FF7A1A',
  violet: '#7B5BFF',
};

/** Light accents want dark text on top; only `violet` wants light text. */
export function isLightAccent(accent: Accent): boolean {
  return accent !== 'violet';
}

/** Deterministically pick one accent name from a seed. */
export function pickAccent(seed: string): Accent {
  return ACCENTS[seededInt(seed, ACCENTS.length)];
}

/** Deterministically pick one accent hex from a seed. */
export function pickAccentHex(seed: string): string {
  return ACCENT_HEX[pickAccent(seed)];
}

/** Text color (ink-dark or cream) that reads on top of a given accent. */
export function accentTextColor(accent: Accent): string {
  return isLightAccent(accent) ? '#0A0A0A' : '#F5F1E8';
}
