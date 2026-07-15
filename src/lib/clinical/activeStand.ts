/**
 * Active Stand Test calculations and visual flags (spec §7.7, AS-03/AS-04).
 *
 * Flag rule [E5], AHA 2024 orthostatic hypotension definition: a sustained
 * fall of >= 20 mmHg systolic or >= 10 mmHg diastolic from supine baseline.
 * Red when the qualifying drop occurs within minutes 1-3; orange when it
 * FIRST appears during minutes 4-5. Visual support only — not a diagnosis.
 */

export interface StandReading {
  systolic: number | null;
  diastolic: number | null;
  heartRate: number | null;
  symptoms?: string;
}

export interface StandChange {
  systolicChange: number | null;
  diastolicChange: number | null;
  heartRateChange: number | null;
}

export type StandFlag = 'red' | 'orange' | null;

export const SYSTOLIC_DROP_THRESHOLD = 20;
export const DIASTOLIC_DROP_THRESHOLD = 10;

/** AS-03: change from supine baseline for one standing minute. */
export function changeFromBaseline(
  baseline: StandReading,
  reading: StandReading,
): StandChange {
  const diff = (a: number | null, b: number | null) =>
    a != null && b != null ? a - b : null;
  return {
    systolicChange: diff(reading.systolic, baseline.systolic),
    diastolicChange: diff(reading.diastolic, baseline.diastolic),
    heartRateChange: diff(reading.heartRate, baseline.heartRate),
  };
}

/** Whether a single reading has a qualifying BP drop from baseline. */
export function hasQualifyingDrop(change: StandChange): boolean {
  const sysDrop = change.systolicChange != null && change.systolicChange <= -SYSTOLIC_DROP_THRESHOLD;
  const diaDrop = change.diastolicChange != null && change.diastolicChange <= -DIASTOLIC_DROP_THRESHOLD;
  return sysDrop || diaDrop;
}

/**
 * AS-04: flags for standing minutes 1..5 (index 0 = minute 1).
 * Red for qualifying drops in minutes 1-3; orange when the drop first
 * appears in minutes 4-5 (i.e. no qualifying drop occurred in minutes 1-3).
 */
export function standFlags(
  baseline: StandReading,
  minutes: (StandReading | null)[],
): StandFlag[] {
  const changes = minutes.map((m) => (m ? changeFromBaseline(baseline, m) : null));
  const drops = changes.map((c) => (c ? hasQualifyingDrop(c) : false));
  const earlyDrop = drops.slice(0, 3).some(Boolean);

  return drops.map((dropped, i) => {
    if (!dropped) return null;
    const minute = i + 1;
    if (minute <= 3) return 'red';
    return earlyDrop ? 'red' : 'orange';
  });
}
