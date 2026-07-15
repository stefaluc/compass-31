export interface BloodPressure {
  systolic: string;
  diastolic: string;
}

export interface Measurement {
  timeMinutes: number;
  timeSeconds: number;
  totalSeconds: number;
  /** Null when only symptoms were recorded at this time (NL-02). */
  pulseRate: number | null;
  symptoms: string;
  label: string;
  chartTime: number;
}

export function makeMeasurement(
  totalSeconds: number,
  pulseRate: number | null,
  symptoms: string,
): Measurement {
  const timeMinutes = Math.floor(totalSeconds / 60);
  const timeSeconds = totalSeconds % 60;
  return {
    timeMinutes,
    timeSeconds,
    totalSeconds,
    pulseRate,
    symptoms,
    label: `${timeMinutes}:${timeSeconds.toString().padStart(2, '0')}`,
    chartTime: totalSeconds / 60,
  };
}

export interface ChartDataPoint {
  time: number;
  heartRate: number;
  label: string;
  isPreTest: boolean;
  trendValue?: number;
}

export interface TestStats {
  baseline: number | null;
  lowest: number | null;
  highest: number | null;
  delta: number | null;
}

export type TestPhase = 'setup' | 'supine' | 'standing' | 'complete';

/* ------------------------------- PDF export ------------------------------- */

export interface PDFReportData {
  patientName: string;
  testDate: string;
  initialBP: BloodPressure;
  initialPR: string;
  lowestSupinePR: string;
  measurements: Measurement[];
  stats: TestStats;
  chartImage?: string;
  includeClinicalInterpretation: boolean;
  testResult: 'POSITIVE' | 'NEGATIVE';
  generatedAt: string;
  clinicName?: string;
}

export interface PDFGenerationOptions {
  includeChart: boolean;
  includeAllMeasurements: boolean;
  includeSymptoms: boolean;
}

export interface ChartCaptureOptions {
  backgroundColor: string;
  scale: number;
  quality: number;
  format: 'png' | 'jpeg';
}
