import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Trash2 } from 'lucide-react';
import { useReportStore } from '../../store';
import {
  REFERRAL_OPTIONS,
  REHAB_REQUIREMENT_OPTIONS,
  TREATMENT_FREQUENCY_OPTIONS,
  type ReportDocument,
} from '../../types';
import { SectionShell } from '../SectionShell';
import {
  MultiCheckField,
  SelectField,
  TextAreaField,
  TextField,
} from '../fields';

/* --------------------------- §7.12 Cranial Nerves --------------------------- */

export function CranialNerveSection({ report }: { report: ReportDocument }) {
  const updateSection = useReportStore((s) => s.updateSection);
  const section = report.cranialNerves;
  const isAbnormal = section.result === 'Abnormal';

  return (
    <SectionShell
      title="Cranial Nerve Examination"
      subtitle={
        report.reportType === 'initial'
          ? 'Included on every initial evaluation'
          : 'Optional on re-evaluations — document as a Special Test when repeated'
      }
      hasContent={!!section.result}
    >
      <SelectField
        label="Overall Result"
        value={section.result}
        onChange={(v) =>
          updateSection('cranialNerves', (cur) => ({ ...cur, result: v }))
        }
        options={['Normal', 'Abnormal', 'Not Tested']}
      />
      {section.result === 'Normal' && (
        <label className="flex cursor-pointer items-center gap-2 text-sm">
          <Checkbox
            checked={section.includeNormalInPdf}
            onCheckedChange={(v) =>
              updateSection('cranialNerves', (cur) => ({
                ...cur,
                includeNormalInPdf: !!v,
              }))
            }
          />
          Include the normal result in the printed report
        </label>
      )}
      {isAbnormal && (
        <div className="space-y-4">
          <TextField
            label="Cranial nerve(s) involved"
            value={section.nervesInvolved}
            onChange={(v) =>
              updateSection('cranialNerves', (cur) => ({ ...cur, nervesInvolved: v }))
            }
          />
          <TextAreaField
            label="Abnormal findings"
            value={section.findings}
            onChange={(v) =>
              updateSection('cranialNerves', (cur) => ({ ...cur, findings: v }))
            }
          />
          <TextAreaField
            label="Provider Interpretation"
            value={section.interpretation}
            onChange={(v) =>
              updateSection('cranialNerves', (cur) => ({ ...cur, interpretation: v }))
            }
          />
        </div>
      )}
    </SectionShell>
  );
}

/* ------------------------ Musculoskeletal Findings -------------------------- */

export function MusculoskeletalSection({ report }: { report: ReportDocument }) {
  const updateSection = useReportStore((s) => s.updateSection);
  const section = report.musculoskeletal;

  return (
    <SectionShell
      title="Musculoskeletal Findings"
      hasContent={!!section.findings.trim() || !!section.interpretation.trim()}
      interpretation={section.interpretation}
      onInterpretationChange={(v) =>
        updateSection('musculoskeletal', (cur) => ({ ...cur, interpretation: v }))
      }
    >
      <TextAreaField
        label="Findings"
        value={section.findings}
        onChange={(v) =>
          updateSection('musculoskeletal', (cur) => ({ ...cur, findings: v }))
        }
        placeholder="Posture, range of motion, palpation, strength, orthopedic findings…"
      />
    </SectionShell>
  );
}

/* ---------------------------- §7.13 Special Tests --------------------------- */

export function SpecialTestsSection({ report }: { report: ReportDocument }) {
  const updateSection = useReportStore((s) => s.updateSection);
  const updateReport = useReportStore((s) => s.updateReport);
  const tests = report.specialTests;

  return (
    <SectionShell
      title="Special Tests and Additional Notes"
      hasContent={tests.some((t) => t.name || t.findings) || !!report.generalNotes}
    >
      {tests.map((test, i) => (
        <div key={test.id} className="space-y-4 rounded-lg border p-4">
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-semibold text-muted-foreground">
              Special Test {i + 1}
            </p>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-destructive"
              aria-label={`Remove special test ${i + 1}`}
              onClick={() =>
                updateSection('specialTests', (cur) => cur.filter((t) => t.id !== test.id))
              }
            >
              <Trash2 className="h-4 w-4" aria-hidden />
            </Button>
          </div>
          <TextField
            label="Special Test Name"
            value={test.name}
            onChange={(v) =>
              updateSection('specialTests', (cur) =>
                cur.map((t) => (t.id === test.id ? { ...t, name: v } : t)),
              )
            }
          />
          <TextAreaField
            label="Result or Findings"
            value={test.findings}
            onChange={(v) =>
              updateSection('specialTests', (cur) =>
                cur.map((t) => (t.id === test.id ? { ...t, findings: v } : t)),
              )
            }
          />
          <TextAreaField
            label="Provider Interpretation (optional)"
            value={test.interpretation}
            onChange={(v) =>
              updateSection('specialTests', (cur) =>
                cur.map((t) => (t.id === test.id ? { ...t, interpretation: v } : t)),
              )
            }
          />
        </div>
      ))}

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() =>
          updateSection('specialTests', (cur) => [
            ...cur,
            {
              id: `st-${Date.now()}-${cur.length}`,
              name: '',
              findings: '',
              interpretation: '',
            },
          ])
        }
      >
        <Plus className="mr-1 h-3.5 w-3.5" aria-hidden />
        Add Another Test
      </Button>

      <TextAreaField
        label="General Additional Notes (optional)"
        value={report.generalNotes}
        onChange={(v) => updateReport({ generalNotes: v })}
      />
    </SectionShell>
  );
}

/* ------------------------- §7.14 Recommendations ---------------------------- */

export function RecommendationsSection({ report }: { report: ReportDocument }) {
  const updateSection = useReportStore((s) => s.updateSection);
  const rec = report.recommendations;
  const patch = (p: Partial<ReportDocument['recommendations']>) =>
    updateSection('recommendations', (cur) => ({ ...cur, ...p }));

  return (
    <SectionShell
      title="Recommendations and Next Steps"
      subtitle="Included on all reports"
      hasContent={!!rec.treatmentFrequency || rec.referrals.length > 0 || !!rec.rehabRequirement}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <SelectField
          label="Recommended Treatment Frequency"
          value={rec.treatmentFrequency}
          onChange={(v) => patch({ treatmentFrequency: v })}
          options={TREATMENT_FREQUENCY_OPTIONS}
        />
        {rec.treatmentFrequency === 'Other' && (
          <TextField
            label="Describe frequency"
            value={rec.treatmentFrequencyOther}
            onChange={(v) => patch({ treatmentFrequencyOther: v })}
          />
        )}
      </div>

      <MultiCheckField
        label="Referrals / Additional Evaluations"
        options={REFERRAL_OPTIONS}
        values={rec.referrals}
        onChange={(v) => patch({ referrals: v })}
      />
      {rec.referrals.includes('Other') && (
        <TextField
          label="Other referral"
          value={rec.referralOther}
          onChange={(v) => patch({ referralOther: v })}
        />
      )}

      <div className="space-y-4">
        <SelectField
          label="Requirement Before Rehabilitation"
          value={rec.rehabRequirement}
          onChange={(v) => patch({ rehabRequirement: v })}
          options={REHAB_REQUIREMENT_OPTIONS}
        />
        {rec.rehabRequirement === 'Additional evaluation required' && (
          <TextField
            label="Required evaluation or clearance"
            value={rec.requiredEvaluation}
            onChange={(v) => patch({ requiredEvaluation: v })}
            placeholder="Which evaluation or clearance is required"
          />
        )}
      </div>
    </SectionShell>
  );
}
