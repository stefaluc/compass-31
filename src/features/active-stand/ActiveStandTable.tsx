import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import {
  changeFromBaseline,
  standFlags,
  type StandFlag,
} from '@/lib/clinical/activeStand';
import type { ActiveStandReading, ActiveStandValues } from '@/features/report/types';

interface ActiveStandTableProps {
  values: ActiveStandValues;
  onBaselineChange?: (patch: Partial<ActiveStandReading>) => void;
  onMinuteChange?: (index: number, patch: Partial<ActiveStandReading>) => void;
  readOnly?: boolean;
}

function numberOrNull(value: string): number | null {
  return value === '' ? null : parseInt(value, 10);
}

function formatChange(change: number | null): string {
  if (change == null) return '';
  return change > 0 ? `+${change}` : `${change}`;
}

/**
 * AS-04 flag styling. Red/orange must stay legible in grayscale, so flagged
 * rows also get a "▼ BP drop" text marker, not color alone (§11).
 */
const flagRowClass: Record<Exclude<StandFlag, null>, string> = {
  red: 'bg-destructive/10',
  orange: 'bg-warning/15',
};
const flagTextClass: Record<Exclude<StandFlag, null>, string> = {
  red: 'text-destructive',
  orange: 'text-warning',
};

function ReadingCells({
  reading,
  baseline,
  onChange,
  readOnly,
  rowLabel,
}: {
  reading: ActiveStandReading;
  baseline?: ActiveStandReading;
  onChange?: (patch: Partial<ActiveStandReading>) => void;
  readOnly?: boolean;
  rowLabel: string;
}) {
  const change = baseline ? changeFromBaseline(baseline, reading) : null;

  const cell = (
    field: 'systolic' | 'diastolic' | 'heartRate',
    placeholder: string,
    changeValue: number | null,
  ) => (
    <td className="p-1.5 sm:p-2">
      <div className="flex flex-col items-center gap-0.5">
        {readOnly ? (
          <span className="font-mono tabular-nums">{reading[field] ?? '—'}</span>
        ) : (
          <Input
            type="number"
            inputMode="numeric"
            value={reading[field] ?? ''}
            placeholder={placeholder}
            aria-label={`${rowLabel} ${field}`}
            onChange={(e) => onChange?.({ [field]: numberOrNull(e.target.value) })}
            className="h-9 w-16 px-1 text-center font-mono text-sm tabular-nums sm:w-20"
          />
        )}
        {baseline && (
          <span className="font-mono text-xs tabular-nums text-muted-foreground">
            {formatChange(changeValue)}
          </span>
        )}
      </div>
    </td>
  );

  return (
    <>
      {cell('systolic', '', change?.systolicChange ?? null)}
      {cell('diastolic', '', change?.diastolicChange ?? null)}
      {cell('heartRate', '', change?.heartRateChange ?? null)}
      <td className="p-1.5 sm:p-2">
        {readOnly ? (
          <span className="text-sm">{reading.symptoms || ''}</span>
        ) : (
          <Input
            type="text"
            value={reading.symptoms}
            placeholder="Symptoms / observations"
            aria-label={`${rowLabel} symptoms`}
            onChange={(e) => onChange?.({ symptoms: e.target.value })}
            className="h-9 min-w-32 text-sm"
          />
        )}
      </td>
    </>
  );
}

export function ActiveStandTable({
  values,
  onBaselineChange,
  onMinuteChange,
  readOnly = false,
}: ActiveStandTableProps) {
  const flags = standFlags(values.baseline, values.minutes);

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[560px] border-collapse text-sm">
        <thead>
          <tr className="border-b text-left text-[11px] uppercase tracking-[0.11em] text-muted-foreground">
            <th className="p-2 font-medium">Time</th>
            <th className="p-2 text-center font-medium">Systolic</th>
            <th className="p-2 text-center font-medium">Diastolic</th>
            <th className="p-2 text-center font-medium">HR</th>
            <th className="p-2 font-medium">Symptoms</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b bg-section/60">
            <td className="whitespace-nowrap p-2 font-medium">
              Supine baseline
              <span className="block text-xs font-normal text-muted-foreground">
                measured at minute 5
              </span>
            </td>
            <ReadingCells
              reading={values.baseline}
              onChange={onBaselineChange}
              readOnly={readOnly}
              rowLabel="Supine baseline"
            />
          </tr>
          {values.minutes.map((minute, i) => {
            const flag = flags[i];
            return (
              <tr
                key={i}
                className={cn('border-b', flag && flagRowClass[flag])}
              >
                <td className="whitespace-nowrap p-2 font-medium">
                  Standing min {i + 1}
                  {flag && (
                    <span
                      className={cn(
                        'block text-xs font-semibold',
                        flagTextClass[flag],
                      )}
                    >
                      ▼ BP drop{flag === 'orange' ? ' (delayed)' : ''}
                    </span>
                  )}
                </td>
                <ReadingCells
                  reading={minute}
                  baseline={values.baseline}
                  onChange={onMinuteChange ? (patch) => onMinuteChange(i, patch) : undefined}
                  readOnly={readOnly}
                  rowLabel={`Standing minute ${i + 1}`}
                />
              </tr>
            );
          })}
        </tbody>
      </table>
      <p className="mt-2 text-xs text-muted-foreground">
        Changes from supine baseline are shown beneath each value. Red: systolic drop
        ≥20 mmHg or diastolic drop ≥10 mmHg within minutes 1–3. Orange: the same drop
        first appearing during minutes 4–5. Visual flags support screening only — they
        are not a diagnosis.
      </p>
    </div>
  );
}
