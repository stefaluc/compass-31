import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { useReportStore } from '../../store';
import {
  activeTimePoints,
  BROCK_VISUALIZATION_OPTIONS,
  emptyOcularValues,
  EYE_LAG_OPTIONS,
  GAZE_POSITION_OPTIONS,
  NECK_TORSION_RESULT_OPTIONS,
  NORMALITY_OPTIONS,
  NYSTAGMUS_EYE_OPTIONS,
  TIME_POINT_LABELS,
  type BrockStringPosition,
  type OcularValues,
  type ReportDocument,
  type TimePointKey,
} from '../../types';
import { SectionShell } from '../SectionShell';
import { MultiCheckField, SelectField, TextField } from '../fields';

const BROCK_POSITIONS: { key: 'brockNeutral' | 'brockRight15' | 'brockLeft15'; label: string }[] = [
  { key: 'brockNeutral', label: 'Neutral' },
  { key: 'brockRight15', label: '15° Right' },
  { key: 'brockLeft15', label: '15° Left' },
];

function OcularFields({
  values,
  onChange,
}: {
  values: OcularValues;
  onChange: (patch: Partial<OcularValues>) => void;
}) {
  const setBrock = (
    key: 'brockNeutral' | 'brockRight15' | 'brockLeft15',
    patch: Partial<BrockStringPosition>,
  ) => onChange({ [key]: { ...values[key], ...patch } } as Partial<OcularValues>);

  return (
    <div className="space-y-6">
      {/* Near Point of Convergence */}
      <div>
        <p className="mb-3 font-semibold">Near Point of Convergence</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            label="Near Point of Convergence (cm)"
            value={values.npcCm}
            onChange={(v) => onChange({ npcCm: v })}
            placeholder="Final measurement"
          />
          <SelectField
            label="Eye Lag"
            value={values.eyeLag}
            onChange={(v) => onChange({ eyeLag: v })}
            options={EYE_LAG_OPTIONS}
          />
        </div>
      </div>

      <Separator />

      {/* Nystagmus */}
      <div className="space-y-4">
        <p className="font-semibold">Nystagmus</p>
        <div className="space-y-2">
          <Label>Nystagmus observed?</Label>
          <RadioGroup
            value={values.nystagmus ?? ''}
            onValueChange={(v) => onChange({ nystagmus: (v as 'yes' | 'no') || null })}
            className="flex gap-6"
          >
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <RadioGroupItem value="yes" /> Yes
            </label>
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <RadioGroupItem value="no" /> No
            </label>
          </RadioGroup>
        </div>
        {values.nystagmus === 'yes' && (
          <div className="space-y-4">
            <SelectField
              label="Eye(s)"
              value={values.nystagmusEyes}
              onChange={(v) => onChange({ nystagmusEyes: v })}
              options={NYSTAGMUS_EYE_OPTIONS}
            />
            <MultiCheckField
              label="Gaze Position / Quadrant Observed"
              options={GAZE_POSITION_OPTIONS}
              values={values.nystagmusGazePositions}
              onChange={(v) => onChange({ nystagmusGazePositions: v })}
              columns={3}
            />
            <TextField
              label="Additional Details"
              value={values.nystagmusDetails}
              onChange={(v) => onChange({ nystagmusDetails: v })}
            />
          </div>
        )}
      </div>

      <Separator />

      {/* Neck Torsion */}
      <div className="space-y-4">
        <p className="font-semibold">Neck Torsion Test</p>
        <SelectField
          label="Result"
          value={values.neckTorsionResult}
          onChange={(v) => onChange({ neckTorsionResult: v })}
          options={NECK_TORSION_RESULT_OPTIONS}
        />
        {values.neckTorsionResult === 'Positive' && (
          <div className="grid gap-4 sm:grid-cols-2">
            <SelectField
              label="Head Position"
              value={values.neckTorsionHeadPosition}
              onChange={(v) => onChange({ neckTorsionHeadPosition: v })}
              options={['Right Rotation', 'Left Rotation', 'Other']}
            />
            {values.neckTorsionHeadPosition === 'Other' && (
              <TextField
                label="Describe head position"
                value={values.neckTorsionHeadPositionOther}
                onChange={(v) => onChange({ neckTorsionHeadPositionOther: v })}
              />
            )}
            <TextField
              label="Symptom or Finding Produced"
              value={values.neckTorsionFinding}
              onChange={(v) => onChange({ neckTorsionFinding: v })}
            />
            <TextField
              label="Additional Details (optional)"
              value={values.neckTorsionDetails}
              onChange={(v) => onChange({ neckTorsionDetails: v })}
            />
          </div>
        )}
      </div>

      <Separator />

      {/* Saccades */}
      <div className="space-y-4">
        <p className="font-semibold">Saccades</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <SelectField
            label="Horizontal Saccades"
            value={values.saccadesHorizontal}
            onChange={(v) => onChange({ saccadesHorizontal: v })}
            options={NORMALITY_OPTIONS}
          />
          <SelectField
            label="Vertical Saccades"
            value={values.saccadesVertical}
            onChange={(v) => onChange({ saccadesVertical: v })}
            options={NORMALITY_OPTIONS}
          />
          <TextField
            label="Symptoms Produced"
            value={values.saccadesSymptoms}
            onChange={(v) => onChange({ saccadesSymptoms: v })}
          />
          <TextField
            label="Additional Findings"
            value={values.saccadesFindings}
            onChange={(v) => onChange({ saccadesFindings: v })}
          />
        </div>
      </div>

      <Separator />

      {/* Smooth Pursuit */}
      <div className="space-y-4">
        <p className="font-semibold">Smooth Pursuit</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <SelectField
            label="Result"
            value={values.smoothPursuitResult}
            onChange={(v) => onChange({ smoothPursuitResult: v })}
            options={NORMALITY_OPTIONS}
          />
          <TextField
            label="Symptoms Produced"
            value={values.smoothPursuitSymptoms}
            onChange={(v) => onChange({ smoothPursuitSymptoms: v })}
          />
          <TextField
            label="Additional Findings"
            value={values.smoothPursuitFindings}
            onChange={(v) => onChange({ smoothPursuitFindings: v })}
          />
        </div>
      </div>

      <Separator />

      {/* Brock String */}
      <div className="space-y-4">
        <p className="font-semibold">Brock String</p>
        {BROCK_POSITIONS.map(({ key, label }) => {
          const pos = values[key];
          return (
            <div key={key} className="rounded-lg border p-4">
              <p className="mb-3 text-sm font-semibold text-muted-foreground">{label}</p>
              <div className="grid gap-4 sm:grid-cols-2">
                <SelectField
                  label="What the patient visualizes"
                  value={pos.visualization}
                  onChange={(v) => setBrock(key, { visualization: v })}
                  options={BROCK_VISUALIZATION_OPTIONS}
                />
                {pos.visualization === 'Other / Custom' && (
                  <TextField
                    label="Describe the patient report"
                    value={pos.customVisualization}
                    onChange={(v) => setBrock(key, { customVisualization: v })}
                  />
                )}
                <TextField
                  label="Bead distance/location"
                  value={pos.beadDistance}
                  onChange={(v) => setBrock(key, { beadDistance: v })}
                />
                <TextField
                  label="Symptoms Produced"
                  value={pos.symptoms}
                  onChange={(v) => setBrock(key, { symptoms: v })}
                />
                <TextField
                  label="Additional Findings"
                  value={pos.findings}
                  onChange={(v) => setBrock(key, { findings: v })}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function OcularSection({ report }: { report: ReportDocument }) {
  const updateSection = useReportStore((s) => s.updateSection);
  const timePoints = activeTimePoints(report.reportType);
  const section = report.ocular;

  const hasContent =
    timePoints.some((tp) => {
      const v = section.values[tp];
      return (
        v &&
        Object.entries(v).some(([, x]) =>
          typeof x === 'string'
            ? x !== ''
            : Array.isArray(x)
              ? x.length > 0
              : x != null && typeof x !== 'object',
        )
      );
    }) || !!section.interpretation;

  const handleChange = (tp: TimePointKey) => (patch: Partial<OcularValues>) =>
    updateSection('ocular', (cur) => ({
      ...cur,
      values: {
        ...cur.values,
        [tp]: { ...(cur.values[tp] ?? emptyOcularValues()), ...patch },
      },
    }));

  return (
    <SectionShell
      title="Ocular Testing"
      subtitle="Near point, nystagmus, neck torsion, saccades, smooth pursuit, Brock string"
      hasContent={hasContent}
      interpretation={section.interpretation}
      onInterpretationChange={(v) =>
        updateSection('ocular', (cur) => ({ ...cur, interpretation: v }))
      }
      interpretationLabel="Ocular Testing Provider Interpretation (one combined field, optional)"
    >
      {timePoints.length === 1 ? (
        <OcularFields
          values={section.values.current ?? emptyOcularValues()}
          onChange={handleChange('current')}
        />
      ) : (
        <Tabs defaultValue="current">
          <TabsList>
            {timePoints.map((tp) => (
              <TabsTrigger key={tp} value={tp}>
                {TIME_POINT_LABELS[tp]}
              </TabsTrigger>
            ))}
          </TabsList>
          {timePoints.map((tp) => (
            <TabsContent key={tp} value={tp} className="pt-2">
              <OcularFields
                values={section.values[tp] ?? emptyOcularValues()}
                onChange={handleChange(tp)}
              />
            </TabsContent>
          ))}
        </Tabs>
      )}
    </SectionShell>
  );
}
