import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from 'sonner';
import { Download, Plus, Trash2 } from 'lucide-react';
import { useReportStore } from '../../store';
import {
  activeTimePoints,
  TIME_POINT_LABELS,
  type LeanSymptomEntry,
  type NasaLeanValues,
  type ReportDocument,
  type TimePointKey,
} from '../../types';
import { SectionShell } from '../SectionShell';
import {
  NumField,
  SelectField,
  TextAreaField,
  TextField,
  numberOrNull,
} from '../fields';
import { HR_TREND_OPTIONS, computeLeanStats } from '@/lib/clinical/nasaLean';
import { useNasaLeanStore } from '@/features/nasa-lean/store';

function computedDelta(v: Partial<NasaLeanValues> | undefined | null): number | null {
  if (!v) return null;
  if (v.deltaOverride != null) return v.deltaOverride;
  if (v.highestHR != null && v.baselineHR != null) return v.highestHR - v.baselineHR;
  return null;
}

function TimePointFields({
  tp,
  label,
  values,
  onChange,
}: {
  tp: TimePointKey;
  label: string | null;
  values: Partial<NasaLeanValues> | undefined | null;
  onChange: (patch: Partial<NasaLeanValues>) => void;
}) {
  const v = values ?? {};
  const delta = computedDelta(v);

  return (
    <div className="space-y-4">
      {label && (
        <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
      )}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <NumField
          label="BP Systolic"
          value={v.bpSystolic ?? null}
          onChange={(n) => onChange({ bpSystolic: n })}
        />
        <NumField
          label="BP Diastolic"
          value={v.bpDiastolic ?? null}
          onChange={(n) => onChange({ bpDiastolic: n })}
        />
        <NumField
          label="Resting/Baseline HR"
          value={v.baselineHR ?? null}
          onChange={(n) => onChange({ baselineHR: n })}
        />
        <NumField
          label="Lowest HR"
          value={v.lowestHR ?? null}
          onChange={(n) => onChange({ lowestHR: n })}
        />
        <NumField
          label="Highest HR"
          value={v.highestHR ?? null}
          onChange={(n) => onChange({ highestHR: n })}
        />
        <div className="space-y-1.5">
          <Label htmlFor={`delta-${tp}`}>Max HR Delta</Label>
          <div className="flex items-center gap-2">
            <Input
              id={`delta-${tp}`}
              type="number"
              inputMode="numeric"
              value={delta ?? ''}
              onChange={(e) => onChange({ deltaOverride: numberOrNull(e.target.value) })}
              className="w-24 text-center"
            />
            {v.deltaOverride != null ? (
              <button
                type="button"
                className="text-xs text-primary underline-offset-2 hover:underline"
                onClick={() => onChange({ deltaOverride: null })}
              >
                auto
              </button>
            ) : (
              <span className="text-xs text-muted-foreground">auto</span>
            )}
          </div>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <SelectField
          label="Overall HR Trend"
          value={v.hrTrend ?? ''}
          onChange={(s) => onChange({ hrTrend: s })}
          options={HR_TREND_OPTIONS}
        />
        {v.hrTrend === 'Other' && (
          <TextField
            label="Describe the trend"
            value={v.hrTrendOther ?? ''}
            onChange={(s) => onChange({ hrTrendOther: s })}
          />
        )}
      </div>
    </div>
  );
}

