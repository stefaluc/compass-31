import { useReportStore } from '../../store';
import {
  activeTimePoints,
  FUKUDA_DISPLACEMENT_OPTIONS,
  FUKUDA_ROTATION_OPTIONS,
  TIME_POINT_LABELS,
  type BalanceValues,
  type ReportDocument,
  type ThreePoint,
  type TimePointKey,
} from '../../types';
import { SectionShell } from '../SectionShell';
import {
  NumField,
  SelectField,
  TextField,
  ThreePointNumberGrid,
  type MetricDef,
} from '../fields';
import { trailRatio } from '@/lib/clinical/cognitive';
import { MBESS_TOTAL_MAX, mbessTotal, mbessTotalFlag } from '@/lib/clinical/balance';
import { cn } from '@/lib/utils';

function setThreePointValue<V extends object>(
  values: ThreePoint<V>,
  tp: TimePointKey,
  key: string,
  value: unknown,
): ThreePoint<V> {
  return { ...values, [tp]: { ...(values[tp] ?? {}), [key]: value } as V };
}

/* --------------------------- §7.8 Cognitive Testing ------------------------- */

const COGNITIVE_METRICS: MetricDef[] = [
  { key: 'immediateRecall', label: 'Immediate Recall', max: 30 },
  { key: 'delayedRecall', label: 'Delayed Recall', max: 10 },
  { key: 'digitsBackward', label: 'Digits Backward', max: 4 },
  { key: 'trailASeconds', label: 'Trail Making A (s)' },
  { key: 'trailBSeconds', label: 'Trail Making B (s)' },
];

export function CognitiveSection({ report }: { report: ReportDocument }) {
  const updateSection = useReportStore((s) => s.updateSection);
  const timePoints = activeTimePoints(report.reportType);
  const section = report.cognitive;

  const hasContent =
    timePoints.some((tp) => {
      const v = section.values[tp];
      return v && Object.values(v).some((x) => x != null);
    }) || !!section.interpretation;

  return (
    <SectionShell
      title="Cognitive Testing"
      subtitle="Orientation intentionally omitted"
      hasContent={hasContent}
      interpretation={section.interpretation}
      onInterpretationChange={(v) =>
        updateSection('cognitive', (cur) => ({ ...cur, interpretation: v }))
      }
    >
      <ThreePointNumberGrid
        metrics={COGNITIVE_METRICS}
        values={section.values}
        timePoints={timePoints}
        onChange={(tp, key, value) =>
          updateSection('cognitive', (cur) => ({
            ...cur,
            values: setThreePointValue(cur.values, tp, key, value),
          }))
        }
      />
      <div className="grid gap-2 sm:grid-cols-3">
        {timePoints.map((tp) => {
          const v = section.values[tp];
          const ratio = trailRatio(v?.trailASeconds ?? null, v?.trailBSeconds ?? null);
          if (ratio == null) return null;
          return (
            <div key={tp} className="rounded-lg bg-muted p-3 text-sm">
              {timePoints.length > 1 && (
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {TIME_POINT_LABELS[tp]}
                </p>
              )}
              <p className="font-bold tabular-nums">Trail B/A Ratio: {ratio}</p>
            </div>
          );
        })}
      </div>
    </SectionShell>
  );
}

/* ----------------------- §7.9 Balance and Coordination ---------------------- */

const MBESS_METRICS: MetricDef[] = [
  { key: 'mbessDoubleLeg', label: 'mBESS Double-Leg Stance', max: 10 },
  { key: 'mbessSingleLeg', label: 'mBESS Single-Leg Stance', max: 10 },
  { key: 'mbessTandem', label: 'mBESS Tandem Stance', max: 10 },
];

