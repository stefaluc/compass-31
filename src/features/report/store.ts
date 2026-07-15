import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  createEmptyReport,
  type ReportDocument,
  type ReportType,
} from './types';

/**
 * The report being assembled. Persisted to localStorage so an accidental
 * refresh or tab close never loses a half-entered evaluation (§10 browser
 * behavior). This is crash-safety for the current document only — not a
 * patient database (Phase 5 is intentionally out of scope).
 */

export type ReportStage = 'start' | 'form' | 'preview';

interface ReportState {
  report: ReportDocument | null;
  stage: ReportStage;
  startReport: (type: ReportType) => void;
  /** Immutable partial update at the top level of the document. */
  updateReport: (patch: Partial<ReportDocument>) => void;
  /** Update a single section via updater function (keeps call sites terse). */
  updateSection: <K extends keyof ReportDocument>(
    key: K,
    updater: (current: ReportDocument[K]) => ReportDocument[K],
  ) => void;
  setStage: (stage: ReportStage) => void;
  clearReport: () => void;
}

const todayISO = () => new Date().toISOString().split('T')[0];

export const useReportStore = create<ReportState>()(
  persist(
    (set, get) => ({
      report: null,
      stage: 'start',
      startReport: (type) =>
        set({ report: createEmptyReport(type, todayISO()), stage: 'form' }),
      updateReport: (patch) => {
        const report = get().report;
        if (!report) return;
        set({ report: { ...report, ...patch } });
      },
      updateSection: (key, updater) => {
        const report = get().report;
        if (!report) return;
        set({ report: { ...report, [key]: updater(report[key]) } });
      },
      setStage: (stage) => set({ stage }),
      clearReport: () => set({ report: null, stage: 'start' }),
    }),
    {
      name: 'aep-report',
      version: 1,
    },
  ),
);