export function NasaLeanReportSection({ report }: { report: ReportDocument }) {
  const updateSection = useReportStore((s) => s.updateSection);
  const leanStore = useNasaLeanStore();
  const timePoints = activeTimePoints(report.reportType);
  const section = report.nasaLean;

  const hasContent =
    timePoints.some((tp) => {
      const v = section.values[tp];
      return v && Object.values(v).some((x) => x != null && x !== '');
    }) ||
    section.symptomEntries.length > 0 ||
    !!section.interpretation;

  const toolHasData = leanStore.measurements.length > 0 || !!leanStore.initialPR;

  /** NR-01/NR-04: transfer summary values, graph data, and timestamped symptoms. */
  const transferFromTool = () => {
    const recordedBaseline = leanStore.lowestSupinePR
      ? parseInt(leanStore.lowestSupinePR, 10)
      : leanStore.initialPR
        ? parseInt(leanStore.initialPR, 10)
        : null;
    const stats = computeLeanStats(recordedBaseline, leanStore.measurements, {
      baseline: leanStore.baselineOverride,
      lowest: leanStore.lowestOverride,
      highest: leanStore.highestOverride,
    });

    const chartData = [
      ...(leanStore.initialPR
        ? [
            {
              time: -2,
              heartRate: parseInt(leanStore.initialPR, 10),
              label: 'Initial (Supine)',
              isPreTest: true,
            },
          ]
        : []),
      ...(leanStore.lowestSupinePR
        ? [
            {
              time: -1,
              heartRate: parseInt(leanStore.lowestSupinePR, 10),
              label: 'Lowest Supine',
              isPreTest: true,
            },
          ]
        : []),
      ...leanStore.measurements
        .filter((m) => m.pulseRate != null)
        .map((m) => ({
          time: m.chartTime,
          heartRate: m.pulseRate as number,
          label: `${m.label} (Standing)`,
          isPreTest: false,
        })),
    ];

    const symptomEntries: LeanSymptomEntry[] = leanStore.measurements
      .filter((m) => m.symptoms)
      .map((m) => ({ time: m.label, text: m.symptoms }));

    updateSection('nasaLean', (cur) => ({
      ...cur,
      values: {
        ...cur.values,
        current: {
          ...(cur.values.current ?? {}),
          bpSystolic: numberOrNull(leanStore.bpSystolic),
          bpDiastolic: numberOrNull(leanStore.bpDiastolic),
          baselineHR: stats.baseline,
          lowestHR: stats.lowest,
          highestHR: stats.highest,
        },
      },
      symptomEntries,
      chartData: chartData.length ? chartData : null,
    }));
    toast.success('NASA Lean results transferred from the tool');
  };

  const setEntry = (index: number, patch: Partial<LeanSymptomEntry>) =>
    updateSection('nasaLean', (cur) => ({
      ...cur,
      symptomEntries: cur.symptomEntries.map((e, i) =>
        i === index ? { ...e, ...patch } : e,
      ),
    }));

  return (
    <SectionShell
      title="NASA Lean Test"
      hasContent={hasContent}
      interpretation={section.interpretation}
      onInterpretationChange={(v) =>
        updateSection('nasaLean', (cur) => ({ ...cur, interpretation: v }))
      }
    >
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={transferFromTool}
          disabled={!toolHasData}
        >
          <Download className="mr-2 h-4 w-4" aria-hidden />
          {toolHasData
            ? 'Transfer from NASA Lean tool (graph included)'
            : 'No data in the NASA Lean tool yet'}
        </Button>
        {section.chartData && (
          <span className="text-xs text-muted-foreground">
            ✓ Current graph attached ({section.chartData.length} points)
          </span>
        )}
      </div>

      <div className="space-y-6">
        {timePoints.map((tp) => (
          <TimePointFields
            key={tp}
            tp={tp}
            label={timePoints.length > 1 ? TIME_POINT_LABELS[tp] : null}
            values={section.values[tp]}
            onChange={(patch) =>
              updateSection('nasaLean', (cur) => ({
                ...cur,
                values: { ...cur.values, [tp]: { ...(cur.values[tp] ?? {}), ...patch } },
              }))
            }
          />
        ))}
      </div>

      {/* NR-03 */}
      <div className="space-y-2">
        <Label>Is the patient currently taking any medication that may affect heart rate?</Label>
        <RadioGroup
          value={section.medicationAffectingHR ?? ''}
          onValueChange={(v) =>
            updateSection('nasaLean', (cur) => ({
              ...cur,
              medicationAffectingHR: (v as 'yes' | 'no') || null,
            }))
          }
          className="flex gap-6"
        >
          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <RadioGroupItem value="yes" /> Yes
          </label>
          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <RadioGroupItem value="no" /> No
          </label>
        </RadioGroup>
        {section.medicationAffectingHR === 'yes' && (
          <TextField
            label="Medication(s)"
            value={section.medications}
            onChange={(v) =>
              updateSection('nasaLean', (cur) => ({ ...cur, medications: v }))
            }
          />
        )}
      </div>

      {/* NR-04 */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Symptoms / Observations (time or phase)</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              updateSection('nasaLean', (cur) => ({
                ...cur,
                symptomEntries: [...cur.symptomEntries, { time: '', text: '' }],
              }))
            }
          >
            <Plus className="mr-1 h-3.5 w-3.5" aria-hidden />
            Add
          </Button>
        </div>
        {section.symptomEntries.length === 0 && (
          <p className="text-sm text-muted-foreground">
            No entries — transfer from the tool or add manually.
          </p>
        )}
        <div className="space-y-2">
          {section.symptomEntries.map((entry, i) => (
            <div key={i} className="flex items-center gap-2">
              <Input
                value={entry.time}
                onChange={(e) => setEntry(i, { time: e.target.value })}
                placeholder="Time/phase"
                aria-label={`Symptom entry ${i + 1} time`}
                className="w-28"
              />
              <Input
                value={entry.text}
                onChange={(e) => setEntry(i, { text: e.target.value })}
                placeholder="Symptom or observation"
                aria-label={`Symptom entry ${i + 1} text`}
                className="flex-1"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-9 w-9 p-0 text-destructive"
                aria-label={`Delete symptom entry ${i + 1}`}
                onClick={() =>
                  updateSection('nasaLean', (cur) => ({
                    ...cur,
                    symptomEntries: cur.symptomEntries.filter((_, j) => j !== i),
                  }))
                }
              >
                <Trash2 className="h-4 w-4" aria-hidden />
              </Button>
            </div>
          ))}
        </div>
      </div>

      <TextAreaField
        label="Additional Notes (optional)"
        value={section.manualNotes}
        onChange={(v) => updateSection('nasaLean', (cur) => ({ ...cur, manualNotes: v }))}
      />
    </SectionShell>
  );
}
