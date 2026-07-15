import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import {
  ClipboardList,
  HeartPulse,
  PersonStanding,
  FileText,
  ArrowRight,
} from 'lucide-react';

const TOOLS = [
  {
    to: '/compass-31',
    title: 'COMPASS-31 Scoring',
    description:
      'Score the Composite Autonomic Symptom Score questionnaire across all six symptom domains.',
    icon: ClipboardList,
  },
  {
    to: '/nasa-lean',
    title: 'NASA Lean Test',
    description:
      'Guide and document a 10-minute lean test with timed heart-rate entries, symptoms, and a printable graph.',
    icon: HeartPulse,
  },
  {
    to: '/active-stand',
    title: 'Active Stand Test',
    description:
      'Document supine baseline and five standing minutes with automatic change-from-baseline calculations.',
    icon: PersonStanding,
  },
  {
    to: '/report',
    title: 'Patient Evaluation Report',
    description:
      'Assemble initial-evaluation or re-evaluation findings into one polished, chart-ready PDF.',
    icon: FileText,
  },
];

/** HP-01/HP-02/HP-03: the platform home page. */
function Home() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-16">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-3xl font-extrabold sm:text-5xl">
          Autonomic Compass
        </h1>
        <p className="mt-4 text-base text-muted-foreground sm:text-lg">
          A clinical tool designed to help healthcare providers score autonomic
          symptom questionnaires, document orthostatic testing, visualize
          patient findings, and monitor changes over time.
        </p>
      </div>

      <div className="mt-10 grid gap-4 sm:mt-14 sm:grid-cols-2">
        {TOOLS.map((tool) => (
          <Link key={tool.to} to={tool.to} className="group">
            <Card className="h-full transition-all group-hover:border-primary/40 group-hover:shadow-md">
              <CardContent className="flex h-full flex-col gap-3 p-6">
                <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <tool.icon className="h-6 w-6" aria-hidden />
                </span>
                <h2 className="flex items-center gap-2 text-lg font-bold">
                  {tool.title}
                  <ArrowRight
                    className="h-4 w-4 shrink-0 text-primary opacity-0 transition-all group-hover:translate-x-1 group-hover:opacity-100"
                    aria-hidden
                  />
                </h2>
                <p className="text-sm text-muted-foreground">{tool.description}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <p className="mt-10 text-center text-xs text-muted-foreground">
        Score labels and color flags are screening support only and are not a
        diagnosis. Clinical interpretation always rests with the provider.
      </p>
    </div>
  );
}

export default Home;
