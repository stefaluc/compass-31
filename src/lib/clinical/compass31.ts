/**
 * COMPASS-31 scoring.
 *
 * CV-01 (resolved): the validated instrument (Sletten et al. 2012) uses
 * weighted scoring totaling /100, and that is the primary figure everywhere.
 * Raw domain scores (/75 total) remain visible on the scoring page as entry
 * support but are omitted from the final summary PDF.
 */

export interface Compass31DomainScore {
  domain: string;
  score: number;
  maxScore: number;
}

export const COMPASS31_DOMAINS = [
  { key: 'orthostaticIntolerance', domain: 'Orthostatic Intolerance', maxScore: 10, weight: 4, weightedMax: 40 },
  { key: 'vasomotor', domain: 'Vasomotor', maxScore: 6, weight: 0.8333, weightedMax: 5 },
  { key: 'secretomotor', domain: 'Secretomotor', maxScore: 7, weight: 2.1428571, weightedMax: 15 },
  { key: 'gastrointestinal', domain: 'Gastrointestinal', maxScore: 28, weight: 0.8928571, weightedMax: 25 },
  { key: 'bladder', domain: 'Bladder', maxScore: 9, weight: 1.111, weightedMax: 10 },
  { key: 'pupillomotor', domain: 'Pupillomotor', maxScore: 15, weight: 0.333, weightedMax: 5 },
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

/** Weighted score for one domain (raw × weight), rounded to one decimal. */
export function compass31DomainWeighted(
  domain: (typeof COMPASS31_DOMAINS)[number],
  raw: number | null | undefined,
): number | null {
  if (raw == null) return null;
  return Math.round(raw * domain.weight * 10) / 10;
}
