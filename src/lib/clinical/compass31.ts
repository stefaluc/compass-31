/**
 * COMPASS-31 scoring.
 *
 * CV-01 (resolved): the validated instrument (Sletten et al. 2012) uses
 * weighted scoring totaling /100. Only weighted scores are shown — on the
 * scoring page, in the report generators, and in the PDF. Raw domain scores
 * (/75 total) are an internal step of the calculation and never displayed.
 */

export interface Compass31DomainScore {
  domain: string;
  score: number;
  maxScore: number;
}

/**
 * Weighting factors per Sletten et al. 2012, Table 3. Stored as the exact
 * fractions (weightedMax / maxScore) that the paper prints as truncated
 * decimals (e.g. 5/6 → 0.83333333).
 */
export const COMPASS31_DOMAINS = [
  { key: 'orthostaticIntolerance', domain: 'Orthostatic Intolerance', maxScore: 10, weight: 40 / 10, weightedMax: 40 },
  { key: 'vasomotor', domain: 'Vasomotor', maxScore: 6, weight: 5 / 6, weightedMax: 5 },
  { key: 'secretomotor', domain: 'Secretomotor', maxScore: 7, weight: 15 / 7, weightedMax: 15 },
  { key: 'gastrointestinal', domain: 'Gastrointestinal', maxScore: 28, weight: 25 / 28, weightedMax: 25 },
  { key: 'bladder', domain: 'Bladder', maxScore: 9, weight: 10 / 9, weightedMax: 10 },
  { key: 'pupillomotor', domain: 'Pupillomotor', maxScore: 15, weight: 5 / 15, weightedMax: 5 },
] as const;

export type Compass31DomainKey = (typeof COMPASS31_DOMAINS)[number]['key'];

export const COMPASS31_RAW_MAX = 75;
export const COMPASS31_WEIGHTED_MAX = 100;

export type Compass31DomainScores = Partial<Record<Compass31DomainKey, number | null>>;

/** Weighted domain scores as they are displayed, charted, and stored in reports. */
export type Compass31WeightedScores = Partial<Record<Compass31DomainKey, number | null>>;

const round1 = (n: number) => Math.round(n * 10) / 10;

/** Raw total: simple sum of domain raw scores (max 75). Scoring internals only. */
export function compass31RawTotal(scores: Compass31DomainScores): number {
  return COMPASS31_DOMAINS.reduce((sum, d) => sum + (scores[d.key] ?? 0), 0);
}

/** Weighted score for one domain (raw × weight), rounded to one decimal. */
export function compass31DomainWeighted(
  domain: (typeof COMPASS31_DOMAINS)[number],
  raw: number | null | undefined,
): number | null {
  if (raw == null) return null;
  return round1(raw * domain.weight);
}

/** Raw domain scores → weighted domain scores (one decimal each). */
export function compass31WeightedScores(raw: Compass31DomainScores): Compass31WeightedScores {
  const out: Compass31WeightedScores = {};
  for (const d of COMPASS31_DOMAINS) {
    const w = compass31DomainWeighted(d, raw[d.key]);
    if (w != null) out[d.key] = w;
  }
  return out;
}

/**
 * Total /100 from weighted domain scores. The total is the sum of the domain
 * scores exactly as shown (one decimal each), so the six lines a provider
 * charts always add up to the total beside them, and a total re-entered from
 * a prior report matches the one computed by the scorer.
 */
export function compass31TotalFromWeighted(weighted: Compass31WeightedScores): number {
  return round1(COMPASS31_DOMAINS.reduce((sum, d) => sum + (weighted[d.key] ?? 0), 0));
}

/** Weighted total per the validated instrument (max 100), from raw domain scores. */
export function compass31WeightedTotal(scores: Compass31DomainScores): number {
  return compass31TotalFromWeighted(compass31WeightedScores(scores));
}

/**
 * Plain-text block for pasting into the chart: one "Domain: score/max" line
 * per domain, then the total. Missing domains count as 0.
 */
export function compass31ChartText(weighted: Compass31WeightedScores): string {
  const lines = COMPASS31_DOMAINS.map(
    (d) => `${d.domain}: ${weighted[d.key] ?? 0}/${d.weightedMax}`,
  );
  lines.push(`Total: ${compass31TotalFromWeighted(weighted)}/${COMPASS31_WEIGHTED_MAX}`);
  return lines.join('\n');
}
