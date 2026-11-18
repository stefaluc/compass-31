import { useReportStore } from '../../store';
import { ETIOLOGY_OPTIONS, type ReportDocument } from '../../types';
import { MultiCheckField, NumField, TextAreaField, TextField } from '../fields';
import { SectionShell } from '../SectionShell';

export function PatientInfoSection({ report }: { report: ReportDocument }) {
  const updateSection = useReportStore((s) => s.updateSection);
  const patient = report.patient;
  const patch = (p: Partial<ReportDocument['patient']>) =>
    updateSection('patient', (cur) => ({ ...cur, ...p }));

  return (
    <SectionShell
      title="Patient and Visit Information"
      defaultOpen
      hasContent={!!patient.patientName}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          label="Patient Name"
          value={patient.patientName}
          onChange={(v) => patch({ patientName: v })}
          placeholder="Full name"
        />
        <TextField
          label="Evaluation Date"
          type="date"
          value={patient.evaluationDate}
          onChange={(v) => patch({ evaluationDate: v })}
        />
        <TextField
          label="Age"
          value={patient.age}
          onChange={(v) => patch({ age: v })}
          placeholder="e.g., 24"
        />
        <TextField
          label="MRN / Patient ID (optional)"
          value={patient.mrn}
          onChange={(v) => patch({ mrn: v })}
        />
        <TextField
          label="Provider Name"
          value={patient.providerName}
          onChange={(v) => patch({ providerName: v })}
        />
      </div>

      {report.reportType === 're-evaluation' && (
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            label="Initial Evaluation Date"
            type="date"
            value={patient.initialEvalDate}
            onChange={(v) => patch({ initialEvalDate: v })}
          />
          <TextField
            label="Last Re-evaluation Date"
            type="date"
            value={patient.lastReEvalDate}
            onChange={(v) => patch({ lastReEvalDate: v })}
          />
        </div>
      )}

      <TextAreaField
        label="Brief Case History"
        value={patient.caseHistory}
        onChange={(v) => patch({ caseHistory: v })}
        placeholder="Presenting complaint, relevant history, and course to date…"
      />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <NumField
          label="BP Systolic"
          value={patient.bpSystolic}
          onChange={(v) => patch({ bpSystolic: v })}
          suffix="mmHg"
        />
        <NumField
          label="BP Diastolic"
          value={patient.bpDiastolic}
          onChange={(v) => patch({ bpDiastolic: v })}
          suffix="mmHg"
        />
        <NumField
          label="Heart Rate"
          value={patient.heartRate}
          onChange={(v) => patch({ heartRate: v })}
          suffix="bpm"
        />
        <NumField
          label="SpO₂"
          value={patient.spo2}
          onChange={(v) => patch({ spo2: v })}
          suffix="%"
        />
      </div>

      <MultiCheckField
        label="Etiology (select all that apply)"
        options={ETIOLOGY_OPTIONS}
        values={patient.etiologies}
        onChange={(v) => patch({ etiologies: v })}
        columns={3}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          label="Date of Symptom Onset"
          value={patient.symptomOnset}
          onChange={(v) => patch({ symptomOnset: v })}
          placeholder='Exact date or wording like "Spring 2024"'
        />
        {report.reportType === 're-evaluation' && (
          <TextField
            label="Time in Rehabilitation Program"
            value={patient.timeInRehab}
            onChange={(v) => patch({ timeInRehab: v })}
            placeholder="e.g., 8 weeks"
          />
        )}
      </div>
    </SectionShell>
  );
}
