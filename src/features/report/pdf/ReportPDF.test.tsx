import { describe, it, expect } from 'vitest';
import { pdf } from '@react-pdf/renderer';
import { writeFileSync } from 'node:fs';
import { ReportPDF } from './ReportPDF';
import { createEmptyReport, migrateReport } from '../types';
import { buildBalance, buildCompass, buildPatientHeader } from '../reportContent';

/**
 * Smoke test: a populated report document renders to a non-empty PDF with no
 * exceptions (PDF-03/PDF-05). Also writes the result to disk for visual
 * inspection when SAMPLE_PDF_PATH is set.
 */
describe('ReportPDF', () => {
  it('renders a populated initial report', async () => {
    const report = createEmptyReport('initial', '2026-07-15');
    report.patient.patientName = 'Test Patient';
    report.patient.age = '29';
    report.patient.providerName = 'Dr. Example';
    report.patient.bpSystolic = 118;
    report.patient.bpDiastolic = 76;
    report.patient.heartRate = 74;
    report.patient.spo2 = 99;
    report.patient.etiologies = ['Post-viral', 'Unknown'];
    report.patient.symptomOnset = 'Spring 2025';
    report.patient.caseHistory = 'Onset of orthostatic symptoms after a viral illness.';

    report.gradedSymptoms.values.current = {
      symptomScore: 12,
      compositeScore: 47,
      highestBurdens: 'Dizziness, fatigue',
    };
    report.gradedSymptoms.interpretation = 'Moderate overall burden.';

    // Weighted domain scores, as entered in the report.
    report.compass.values.current = {
      orthostaticIntolerance: 32,
      vasomotor: 1.7,
      secretomotor: 6.4,
      gastrointestinal: 8.9,
      bladder: 1.1,
      pupillomotor: 1.3,
    };

    report.mentalHealth.values.current = { phq9: 8, gad7: 11, ais8: 7 };

    report.nasaLean.values.current = {
      bpSystolic: 120,
      bpDiastolic: 80,
      baselineHR: 72,
      lowestHR: 92,
      highestHR: 110,
      deltaOverride: null,
      hrTrend: 'Gradual increase',
      hrTrendOther: '',
    };
    report.nasaLean.medicationAffectingHR = 'no';
    report.nasaLean.symptomEntries = [{ time: '0:15', text: 'Dizziness' }];

    report.activeStand.performed = 'performed';
    report.activeStand.values.current = {
      baseline: { systolic: 120, diastolic: 80, heartRate: 70, symptoms: '' },
      minutes: [
        { systolic: 118, diastolic: 79, heartRate: 85, symptoms: '' },
        { systolic: 99, diastolic: 78, heartRate: 92, symptoms: 'Lightheaded' },
        { systolic: 110, diastolic: 79, heartRate: 90, symptoms: '' },
        { systolic: 112, diastolic: 80, heartRate: 88, symptoms: '' },
        { systolic: 114, diastolic: 80, heartRate: 86, symptoms: '' },
      ],
    };

    report.cognitive.values.current = {
      immediateRecall: 18,
      delayedRecall: 5,
      digitsBackward: 3,
      trailASeconds: 30,
      trailBSeconds: 96,
    };

    report.balance.values.current = {
      mbessDoubleLeg: 0,
      mbessSingleLeg: 4,
      mbessTandem: 7,
      tandemGaitDistance: '10',
      tandemGaitQuality: 'Slow and mildly unsteady',
      tandemGaitOther: '',
      fukudaRotationDirection: 'Left',
      fukudaDegrees: '45',
      fukudaDisplacements: [
        { direction: 'Forward', distance: '3 ft' },
        { direction: 'Right', distance: '2 ft' },
      ],
      symptoms: '',
    };
    report.musculoskeletal = {
      findings: 'Reduced cervical rotation to the left.',
      interpretation: 'Consistent with upper cervical dysfunction.',
    };

    const rows = Object.fromEntries(
      buildBalance(report)!.rows.map((r) => [r.label, r]),
    );
    expect(rows['mBESS Total Errors'].values).toEqual(['11 / 30']);
    expect(rows['mBESS Total Errors'].flags).toEqual([true]);
    expect(rows['Tandem Gait'].values).toEqual(['Slow and mildly unsteady, 10 ft']);
    expect(rows['Fukuda Displacement'].values).toEqual(['Forward 3 ft, Right 2 ft']);

    const compass = buildCompass(report)!;
    expect(compass.table.rows[0].values).toEqual(['32 / 40']);
    expect(compass.totals[0].weighted).toBe(51.4);

    report.beighton.score = 6;
    report.cranialNerves = {
      result: 'Normal',
      nervesInvolved: '',
      findings: '',
      interpretation: '',
      includeNormalInPdf: true,
    };
    report.specialTests = [
      { id: 't1', name: 'VOMS', findings: 'Symptom provocation on saccades', interpretation: '' },
    ];
    report.recommendations = {
      treatmentFrequency: '2x/week',
      treatmentFrequencyOther: '',
      referrals: ['Cardiology', 'Vestibular therapy'],
      referralOther: '',
      rehabRequirement: 'Additional evaluation not required',
      requiredEvaluation: '',
    };

    const blob = await pdf(<ReportPDF report={report} chartImage={null} />).toBlob();
    expect(blob.size).toBeGreaterThan(5000);

    if (process.env.SAMPLE_PDF_PATH) {
      writeFileSync(process.env.SAMPLE_PDF_PATH, Buffer.from(await blob.arrayBuffer()));
    }
  });

  it('lists prior visit dates in the re-evaluation header only', () => {
    const report = createEmptyReport('re-evaluation', '2026-11-18');
    report.patient.initialEvalDate = '2026-06-01';
    report.patient.lastReEvalDate = '2026-09-10';
    const labels = (r: typeof report) => buildPatientHeader(r).map((i) => i.label);
    expect(labels(report)).toEqual([
      'Evaluation Date',
      'Initial Evaluation Date',
      'Last Re-evaluation Date',
    ]);
    expect(labels({ ...report, reportType: 'initial' })).toEqual(['Evaluation Date']);
  });

  it('migrates a draft saved before the weighted / errors / multi-direction changes', () => {
    const old = JSON.parse(JSON.stringify(createEmptyReport('initial', '2026-08-01')));
    delete old.musculoskeletal;
    delete old.patient.caseHistory;
    old.compass.values.current = { orthostaticIntolerance: 8, vasomotor: 2 };
    old.balance.values.current = {
      mbessDoubleLeg: 10,
      mbessSingleLeg: 6,
      mbessTandem: null,
      fukudaDisplacementDirection: 'Forward',
      fukudaDisplacementDistance: '18 inches',
    };

    const report = migrateReport(old, 1)!;
    // raw 8/10 and 2/6 become weighted 32/40 and 1.7/5
    expect(report.compass.values.current).toEqual({
      orthostaticIntolerance: 32,
      vasomotor: 1.7,
    });
    // points earned become errors
    expect(report.balance.values.current).toEqual({
      mbessDoubleLeg: 0,
      mbessSingleLeg: 4,
      mbessTandem: null,
      fukudaDisplacements: [{ direction: 'Forward', distance: '18 inches' }],
    });
    expect(report.musculoskeletal).toEqual({ findings: '', interpretation: '' });
    expect(report.patient.caseHistory).toBe('');
    expect(migrateReport(null, 1)).toBeNull();
  });

  it('omits blank sections entirely (PDF-03)', async () => {
    const report = createEmptyReport('re-evaluation', '2026-07-15');
    report.patient.patientName = 'Blank Test';
    const blob = await pdf(<ReportPDF report={report} chartImage={null} />).toBlob();
    expect(blob.size).toBeGreaterThan(500);
  });
});
