/**
 * Evidence-supported severity bands for mental-health and sleep screens
 * (spec §7.5, §9.1). These are screening labels, not diagnoses.
 */

export interface SeverityBand {
  min: number;
  max: number;
  label: string;
}

/** PHQ-9 (0-27), Kroenke et al. 2001 [E2]. */
export const PHQ9_MAX = 27;
export const PHQ9_BANDS: SeverityBand[] = [
  { min: 0, max: 4, label: 'None to minimal' },
  { min: 5, max: 9, label: 'Mild' },
  { min: 10, max: 14, label: 'Moderate' },
  { min: 15, max: 19, label: 'Moderately severe' },
  { min: 20, max: 27, label: 'Severe depression' },
];

/** GAD-7 (0-21), Spitzer et al. 2006 [E3]. */
export const GAD7_MAX = 21;
export const GAD7_BANDS: SeverityBand[] = [
  { min: 0, max: 4, label: 'Minimal' },
  { min: 5, max: 9, label: 'Mild' },
  { min: 10, max: 14, label: 'Moderate' },
  { min: 15, max: 21, label: 'Severe anxiety' },
];

/** Athens Insomnia Scale, AIS-8 (0-24), Okajima et al. 2020 [E4]. */
export const AIS8_MAX = 24;
export const AIS8_BANDS: SeverityBand[] = [
  { min: 0, max: 5, label: 'No clinically significant insomnia symptoms' },
  { min: 6, max: 9, label: 'Mild' },
  { min: 10, max: 15, label: 'Moderate' },
  { min: 16, max: 24, label: 'Severe insomnia symptoms' },
];

export function severityLabel(bands: SeverityBand[], score: number): string | null {
  const band = bands.find((b) => score >= b.min && score <= b.max);
  return band ? band.label : null;
}

export const phq9Label = (score: number) => severityLabel(PHQ9_BANDS, score);
export const gad7Label = (score: number) => severityLabel(GAD7_BANDS, score);
export const ais8Label = (score: number) => severityLabel(AIS8_BANDS, score);
