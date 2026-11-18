import { Document, Page, Text, View, Image, StyleSheet } from '@react-pdf/renderer';
import {
  TIME_POINT_LABELS,
  type ActiveStandValues,
  type ReportDocument,
} from '../types';
import {
  activeStandTables,
  buildBalance,
  buildCognitive,
  buildCompass,
  buildGradedSymptoms,
  buildMentalHealth,
  buildNasaLean,
  buildOcular,
  buildPatientHeader,
  buildRecommendations,
  cranialNerveVisible,
  has,
  type CompareTable,
} from '../reportContent';
import { changeFromBaseline, standFlags } from '@/lib/clinical/activeStand';

const MAROON = '#7A1F2B';
const RED = '#DC2626';
const ORANGE = '#D97706';

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 36,
    fontSize: 10,
    fontFamily: 'Helvetica',
    color: '#1A1A1A',
  },
  headerTitle: { fontSize: 18, fontFamily: 'Helvetica-Bold', color: MAROON },
  headerBrand: { fontSize: 10, color: '#666666', marginBottom: 8 },
  headerRule: { borderBottom: `2 solid ${MAROON}`, marginBottom: 10 },
  headerGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  headerItem: { width: '50%', flexDirection: 'row', marginBottom: 2 },
  headerLabel: { fontFamily: 'Helvetica-Bold' },
  section: { marginTop: 14 },
  sectionTitle: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: MAROON,
    borderBottom: `1 solid ${MAROON}`,
    paddingBottom: 2,
    marginBottom: 6,
  },
  table: { marginBottom: 4 },
  tr: { flexDirection: 'row', borderBottom: '0.5 solid #E5E5E5', paddingVertical: 2.5 },
  trHead: { flexDirection: 'row', borderBottom: '1 solid #BBBBBB', paddingVertical: 2.5 },
  thLabel: { flex: 2.2, fontFamily: 'Helvetica-Bold', fontSize: 8, color: '#666666' },
  th: {
    flex: 1,
    fontFamily: 'Helvetica-Bold',
    fontSize: 8,
    color: '#666666',
    textAlign: 'center',
  },
  tdLabel: { flex: 2.2, fontFamily: 'Helvetica-Bold' },
  td: { flex: 1, textAlign: 'center' },
  tdFlag: { flex: 1, textAlign: 'center', color: RED, fontFamily: 'Helvetica-Bold' },
  interpretation: {
    backgroundColor: '#F6F2F3',
    padding: 6,
    marginTop: 4,
    borderLeft: `2 solid ${MAROON}`,
  },
  interpretationLabel: {
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
    color: '#666666',
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  chart: { marginTop: 6, alignSelf: 'center', width: 460, height: 260 },
  bodyText: { marginBottom: 2 },
  bold: { fontFamily: 'Helvetica-Bold' },
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 36,
    right: 36,
    borderTop: '0.5 solid #CCCCCC',
    paddingTop: 5,
    fontSize: 7,
    color: '#777777',
    textAlign: 'center',
  },
  disclaimer: { marginTop: 16, fontSize: 7.5, color: '#777777' },
  subLabel: { fontFamily: 'Helvetica-Bold', fontSize: 9, marginTop: 6, marginBottom: 3 },
});

function PdfTable({ table }: { table: CompareTable }) {
  const multi = table.columns.length > 1;
  return (
    <View style={styles.table}>
      {multi && (
        <View style={styles.trHead}>
          <Text style={styles.thLabel}> </Text>
          {table.columns.map((c, i) => (
            <Text key={i} style={styles.th}>
              {c}
            </Text>
          ))}
        </View>
      )}
      {table.rows.map((row, i) => (
        <View key={i} style={styles.tr} wrap={false}>
          <Text style={styles.tdLabel}>{row.label}</Text>
          {row.values.map((v, j) => (
            <Text key={j} style={row.flags?.[j] ? styles.tdFlag : styles.td}>
              {v != null ? `${v}${row.flags?.[j] ? ' *' : ''}` : '-'}
            </Text>
          ))}
        </View>
      ))}
    </View>
  );
}

function Interpretation({ text }: { text: string }) {
  if (!has(text)) return null;
  return (
    <View style={styles.interpretation} wrap={false}>
      <Text style={styles.interpretationLabel}>Provider Interpretation</Text>
      <Text>{text}</Text>
    </View>
  );
}

function Section({
  title,
  interpretation,
  children,
}: {
  title: string;
  interpretation?: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
      {interpretation != null && <Interpretation text={interpretation} />}
    </View>
  );
}

