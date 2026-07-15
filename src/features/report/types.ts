/**
 * The report document model. The form, the on-screen preview, and the PDF
 * are all renderers of this one structure, which guarantees preview and PDF
 * stay in sync (PDF-01) and makes "omit blank content" (PDF-03) a pure
 * function over the data.
 *
 * Re-evaluation comparisons use three time points (RE-01): Initial, Last
 * Re-evaluation, Current. Initial reports only populate `current`.
 */

import type { Compass31DomainKey } from '@/lib/clinical/compass31';

export type ReportType = 'initial' | 're-evaluation';

export interface ThreePoint<T> {
  initial?: T | null;
  last?: T | null;
  current?: T | null;
}

export const TIME_POINTS = ['initial', 'last', 'current'] as const;
export type TimePointKey = (typeof TIME_POINTS)[number];

export const TIME_POINT_LABELS: Record<TimePointKey, string> = {
  initial: 'Initial Evaluation',
  last: 'Last Re-evaluation',
  current: 'Current Re-evaluation',
};

/* ------------------------------ §7.2 Patient ------------------------------ */

export const ETIOLOGY_OPTIONS = [
  'Neuropathic',
  'Post-viral',
  'Autoimmune',
  'Hypermobile/EDS',
  'Cardiogenic',
  'Hyperadrenergic',
  'Hypovolemic',
  'Unknown',
] as const;

export interface PatientInfo {
  patientName: string;
  evaluationDate: string; // YYYY-MM-DD, auto-filled, editable
  age: string;
  mrn: string;
  providerName: string;
  bpSystolic: number | null;
  bpDiastolic: number | null;
  heartRate: number | null;
  spo2: number | null;
  etiologies: string[];
  symptomOnset: string; // open text: exact date or "Spring 2024"
  timeInRehab: string; // re-evaluation only
}

/* ------------------------- §7.3 Graded Symptom Survey ---------------------- */

export interface GradedSymptomValues {
  symptomScore: number | null; // /23
  compositeScore: number | null; // /138
  highestBurdens: string;
}

/* ------------------------------ §7.4 COMPASS-31 ---------------------------- */

export type CompassDomainValues = Partial<Record<Compass31DomainKey, number | null>>;

/* --------------------- §7.5 Mental Health and Sleep ------------------------ */

export interface MentalHealthValues {
  phq9: number | null; // /27
  gad7: number | null; // /21
  ais8: number | null; // /24
}

/* --------------------------- §7.6 NASA Lean Test --------------------------- */

export interface LeanSymptomEntry {
  /** "m:ss" time or phase label */
  time: string;
  text: string;
}

export interface NasaLeanValues {
  bpSystolic: number | null;
  bpDiastolic: number | null;
  baselineHR: number | null;
  lowestHR: number | null;
  highestHR: number | null;
  /** Manual override for highest-minus-baseline; null = automatic. */
  deltaOverride: number | null;
  hrTrend: string;
  hrTrendOther: string;
}

export interface LeanChartPoint {
  time: number;
  heartRate: number;
  label: string;
  isPreTest: boolean;
}

export interface NasaLeanSection {
  values: ThreePoint<Partial<NasaLeanValues>>;
  medicationAffectingHR: 'yes' | 'no' | null; // NR-03
  medications: string;
  symptomEntries: LeanSymptomEntry[]; // NR-04 timestamped, transferred or manual
  manualNotes: string;
  /**
   * NR-02: snapshot of the current test's graph data, captured at transfer
   * time so the report stays stable even if the tool is reset afterwards.
   */
  chartData: LeanChartPoint[] | null;
  interpretation: string;
}

/* ------------------------- §7.7 Active Stand Test -------------------------- */

export interface ActiveStandReading {
  systolic: number | null;
  diastolic: number | null;
  heartRate: number | null;
  symptoms: string;
}

export interface ActiveStandValues {
  /** Supine baseline measured at minute 5. */
  baseline: ActiveStandReading;
  /** Standing minutes 1-5, index 0 = minute 1. */
  minutes: ActiveStandReading[];
}

export interface ActiveStandSection {
  performed: 'performed' | 'not-performed' | null;
  values: ThreePoint<ActiveStandValues>;
  /** RE-02/AS-05: prior tables are opt-in on re-evaluations. */
  includePrior: { initial: boolean; last: boolean };
  interpretation: string;
}

