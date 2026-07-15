import { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Download } from 'lucide-react';
import { useReportStore } from '../../store';
import {
  activeTimePoints,
  TIME_POINT_LABELS,
  type CompassDomainValues,
  type ReportDocument,
  type ThreePoint,
  type TimePointKey,
} from '../../types';
import { SectionShell } from '../SectionShell';
import {
  TextField,
  ThreePointNumberGrid,
  type MetricDef,
} from '../fields';
import {
  COMPASS31_DOMAINS,
  COMPASS31_RAW_MAX,
  COMPASS31_WEIGHTED_MAX,
  compass31RawTotal,
  compass31SeverityLabel,
  compass31WeightedTotal,
} from '@/lib/clinical/compass31';
import {
  AIS8_MAX,
  GAD7_MAX,
  PHQ9_MAX,
  ais8Label,
  gad7Label,
  phq9Label,
} from '@/lib/clinical/severity';
import { useCompassStore } from '@/features/compass31/store';
import { COMPASS_QUESTIONNAIRE, domainScore } from '@/features/compass31/questions';

function setThreePointValue<V extends object>(
  values: ThreePoint<V>,
  tp: TimePointKey,
  key: string,
  value: unknown,
): ThreePoint<V> {
  return { ...values, [tp]: { ...(values[tp] ?? {}), [key]: value } as V };
}

/* ------------------------ §7.3 Graded Symptom Survey ------------------------ */

const GRADED_METRICS: MetricDef[] = [
  { key: 'symptomScore', label: 'Symptom Score', max: 23 },
  { key: 'compositeScore', label: 'Composite Score', max: 138 },
];

export function GradedSymptomsSection({ report }: { report: ReportDocument }) {
  const updateSection = useReportStore((s) => s.updateSection);
  const timePoints = activeTimePoints(report.reportType);
  const section = report.gradedSymptoms;

  const hasContent =
    timePoints.some((tp) => {
      const v = section.values[tp];
      return v && (v.symptomScore != null || v.compositeScore != null || v.highestBurdens);
    }) || !!section.interpretation;

  return (
    <SectionShell
      title="Graded Symptom Survey"
      hasContent={hasContent}
      interpretation={section.interpretation}
      onInterpretationChange={(v) =>
        updateSection('gradedSymptoms', (cur) => ({ ...cur, interpretation: v }))
      }
    >
      <ThreePointNumberGrid
        metrics={GRADED_METRICS}
        values={section.values}
        timePoints={timePoints}
        onChange={(tp, key, value) =>
          updateSection('gradedSymptoms', (cur) => ({
            ...cur,
            values: setThreePointValue(cur.values, tp, key, value),
          }))
        }
      />
      {timePoints.map((tp) => (
        <TextField
          key={tp}
          label={
            timePoints.length > 1
              ? `Highest Symptom Burden(s) — ${TIME_POINT_LABELS[tp]}`
              : 'Highest Symptom Burden(s)'
          }
          value={section.values[tp]?.highestBurdens ?? ''}
          onChange={(v) =>
            updateSection('gradedSymptoms', (cur) => ({
              ...cur,
              values: setThreePointValue(cur.values, tp, 'highestBurdens', v),
            }))
          }
          placeholder="One or several symptoms"
        />
      ))}
    </SectionShell>
  );
}

/* ------------------------------ §7.4 COMPASS-31 ----------------------------- */

const COMPASS_METRICS: MetricDef[] = COMPASS31_DOMAINS.map((d) => ({
  key: d.key,
  label: d.domain,
  max: d.maxScore,
}));

