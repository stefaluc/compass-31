import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Measurement, TestPhase } from './types';

interface NasaLeanState {
  patientName: string;
  testDate: string;
  phase: TestPhase;
  /** Elapsed seconds in the current phase. Persisted so a refresh mid-test resumes (paused). */
  timer: number;
  isRunning: boolean;
  isInitialHRRecording: boolean;
  bpSystolic: string;
  bpDiastolic: string;
  initialPR: string;
  lowestSupinePR: string;
  measurements: Measurement[];
  /** NL-03/NL-04 manual corrections; null = use recorded/auto value. */
  baselineOverride: number | null;
  lowestOverride: number | null;
  highestOverride: number | null;
  showTrendLine: boolean;

  set: (patch: Partial<NasaLeanState>) => void;
  addMeasurement: (m: Measurement) => void;
  updateMeasurement: (index: number, pulseRate: number | null, symptoms: string) => void;
  deleteMeasurement: (index: number) => void;
  reset: () => void;
}

const initialState = {
  patientName: '',
  testDate: new Date().toISOString().split('T')[0],
  phase: 'setup' as TestPhase,
  timer: 0,
  isRunning: false,
  isInitialHRRecording: false,
  bpSystolic: '',
  bpDiastolic: '',
  initialPR: '',
  lowestSupinePR: '',
  measurements: [] as Measurement[],
  baselineOverride: null,
  lowestOverride: null,
  highestOverride: null,
  showTrendLine: false,
};

export const useNasaLeanStore = create<NasaLeanState>()(
  persist(
    (set) => ({
      ...initialState,
      set: (patch) => set(patch),
      addMeasurement: (m) =>
        set((s) => ({
          measurements: [...s.measurements, m].sort((a, b) => a.totalSeconds - b.totalSeconds),
        })),
      updateMeasurement: (index, pulseRate, symptoms) =>
        set((s) => ({
          measurements: s.measurements.map((m, i) =>
            i === index ? { ...m, pulseRate, symptoms } : m,
          ),
        })),
      deleteMeasurement: (index) =>
        set((s) => ({ measurements: s.measurements.filter((_, i) => i !== index) })),
      reset: () =>
        set({ ...initialState, testDate: new Date().toISOString().split('T')[0] }),
    }),
    {
      name: 'aep-nasa-lean',
      version: 1,
      // A timer can't keep running while the tab is closed — resume paused.
      merge: (persisted, current) => ({
        ...current,
        ...(persisted as Partial<NasaLeanState>),
        isRunning: false,
      }),
    },
  ),
);