/* --------------------------- §7.8 Cognitive Testing ------------------------ */

export interface CognitiveValues {
  immediateRecall: number | null; // /30
  delayedRecall: number | null; // /10
  digitsBackward: number | null; // /4
  trailASeconds: number | null;
  trailBSeconds: number | null;
}

/* ----------------------- §7.9 Balance and Coordination --------------------- */

export const FUKUDA_ROTATION_OPTIONS = ['Left', 'Right', 'None'] as const;
export const FUKUDA_DISPLACEMENT_OPTIONS = ['Forward', 'Backward', 'Left', 'Right', 'None'] as const;

export interface BalanceValues {
  mbessDoubleLeg: number | null; // /10
  mbessSingleLeg: number | null; // /10
  mbessTandem: number | null; // /10
  fukudaRotationDirection: string;
  fukudaDegrees: string;
  fukudaDisplacementDirection: string;
  fukudaDisplacementDistance: string;
  symptoms: string;
}

/* ---------------------------- §7.10 Ocular Testing ------------------------- */

export const EYE_LAG_OPTIONS = ['None', 'Left', 'Right', 'Bilateral'] as const;
export const NYSTAGMUS_EYE_OPTIONS = ['Right', 'Left', 'Bilateral'] as const;
export const GAZE_POSITION_OPTIONS = [
  'Primary/center',
  'Right horizontal',
  'Left horizontal',
  'Upward',
  'Downward',
  'Right upper',
  'Left upper',
  'Right lower',
  'Left lower',
] as const;
export const NORMALITY_OPTIONS = ['Normal', 'Abnormal', 'Not Tested'] as const;
export const NECK_TORSION_RESULT_OPTIONS = ['Positive', 'Negative', 'Not Tested'] as const;
export const BROCK_VISUALIZATION_OPTIONS = [
  'Complete X centered at bead',
  'X crossing in front',
  'X crossing behind',
  'One straight string',
  'Partial X or missing portion',
  'V pattern',
  'Y pattern',
  'Two beads and two strings',
  'Other / Custom',
] as const;

export interface BrockStringPosition {
  visualization: string;
  customVisualization: string;
  beadDistance: string;
  symptoms: string;
  findings: string;
}

export interface OcularValues {
  npcCm: string; // one final measurement in cm
  eyeLag: string;
  nystagmus: 'yes' | 'no' | null;
  nystagmusEyes: string;
  nystagmusGazePositions: string[];
  nystagmusDetails: string;
  neckTorsionResult: string;
  neckTorsionHeadPosition: string;
  neckTorsionHeadPositionOther: string;
  neckTorsionFinding: string;
  neckTorsionDetails: string;
  saccadesHorizontal: string;
  saccadesVertical: string;
  saccadesSymptoms: string;
  saccadesFindings: string;
  smoothPursuitResult: string;
  smoothPursuitSymptoms: string;
  smoothPursuitFindings: string;
  brockNeutral: BrockStringPosition;
  brockRight15: BrockStringPosition;
  brockLeft15: BrockStringPosition;
}

/* --------------------------- §7.12 Cranial Nerves -------------------------- */

export interface CranialNerveSection {
  result: string; // Normal | Abnormal | Not Tested
  nervesInvolved: string;
  findings: string;
  interpretation: string;
  /** Normal results stay off the PDF unless the provider opts in (§7.12). */
  includeNormalInPdf: boolean;
}

/* ---------------------------- §7.13 Special Tests --------------------------- */

export interface SpecialTest {
  id: string;
  name: string;
  findings: string;
  interpretation: string;
}

/* ------------------------- §7.14 Recommendations ---------------------------- */

export const TREATMENT_FREQUENCY_OPTIONS = [
  '1x/week',
  '2x/week',
  '3x/week',
  'Every other week',
  'Monthly',
  'As needed',
  'Other',
] as const;

export const REFERRAL_OPTIONS = [
  'Primary care',
  'Cardiology',
  'Neurology',
  'Neuro-optometry',
  'Vestibular therapy',
  'Physical therapy',
  'Psychology or counseling',
  'Sleep medicine',
  'Other',
] as const;

export const REHAB_REQUIREMENT_OPTIONS = [
  'Additional evaluation required',
  'Additional evaluation not required',
  'Not applicable',
] as const;

