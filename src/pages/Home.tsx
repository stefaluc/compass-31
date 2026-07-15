import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useCompassStore } from '@/features/compass31/store';
import { useNasaLeanStore } from '@/features/nasa-lean/store';
import { useActiveStandStore } from '@/features/active-stand/store';
import { useReportStore } from '@/features/report/store';
import {
  COMPASS_QUESTIONNAIRE,
  TOTAL_QUESTIONS,
  questionsDone,
} from '@/features/compass31/questions';

const TOOLS = [
  {
    to: '/compass-31',
    code: 'C-31',
    title: 'COMPASS-31 Scoring',
    description:
      'Composite Autonomic Symptom Score across all six symptom domains.',
  },
  {
    to: '/nasa-lean',
    code: 'LEAN',
    title: 'NASA Lean Test',
    description:
      'Guided 10-minute lean test with timed heart-rate entries and a printable graph.',
  },
  {
    to: '/active-stand',
    code: 'STND',
    title: 'Active Stand Test',
    description:
      'Supine baseline and five standing minutes with automatic change-from-baseline.',
  },
  {
    to: '/report',
    code: 'RPRT',
    title: 'Patient Evaluation Report',
    description: 'Assemble findings into one polished, chart-ready PDF.',
  },
];

const DAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

function todayStamp(): string {
  const now = new Date();
  return `${DAYS[now.getDay()]} ${now.toISOString().split('T')[0]}`;
}

interface Draft {
  key: string;
  to: string;
  title: string;
  meta: string;
  action: string;
}

/** Work saved on this device by the Zustand persist stores. */
function useDrafts(): Draft[] {
  const answers = useCompassStore((s) => s.answers);
  const leanPhase = useNasaLeanStore((s) => s.phase);
  const leanPatient = useNasaLeanStore((s) => s.patientName);
  const standPatient = useActiveStandStore((s) => s.patientName);
  const standValues = useActiveStandStore((s) => s.values);
  const report = useReportStore((s) => s.report);

  const drafts: Draft[] = [];

  if (report) {
    const type =
      report.reportType === 'initial' ? 'Initial evaluation' : 'Re-evaluation';
    drafts.push({
      key: 'report',
      to: '/report',
      title: `${type} report${report.patient.patientName ? ` — ${report.patient.patientName}` : ''}`,
      meta: 'RPRT · in progress',
      action: 'Resume',
    });
  }

  const answered = questionsDone(
    COMPASS_QUESTIONNAIRE.flatMap((d) => d.questions),
    answers,
  );
  if (answered > 0) {
    drafts.push({
      key: 'compass',
      to: '/compass-31',
      title: `COMPASS-31 survey`,
      meta: `C-31 · ${answered}/${TOTAL_QUESTIONS} answered`,
      action: answered === TOTAL_QUESTIONS ? 'Open' : 'Resume',
    });
  }

  if (leanPhase !== 'setup' || leanPatient.trim() !== '') {
    const phaseLabel =
      leanPhase === 'setup'
        ? 'setup'
        : leanPhase === 'supine'
          ? 'supine phase'
          : leanPhase === 'standing'
            ? 'standing phase'
            : 'complete';
    drafts.push({
      key: 'lean',
      to: '/nasa-lean',
      title: `NASA Lean Test${leanPatient ? ` — ${leanPatient}` : ''}`,
      meta: `LEAN · ${phaseLabel}`,
      action: leanPhase === 'complete' ? 'Open' : 'Resume',
    });
  }

  const standStarted =
    standPatient.trim() !== '' ||
    [standValues.baseline, ...standValues.minutes].some(
      (r) =>
        r.systolic != null ||
        r.diastolic != null ||
        r.heartRate != null ||
        r.symptoms.trim() !== '',
    );
  if (standStarted) {
    drafts.push({
      key: 'stand',
      to: '/active-stand',
      title: `Active Stand Test${standPatient ? ` — ${standPatient}` : ''}`,
      meta: 'STND · in progress',
      action: 'Resume',
    });
  }

  return drafts;
}

function Panel({ label, children }: { label: string; children: ReactNode }) {
  return (
    <section className="overflow-hidden rounded-lg bg-card ring-1 ring-foreground/10">
      <h2 className="border-b px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
        {label}
      </h2>
      {children}
    </section>
  );
}

/** HP-01/HP-02/HP-03: the platform home page, laid out as a daily workbench. */
function Home() {
  const drafts = useDrafts();

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <div className="mb-6 flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <h1 className="text-2xl font-extrabold sm:text-3xl">Workbench</h1>
          <p className="mt-1 max-w-xl text-sm text-muted-foreground">
            Score autonomic symptom questionnaires, document orthostatic
            testing, and assemble patient evaluation reports.
          </p>
        </div>
        <span className="font-mono text-xs tabular-nums text-muted-foreground">
          {todayStamp()}
        </span>
      </div>

      <div className="grid items-start gap-5 lg:grid-cols-[1.62fr_1fr]">
        <Panel label="Instruments">
          {TOOLS.map((tool) => (
            <Link
              key={tool.to}
              to={tool.to}
              className="group grid grid-cols-[3.5rem_minmax(0,1fr)_auto] items-center gap-4 border-b px-5 py-4 transition-colors last:border-b-0 hover:bg-muted/50"
            >
              <span className="font-mono text-xs font-semibold tracking-wider text-primary">
                {tool.code}
              </span>
              <span>
                <span className="block font-heading text-[15px] font-bold">
                  {tool.title}
                </span>
                <span className="mt-0.5 block text-[13px] leading-snug text-muted-foreground">
                  {tool.description}
                </span>
              </span>
              <span
                className="font-mono text-sm text-muted-foreground/60 transition-colors group-hover:text-primary"
                aria-hidden
              >
                &rarr;
              </span>
            </Link>
          ))}
        </Panel>

        <Panel label="On this device">
          {drafts.length === 0 ? (
            <p className="px-5 py-4 text-sm text-muted-foreground">
              Nothing in progress. Surveys, tests, and reports you start save
              here automatically.
            </p>
          ) : (
            drafts.map((draft) => (
              <div key={draft.key} className="border-b px-5 py-3.5 last:border-b-0">
                <p className="flex items-baseline justify-between gap-3 text-sm font-semibold">
                  <span className="truncate">{draft.title}</span>
                  <Link
                    to={draft.to}
                    className="shrink-0 text-xs font-medium text-primary underline-offset-2 hover:underline"
                  >
                    {draft.action}
                  </Link>
                </p>
                <p className="mt-0.5 font-mono text-[11px] tabular-nums text-muted-foreground/80">
                  {draft.meta}
                </p>
              </div>
            ))
          )}
          <p className="border-t bg-muted/40 px-5 py-3 text-xs text-muted-foreground">
            Drafts save to this device as you type. Nothing is uploaded.
          </p>
        </Panel>
      </div>

      <p className="mt-8 text-xs text-muted-foreground">
        Score labels and color flags are screening support only and are not a
        diagnosis. Clinical interpretation always rests with the provider.
      </p>
    </div>
  );
}

export default Home;
