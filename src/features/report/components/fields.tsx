import { useId } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import {
  TIME_POINT_LABELS,
  type ThreePoint,
  type TimePointKey,
} from '../types';

export function numberOrNull(value: string): number | null {
  if (value === '') return null;
  const n = Number(value);
  return Number.isNaN(n) ? null : n;
}

/* --------------------------------- Fields --------------------------------- */

export function NumField({
  label,
  value,
  onChange,
  max,
  suffix,
  flagged = false,
  className,
}: {
  label: string;
  value: number | null;
  onChange: (v: number | null) => void;
  max?: number;
  suffix?: string;
  flagged?: boolean;
  className?: string;
}) {
  const id = useId();
  return (
    <div className={cn('space-y-1.5', className)}>
      <Label htmlFor={id}>{label}</Label>
      <div className="flex items-center gap-2">
        <Input
          id={id}
          type="number"
          inputMode="decimal"
          value={value ?? ''}
          onChange={(e) => onChange(numberOrNull(e.target.value))}
          className={cn('w-24 text-center', flagged && 'border-destructive font-semibold text-destructive')}
        />
        {(max != null || suffix) && (
          <span className="whitespace-nowrap text-sm text-muted-foreground">
            {max != null ? `/ ${max}` : ''} {suffix ?? ''}
          </span>
        )}
      </div>
    </div>
  );
}

export function TextField({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  className,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  className?: string;
}) {
  const id = useId();
  return (
    <div className={cn('space-y-1.5', className)}>
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

export function TextAreaField({
  label,
  value,
  onChange,
  placeholder,
  className,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
}) {
  const id = useId();
  return (
    <div className={cn('space-y-1.5', className)}>
      <Label htmlFor={id}>{label}</Label>
      <Textarea
        id={id}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="min-h-20"
      />
    </div>
  );
}

export function SelectField({
  label,
  value,
  onChange,
  options,
  placeholder = 'Select…',
  className,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: readonly string[];
  placeholder?: string;
  className?: string;
}) {
  const id = useId();
  return (
    <div className={cn('space-y-1.5', className)}>
      <Label htmlFor={id}>{label}</Label>
      <Select
        value={value || undefined}
        onValueChange={(v) => onChange((v as string) ?? '')}
      >
        <SelectTrigger id={id} className="w-full">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((o) => (
            <SelectItem key={o} value={o}>
              {o}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export function MultiCheckField({
  label,
  options,
  values,
  onChange,
  columns = 2,
}: {
  label: string;
  options: readonly string[];
  values: string[];
  onChange: (v: string[]) => void;
  columns?: number;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div
        className={cn(
          'grid gap-2',
          columns === 2 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-2 sm:grid-cols-3',
        )}
      >
        {options.map((option) => {
          const checked = values.includes(option);
          return (
            <label
              key={option}
              className="flex cursor-pointer items-center gap-2 text-sm"
            >
              <Checkbox
                checked={checked}
                onCheckedChange={(next) =>
                  onChange(
                    next
                      ? [...values, option]
                      : values.filter((v) => v !== option),
                  )
                }
              />
              {option}
            </label>
          );
        })}
      </div>
    </div>
  );
}

/* ------------------------- Three-time-point helpers ------------------------ */

export interface MetricDef {
  key: string;
  label: string;
  max?: number;
  suffix?: string;
}

/**
 * RE-01: numeric metrics entered per time point. Initial reports render one
 * column (current); re-evaluations render Initial / Last / Current columns.
 */
export function ThreePointNumberGrid({
  metrics,
  values,
  timePoints,
  onChange,
}: {
  metrics: MetricDef[];
  values: ThreePoint<object>;
  timePoints: TimePointKey[];
  onChange: (tp: TimePointKey, key: string, value: number | null) => void;
}) {
  const multi = timePoints.length > 1;

  return (
    <div className="overflow-x-auto">
      <table className={cn('border-collapse text-sm', multi ? 'w-full min-w-[480px]' : '')}>
        <thead>
          <tr className="border-b text-left text-xs uppercase tracking-wide text-muted-foreground">
            <th className="p-2 font-medium">Measure</th>
            {timePoints.map((tp) => (
              <th key={tp} className="p-2 text-center font-medium">
                {multi ? TIME_POINT_LABELS[tp] : 'Score'}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {metrics.map((metric) => (
            <tr key={metric.key} className="border-b">
              <td className="whitespace-nowrap p-2 font-medium">
                {metric.label}
                {metric.max != null && (
                  <span className="ml-1 font-normal text-muted-foreground">
                    / {metric.max}
                  </span>
                )}
              </td>
              {timePoints.map((tp) => (
                <td key={tp} className="p-1.5 text-center sm:p-2">
                  <Input
                    type="number"
                    inputMode="decimal"
                    aria-label={`${metric.label} — ${TIME_POINT_LABELS[tp]}`}
                    value={
                      ((values[tp] as Record<string, unknown> | undefined | null)?.[
                        metric.key
                      ] as number | null | undefined) ?? ''
                    }
                    onChange={(e) =>
                      onChange(tp, metric.key, numberOrNull(e.target.value))
                    }
                    className="mx-auto h-9 w-20 text-center"
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