export function CompassSection({ report }: { report: ReportDocument }) {
  const updateSection = useReportStore((s) => s.updateSection);
  const compassAnswers = useCompassStore((s) => s.answers);
  const timePoints = activeTimePoints(report.reportType);
  const section = report.compass;

  const hasContent =
    timePoints.some((tp) => {
      const v = section.values[tp];
      return v && COMPASS31_DOMAINS.some((d) => v[d.key] != null);
    }) || !!section.interpretation;

  const scorerHasData = useMemo(
    () => Object.values(compassAnswers).some((v) => v != null),
    [compassAnswers],
  );

  /** CP-01: automatic transfer from the COMPASS-31 scorer into `current`. */
  const transferFromScorer = () => {
    const scores: CompassDomainValues = {};
    for (const d of COMPASS_QUESTIONNAIRE) scores[d.key] = domainScore(d, compassAnswers);
    updateSection('compass', (cur) => ({
      ...cur,
      values: { ...cur.values, current: scores },
    }));
    toast.success('COMPASS-31 domain scores transferred from the scorer');
  };

  return (
    <SectionShell
      title="COMPASS-31"
      hasContent={hasContent}
      interpretation={section.interpretation}
      onInterpretationChange={(v) =>
        updateSection('compass', (cur) => ({ ...cur, interpretation: v }))
      }
    >
      <Button
        type="button"
        variant="secondary"
        size="sm"
        onClick={transferFromScorer}
        disabled={!scorerHasData}
      >
        <Download className="mr-2 h-4 w-4" aria-hidden />
        {scorerHasData
          ? 'Transfer from COMPASS-31 scorer'
          : 'No data in the COMPASS-31 scorer yet'}
      </Button>

      <ThreePointNumberGrid
        metrics={COMPASS_METRICS}
        values={section.values}
        timePoints={timePoints}
        onChange={(tp, key, value) =>
          updateSection('compass', (cur) => ({
            ...cur,
            values: setThreePointValue(cur.values, tp, key, value),
          }))
        }
      />

      {/* CP-04 label + CV-01: raw /75 shown with weighted /100 alongside. */}
      <div className="grid gap-2 sm:grid-cols-3">
        {timePoints.map((tp) => {
          const v = section.values[tp];
          if (!v || !COMPASS31_DOMAINS.some((d) => v[d.key] != null)) return null;
          const raw = compass31RawTotal(v);
          const weighted = compass31WeightedTotal(v);
          const severity = compass31SeverityLabel(raw);
          return (
            <div key={tp} className="rounded-lg bg-muted p-3 text-sm">
              {timePoints.length > 1 && (
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {TIME_POINT_LABELS[tp]}
                </p>
              )}
              <p className="font-bold tabular-nums">
                Total: {raw} / {COMPASS31_RAW_MAX}
              </p>
              <p className="text-muted-foreground tabular-nums">
                Weighted: {weighted} / {COMPASS31_WEIGHTED_MAX}
              </p>
              {severity && <p className="font-medium text-primary">{severity}</p>}
            </div>
          );
        })}
      </div>
    </SectionShell>
  );
}

/* --------------------- §7.5 Mental Health and Sleep ------------------------ */

const MENTAL_METRICS: MetricDef[] = [
  { key: 'phq9', label: 'PHQ-9', max: PHQ9_MAX },
  { key: 'gad7', label: 'GAD-7', max: GAD7_MAX },
  { key: 'ais8', label: 'Athens Insomnia Scale', max: AIS8_MAX },
];

export function MentalHealthSection({ report }: { report: ReportDocument }) {
  const updateSection = useReportStore((s) => s.updateSection);
  const timePoints = activeTimePoints(report.reportType);
  const section = report.mentalHealth;

  const hasContent =
    timePoints.some((tp) => {
      const v = section.values[tp];
      return v && (v.phq9 != null || v.gad7 != null || v.ais8 != null);
    }) || !!section.interpretation;

  const current = section.values.current;

  return (
    <SectionShell
      title="Mental Health and Sleep Screening"
      subtitle="PHQ-9, GAD-7, and Athens Insomnia Scale (AIS-8)"
      hasContent={hasContent}
      interpretation={section.interpretation}
      onInterpretationChange={(v) =>
        updateSection('mentalHealth', (cur) => ({ ...cur, interpretation: v }))
      }
    >
      <ThreePointNumberGrid
        metrics={MENTAL_METRICS}
        values={section.values}
        timePoints={timePoints}
        onChange={(tp, key, value) =>
          updateSection('mentalHealth', (cur) => ({
            ...cur,
            values: setThreePointValue(cur.values, tp, key, value),
          }))
        }
      />
      {current && (
        <div className="space-y-1 text-sm text-muted-foreground">
          {current.phq9 != null && <p>PHQ-9: {phq9Label(current.phq9) ?? 'out of range'}</p>}
          {current.gad7 != null && <p>GAD-7: {gad7Label(current.gad7) ?? 'out of range'}</p>}
          {current.ais8 != null && <p>AIS-8: {ais8Label(current.ais8) ?? 'out of range'}</p>}
        </div>
      )}
    </SectionShell>
  );
}
