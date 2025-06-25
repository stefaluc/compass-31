import { Measurement, TestStats, BloodPressure } from './pots';

export interface PDFReportData {
  // Patient Information
  patientName: string;
  testDate: string;
  
  // Baseline Measurements
  initialBP: BloodPressure;
  initialPR: string;
  lowestSupinePR: string;
  
  // Test Results
  measurements: Measurement[];
  stats: TestStats;
  
  // Chart Data
  chartImage?: string;
  
  // Clinical Information
  clinicalInterpretation: string;
  testResult: 'POSITIVE' | 'NEGATIVE';
  
  // Meta Information
  generatedAt: string;
  clinicName?: string;
  clinicAddress?: string;
  clinicPhone?: string;
}

export interface PDFGenerationOptions {
  includeChart: boolean;
  includeAllMeasurements: boolean;
  includeSymptoms: boolean;
  format: 'A4' | 'Letter';
  orientation: 'portrait' | 'landscape';
}

export interface ChartCaptureOptions {
  backgroundColor: string;
  scale: number;
  quality: number;
  format: 'png' | 'jpeg';
}