function PdfActiveStandTable({ values }: { values: ActiveStandValues }) {
  const flags = standFlags(values.baseline, values.minutes);
  const readingRow = (
    label: string,
    reading: ActiveStandValues['baseline'],
    flag: 'red' | 'orange' | null,
    withChange: boolean,
  ) => {
    const change = withChange ? changeFromBaseline(values.baseline, reading) : null;
    const cell = (v: number | null, delta: number | null) =>
      v != null
        ? `${v}${delta != null ? ` (${delta > 0 ? '+' : ''}${delta})` : ''}`
        : '-';
    const flagColor = flag === 'red' ? RED : flag === 'orange' ? ORANGE : undefined;
    return (
      <View style={styles.tr} wrap={false} key={label}>
        <Text style={[styles.tdLabel, flagColor ? { color: flagColor } : {}]}>
          {label}
          {flag ? ` (BP drop${flag === 'orange' ? ', delayed' : ''})` : ''}
        </Text>
        <Text style={[styles.td, flagColor ? { color: flagColor } : {}]}>
          {cell(reading.systolic, change?.systolicChange ?? null)}
        </Text>
        <Text style={[styles.td, flagColor ? { color: flagColor } : {}]}>
          {cell(reading.diastolic, change?.diastolicChange ?? null)}
        </Text>
        <Text style={styles.td}>{cell(reading.heartRate, change?.heartRateChange ?? null)}</Text>
        <Text style={[styles.td, { flex: 1.6, textAlign: 'left' }]}>
          {reading.symptoms || ''}
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.table}>
      <View style={styles.trHead}>
        <Text style={styles.thLabel}> </Text>
        <Text style={styles.th}>Systolic</Text>
        <Text style={styles.th}>Diastolic</Text>
        <Text style={styles.th}>HR</Text>
        <Text style={[styles.th, { flex: 1.6, textAlign: 'left' }]}>Symptoms</Text>
      </View>
      {readingRow('Supine baseline (min 5)', values.baseline, null, false)}
      {values.minutes.map((m, i) => readingRow(`Standing min ${i + 1}`, m, flags[i], true))}
    </View>
  );
}

