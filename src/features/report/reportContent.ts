/**
 * Pure presence/formatting logic shared by the on-screen preview and the PDF
 * template. Because both render from the same computed structure, the preview
 * always matches the generated PDF (PDF-01) and blank content is omitted in
 * both places by construction (PDF-03). Explicit statuses like "Not Tested"
 * or "Not Performed" count as documented content when relevant (PDF-04).
 */

import {
  activeTimePoints,
  TIME_POINT_LABELS,
  type ActiveStandValues,
  type BrockStringPosition,
  type OcularValues,
  type ReportDocument,
  type ThreePoint,
  type TimePointKey,
} from './types';
import {
  COMPASS31_DOMAINS,
  compass31RawTotal,
  compass31SeverityLabel,
  compass31WeightedTotal,
} from '@/lib/clinical/compass31';
import { ais8Label, gad7Label, phq9Label } from '@/lib/clinical/severity';
import {
  trailRatio,
} from '@/lib/clinical/cognitive';
import { mbessTotal, mbessTotalFlag } from '@/lib/clinical/balance';

export const has = (v: unknown): boolean => {
  if (v == null) return false;
  if (typeof v === 'string') return v.trim() !== '';
  if (Array.isArray(v)) return v.length > 0;
  return true;
};

/** Rows for a comparison table: label + one formatted value per time point. */
export interface CompareRow {
  label: string;
  values: (string | null)[];
  /** Per-column red-flag markers (clinic display rules). */
  flags?: boolean[];
}

export interface CompareTable {
  columns: string[]; // column headers (time point labels), 1 for initial reports
  timePoints: TimePointKey[];
  rows: CompareRow[];
}

function presentTimePoints<T>(
  report: ReportDocument,
  values: ThreePoint<T>,
  isPresent: (v: T) => boolean,
): TimePointKey[] {
  return activeTimePoints(report.reportType).filter((tp) => {
    const v = values[tp];
    return v != null && isPresent(v);
  });
}

function buildTable<T>(
  report: ReportDocument,
  values: ThreePoint<T>,
  isPresent: (v: T) => boolean,
  makeRows: (get: (tp: TimePointKey) => T | null) => CompareRow[],
): CompareTable | null {
  const tps = presentTimePoints(report, values, isPresent);
  if (tps.length === 0) return null;
  const rows = makeRows((tp) => values[tp] ?? null).filter((r) =>
    r.values.some((v) => v != null),
  );
  if (rows.length === 0) return null;
  return {
    columns: tps.map((tp) =>
      report.reportType === 'initial' ? 'Result' : TIME_POINT_LABELS[tp],
    ),
    timePoints: tps,
    rows,
  };
}

const fmt = (v: number | null | undefined, max?: number): string | null =>
  v == null ? null : max != null ? `${v} / ${max}` : `${v}`;

const fmtText = (v: string | null | undefined): string | null =>
  v && v.trim() !== '' ? v : null;

/* ------------------------------ Section models ----------------------------- */

export function buildGradedSymptoms(report: ReportDocument): CompareTable | null {
  return buildTable(
    report,
    report.gradedSymptoms.values,
    (v) => v.symptomScore != null || v.compositeScore != null || has(v.highestBurdens),
    (get) => {
      const tps = presentTimePoints(
        report,
        report.gradedSymptoms.values,
        (v) => v.symptomScore != null || v.compositeScore != null || has(v.highestBurdens),
      );
      return [
        { label: 'Symptom Score', values: tps.map((tp) => fmt(get(tp)?.symptomScore, 23)) },
        { label: 'Composite Score', values: tps.map((tp) => fmt(get(tp)?.compositeScore, 138)) },
        {
          label: 'Highest Symptom Burden(s)',
          values: tps.map((tp) => fmtText(get(tp)?.highestBurdens)),
        },
      ];
    },
  );
}

export interface CompassSummary {
  table: CompareTable;
  totals: {
    timePoint: TimePointKey;
    raw: number;
    weighted: number;
    severity: string | null;
  }[];
}

