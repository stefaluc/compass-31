import { describe, it, expect } from 'vitest';
import {
  COMPASS31_DOMAINS,
  compass31RawTotal,
  compass31WeightedTotal,
  compass31SeverityLabel,
} from './compass31';
import { phq9Label, gad7Label, ais8Label } from './severity';
import {
  changeFromBaseline,
  hasQualifyingDrop,
  standFlags,
  type StandReading,
} from './activeStand';
import {
  immediateRecallFlag,
  delayedRecallFlag,
  digitsBackwardFlag,
  trailRatio,
  trailRatioFlag,
} from './cognitive';
import { mbessTotal, mbessTotalFlag } from './balance';
import { computeLeanStats, meetsPotsDeltaCriteria } from './nasaLean';

describe('COMPASS-31', () => {
  it('domain raw maxima total 75', () => {
    expect(COMPASS31_DOMAINS.reduce((s, d) => s + d.maxScore, 0)).toBe(75);
  });

  it('weighted maxima total 100', () => {
    const max = Object.fromEntries(COMPASS31_DOMAINS.map((d) => [d.key, d.maxScore]));
    expect(compass31WeightedTotal(max)).toBeCloseTo(100, 0);
  });

  it('raw total sums domains, treating missing as 0', () => {
    expect(compass31RawTotal({ orthostaticIntolerance: 8, bladder: 3 })).toBe(11);
    expect(compass31RawTotal({})).toBe(0);
  });

  it('severity labels follow CP-04 bands and leave >45 unlabeled (CV-03)', () => {
    expect(compass31SeverityLabel(0)).toBe('Mild symptoms');
    expect(compass31SeverityLabel(15)).toBe('Mild symptoms');
    expect(compass31SeverityLabel(16)).toBe('Moderate symptoms');
    expect(compass31SeverityLabel(30)).toBe('Moderate symptoms');
    expect(compass31SeverityLabel(31)).toBe('Severe symptoms');
    expect(compass31SeverityLabel(45)).toBe('Severe symptoms');
    expect(compass31SeverityLabel(46)).toBeNull();
    expect(compass31SeverityLabel(-1)).toBeNull();
  });
});

describe('mental health and sleep severity bands', () => {
  it('PHQ-9 bands', () => {
    expect(phq9Label(4)).toBe('None to minimal');
    expect(phq9Label(5)).toBe('Mild');
    expect(phq9Label(10)).toBe('Moderate');
    expect(phq9Label(15)).toBe('Moderately severe');
    expect(phq9Label(20)).toBe('Severe depression');
    expect(phq9Label(27)).toBe('Severe depression');
    expect(phq9Label(28)).toBeNull();
  });

  it('GAD-7 bands', () => {
    expect(gad7Label(4)).toBe('Minimal');
    expect(gad7Label(9)).toBe('Mild');
    expect(gad7Label(14)).toBe('Moderate');
    expect(gad7Label(15)).toBe('Severe anxiety');
    expect(gad7Label(21)).toBe('Severe anxiety');
  });

  it('AIS-8 bands', () => {
    expect(ais8Label(5)).toBe('No clinically significant insomnia symptoms');
    expect(ais8Label(6)).toBe('Mild');
    expect(ais8Label(15)).toBe('Moderate');
    expect(ais8Label(16)).toBe('Severe insomnia symptoms');
  });
});