export function BalanceSection({ report }: { report: ReportDocument }) {
  const updateSection = useReportStore((s) => s.updateSection);
  const timePoints = activeTimePoints(report.reportType);
  const section = report.balance;

  const hasContent =
    timePoints.some((tp) => {
      const v = section.values[tp];
      return v && Object.values(v).some((x) => x != null && x !== '');
    }) || !!section.interpretation;

  const setField = (tp: TimePointKey, key: string, value: unknown) =>
    updateSection('balance', (cur) => ({
      ...cur,
      values: setThreePointValue(cur.values, tp, key, value),
    }));

  return (
    <SectionShell
      title="Balance and Coordination"
      subtitle="mBESS and Fukuda step test"
      hasContent={hasContent}
      interpretation={section.interpretation}
      onInterpretationChange={(v) =>
        updateSection('balance', (cur) => ({ ...cur, interpretation: v }))
      }
    >
      <ThreePointNumberGrid
        metrics={MBESS_METRICS}
        values={section.values}
        timePoints={timePoints}
        onChange={(tp, key, value) => setField(tp, key, value)}
      />
      <div className="grid gap-2 sm:grid-cols-3">
        {timePoints.map((tp) => {
          const v = section.values[tp];
          const total = mbessTotal(
            v?.mbessDoubleLeg ?? null,
            v?.mbessSingleLeg ?? null,
            v?.mbessTandem ?? null,
          );
          if (total == null) return null;
          const flagged = mbessTotalFlag(total);
          return (
            <div key={tp} className="rounded-lg bg-muted p-3 text-sm">
              {timePoints.length > 1 && (
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {TIME_POINT_LABELS[tp]}
                </p>
              )}
              <p className={cn('font-bold tabular-nums', flagged && 'text-destructive')}>
                mBESS Total: {total} / {MBESS_TOTAL_MAX}
                {flagged && ' ▲'}
              </p>
            </div>
          );
        })}
      </div>
      <p className="text-xs text-muted-foreground">
        Scoring convention pending clinical confirmation (CV-02): entered as points
        earned out of 10 per stance; totals below 20 are flagged.
      </p>

      {timePoints.map((tp) => {
        const v: Partial<BalanceValues> = section.values[tp] ?? {};
        return (
          <div key={tp} className="space-y-4">
            {timePoints.length > 1 && (
              <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Fukuda — {TIME_POINT_LABELS[tp]}
              </p>
            )}
            <div className="grid gap-4 sm:grid-cols-2">
              <SelectField
                label="Fukuda Rotation Direction"
                value={v.fukudaRotationDirection ?? ''}
                onChange={(s) => setField(tp, 'fukudaRotationDirection', s)}
                options={FUKUDA_ROTATION_OPTIONS}
              />
              <TextField
                label="Fukuda Degrees of Rotation"
                value={v.fukudaDegrees ?? ''}
                onChange={(s) => setField(tp, 'fukudaDegrees', s)}
                placeholder="e.g., 45"
              />
              <SelectField
                label="Fukuda Displacement Direction"
                value={v.fukudaDisplacementDirection ?? ''}
                onChange={(s) => setField(tp, 'fukudaDisplacementDirection', s)}
                options={FUKUDA_DISPLACEMENT_OPTIONS}
              />
              <TextField
                label="Fukuda Displacement Distance"
                value={v.fukudaDisplacementDistance ?? ''}
                onChange={(s) => setField(tp, 'fukudaDisplacementDistance', s)}
                placeholder="e.g., 18 inches, 45 cm, minimal"
              />
            </div>
            <TextField
              label="Symptoms or Observations"
              value={v.symptoms ?? ''}
              onChange={(s) => setField(tp, 'symptoms', s)}
            />
          </div>
        );
      })}
    </SectionShell>
  );
}

/* ----------------------------- §7.11 Beighton ------------------------------- */

export function BeightonSection({ report }: { report: ReportDocument }) {
  const updateSection = useReportStore((s) => s.updateSection);
  const section = report.beighton;

  // Initial evaluations only (§7.11) — the form hides it entirely on re-evals.
  if (report.reportType !== 'initial') return null;

  return (
    <SectionShell
      title="Beighton Score"
      subtitle="Initial evaluations only"
      hasContent={section.score != null || !!section.interpretation}
      interpretation={section.interpretation}
      onInterpretationChange={(v) =>
        updateSection('beighton', (cur) => ({ ...cur, interpretation: v }))
      }
    >
      <NumField
        label="Beighton Score"
        value={section.score}
        onChange={(v) => updateSection('beighton', (cur) => ({ ...cur, score: v }))}
        max={9}
      />
    </SectionShell>
  );
}
