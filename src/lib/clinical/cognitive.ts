/**
 * Cognitive testing display rules (spec §7.8, §9.2).
 * These are CLINIC-DEFINED visual flags, not validated diagnostic cutoffs.
 * Orientation is intentionally omitted per spec.
 */

export const COGNITIVE_MAX = {
  immediateRecall: 30,
  delayedRecall: 10,
  digitsBackward: 4,
} as const;

export const immediateRecallFlag = (score: number) => score < 20;
export const delayedRecallFlag = (score: number) => score < 6;
export const digitsBackwardFlag = (score: number) => score < 3;

/** Trail B/A ratio, rounded to 2 decimals. Null when either time is missing/zero. */
export function trailRatio(trailASeconds: number | null, trailBSeconds: number | null): number | null {
  if (trailASeconds == null || trailBSeconds == null || trailASeconds <= 0 || trailBSeconds < 0) {
    return null;
  }
  return Math.round((trailBSeconds / trailASeconds) * 100) / 100;
}

export const trailRatioFlag = (ratio: number | null) => ratio != null && ratio > 3;
