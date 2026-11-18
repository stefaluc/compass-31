/**
 * Balance and coordination (spec §7.9).
 *
 * CV-02 (resolved): mBESS is scored the standard way — the provider enters the
 * number of ERRORS per stance (0–10), the total is errors out of 30, and lower
 * is better. The total carries no red flag (removed at the clinic's request,
 * Nov 2026); the report states that the numbers are error counts instead.
 */

export const MBESS_STANCE_MAX = 10;
export const MBESS_TOTAL_MAX = 30;

/** Printed under the balance table so a reader cannot mistake errors for points. */
export const MBESS_REPORT_NOTE =
  'mBESS is recorded as the number of errors in each stance (maximum 10 per stance, 30 total). Lower is better.';

/** Total errors across the three stances; null when nothing was entered. */
export function mbessTotal(
  doubleLeg: number | null,
  singleLeg: number | null,
  tandem: number | null,
): number | null {
  if (doubleLeg == null && singleLeg == null && tandem == null) return null;
  return (doubleLeg ?? 0) + (singleLeg ?? 0) + (tandem ?? 0);
}

/* ------------------------------- Tandem gait ------------------------------- */

export const TANDEM_GAIT_OPTIONS = [
  'Quick and steady',
  'Slow and steady',
  'Quick and mildly unsteady',
  'Slow and mildly unsteady',
  'Quick and moderately unsteady',
  'Slow and moderately unsteady',
  'Quick and very unsteady',
  'Slow and very unsteady',
  'Other',
] as const;

/** "10" → "10 ft"; anything already carrying words or units is left as typed. */
export function formatFeet(distance: string | null | undefined): string | null {
  const d = (distance ?? '').trim();
  if (d === '') return null;
  return /^\d+(\.\d+)?$/.test(d) ? `${d} ft` : d;
}