export function ReportPDF({
  report,
  chartImage,
}: {
  report: ReportDocument;
  chartImage: string | null;
}) {
  const header = buildPatientHeader(report);
  const graded = buildGradedSymptoms(report);
  const compass = buildCompass(report);
  const mental = buildMentalHealth(report);
  const lean = buildNasaLean(report);
  const cognitive = buildCognitive(report);
  const balance = buildBalance(report);
  const ocular = buildOcular(report);
  const standTables = activeStandTables(report);
  const recommendations = buildRecommendations(report);
  const isReEval = report.reportType === 're-evaluation';
  const leanSection = report.nasaLean;

  const showLean =
    !!lean ||
    leanSection.symptomEntries.length > 0 ||
    has(leanSection.manualNotes) ||
    has(leanSection.interpretation) ||
    leanSection.medicationAffectingHR != null;

  const showActiveStand =
    report.activeStand.performed === 'performed' &&
    (standTables.length > 0 || has(report.activeStand.interpretation));

  const visibleSpecialTests = report.specialTests.filter((t) => has(t.name) || has(t.findings));

  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        {/* Header */}
        <Text style={styles.headerTitle}>
          {isReEval ? 'Patient Re-evaluation' : 'Initial Patient Evaluation'}
        </Text>
        <Text style={styles.headerBrand}>Autonomic Compass</Text>
        <View style={styles.headerRule} />
        <View style={styles.headerGrid}>
          {header.map((item) => (
            <View key={item.label} style={styles.headerItem}>
              <Text style={styles.headerLabel}>{item.label}: </Text>
              <Text>{item.value}</Text>
            </View>
          ))}
        </View>
        {has(report.patient.caseHistory) && (
          <View style={{ marginTop: 6 }}>
            <Text style={styles.subLabel}>Brief Case History</Text>
            <Text>{report.patient.caseHistory}</Text>
          </View>
        )}

        {graded && (
          <Section title="Graded Symptom Survey" interpretation={report.gradedSymptoms.interpretation}>
            <PdfTable table={graded} />
          </Section>
        )}

        {compass && (
          <Section title="COMPASS-31" interpretation={report.compass.interpretation}>
            <PdfTable table={compass.table} />
            {compass.totals.map((t) => (
              <Text key={t.timePoint} style={styles.bodyText}>
                {isReEval ? `${TIME_POINT_LABELS[t.timePoint]}: ` : ''}
                <Text style={styles.bold}>Total {t.weighted} / 100</Text>
              </Text>
            ))}
          </Section>
        )}

        {mental && (
          <Section
            title="Mental Health and Sleep Screening"
            interpretation={report.mentalHealth.interpretation}
          >
            <PdfTable table={mental} />
          </Section>
        )}

        {showLean && (
          <Section title="NASA Lean Test" interpretation={leanSection.interpretation}>
            {lean && <PdfTable table={lean} />}
            {leanSection.medicationAffectingHR != null && (
              <Text style={styles.bodyText}>
                <Text style={styles.bold}>Medication that may affect heart rate: </Text>
                {leanSection.medicationAffectingHR === 'yes'
                  ? `Yes${has(leanSection.medications) ? ` — ${leanSection.medications}` : ''}`
                  : 'No'}
              </Text>
            )}
            {chartImage && <Image src={chartImage} style={styles.chart} />}
            {leanSection.symptomEntries.filter((e) => has(e.text)).length > 0 && (
              <View>
                <Text style={styles.subLabel}>Symptoms / Observations</Text>
                {leanSection.symptomEntries
                  .filter((e) => has(e.text))
                  .map((e, i) => (
                    <View key={i} style={styles.tr} wrap={false}>
                      <Text style={[styles.tdLabel, { flex: 0.5 }]}>{e.time}</Text>
                      <Text style={[styles.td, { flex: 3, textAlign: 'left' }]}>{e.text}</Text>
                    </View>
                  ))}
              </View>
            )}
            {has(leanSection.manualNotes) && (
              <Text style={[styles.bodyText, { marginTop: 4 }]}>{leanSection.manualNotes}</Text>
            )}
          </Section>
        )}

        {showActiveStand && (
          <Section title="Active Stand Test" interpretation={report.activeStand.interpretation}>
            {standTables.map(({ timePoint, values }) => (
              <View key={timePoint}>
                {isReEval && <Text style={styles.subLabel}>{TIME_POINT_LABELS[timePoint]}</Text>}
                <PdfActiveStandTable values={values} />
              </View>
            ))}
            <Text style={{ fontSize: 7, color: '#777777' }}>
              Values in parentheses are changes from supine baseline. "BP drop" marks a
              systolic drop of 20 mmHg or more, or a diastolic drop of 10 mmHg or more
              (red: minutes 1-3; orange: first appearing minutes 4-5). Visual flags are
              screening support, not a diagnosis.
            </Text>
          </Section>
        )}

        {cognitive && (
          <Section title="Cognitive Testing" interpretation={report.cognitive.interpretation}>
            <PdfTable table={cognitive} />
          </Section>
        )}

        {balance && (
          <Section title="Balance and Coordination" interpretation={report.balance.interpretation}>
            <PdfTable table={balance} />
          </Section>
        )}

        {ocular && (
          <Section title="Ocular Testing" interpretation={report.ocular.interpretation}>
            <PdfTable table={ocular} />
          </Section>
        )}

        {!isReEval && report.beighton.score != null && (
          <Section title="Beighton Score" interpretation={report.beighton.interpretation}>
            <Text style={styles.bodyText}>
              <Text style={styles.bold}>Beighton Score: </Text>
              {report.beighton.score} / 9
            </Text>
          </Section>
        )}

        {cranialNerveVisible(report) && (
          <Section title="Cranial Nerve Examination">
            <Text style={styles.bodyText}>
              <Text style={styles.bold}>Overall result: </Text>
              {report.cranialNerves.result}
            </Text>
            {report.cranialNerves.result === 'Abnormal' && (
              <>
                {has(report.cranialNerves.nervesInvolved) && (
                  <Text style={styles.bodyText}>
                    <Text style={styles.bold}>Cranial nerve(s) involved: </Text>
                    {report.cranialNerves.nervesInvolved}
                  </Text>
                )}
                {has(report.cranialNerves.findings) && (
                  <Text style={styles.bodyText}>
                    <Text style={styles.bold}>Findings: </Text>
                    {report.cranialNerves.findings}
                  </Text>
                )}
                <Interpretation text={report.cranialNerves.interpretation} />
              </>
            )}
          </Section>
        )}

        {(has(report.musculoskeletal.findings) ||
          has(report.musculoskeletal.interpretation)) && (
          <Section
            title="Musculoskeletal Findings"
            interpretation={report.musculoskeletal.interpretation}
          >
            {has(report.musculoskeletal.findings) && (
              <Text style={styles.bodyText}>{report.musculoskeletal.findings}</Text>
            )}
          </Section>
        )}

        {(visibleSpecialTests.length > 0 || has(report.generalNotes)) && (
          <Section title="Special Tests and Additional Notes">
            {visibleSpecialTests.map((t) => (
              <View key={t.id} style={{ marginBottom: 5 }} wrap={false}>
                <Text style={styles.bold}>{t.name || 'Special Test'}</Text>
                {has(t.findings) && <Text>{t.findings}</Text>}
                {has(t.interpretation) && (
                  <Text style={{ color: '#555555' }}>{t.interpretation}</Text>
                )}
              </View>
            ))}
            {has(report.generalNotes) && <Text>{report.generalNotes}</Text>}
          </Section>
        )}

        {recommendations.length > 0 && (
          <Section title="Recommendations and Next Steps">
            {recommendations.map((item) => (
              <Text key={item.label} style={styles.bodyText}>
                <Text style={styles.bold}>{item.label}: </Text>
                {item.value}
              </Text>
            ))}
          </Section>
        )}

        <Text style={styles.disclaimer}>
          Values marked with * fall outside clinic-defined display thresholds. Automated
          score labels and color flags in this report are screening or visual-support
          outputs, not diagnoses. Clinical interpretation rests with the treating
          provider.
        </Text>

        <Text
          style={styles.footer}
          fixed
          render={({ pageNumber, totalPages }) =>
            `Autonomic Compass — generated ${new Date().toLocaleDateString()} — page ${pageNumber} of ${totalPages}`
          }
        />
      </Page>
    </Document>
  );
}
