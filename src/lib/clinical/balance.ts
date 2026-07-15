/**
 * Balance and coordination (spec §7.9).
 *
 * CV-02 (open question): the requested design treats each mBESS stance as
 * points EARNED out of 10 (higher = better) and flags totals below 20 in
 * red. Standard mBESS documentation counts ERRORS (lower = better). Best
 * guess pending confirmation: implement the clinic's requested convention
 * (points earned, red below 20) since it matches their paper workflow.
 */

export const MBESS_STANCE_MAX = 10;
export const MBESS_TOTAL_MAX = 30;
export const MBESS_RED_THRESHOLD = 20;

export function mbessTotal(
  doubleLeg: number | null,
  singleLeg: number | null,
  tandem: number | null,
): number | null {
  if (doubleLeg == null && singleLeg == null && tandem == null) return null;
  return (doubleLeg ?? 0) + (singleLeg ?? 0) + (tandem ?? 0);
}

/** Red when total is below 20 (clinic-defined display rule, see CV-02). */
export const mbessTotalFlag = (total: number | null) =>
  total != null && total < MBESS_RED_THRESHOLD;
