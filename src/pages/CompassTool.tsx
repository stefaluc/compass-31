import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Info, FileText, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import {
  COMPASS_QUESTIONNAIRE,
  TOTAL_QUESTIONS,
  domainScore,
  isAnswerInRange,
  isQuestionNA,
  questionsDone,
  type CompassQuestion,
} from '@/features/compass31/questions';
import { useCompassStore } from '@/features/compass31/store';
import {
  COMPASS31_DOMAINS,
  COMPASS31_RAW_MAX,
  COMPASS31_WEIGHTED_MAX,
  compass31DomainWeighted,
  compass31RawTotal,
  compass31WeightedTotal,
  type Compass31DomainScores,
} from '@/lib/clinical/compass31';

function QuestionRow({
  question,
  answer,
  onAnswer,
}: {
  question: CompassQuestion;
  answer: number | null;
  onAnswer: (value: number | null) => void;
}) {
  const answers = useCompassStore((s) => s.answers);
  const isNA = isQuestionNA(question, answers);
  const outOfRange = !isNA && answer != null && !isAnswerInRange(question, answer);

  return (
    <li value={question.id} className="space-y-2 py-3">
      <p className="text-sm sm:text-base">{question.text}</p>
      <div className="flex items-center gap-2">
        <Input
          type="number"
          inputMode="numeric"
          min={1}
          max={question.pointsKey.length}
          disabled={isNA}
          value={isNA ? '' : (answer ?? '')}
          placeholder={isNA ? 'N/A' : `1–${question.pointsKey.length}`}
          aria-label={`Answer for question ${question.id}`}
          aria-invalid={outOfRange || undefined}
          onChange={(e) => {
            const v = e.target.value;
            onAnswer(v === '' ? null : parseInt(v, 10));
          }}
          className="w-24"
        />
        {isNA && (
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Info className="h-3.5 w-3.5 shrink-0" aria-hidden />
            Skipped — depends on question {question.dependsOn}
          </span>
        )}
        {question.type === 'checkmark' && !isNA && (
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Info className="h-3.5 w-3.5 shrink-0" aria-hidden />
            Enter 1 if none checked, 2 if one, 3 if both
          </span>
        )}
      </div>
      {outOfRange && (
        <p className="text-sm font-medium text-destructive">
          This number is not a valid patient answer.
        </p>
      )}
    </li>
  );
}

function CompassTool() {
  const { answers, setAnswer, reset } = useCompassStore();
  const [showScore, setShowScore] = useState(false);

  const domainScores = useMemo(() => {
    const scores: Compass31DomainScores = {};
    for (const d of COMPASS_QUESTIONNAIRE) scores[d.key] = domainScore(d, answers);
    return scores;
  }, [answers]);

  const done = questionsDone(
    COMPASS_QUESTIONNAIRE.flatMap((d) => d.questions),
    answers,
  );
  const rawTotal = compass31RawTotal(domainScores);
  const weightedTotal = compass31WeightedTotal(domainScores);

  const handleReset = () => {
    reset();
    setShowScore(false);
    toast.info('Ready for a new COMPASS-31 survey');
  };

  return (
    <div className="mx-auto max-w-3xl px-4 pb-24 sm:px-6">
      <Progress
        value={(done / TOTAL_QUESTIONS) * 100}
        aria-label="Survey progress"
        className="fixed left-0 top-0 z-50 h-1 w-full rounded-none"
      />
      <div className="py-6">
        <h1 className="text-2xl font-extrabold sm:text-3xl">
          <span className="text-primary">COMPASS-31</span> Scoring
        </h1>
        <p className="mt-1 text-sm text-muted-foreground sm:text-base">
          The Composite Autonomic Symptom Score. Enter the patient's selected
          answer number for each question; domain scores update as you type.
        </p>
      </div>

      <div className="space-y-6">
        {COMPASS_QUESTIONNAIRE.map((domain) => {
          const doneInDomain = questionsDone(domain.questions, answers);
          const complete = doneInDomain === domain.questions.length;
          const score = domainScores[domain.key] ?? 0;

          return (
            <Card key={domain.key}>
              <CardHeader className="flex-row items-center justify-between space-y-0">
                <CardTitle className="text-lg sm:text-xl">{domain.domain}</CardTitle>
                <Badge variant={complete ? 'default' : 'outline'} className="tabular-nums">
                  {score} / {domain.maxScore}
                </Badge>
              </CardHeader>
              <Separator />
              <CardContent>
                <ol className="list-decimal divide-y pl-5 marker:font-semibold marker:text-primary">
                  {domain.questions.map((q) => (
                    <QuestionRow
                      key={q.id}
                      question={q}
                      answer={answers[q.id] ?? null}
                      onAnswer={(v) => setAnswer(q.id, v)}
                    />
                  ))}
                </ol>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
        <Button variant="outline" onClick={handleReset}>
          <RotateCcw className="mr-2 h-4 w-4" aria-hidden />
          New Survey
        </Button>
        <Button size="lg" onClick={() => setShowScore(true)}>
          Calculate Score
        </Button>
      </div>

      <Dialog open={showScore} onOpenChange={setShowScore}>
        <DialogContent className="max-h-[85dvh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Patient's COMPASS-31 Score</DialogTitle>
          </DialogHeader>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Domain</TableHead>
                <TableHead className="text-right">Raw</TableHead>
                <TableHead className="text-right">Weighted</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {COMPASS31_DOMAINS.map((d) => (
                <TableRow key={d.key}>
                  <TableCell>{d.domain}</TableCell>
                  <TableCell className="text-right tabular-nums text-muted-foreground">
                    {domainScores[d.key] ?? 0} / {d.maxScore}
                  </TableCell>
                  <TableCell className="text-right font-medium tabular-nums">
                    {compass31DomainWeighted(d, domainScores[d.key] ?? 0)} / {d.weightedMax}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="space-y-1 rounded-lg bg-muted p-4 text-right">
            <p className="text-xl font-bold tabular-nums">
              Total: {weightedTotal} / {COMPASS31_WEIGHTED_MAX}
            </p>
            <p className="text-sm text-muted-foreground tabular-nums">
              Raw: {rawTotal} / {COMPASS31_RAW_MAX}
            </p>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowScore(false)}>
              Edit Answers
            </Button>
            <Button variant="secondary" nativeButton={false} render={<Link to="/report" />}>
              <FileText className="mr-2 h-4 w-4" aria-hidden />
              Use in Report
            </Button>
            <Button onClick={handleReset}>New Survey</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default CompassTool;