export function buildCompass(report: ReportDocument): CompassSummary | null {
  const isPresent = (v: Record<string, number | null | undefined>) =>
    COMPASS31_DOMAINS.some((d) => v[d.key] != null);
  const tps = presentTimePoints(report, report.compass.values, isPresent);
  if (tps.length === 0) return null;

  const table = buildTable(report, report.compass.values, isPresent, (get) =>
    COMPASS31_DOMAINS.map((d) => ({
      label: d.domain,
      values: tps.map((tp) => fmt(get(tp)?.[d.key] ?? null, d.maxScore)),
    })),
  );
  if (!table) return null;

  const totals = tps.map((tp) => {
    const v = report.compass.values[tp]!;
    const raw = compass31RawTotal(v);
    return {
      timePoint: tp,
      raw,
      weighted: compass31WeightedTotal(v),
      severity: compass31SeverityLabel(raw),
    };
  });

  return { table, totals };
}

export function buildMentalHealth(report: ReportDocument): CompareTable | null {
  return buildTable(
    report,
    report.mentalHealth.values,
    (v) => v.phq9 != null || v.gad7 != null || v.ais8 != null,
    (get) => {
      const tps = presentTimePoints(
        report,
        report.mentalHealth.values,
        (v) => v.phq9 != null || v.gad7 != null || v.ais8 != null,
      );
      const row = (
        label: string,
        key: 'phq9' | 'gad7' | 'ais8',
        max: number,
        labelFn: (n: number) => string | null,
      ): CompareRow => ({
        label,
        values: tps.map((tp) => {
          const v = get(tp)?.[key];
          if (v == null) return null;
          const band = labelFn(v);
          return band ? `${v} / ${max} — ${band}` : `${v} / ${max}`;
        }),
      });
      return [
        row('PHQ-9', 'phq9', 27, phq9Label),
        row('GAD-7', 'gad7', 21, gad7Label),
        row('Athens Insomnia Scale', 'ais8', 24, ais8Label),
      ];
    },
  );
}

export function buildNasaLean(report: ReportDocument): CompareTable | null {
  return buildTable(
    report,
    report.nasaLean.values,
    (v) => Object.values(v).some((x) => x != null && x !== ''),
    (get) => {
      const tps = presentTimePoints(report, report.nasaLean.values, (v) =>
        Object.values(v).some((x) => x != null && x !== ''),
      );
      const delta = (tp: TimePointKey): string | null => {
        const v = get(tp);
        if (!v) return null;
        if (v.deltaOverride != null) return `${v.deltaOverride} bpm`;
        if (v.highestHR != null && v.baselineHR != null)
          return `${v.highestHR - v.baselineHR} bpm`;
        return null;
      };
      return [
        {
          label: 'Blood Pressure',
          values: tps.map((tp) => {
            const v = get(tp);
            return v?.bpSystolic != null && v?.bpDiastolic != null
              ? `${v.bpSystolic} / ${v.bpDiastolic} mmHg`
              : null;
          }),
        },
        {
          label: 'Resting/Baseline HR',
          values: tps.map((tp) => (get(tp)?.baselineHR != null ? `${get(tp)!.baselineHR} bpm` : null)),
        },
        {
          label: 'Lowest HR',
          values: tps.map((tp) => (get(tp)?.lowestHR != null ? `${get(tp)!.lowestHR} bpm` : null)),
        },
        {
          label: 'Highest HR',
          values: tps.map((tp) => (get(tp)?.highestHR != null ? `${get(tp)!.highestHR} bpm` : null)),
        },
        { label: 'Maximum HR Delta', values: tps.map(delta) },
        {
          label: 'Overall HR Trend',
          values: tps.map((tp) => {
            const v = get(tp);
            if (!v) return null;
            return fmtText(v.hrTrend === 'Other' ? v.hrTrendOther : v.hrTrend);
          }),
        },
      ];
    },
  );
}

