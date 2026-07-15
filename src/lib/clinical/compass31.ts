/**
 * COMPASS-31 scoring.
 *
 * CV-01 (open question): the clinic's paper workflow uses raw domain maxima
 * totaling /75, while the validated instrument (Sletten et al. 2012) uses
 * weighted scoring totaling /100. Best guess pending confirmation: we compute
 * and display BOTH — raw /75 as the primary figure (matches the paper
 * workflow) with the weighted /100 alongside.
 */

export interface Compass31DomainScore {
  domain: string;
  score: number;
  maxScore: number;
}

export const COMPASS31_DOMAINS = [
  { key: 'orthostaticIntolerance', domain: 'Orthostatic Intolerance', maxScore: 10, weight: 4 },
  { key: 'vasomotor', domain: 'Vasomotor', maxScore: 6, weight: 0.8333 },
  { key: 'secretomotor', domain: 'Secretomotor', maxScore: 7, weight: 2.1428571 },
  { key: 'gastrointestinal', domain: 'Gastrointestinal', maxScore: 28, weight: 0.8928571 },
  { key: 'bladder', domain: 'Bladder', maxScore: 9, weight: 1.111 },
  { key: 'pupillomotor', domain: 'Pupillomotor', maxScore: 15, weight: 0.333 },
] as const;

export type Compass31DomainKey = (typeof COMPASS31_DOMAINS)[number]['key'];

export const COMPASS31_RAW_MAX = 75;
export const COMPASS31_WEIGHTED_MAX = 100;

export type Compass31DomainScores = Partial<Record<Compass31DomainKey, number | null>>;

/** Raw total: simple sum of domain raw scores (max 75). */
export function compass31RawTotal(scores: Compass31DomainScores): number {
  return COMPASS31_DOMAINS.reduce((sum, d) => sum + (scores[d.key] ?? 0), 0);
}

/** Weighted total per the validated instrument (max 100). */
export function compass31WeightedTotal(scores: Compass31DomainScores): number {
  const total = COMPASS31_DOMAINS.reduce(
    (sum, d) => sum + (scores[d.key] ?? 0) * d.weight,
    0,
  );
  return Math.round(total * 10) / 10;
}

/**
 * CP-04: requested severity labels applied to the displayed total.
 * 0-15 Mild, 16-30 Moderate, 31-45 Severe. Scores above 45 return null
 * (CV-03: intentionally unlabeled until ranges are finalized).
 *
 * These are user-requested display labels, not universally validated
 * diagnostic categories (spec §9.2) — presentation must keep them visually
 * separate from provider interpretation.
 */
export function compass31SeverityLabel(total: number): string | null {
  if (total < 0) return null;
  if (total <= 15) return 'Mild symptoms';
  if (total <= 30) return 'Moderate symptoms';
  if (total <= 45) return 'Severe symptoms';
  return null;
}