describe('Active Stand flags', () => {
  const baseline: StandReading = { systolic: 120, diastolic: 80, heartRate: 70 };
  const reading = (systolic: number, diastolic: number, heartRate = 80): StandReading => ({
    systolic,
    diastolic,
    heartRate,
  });

  it('computes changes from baseline', () => {
    const change = changeFromBaseline(baseline, reading(100, 75, 95));
    expect(change).toEqual({ systolicChange: -20, diastolicChange: -5, heartRateChange: 25 });
  });

  it('handles missing values as null changes', () => {
    const change = changeFromBaseline(baseline, { systolic: null, diastolic: 70, heartRate: null });
    expect(change.systolicChange).toBeNull();
    expect(change.diastolicChange).toBe(-10);
    expect(change.heartRateChange).toBeNull();
  });

  it('qualifying drop: >=20 systolic OR >=10 diastolic', () => {
    expect(hasQualifyingDrop(changeFromBaseline(baseline, reading(100, 80)))).toBe(true);
    expect(hasQualifyingDrop(changeFromBaseline(baseline, reading(101, 80)))).toBe(false);
    expect(hasQualifyingDrop(changeFromBaseline(baseline, reading(120, 70)))).toBe(true);
    expect(hasQualifyingDrop(changeFromBaseline(baseline, reading(120, 71)))).toBe(false);
  });

  it('red flags for drops in minutes 1-3', () => {
    const flags = standFlags(baseline, [
      reading(95, 80),
      reading(118, 79),
      reading(119, 78),
      reading(119, 79),
      reading(118, 79),
    ]);
    expect(flags).toEqual(['red', null, null, null, null]);
  });

  it('orange flags when the drop first appears in minutes 4-5', () => {
    const flags = standFlags(baseline, [
      reading(118, 79),
      reading(117, 78),
      reading(116, 78),
      reading(99, 79),
      reading(98, 78),
    ]);
    expect(flags).toEqual([null, null, null, 'orange', 'orange']);
  });

  it('continuation of an early drop into minutes 4-5 stays red', () => {
    const flags = standFlags(baseline, [
      reading(99, 79),
      reading(98, 78),
      reading(97, 78),
      reading(96, 79),
      reading(95, 78),
    ]);
    expect(flags).toEqual(['red', 'red', 'red', 'red', 'red']);
  });

  it('skips missing minutes', () => {
    const flags = standFlags(baseline, [reading(99, 79), null, null, null, null]);
    expect(flags).toEqual(['red', null, null, null, null]);
  });
});

describe('cognitive flags (clinic-defined)', () => {
  it('immediate recall red below 20', () => {
    expect(immediateRecallFlag(19)).toBe(true);
    expect(immediateRecallFlag(20)).toBe(false);
  });
  it('delayed recall red below 6', () => {
    expect(delayedRecallFlag(5)).toBe(true);
    expect(delayedRecallFlag(6)).toBe(false);
  });
  it('digits backward red below 3', () => {
    expect(digitsBackwardFlag(2)).toBe(true);
    expect(digitsBackwardFlag(3)).toBe(false);
  });
  it('trail B/A ratio computes and flags above 3', () => {
    expect(trailRatio(30, 96)).toBe(3.2);
    expect(trailRatioFlag(trailRatio(30, 96))).toBe(true);
    expect(trailRatioFlag(trailRatio(30, 90))).toBe(false);
    expect(trailRatio(0, 90)).toBeNull();
    expect(trailRatio(null, 90)).toBeNull();
    expect(trailRatioFlag(null)).toBe(false);
  });
});

describe('mBESS (CV-02 best guess: points earned, higher is better)', () => {
  it('totals three stances', () => {
    expect(mbessTotal(10, 7, 5)).toBe(22);
    expect(mbessTotal(null, null, null)).toBeNull();
    expect(mbessTotal(10, null, null)).toBe(10);
  });
  it('red below 20', () => {
    expect(mbessTotalFlag(19)).toBe(true);
    expect(mbessTotalFlag(20)).toBe(false);
    expect(mbessTotalFlag(null)).toBe(false);
  });
});

describe('NASA Lean stats', () => {
  const measurements = [
    { totalSeconds: 0, pulseRate: 88, symptoms: '' },
    { totalSeconds: 30, pulseRate: 95, symptoms: 'Dizziness' },
    { totalSeconds: 60, pulseRate: 104, symptoms: '' },
  ];

  it('auto-identifies lowest and highest and computes delta from baseline', () => {
    const stats = computeLeanStats(68, measurements);
    expect(stats).toEqual({ baseline: 68, lowest: 88, highest: 104, delta: 36 });
  });

  it('NL-03/NL-04: overrides replace auto values and recalculate delta', () => {
    const stats = computeLeanStats(68, measurements, { baseline: 72, highest: 100 });
    expect(stats.baseline).toBe(72);
    expect(stats.highest).toBe(100);
    expect(stats.delta).toBe(28);
  });

  it('delta null when baseline or measurements missing', () => {
    expect(computeLeanStats(null, measurements).delta).toBeNull();
    expect(computeLeanStats(68, []).delta).toBeNull();
  });

  it('POTS delta criteria at >=30', () => {
    expect(meetsPotsDeltaCriteria(30)).toBe(true);
    expect(meetsPotsDeltaCriteria(29)).toBe(false);
    expect(meetsPotsDeltaCriteria(null)).toBe(false);
  });
});