export function buildCognitive(report: ReportDocument): CompareTable | null {
  return buildTable(
    report,
    report.cognitive.values,
    (v) => Object.values(v).some((x) => x != null),
    (get) => {
      const tps = presentTimePoints(report, report.cognitive.values, (v) =>
        Object.values(v).some((x) => x != null),
      );
      return [
        {
          label: 'Immediate Recall',
          values: tps.map((tp) => fmt(get(tp)?.immediateRecall, 30)),
        },
        {
          label: 'Delayed Recall',
          values: tps.map((tp) => fmt(get(tp)?.delayedRecall, 10)),
        },
        {
          label: 'Digits Backward',
          values: tps.map((tp) => fmt(get(tp)?.digitsBackward, 4)),
        },
        {
          label: 'Trail Making A',
          values: tps.map((tp) =>
            get(tp)?.trailASeconds != null ? `${get(tp)!.trailASeconds} s` : null,
          ),
        },
        {
          label: 'Trail Making B',
          values: tps.map((tp) =>
            get(tp)?.trailBSeconds != null ? `${get(tp)!.trailBSeconds} s` : null,
          ),
        },
        {
          label: 'Trail B/A Ratio',
          values: tps.map((tp) => {
            const v = get(tp);
            const r = trailRatio(v?.trailASeconds ?? null, v?.trailBSeconds ?? null);
            return r != null ? `${r}` : null;
          }),
        },
      ];
    },
  );
}

export function buildBalance(report: ReportDocument): CompareTable | null {
  return buildTable(
    report,
    report.balance.values,
    (v) => Object.values(v).some((x) => x != null && x !== ''),
    (get) => {
      const tps = presentTimePoints(report, report.balance.values, (v) =>
        Object.values(v).some((x) => x != null && x !== ''),
      );
      return [
        {
          label: 'mBESS Double-Leg Stance',
          values: tps.map((tp) => fmt(get(tp)?.mbessDoubleLeg, 10)),
        },
        {
          label: 'mBESS Single-Leg Stance',
          values: tps.map((tp) => fmt(get(tp)?.mbessSingleLeg, 10)),
        },
        {
          label: 'mBESS Tandem Stance',
          values: tps.map((tp) => fmt(get(tp)?.mbessTandem, 10)),
        },
        {
          label: 'mBESS Total',
          values: tps.map((tp) => {
            const v = get(tp);
            const total = mbessTotal(
              v?.mbessDoubleLeg ?? null,
              v?.mbessSingleLeg ?? null,
              v?.mbessTandem ?? null,
            );
            return total != null ? `${total} / 30` : null;
          }),
          flags: tps.map((tp) => {
            const v = get(tp);
            return mbessTotalFlag(
              mbessTotal(
                v?.mbessDoubleLeg ?? null,
                v?.mbessSingleLeg ?? null,
                v?.mbessTandem ?? null,
              ),
            );
          }),
        },
        {
          label: 'Fukuda Rotation',
          values: tps.map((tp) => {
            const v = get(tp);
            if (!v) return null;
            const parts = [fmtText(v.fukudaRotationDirection), fmtText(v.fukudaDegrees ? `${v.fukudaDegrees}°` : '')].filter(
              Boolean,
            );
            return parts.length ? parts.join(', ') : null;
          }),
        },
        {
          label: 'Fukuda Displacement',
          values: tps.map((tp) => {
            const v = get(tp);
            if (!v) return null;
            const parts = [
              fmtText(v.fukudaDisplacementDirection),
              fmtText(v.fukudaDisplacementDistance),
            ].filter(Boolean);
            return parts.length ? parts.join(', ') : null;
          }),
        },
        {
          label: 'Symptoms / Observations',
          values: tps.map((tp) => fmtText(get(tp)?.symptoms)),
        },
      ];
    },
  );
}

/* --------------------------------- Ocular ---------------------------------- */

function brockSummary(pos: BrockStringPosition | undefined): string | null {
  if (!pos) return null;
  const vis =
    pos.visualization === 'Other / Custom'
      ? fmtText(pos.customVisualization)
      : fmtText(pos.visualization);
  const parts = [
    vis,
    fmtText(pos.beadDistance ? `bead: ${pos.beadDistance}` : ''),
    fmtText(pos.symptoms ? `symptoms: ${pos.symptoms}` : ''),
    fmtText(pos.findings),
  ].filter(Boolean);
  return parts.length ? parts.join('; ') : null;
}