export interface Recommendations {
  treatmentFrequency: string;
  treatmentFrequencyOther: string;
  referrals: string[];
  referralOther: string;
  rehabRequirement: string;
  requiredEvaluation: string; // shown when "required"
}

/* ------------------------------- The document ------------------------------ */

export interface SectionWithInterpretation<T> {
  values: ThreePoint<T>;
  interpretation: string; // RG-04/RG-05: one field per section (combined on re-eval)
}

export interface ReportDocument {
  reportType: ReportType;
  patient: PatientInfo;
  gradedSymptoms: SectionWithInterpretation<Partial<GradedSymptomValues>>;
  compass: SectionWithInterpretation<CompassDomainValues>;
  mentalHealth: SectionWithInterpretation<Partial<MentalHealthValues>>;
  nasaLean: NasaLeanSection;
  activeStand: ActiveStandSection;
  cognitive: SectionWithInterpretation<Partial<CognitiveValues>>;
  balance: SectionWithInterpretation<Partial<BalanceValues>>;
  ocular: SectionWithInterpretation<OcularValues>;
  beighton: { score: number | null; interpretation: string }; // initial only
  cranialNerves: CranialNerveSection;
  specialTests: SpecialTest[];
  generalNotes: string;
  recommendations: Recommendations;
}

/* ------------------------------ Empty factories ---------------------------- */

export const emptyActiveStandReading = (): ActiveStandReading => ({
  systolic: null,
  diastolic: null,
  heartRate: null,
  symptoms: '',
});

export const emptyActiveStandValues = (): ActiveStandValues => ({
  baseline: emptyActiveStandReading(),
  minutes: Array.from({ length: 5 }, emptyActiveStandReading),
});

export const emptyBrockPosition = (): BrockStringPosition => ({
  visualization: '',
  customVisualization: '',
  beadDistance: '',
  symptoms: '',
  findings: '',
});

export const emptyOcularValues = (): OcularValues => ({
  npcCm: '',
  eyeLag: '',
  nystagmus: null,
  nystagmusEyes: '',
  nystagmusGazePositions: [],
  nystagmusDetails: '',
  neckTorsionResult: '',
  neckTorsionHeadPosition: '',
  neckTorsionHeadPositionOther: '',
  neckTorsionFinding: '',
  neckTorsionDetails: '',
  saccadesHorizontal: '',
  saccadesVertical: '',
  saccadesSymptoms: '',
  saccadesFindings: '',
  smoothPursuitResult: '',
  smoothPursuitSymptoms: '',
  smoothPursuitFindings: '',
  brockNeutral: emptyBrockPosition(),
  brockRight15: emptyBrockPosition(),
  brockLeft15: emptyBrockPosition(),
});

export function createEmptyReport(reportType: ReportType, today: string): ReportDocument {
  return {
    reportType,
    patient: {
      patientName: '',
      evaluationDate: today,
      age: '',
      mrn: '',
      providerName: '',
      bpSystolic: null,
      bpDiastolic: null,
      heartRate: null,
      spo2: null,
      etiologies: [],
      symptomOnset: '',
      timeInRehab: '',
    },
    gradedSymptoms: { values: {}, interpretation: '' },
    compass: { values: {}, interpretation: '' },
    mentalHealth: { values: {}, interpretation: '' },
    nasaLean: {
      values: {},
      medicationAffectingHR: null,
      medications: '',
      symptomEntries: [],
      manualNotes: '',
      chartData: null,
      interpretation: '',
    },
    activeStand: {
      performed: null,
      values: {},
      includePrior: { initial: false, last: false },
      interpretation: '',
    },
    cognitive: { values: {}, interpretation: '' },
    balance: { values: {}, interpretation: '' },
    ocular: { values: {}, interpretation: '' },
    beighton: { score: null, interpretation: '' },
    cranialNerves: {
      result: '',
      nervesInvolved: '',
      findings: '',
      interpretation: '',
      includeNormalInPdf: false,
    },
    specialTests: [],
    generalNotes: '',
    recommendations: {
      treatmentFrequency: '',
      treatmentFrequencyOther: '',
      referrals: [],
      referralOther: '',
      rehabRequirement: '',
      requiredEvaluation: '',
    },
  };
}

/** Time points that apply to a report type (initial reports only use `current`). */
export function activeTimePoints(reportType: ReportType): TimePointKey[] {
  return reportType === 'initial' ? ['current'] : ['initial', 'last', 'current'];
}
