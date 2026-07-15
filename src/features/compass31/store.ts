import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CompassAnswers } from './questions';

interface CompassState {
  answers: CompassAnswers;
  setAnswer: (questionId: number, value: number | null) => void;
  reset: () => void;
}

export const useCompassStore = create<CompassState>()(
  persist(
    (set) => ({
      answers: {},
      setAnswer: (questionId, value) =>
        set((state) => ({ answers: { ...state.answers, [questionId]: value } })),
      reset: () => set({ answers: {} }),
    }),
    { name: 'aep-compass', version: 1 },
  ),
);
