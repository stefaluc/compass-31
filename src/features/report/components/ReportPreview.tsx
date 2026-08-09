import { useMemo, useState } from 'react';
import { saveAs } from 'file-saver';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { FileDown, Loader2, Pencil } from 'lucide-react';
import { useReportStore } from '../store';
import {
  TIME_POINT_LABELS,
  type LeanChartPoint,
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
import { ActiveStandTable } from '@/features/active-stand/ActiveStandTable';
import { HeartRateChart } from '@/features/nasa-lean/components/HeartRateChart';
import { captureChartWhenReady } from '@/features/nasa-lean/chartCapture';
import { applyTrendLine } from '@/lib/clinical/nasaLean';
import { cn } from '@/lib/utils';

function PreviewTable({ table }: { table: CompareTable }) {
  const multi = table.columns.length > 1;
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b text-left text-xs uppercase tracking-wide text-muted-foreground">
            <th className="py-1.5 pr-2 font-medium"></th>
            {table.columns.map((c, i) => (
              <th key={i} className={cn('py-1.5 font-medium', multi ? 'text-center' : 'text-left')}>
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {table.rows.map((row, i) => (
            <tr key={i} className="border-b last:border-0">
              <td className="py-1.5 pr-2 font-medium">{row.label}</td>
              {row.values.map((v, j) => (
                <td
                  key={j}
                  className={cn(
                    'py-1.5',
                    multi ? 'text-center' : 'text-left',
                    row.flags?.[j] && 'font-semibold text-destructive',
                  )}
                >
                  {v ?? '—'}
                  {row.flags?.[j] && ' ▲'}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function PreviewSection({
  title,
  interpretation,
  children,
}: {
  title: string;
  interpretation?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3">
      <h2 className="border-b-2 border-primary pb-1 text-lg font-bold text-primary">
        {title}
      </h2>
      {children}
      {has(interpretation) && (
        <div className="rounded-lg bg-muted/60 p-3 text-sm">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Provider Interpretation
          </p>
          <p className="whitespace-pre-wrap">{interpretation}</p>
        </div>
      )}
    </section>
  );
}

export function ReportPreview({ report }: { report: ReportDocument }) {
  const setStage = useReportStore((s) => s.setStage);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showTrendLine, setShowTrendLine] = useState(false);

  const previewChartData = useMemo(() => {
    const points: LeanChartPoint[] = report.nasaLean.chartData ?? [];
    const sorted = [...points].sort((a, b) => a.time - b.time);
    return showTrendLine ? applyTrendLine(sorted) : sorted.map((p) => ({ ...p }));
  }, [report.nasaLean.chartData, showTrendLine]);

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

  const visibleSpecialTests = report.specialTests.filter(
    (t) => has(t.name) || has(t.findings),
  );

  /**
   * PDF-05: one polished PDF containing everything selected. The NASA Lean
   * graph is captured from the preview DOM at generation time so the PDF
   * matches exactly what is previewed.
   */
  const generatePdf = async () => {
    setIsGenerating(true);
    try {
      let chartImage: string | null = null;
      if (leanSection.chartData?.length) {
        chartImage = await captureChartWhenReady('.report-lean-chart .recharts-wrapper svg', {
          backgroundColor: 'white',
          scale: 2,
          quality: 0.95,
          format: 'png',
        });
        if (!chartImage) {
          toast.warning('Could not capture the NASA Lean graph — generating without it');
        }
      }

      // The PDF engine is heavy, so it loads only when a PDF is generated.
      const [{ pdf }, { ReportPDF }] = await Promise.all([
        import('@react-pdf/renderer'),
        import('../pdf/ReportPDF'),
      ]);
      const blob = await pdf(<ReportPDF report={report} chartImage={chartImage} />).toBlob();
      const name = report.patient.patientName.trim().replace(/\s+/g, '-') || 'patient';
      const kind = report.reportType === 'initial' ? 'Initial-Evaluation' : 'Re-evaluation';
      saveAs(blob, `${kind}-Report-${name}-${report.patient.evaluationDate}.pdf`);
      toast.success('PDF report generated');
    } catch (err) {
      console.error('PDF generation failed:', err);
      toast.error('Failed to generate the PDF report');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-4 pb-24">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-xl font-extrabold sm:text-2xl">Report Preview</h1>
          <p className="text-sm text-muted-foreground">
            This is exactly what the PDF will contain. Blank fields are omitted.
          </p>
        </div>
      </div>

      <Card>
        <CardContent className="space-y-8 p-5 sm:p-8">
          {/* Header */}
          <div>
            <h2 className="text-2xl font-extrabold">
              {report.reportType === 'initial'
                ? 'Initial Patient Evaluation'
                : 'Patient Re-evaluation'}
            </h2>
            <p className="text-sm text-muted-foreground">Autonomic Compass</p>
            <Separator className="my-4" />
            <dl className="grid grid-cols-1 gap-x-8 gap-y-1 text-sm sm:grid-cols-2">
              {header.map((item) => (
                <div key={item.label} className="flex gap-2">
                  <dt className="font-semibold">{item.label}:</dt>
                  <dd>{item.value}</dd>
                </div>
              ))}
            </dl>
          </div>

          {graded && (
            <PreviewSection
              title="Graded Symptom Survey"
              interpretation={report.gradedSymptoms.interpretation}
            >
              <PreviewTable table={graded} />
            </PreviewSection>
          )}

          {compass && (
            <PreviewSection title="COMPASS-31" interpretation={report.compass.interpretation}>
              <PreviewTable table={compass.table} />
              <div className="flex flex-wrap gap-3">
                {compass.totals.map((t) => (
                  <div key={t.timePoint} className="rounded-lg bg-muted p-3 text-sm">
                    {isReEval && (
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        {TIME_POINT_LABELS[t.timePoint]}
                      </p>
                    )}
                    <p className="font-bold tabular-nums">Total: {t.weighted} / 100</p>
                  </div>
                ))}
              </div>
            </PreviewSection>
          )}

          {mental && (
            <PreviewSection
              title="Mental Health and Sleep Screening"
              interpretation={report.mentalHealth.interpretation}
            >
              <PreviewTable table={mental} />
            </PreviewSection>
          )}

          {showLean && (
            <PreviewSection
              title="NASA Lean Test"
              interpretation={leanSection.interpretation}
            >
              {lean && <PreviewTable table={lean} />}
              {leanSection.medicationAffectingHR != null && (
                <p className="text-sm">
                  <span className="font-medium">
                    Medication that may affect heart rate:
                  </span>{' '}
                  {leanSection.medicationAffectingHR === 'yes'
                    ? `Yes${has(leanSection.medications) ? ` — ${leanSection.medications}` : ''}`
                    : 'No'}
                </p>
              )}
              {leanSection.chartData && leanSection.chartData.length > 0 && (
                <div className="report-lean-chart">
                  <HeartRateChart
                    chartData={previewChartData}
                    showTrendLine={showTrendLine}
                    onToggleTrendLine={() => setShowTrendLine((v) => !v)}
                  />
                </div>
              )}
              {leanSection.symptomEntries.length > 0 && (
                <div>
                  <p className="mb-1 text-sm font-medium">Symptoms / Observations</p>
                  <table className="w-full max-w-md border-collapse text-sm">
                    <tbody>
                      {leanSection.symptomEntries
                        .filter((e) => has(e.text))
                        .map((e, i) => (
                          <tr key={i} className="border-b last:border-0">
                            <td className="py-1 pr-4 font-medium tabular-nums">{e.time}</td>
                            <td className="py-1">{e.text}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}
              {has(leanSection.manualNotes) && (
                <p className="whitespace-pre-wrap text-sm">{leanSection.manualNotes}</p>
              )}
            </PreviewSection>
          )}

          {showActiveStand && (
            <PreviewSection
              title="Active Stand Test"
              interpretation={report.activeStand.interpretation}
            >
              {standTables.map(({ timePoint, values }) => (
                <div key={timePoint}>
                  {isReEval && (
                    <p className="mb-1 text-sm font-semibold text-muted-foreground">
                      {TIME_POINT_LABELS[timePoint]}
                    </p>
                  )}
                  <ActiveStandTable values={values} readOnly />
                </div>
              ))}
            </PreviewSection>
          )}

          {cognitive && (
            <PreviewSection
              title="Cognitive Testing"
              interpretation={report.cognitive.interpretation}
            >
              <PreviewTable table={cognitive} />
            </PreviewSection>
          )}

          {balance && (
            <PreviewSection
              title="Balance and Coordination"
              interpretation={report.balance.interpretation}
            >
              <PreviewTable table={balance} />
            </PreviewSection>
          )}

          {ocular && (
            <PreviewSection title="Ocular Testing" interpretation={report.ocular.interpretation}>
              <PreviewTable table={ocular} />
            </PreviewSection>
          )}

          {report.reportType === 'initial' && report.beighton.score != null && (
            <PreviewSection
              title="Beighton Score"
              interpretation={report.beighton.interpretation}
            >
              <p className="text-sm">
                <span className="font-medium">Beighton Score:</span> {report.beighton.score} / 9
              </p>
            </PreviewSection>
          )}

          {cranialNerveVisible(report) && (
            <PreviewSection title="Cranial Nerve Examination">
              <p className="text-sm">
                <span className="font-medium">Overall result:</span>{' '}
                {report.cranialNerves.result}
              </p>
              {report.cranialNerves.result === 'Abnormal' && (
                <>
                  {has(report.cranialNerves.nervesInvolved) && (
                    <p className="text-sm">
                      <span className="font-medium">Cranial nerve(s) involved:</span>{' '}
                      {report.cranialNerves.nervesInvolved}
                    </p>
                  )}
                  {has(report.cranialNerves.findings) && (
                    <p className="whitespace-pre-wrap text-sm">
                      <span className="font-medium">Findings:</span>{' '}
                      {report.cranialNerves.findings}
                    </p>
                  )}
                  {has(report.cranialNerves.interpretation) && (
                    <div className="rounded-lg bg-muted/60 p-3 text-sm">
                      <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Provider Interpretation
                      </p>
                      <p className="whitespace-pre-wrap">
                        {report.cranialNerves.interpretation}
                      </p>
                    </div>
                  )}
                </>
              )}
            </PreviewSection>
          )}

          {(visibleSpecialTests.length > 0 || has(report.generalNotes)) && (
            <PreviewSection title="Special Tests and Additional Notes">
              {visibleSpecialTests.map((t) => (
                <div key={t.id} className="space-y-1 text-sm">
                  <p className="font-semibold">{t.name || 'Special Test'}</p>
                  {has(t.findings) && <p className="whitespace-pre-wrap">{t.findings}</p>}
                  {has(t.interpretation) && (
                    <p className="whitespace-pre-wrap text-muted-foreground">
                      {t.interpretation}
                    </p>
                  )}
                </div>
              ))}
              {has(report.generalNotes) && (
                <p className="whitespace-pre-wrap text-sm">{report.generalNotes}</p>
              )}
            </PreviewSection>
          )}

          {recommendations.length > 0 && (
            <PreviewSection title="Recommendations and Next Steps">
              <dl className="space-y-1 text-sm">
                {recommendations.map((item) => (
                  <div key={item.label} className="flex flex-wrap gap-2">
                    <dt className="font-semibold">{item.label}:</dt>
                    <dd>{item.value}</dd>
                  </div>
                ))}
              </dl>
            </PreviewSection>
          )}

          <p className="text-xs text-muted-foreground">
            Automated score labels and color flags are screening support, not diagnoses.
            Clinical interpretation rests with the treating provider.
          </p>
        </CardContent>
      </Card>

      {/* PDF-02: edit without losing data. */}
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-4xl gap-3 px-4 py-3 sm:px-6">
          <Button variant="outline" size="lg" className="flex-1" onClick={() => setStage('form')}>
            <Pencil className="mr-2 h-4 w-4" aria-hidden />
            Edit Report
          </Button>
          <Button size="lg" className="flex-1" onClick={generatePdf} disabled={isGenerating}>
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
                Generating…
              </>
            ) : (
              <>
                <FileDown className="mr-2 h-4 w-4" aria-hidden />
                Generate PDF
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