export function ocularHasContent(v: OcularValues | null | undefined): boolean {
  if (!v) return false;
  return Object.entries(v).some(([, x]) => {
    if (typeof x === 'string') return x.trim() !== '';
    if (Array.isArray(x)) return x.length > 0;
    if (x && typeof x === 'object')
      return Object.values(x as Record<string, unknown>).some(
        (y) => typeof y === 'string' && y.trim() !== '',
      );
    return x != null;
  });
}

export function buildOcular(report: ReportDocument): CompareTable | null {
  return buildTable(
    report,
    report.ocular.values,
    (v) => ocularHasContent(v),
    (get) => {
      const tps = presentTimePoints(report, report.ocular.values, (v) => ocularHasContent(v));
      const g = (tp: TimePointKey) => get(tp);
      return [
        {
          label: 'Near Point of Convergence',
          values: tps.map((tp) => (fmtText(g(tp)?.npcCm) ? `${g(tp)!.npcCm} cm` : null)),
        },
        { label: 'Eye Lag', values: tps.map((tp) => fmtText(g(tp)?.eyeLag)) },
        {
          label: 'Nystagmus',
          values: tps.map((tp) => {
            const v = g(tp);
            if (!v || v.nystagmus == null) return null;
            if (v.nystagmus === 'no') return 'No';
            const parts = [
              'Yes',
              fmtText(v.nystagmusEyes),
              v.nystagmusGazePositions.length ? v.nystagmusGazePositions.join(', ') : null,
              fmtText(v.nystagmusDetails),
            ].filter(Boolean);
            return parts.join(' — ');
          }),
        },
        {
          label: 'Neck Torsion Test',
          values: tps.map((tp) => {
            const v = g(tp);
            if (!v || !fmtText(v.neckTorsionResult)) return null;
            if (v.neckTorsionResult !== 'Positive') return v.neckTorsionResult;
            const head =
              v.neckTorsionHeadPosition === 'Other'
                ? v.neckTorsionHeadPositionOther
                : v.neckTorsionHeadPosition;
            const parts = [
              'Positive',
              fmtText(head),
              fmtText(v.neckTorsionFinding),
              fmtText(v.neckTorsionDetails),
            ].filter(Boolean);
            return parts.join(' — ');
          }),
        },
        {
          label: 'Horizontal Saccades',
          values: tps.map((tp) => fmtText(g(tp)?.saccadesHorizontal)),
        },
        {
          label: 'Vertical Saccades',
          values: tps.map((tp) => fmtText(g(tp)?.saccadesVertical)),
        },
        {
          label: 'Saccades — Symptoms/Findings',
          values: tps.map((tp) => {
            const v = g(tp);
            const parts = [fmtText(v?.saccadesSymptoms), fmtText(v?.saccadesFindings)].filter(
              Boolean,
            );
            return parts.length ? parts.join('; ') : null;
          }),
        },
        {
          label: 'Smooth Pursuit',
          values: tps.map((tp) => {
            const v = g(tp);
            if (!v) return null;
            const parts = [
              fmtText(v.smoothPursuitResult),
              fmtText(v.smoothPursuitSymptoms),
              fmtText(v.smoothPursuitFindings),
            ].filter(Boolean);
            return parts.length ? parts.join('; ') : null;
          }),
        },
        {
          label: 'Brock String — Neutral',
          values: tps.map((tp) => brockSummary(g(tp)?.brockNeutral)),
        },
        {
          label: 'Brock String — 15° Right',
          values: tps.map((tp) => brockSummary(g(tp)?.brockRight15)),
        },
        {
          label: 'Brock String — 15° Left',
          values: tps.map((tp) => brockSummary(g(tp)?.brockLeft15)),
        },
      ];
    },
  );
}

/* ------------------------------- Active Stand ------------------------------- */

