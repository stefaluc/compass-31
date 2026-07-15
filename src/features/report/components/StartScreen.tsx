import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight } from 'lucide-react';
import { useReportStore } from '../store';

/** RG-01: two large starting buttons select the workflow immediately. */
export function StartScreen() {
  const startReport = useReportStore((s) => s.startReport);
  const report = useReportStore((s) => s.report);
  const setStage = useReportStore((s) => s.setStage);

  return (
    <div className="mx-auto max-w-2xl py-8 sm:py-16">
      <div className="mb-8 sm:mb-10">
        <h1 className="text-2xl font-extrabold sm:text-3xl">
          <span className="text-primary">Patient Evaluation</span> Report
        </h1>
        <p className="mt-2 max-w-xl text-muted-foreground">
          Assemble findings into one polished PDF for the patient and the medical
          record. Nothing is uploaded — all data stays on this device.
        </p>
      </div>

      {report && (
        <Card className="mb-6 border-primary/40">
          <CardContent className="flex flex-col items-center justify-between gap-3 p-4 sm:flex-row">
            <p className="text-sm">
              A{' '}
              <strong>
                {report.reportType === 'initial' ? 'initial evaluation' : 're-evaluation'}
              </strong>{' '}
              report{report.patient.patientName ? ` for ${report.patient.patientName}` : ''} is
              in progress on this device.
            </p>
            <Button onClick={() => setStage('form')}>
              Resume
              <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => startReport('initial')}
          className="group rounded-lg border bg-card p-6 text-left shadow-xs transition-all hover:border-primary/50 hover:shadow-md sm:p-8"
        >
          <p className="mb-3 font-mono text-xs font-semibold tracking-wider text-primary">
            INITIAL
          </p>
          <p className="font-heading text-lg font-bold sm:text-xl">
            Create Initial Evaluation Report
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            First visit: full evaluation with all clinical sections.
          </p>
        </button>
        <button
          type="button"
          onClick={() => startReport('re-evaluation')}
          className="group rounded-lg border bg-card p-6 text-left shadow-xs transition-all hover:border-primary/50 hover:shadow-md sm:p-8"
        >
          <p className="mb-3 font-mono text-xs font-semibold tracking-wider text-primary">
            RE-EVAL
          </p>
          <p className="font-heading text-lg font-bold sm:text-xl">
            Create Re-evaluation Report
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Compare Initial, Last Re-evaluation, and Current findings side by side.
          </p>
        </button>
      </div>

      {report && (
        <p className="mt-4 text-center text-xs text-muted-foreground">
          Starting a new report replaces the in-progress one.
        </p>
      )}
    </div>
  );
}
