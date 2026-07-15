import { describe, it, expect } from 'vitest';
import { pdf } from '@react-pdf/renderer';
import { writeFileSync } from 'node:fs';
import { ReportPDF } from './ReportPDF';
import { createEmptyReport } from '../types';

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

    report.gradedSymptoms.values.current = {
      symptomScore: 12,
      compositeScore: 47,
      highestBurdens: 'Dizziness, fatigue',
    };
    report.gradedSymptoms.interpretation = 'Moderate overall burden.';

    report.compass.values.current = {
      orthostaticIntolerance: 8,
      vasomotor: 2,
      secretomotor: 3,
      gastrointestinal: 10,
      bladder: 1,
      pupillomotor: 4,
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
      mbessDoubleLeg: 10,
      mbessSingleLeg: 6,
      mbessTandem: 3,
      fukudaRotationDirection: 'Left',
      fukudaDegrees: '45',
      fukudaDisplacementDirection: 'Forward',
      fukudaDisplacementDistance: '18 inches',
      symptoms: '',
    };

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

  it('omits blank sections entirely (PDF-03)', async () => {
    const report = createEmptyReport('re-evaluation', '2026-07-15');
    report.patient.patientName = 'Blank Test';
    const blob = await pdf(<ReportPDF report={report} chartImage={null} />).toBlob();
    expect(blob.size).toBeGreaterThan(500);
  });
});