export function activeStandHasData(v: ActiveStandValues | null | undefined): boolean {
  if (!v) return false;
  const readingHas = (r: { systolic: number | null; diastolic: number | null; heartRate: number | null; symptoms: string }) =>
    r.systolic != null || r.diastolic != null || r.heartRate != null || has(r.symptoms);
  return readingHas(v.baseline) || v.minutes.some(readingHas);
}

/** AS-05/RE-02: current table always; prior tables only when opted in. */
export function activeStandTables(
  report: ReportDocument,
): { timePoint: TimePointKey; values: ActiveStandValues }[] {
  const section = report.activeStand;
  if (section.performed !== 'performed') return [];
  const out: { timePoint: TimePointKey; values: ActiveStandValues }[] = [];
  if (report.reportType === 're-evaluation') {
    if (section.includePrior.initial && activeStandHasData(section.values.initial))
      out.push({ timePoint: 'initial', values: section.values.initial! });
    if (section.includePrior.last && activeStandHasData(section.values.last))
      out.push({ timePoint: 'last', values: section.values.last! });
  }
  if (activeStandHasData(section.values.current))
    out.push({ timePoint: 'current', values: section.values.current! });
  return out;
}

/* ------------------------------ Patient header ------------------------------ */

export interface HeaderItem {
  label: string;
  value: string;
}

export function buildPatientHeader(report: ReportDocument): HeaderItem[] {
  const p = report.patient;
  const items: HeaderItem[] = [];
  if (has(p.patientName)) items.push({ label: 'Patient', value: p.patientName });
  if (has(p.evaluationDate)) items.push({ label: 'Evaluation Date', value: p.evaluationDate });
  if (has(p.age)) items.push({ label: 'Age', value: p.age });
  if (has(p.mrn)) items.push({ label: 'MRN / ID', value: p.mrn });
  if (has(p.providerName)) items.push({ label: 'Provider', value: p.providerName });
  if (p.bpSystolic != null && p.bpDiastolic != null)
    items.push({ label: 'Blood Pressure', value: `${p.bpSystolic} / ${p.bpDiastolic} mmHg` });
  if (p.heartRate != null) items.push({ label: 'Heart Rate', value: `${p.heartRate} bpm` });
  if (p.spo2 != null) items.push({ label: 'SpO2', value: `${p.spo2}%` });
  if (p.etiologies.length) items.push({ label: 'Etiology', value: p.etiologies.join(', ') });
  if (has(p.symptomOnset)) items.push({ label: 'Symptom Onset', value: p.symptomOnset });
  if (report.reportType === 're-evaluation' && has(p.timeInRehab))
    items.push({ label: 'Time in Rehabilitation', value: p.timeInRehab });
  return items;
}

/* ----------------------------- Recommendations ------------------------------ */

export function buildRecommendations(report: ReportDocument): HeaderItem[] {
  const r = report.recommendations;
  const items: HeaderItem[] = [];
  const freq = r.treatmentFrequency === 'Other' ? r.treatmentFrequencyOther : r.treatmentFrequency;
  if (has(freq)) items.push({ label: 'Recommended treatment frequency', value: freq });
  if (r.referrals.length) {
    const referrals = r.referrals
      .map((x) => (x === 'Other' ? r.referralOther : x))
      .filter((x) => has(x));
    if (referrals.length)
      items.push({ label: 'Referrals / additional evaluations', value: referrals.join(', ') });
  }
  if (has(r.rehabRequirement)) {
    let value = r.rehabRequirement;
    if (r.rehabRequirement === 'Additional evaluation required' && has(r.requiredEvaluation))
      value += ` — ${r.requiredEvaluation}`;
    items.push({ label: 'Requirement before rehabilitation', value });
  }
  return items;
}

/* ------------------------------ Cranial nerves ------------------------------ */

export function cranialNerveVisible(report: ReportDocument): boolean {
  const c = report.cranialNerves;
  if (!has(c.result)) return false;
  if (c.result === 'Normal' && !c.includeNormalInPdf) return false;
  return true;
}
