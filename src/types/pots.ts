export interface BloodPressure {
  systolic: string;
  diastolic: string;
}

export interface Measurement {
  timeMinutes: number;
  timeSeconds: number;
  totalSeconds: number;
  pulseRate: number;
  symptoms: string;
  label: string;
  chartTime: number;
}

export interface ChartDataPoint {
  time: number;
  heartRate: number;
  label: string;
  isPreTest: boolean;
}

export interface TrendDataPoint {
  time: number;
  trendValue: number;
}

export interface TestStats {
  lowest: number;
  highest: number;
  delta: number;
}

export type TestPhase = 'setup' | 'supine' | 'standing' | 'complete';