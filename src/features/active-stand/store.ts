import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  emptyActiveStandValues,
  type ActiveStandReading,
  type ActiveStandValues,
} from '@/features/report/types';

interface ActiveStandState {
  patientName: string;
  testDate: string;
  values: ActiveStandValues;
  setPatientName: (name: string) => void;
  setTestDate: (date: string) => void;
  setBaseline: (patch: Partial<ActiveStandReading>) => void;
  setMinute: (index: number, patch: Partial<ActiveStandReading>) => void;
  reset: () => void;
}

export const useActiveStandStore = create<ActiveStandState>()(
  persist(
    (set) => ({
      patientName: '',
      testDate: new Date().toISOString().split('T')[0],
      values: emptyActiveStandValues(),
      setPatientName: (patientName) => set({ patientName }),
      setTestDate: (testDate) => set({ testDate }),
      setBaseline: (patch) =>
        set((s) => ({ values: { ...s.values, baseline: { ...s.values.baseline, ...patch } } })),
      setMinute: (index, patch) =>
        set((s) => ({
          values: {
            ...s.values,
            minutes: s.values.minutes.map((m, i) => (i === index ? { ...m, ...patch } : m)),
          },
        })),
      reset: () =>
        set({
          patientName: '',
          testDate: new Date().toISOString().split('T')[0],
          values: emptyActiveStandValues(),
        }),
    }),
    { name: 'aep-active-stand', version: 1 },
  ),
);
