import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Download } from 'lucide-react';
import { useReportStore } from '../../store';
import {
  activeTimePoints,
  emptyActiveStandValues,
  TIME_POINT_LABELS,
  type ActiveStandReading,
  type ReportDocument,
  type TimePointKey,
} from '../../types';
import { SectionShell } from '../SectionShell';
import { ActiveStandTable } from '@/features/active-stand/ActiveStandTable';
import { useActiveStandStore } from '@/features/active-stand/store';

export function ActiveStandReportSection({ report }: { report: ReportDocument }) {
  const updateSection = useReportStore((s) => s.updateSection);
  const standStore = useActiveStandStore();
  const timePoints = activeTimePoints(report.reportType);
  const section = report.activeStand;

  const toolHasData =
    Object.values(standStore.values.baseline).some((v) => v != null && v !== '') ||
    standStore.values.minutes.some((m) =>
      Object.values(m).some((v) => v != null && v !== ''),
    );

  const transferFromTool = () => {
    updateSection('activeStand', (cur) => ({
      ...cur,
      performed: 'performed',
      values: { ...cur.values, current: structuredClone(standStore.values) },
    }));
    toast.success('Active Stand results transferred from the tool');
  };

  const setReading = (
    tp: TimePointKey,
    target: 'baseline' | number,
    patch: Partial<ActiveStandReading>,
  ) =>
    updateSection('activeStand', (cur) => {
      const existing = cur.values[tp] ?? emptyActiveStandValues();
      const next =
        target === 'baseline'
          ? { ...existing, baseline: { ...existing.baseline, ...patch } }
          : {
              ...existing,
              minutes: existing.minutes.map((m, i) =>
                i === target ? { ...m, ...patch } : m,
              ),
            };
      return { ...cur, values: { ...cur.values, [tp]: next } };
    });

  return (
    <SectionShell
      title="Active Stand Test"
      subtitle="Optional — use when clinically indicated"
      hasContent={section.performed != null || !!section.interpretation}
      interpretation={section.interpretation}
      onInterpretationChange={(v) =>
        updateSection('activeStand', (cur) => ({ ...cur, interpretation: v }))
      }
    >
      <div className="space-y-2">
        <Label>Was the Active Stand Test performed?</Label>
        <RadioGroup
          value={section.performed ?? ''}
          onValueChange={(v) =>
            updateSection('activeStand', (cur) => ({
              ...cur,
              performed: (v as 'performed' | 'not-performed') || null,
            }))
          }
          className="flex gap-6"
        >
          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <RadioGroupItem value="performed" /> Performed
          </label>
          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <RadioGroupItem value="not-performed" /> Not Performed
          </label>
        </RadioGroup>
      </div>

      {section.performed === 'performed' && (
        <>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={transferFromTool}
            disabled={!toolHasData}
          >
            <Download className="mr-2 h-4 w-4" aria-hidden />
            {toolHasData
              ? 'Transfer from Active Stand tool'
              : 'No data in the Active Stand tool yet'}
          </Button>

          {timePoints.length === 1 ? (
            <ActiveStandTable
              values={section.values.current ?? emptyActiveStandValues()}
              onBaselineChange={(patch) => setReading('current', 'baseline', patch)}
              onMinuteChange={(i, patch) => setReading('current', i, patch)}
            />
          ) : (
            <Tabs defaultValue="current">
              <TabsList>
                {timePoints.map((tp) => (
                  <TabsTrigger key={tp} value={tp}>
                    {TIME_POINT_LABELS[tp]}
                  </TabsTrigger>
                ))}
              </TabsList>
              {timePoints.map((tp) => (
                <TabsContent key={tp} value={tp}>
                  <ActiveStandTable
                    values={section.values[tp] ?? emptyActiveStandValues()}
                    onBaselineChange={(patch) => setReading(tp, 'baseline', patch)}
                    onMinuteChange={(i, patch) => setReading(tp, i, patch)}
                  />
                </TabsContent>
              ))}
            </Tabs>
          )}

          {report.reportType === 're-evaluation' && (
            <div className="space-y-2">
              <Label>Include prior tables in the PDF (current is always included)</Label>
              <div className="flex gap-6">
                <label className="flex cursor-pointer items-center gap-2 text-sm">
                  <Checkbox
                    checked={section.includePrior.initial}
                    onCheckedChange={(v) =>
                      updateSection('activeStand', (cur) => ({
                        ...cur,
                        includePrior: { ...cur.includePrior, initial: !!v },
                      }))
                    }
                  />
                  Initial Evaluation
                </label>
                <label className="flex cursor-pointer items-center gap-2 text-sm">
                  <Checkbox
                    checked={section.includePrior.last}
                    onCheckedChange={(v) =>
                      updateSection('activeStand', (cur) => ({
                        ...cur,
                        includePrior: { ...cur.includePrior, last: !!v },
                      }))
                    }
                  />
                  Last Re-evaluation
                </label>
              </div>
            </div>
          )}
        </>
      )}
    </SectionShell>
  );
}
