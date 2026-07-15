/**
 * NASA Lean Test statistics (spec §6, §7.6).
 *
 * Lowest/highest heart rates are automatically identified but manually
 * correctable (NL-03/NL-04); the max HR delta recalculates from whichever
 * values are in effect (NR spec: highest HR minus selected baseline).
 */

export interface LeanMeasurement {
  totalSeconds: number;
  pulseRate: number | null;
  symptoms: string;
}

export interface LeanStats {
  /** Baseline (resting/supine) HR in effect — override or recorded. */
  baseline: number | null;
  /** Lowest standing HR — override or auto-identified. */
  lowest: number | null;
  /** Highest standing HR — override or auto-identified. */
  highest: number | null;
  /** Highest HR minus baseline (null until both exist). */
  delta: number | null;
}

export interface LeanOverrides {
  baseline?: number | null;
  lowest?: number | null;
  highest?: number | null;
}

export function computeLeanStats(
  recordedBaseline: number | null,
  measurements: LeanMeasurement[],
  overrides: LeanOverrides = {},
): LeanStats {
  const rates = measurements
    .map((m) => m.pulseRate)
    .filter((r): r is number => r != null && !Number.isNaN(r));

  const baseline = overrides.baseline ?? recordedBaseline;
  const lowest = overrides.lowest ?? (rates.length ? Math.min(...rates) : null);
  const highest = overrides.highest ?? (rates.length ? Math.max(...rates) : null);
  const delta = baseline != null && highest != null ? highest - baseline : null;

  return { baseline, lowest, highest, delta };
}

/**
 * Informational POTS-criteria note (>= 30 bpm sustained increase within 10
 * minutes of standing in adults). Display support only — never a diagnosis
 * (spec §9.4).
 */
export const POTS_DELTA_THRESHOLD = 30;
export const meetsPotsDeltaCriteria = (delta: number | null) =>
  delta != null && delta >= POTS_DELTA_THRESHOLD;

export const HR_TREND_OPTIONS = [
  'Stable',
  'Gradual increase',
  'Rapid increase',
  'Sustained elevation',
  'Fluctuating or variable',
  'Gradual decrease',
  'Other',
] as const;
