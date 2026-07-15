import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Copy,
  RotateCcw,
  CheckCircle,
  Clock,
  Play,
  Pause,
  Square,
  Download,
  ChevronRight,
  FileText,
  Pencil,
} from 'lucide-react';
import { toast } from 'sonner';

import { PatientInfoCard } from '@/features/nasa-lean/components/PatientInfoCard';
import { BaselineMeasurementsCard } from '@/features/nasa-lean/components/BaselineMeasurementsCard';
import { HeartRateChart } from '@/features/nasa-lean/components/HeartRateChart';
import { CompactSymptomSelector } from '@/features/nasa-lean/components/CompactSymptomSelector';
import { MeasurementCRUD } from '@/features/nasa-lean/components/MeasurementCRUD';
import { PDFReportGenerator } from '@/features/nasa-lean/components/PDFReportGenerator';
import { useNasaLeanStore } from '@/features/nasa-lean/store';
import { makeMeasurement, type ChartDataPoint } from '@/features/nasa-lean/types';
import { computeLeanStats, meetsPotsDeltaCriteria } from '@/lib/clinical/nasaLean';

function formatTimer(totalSeconds: number): string {
  return `${Math.floor(totalSeconds / 60)}:${(totalSeconds % 60).toString().padStart(2, '0')}`;
}

/* --------------------------- Standing phase entry --------------------------- */

function StandingPhase() {
  const store = useNasaLeanStore();
  const [heartRate, setHeartRate] = useState('');
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const hrInputRef = useRef<HTMLInputElement>(null);

  const { timer, isRunning, isInitialHRRecording, measurements } = store;
  const nextMeasurementIn = !isInitialHRRecording ? 30 - (timer % 30) : undefined;

  const handleSymptomToggle = (symptom: string) => {
    setSelectedSymptoms((prev) =>
      prev.includes(symptom) ? prev.filter((s) => s !== symptom) : [...prev, symptom],
    );
  };

  /**
   * NL-01: pressing Enter in the heart-rate field records the value, clears
   * the field, and keeps focus for the next entry. NL-02: with symptoms
   * selected, recording works without a heart-rate value.
   */
  const handleRecord = () => {
    let hr: number | null = null;
    if (heartRate) {
      hr = parseInt(heartRate, 10);
      if (isNaN(hr)) {
        toast.error('Please enter a valid heart rate');
        return;
      }
      if (hr < 30 || hr > 200) {
        toast.error('Heart rate must be between 30-200 bpm');
        return;
      }
    } else if (selectedSymptoms.length === 0) {
      toast.error('Enter a heart rate or select at least one symptom');
      return;
    }

    const symptoms = selectedSymptoms.join(', ');

    if (isInitialHRRecording) {
      if (hr == null) {
        toast.error('An initial standing heart rate is required to start the timer');
        return;
      }
      store.set({
        measurements: [makeMeasurement(0, hr, symptoms)],
        isInitialHRRecording: false,
        isRunning: true,
      });
      toast.success(`Initial standing HR recorded: ${hr} bpm — timer started!`);
    } else {
      store.addMeasurement(makeMeasurement(store.timer, hr, symptoms));
      toast.success(hr != null ? `Measurement recorded: ${hr} bpm` : 'Symptoms recorded');
    }

    setHeartRate('');
    setSelectedSymptoms([]);
    hrInputRef.current?.focus();
  };

  return (
    <Card>
      <CardContent>
        <div className="mb-6 flex flex-col gap-4 rounded-lg bg-muted/50 p-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-xl font-bold sm:text-2xl">Standing Test Phase</p>
            <p className="text-sm text-muted-foreground sm:text-base">
              {isInitialHRRecording
                ? 'Record initial standing heart rate to start timer'
                : 'Record heart rate every 30 seconds'}
            </p>
          </div>
          <div className="sm:ml-auto">
            <Badge variant={isInitialHRRecording ? 'outline' : isRunning ? 'default' : 'secondary'}>
              {isInitialHRRecording ? 'Ready to Start' : isRunning ? 'Running' : 'Paused'}
            </Badge>
          </div>
        </div>

        {!isInitialHRRecording && (
          <div className="mb-8 text-center">
            <div className="mb-4 font-mono text-6xl font-bold tabular-nums sm:text-7xl">
              {formatTimer(timer)}
            </div>
            <Progress
              value={Math.min((timer / 600) * 100, 100)}
              className="mx-auto mb-4 h-3 max-w-xl sm:h-4"
              aria-label="Standing phase progress"
            />
            <div className="font-mono text-sm tabular-nums text-muted-foreground">
              Next measurement in: {nextMeasurementIn}s · Recorded: {measurements.length}
            </div>
          </div>
        )}

        {isInitialHRRecording && (
          <div className="mb-8 text-center">
            <div className="text-lg font-bold sm:text-xl">Record Initial Standing HR</div>
            <p className="mb-4 text-muted-foreground">
              Have the patient stand up, then immediately record their heart rate to start
              the 10-minute timer.
            </p>
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleRecord();
          }}
          className="mb-6 grid gap-6 md:grid-cols-2"
        >
          <div className="space-y-4">
            <p className="flex items-center gap-2 text-lg font-semibold">
              <span className="h-3 w-3 rounded-full bg-primary" aria-hidden />
              Heart Rate Entry
            </p>
            <div className="space-y-2">
              <Label htmlFor="heartRate" className="text-base font-medium">
                Pulse Rate (bpm)
              </Label>
              <Input
                id="heartRate"
                ref={hrInputRef}
                type="number"
                inputMode="numeric"
                value={heartRate}
                onChange={(e) => setHeartRate(e.target.value)}
                onKeyDown={(e) => {
                  // NL-01: Enter records without leaving the field.
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleRecord();
                  }
                }}
                className="h-16 text-center font-mono !text-2xl tabular-nums"
                placeholder="e.g., 85"
                min={30}
                max={200}
              />
              <p className="text-xs text-muted-foreground">
                Press Enter to record and keep typing — no mouse needed.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <p className="flex items-center gap-2 text-lg font-semibold">
              <span className="h-3 w-3 rounded-full bg-muted-foreground" aria-hidden />
              Symptoms <span className="text-sm text-muted-foreground">(Optional)</span>
            </p>
            <CompactSymptomSelector
              selectedSymptoms={selectedSymptoms}
              onSymptomToggle={handleSymptomToggle}
              onClear={() => setSelectedSymptoms([])}
            />
          </div>

          {/* Hidden submit so Enter in the HR field records (NL-01). */}
          <button type="submit" className="hidden" aria-hidden tabIndex={-1} />
        </form>

        <div className="mb-6 flex flex-col gap-3 sm:flex-row">
          <Button
            onClick={handleRecord}
            disabled={!heartRate && selectedSymptoms.length === 0}
            size="lg"
            className="h-12 text-base sm:h-16 sm:flex-1 sm:text-lg"
          >
            {isInitialHRRecording ? (
              <Play className="mr-2 h-4 w-4 sm:h-5 sm:w-5" aria-hidden />
            ) : (
              <CheckCircle className="mr-2 h-4 w-4 sm:h-5 sm:w-5" aria-hidden />
            )}
            {isInitialHRRecording
              ? 'Record Initial HR & Start Timer'
              : heartRate
                ? 'Record Measurement'
                : 'Record Symptoms Only'}
          </Button>
          {!isInitialHRRecording && (
            <Button
              onClick={() => store.set({ isRunning: !isRunning })}
              variant={isRunning ? 'secondary' : 'outline'}
              size="lg"
              className="h-12 px-4 sm:h-16 sm:px-6"
            >
              {isRunning ? (
                <Pause className="mr-2 h-4 w-4 sm:h-5 sm:w-5" aria-hidden />
              ) : (
                <Play className="mr-2 h-4 w-4 sm:h-5 sm:w-5" aria-hidden />
              )}
              {isRunning ? 'Pause' : 'Resume'}
            </Button>
          )}
          <Button
            onClick={() => {
              store.set({ isRunning: false, phase: 'complete' });
              toast.warning('Test stopped by operator');
            }}
            variant="destructive"
            size="lg"
            className="h-12 px-4 sm:h-16 sm:px-6"
          >
            <Square className="mr-2 h-4 w-4 sm:h-5 sm:w-5" aria-hidden />
            Stop
          </Button>
        </div>

        <Separator className="my-6" />

        <MeasurementCRUD
          measurements={measurements}
          onUpdateMeasurement={(i, hr, symptoms) =>
            store.updateMeasurement(i, hr, symptoms.join(', '))
          }
          onDeleteMeasurement={store.deleteMeasurement}
          onAddMissedMeasurement={(mins, secs, hr, symptoms) =>
            store.addMeasurement(makeMeasurement(mins * 60 + secs, hr, symptoms.join(', ')))
          }
          maxDisplayed={6}
          title="Recent Measurements"
        />

        {timer >= 600 && measurements.length >= 10 && (
          <div className="mt-6">
            <Button
              onClick={() => {
                store.set({ isRunning: false, phase: 'complete' });
                toast.success('Test completed successfully!');
              }}
              size="lg"
              className="h-12 w-full text-base sm:h-16 sm:text-xl"
            >
              <CheckCircle className="mr-3 h-5 w-5 sm:h-6 sm:w-6" aria-hidden />
              Complete Test
            </Button>
          </div>
        )}

        {timer >= 300 && measurements.length >= 5 && !(timer >= 600 && measurements.length >= 10) && (
          <div className="mt-6">
            <Button
              onClick={() => {
                store.set({ isRunning: false, phase: 'complete' });
                toast.success('Test completed');
              }}
              variant="outline"
              size="lg"
              className="h-12 w-full"
            >
              Complete Early
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/* ------------------------ Editable summary (NL-03/04) ------------------------ */

function EditableStat({
  label,
  value,
  isOverridden,
  onChange,
  onClearOverride,
  highlight,
}: {
  label: string;
  value: number | null;
  isOverridden: boolean;
  onChange: (v: number | null) => void;
  onClearOverride: () => void;
  highlight?: boolean;
}) {
  return (
    <Card>
      <CardContent className="space-y-1 p-4 text-center sm:p-6">
        <div className="flex items-center justify-center gap-1">
          <Input
            type="number"
            inputMode="numeric"
            value={value ?? ''}
            aria-label={label}
            onChange={(e) =>
              onChange(e.target.value === '' ? null : parseInt(e.target.value, 10))
            }
            className={`h-11 w-24 border-dashed text-center font-mono !text-2xl font-bold tabular-nums ${
              highlight ? 'text-primary' : ''
            }`}
          />
          <Pencil className="h-3.5 w-3.5 text-muted-foreground" aria-hidden />
        </div>
        <div className="text-sm font-medium text-muted-foreground">{label}</div>
        {isOverridden && (
          <button
            type="button"
            onClick={onClearOverride}
            className="text-xs text-primary underline-offset-2 hover:underline"
          >
            manually corrected — reset
          </button>
        )}
      </CardContent>
    </Card>
  );
}

/* ---------------------------------- Page ---------------------------------- */

function NasaLeanTest() {
  const store = useNasaLeanStore();
  const {
    patientName,
    testDate,
    phase,
    timer,
    isRunning,
    bpSystolic,
    bpDiastolic,
    initialPR,
    lowestSupinePR,
    measurements,
    baselineOverride,
    lowestOverride,
    highestOverride,
    showTrendLine,
  } = store;

  // Timer tick
  useEffect(() => {
    if (!isRunning) return;
    const id = setInterval(() => {
      useNasaLeanStore.setState((s) => ({ timer: s.timer + 1 }));
    }, 1000);
    return () => clearInterval(id);
  }, [isRunning]);

  // Auto-notify at the end of the supine phase
  useEffect(() => {
    if (phase === 'supine' && timer === 600 && isRunning) {
      store.set({ isRunning: false });
      toast.success('Supine phase complete! Ready to start standing phase.', {
        duration: 5000,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, timer, isRunning]);

  const recordedBaseline = lowestSupinePR
    ? parseInt(lowestSupinePR, 10)
    : initialPR
      ? parseInt(initialPR, 10)
      : null;

  const stats = computeLeanStats(recordedBaseline, measurements, {
    baseline: baselineOverride,
    lowest: lowestOverride,
    highest: highestOverride,
  });

  const startSupinePhase = () => {
    if (!patientName.trim()) {
      toast.error('Please enter patient name');
      return;
    }
    if (!bpSystolic || !bpDiastolic || !initialPR) {
      toast.error('Please complete all baseline measurements');
      return;
    }
    store.set({ phase: 'supine', timer: 0, isRunning: true });
    toast.success('Starting 10-minute supine rest phase');
  };

  const startStandingPhase = () => {
    if (!lowestSupinePR) {
      toast.warning('Standing phase started without lowest supine HR recorded');
    }
    store.set({ phase: 'standing', timer: 0, isRunning: false, isInitialHRRecording: true });
    toast.info(
      'Patient should now stand up. Record their initial standing heart rate to start the timer.',
    );
  };

  const resetTest = () => {
    store.reset();
    toast.info('Test reset — ready for new patient');
  };

  const prepareChartData = (): ChartDataPoint[] => {
    const chartData: ChartDataPoint[] = [];
    if (initialPR) {
      chartData.push({
        time: -2,
        heartRate: parseInt(initialPR, 10),
        label: 'Initial (Supine)',
        isPreTest: true,
      });
    }
    if (lowestSupinePR) {
      chartData.push({
        time: -1,
        heartRate: parseInt(lowestSupinePR, 10),
        label: 'Lowest Supine',
        isPreTest: true,
      });
    }
    measurements.forEach((m) => {
      if (m.pulseRate != null && !isNaN(m.pulseRate)) {
        chartData.push({
          time: m.chartTime,
          heartRate: m.pulseRate,
          label: `${m.label} (Standing)`,
          isPreTest: false,
        });
      }
    });

    const sorted = chartData.sort((a, b) => a.time - b.time);

    if (showTrendLine && sorted.length >= 2) {
      const n = sorted.length;
      const sumX = sorted.reduce((sum, d) => sum + d.time, 0);
      const sumY = sorted.reduce((sum, d) => sum + d.heartRate, 0);
      const sumXY = sorted.reduce((sum, d) => sum + d.time * d.heartRate, 0);
      const sumXX = sorted.reduce((sum, d) => sum + d.time * d.time, 0);
      const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
      const intercept = (sumY - slope * sumX) / n;
      sorted.forEach((d) => {
        d.trendValue = slope * d.time + intercept;
      });
    }

    return sorted;
  };

  const generateSummary = (): string => {
    return `NASA 10-Minute Lean Test Results

Patient: ${patientName}
Date: ${testDate}

Initial Measurements (Supine):
- Blood Pressure: ${bpSystolic}/${bpDiastolic} mmHg
- Initial Pulse Rate: ${initialPR} bpm
- Lowest Supine PR: ${lowestSupinePR} bpm

Standing Phase Measurements:
${measurements
  .map(
    (m) =>
      `${m.label}: ${m.pulseRate != null ? `${m.pulseRate} bpm` : 'symptoms only'}${
        m.symptoms ? ` (${m.symptoms})` : ''
      }`,
  )
  .join('\n')}

Summary Statistics:
- Baseline HR: ${stats.baseline ?? '—'} bpm
- Highest Standing HR: ${stats.highest ?? '—'} bpm
- Heart Rate Increase (Δ): ${stats.delta ?? '—'} bpm

Clinical Note:
${
  meetsPotsDeltaCriteria(stats.delta)
    ? 'Meets POTS heart-rate criteria (ΔHR ≥30 bpm) — provider interpretation required'
    : 'Does not meet POTS heart-rate criteria (ΔHR <30 bpm)'
}

Generated: ${new Date().toLocaleString()}`;
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generateSummary()).then(() => {
      toast.success('Summary copied to clipboard');
    });
  };

  const exportChart = () => {
    const svgElement = document.querySelector('.recharts-wrapper svg');
    if (!svgElement) {
      toast.error('Chart not available for export');
      return;
    }
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const img = new Image();
    const svgData = new XMLSerializer().serializeToString(svgElement);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const svgUrl = URL.createObjectURL(svgBlob);
    img.onload = function () {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      const link = document.createElement('a');
      link.download = `nasa-lean-${patientName.replace(/\s+/g, '-')}-${testDate}.png`;
      link.href = canvas.toDataURL();
      link.click();
      URL.revokeObjectURL(svgUrl);
      toast.success('Chart exported successfully');
    };
    img.src = svgUrl;
  };

  const getPhaseProgress = (): number => {
    if (phase === 'setup') return 0;
    if (phase === 'supine') return (timer / 600) * 50;
    if (phase === 'standing') return 50 + (timer / 600) * 50;
    return 100;
  };

  const chartData = prepareChartData();

  return (
    <div className="min-h-screen bg-background">
      <Progress
        value={getPhaseProgress()}
        aria-label="Test progress"
        className="fixed left-0 top-0 z-50 h-1 w-full rounded-none"
      />

      <div className="border-b bg-card">
        <div className="mx-auto max-w-3xl px-4 py-4 sm:px-6">
          <div className="flex flex-col items-center justify-between gap-2 text-center sm:flex-row sm:text-left">
            <div>
              <h1 className="text-2xl font-extrabold">
                <span className="text-primary">NASA Lean</span> Test
              </h1>
              <p className="text-sm text-muted-foreground sm:text-base">
                Monitor the patient's heart rate while supine and standing to assess for
                orthostatic intolerance.
              </p>
            </div>
            {patientName && (
              <Badge variant="outline" className="px-3 py-1 text-base">
                {patientName}
              </Badge>
            )}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-3xl p-4 sm:px-6">
        {phase === 'setup' && (
          <div className="space-y-6">
            <PatientInfoCard
              patientName={patientName}
              setPatientName={(v) => store.set({ patientName: v })}
              testDate={testDate}
              setTestDate={(v) => store.set({ testDate: v })}
            />
            <BaselineMeasurementsCard
              initialBP={{ systolic: bpSystolic, diastolic: bpDiastolic }}
              setInitialBP={(updater) => {
                const next =
                  typeof updater === 'function'
                    ? updater({ systolic: bpSystolic, diastolic: bpDiastolic })
                    : updater;
                store.set({ bpSystolic: next.systolic, bpDiastolic: next.diastolic });
              }}
              initialPR={initialPR}
              setInitialPR={(v) => store.set({ initialPR: v })}
              onStartSupinePhase={startSupinePhase}
            />
          </div>
        )}

        {phase === 'supine' && (
          <Card>
            <CardContent>
              <div className="mb-6 flex flex-col gap-4 rounded-lg bg-muted/50 p-4 sm:flex-row sm:items-center">
                <div className="flex items-center gap-4">
                  <Clock className="h-6 w-6 sm:h-8 sm:w-8" aria-hidden />
                  <div>
                    <p className="text-xl font-bold sm:text-2xl">Supine Rest Phase</p>
                    <p className="mt-1 text-sm text-muted-foreground sm:text-base">
                      Patient resting flat for 10 minutes
                    </p>
                  </div>
                </div>
                <div className="sm:ml-auto">
                  <Badge variant={isRunning ? 'default' : 'secondary'}>
                    {isRunning ? 'Running' : 'Paused'}
                  </Badge>
                </div>
              </div>

              <div className="mb-8 text-center">
                <div className="mb-4 font-mono text-6xl font-bold tabular-nums sm:text-7xl">
                  {formatTimer(timer)}
                </div>
                <Progress
                  value={Math.min((timer / 600) * 100, 100)}
                  className="mx-auto mb-4 h-3 max-w-xl sm:h-4"
                  aria-label="Supine phase progress"
                />
                <div className="text-sm text-muted-foreground">
                  {Math.round(Math.min((timer / 600) * 100, 100))}% Complete
                </div>
              </div>

              <Separator className="my-8" />

              <div className="mb-4 text-center">
                <p className="mb-2 text-xl font-semibold">Record Lowest Supine Heart Rate</p>
                <div className="mx-auto max-w-sm">
                  <Input
                    id="lowestPR"
                    type="number"
                    inputMode="numeric"
                    value={lowestSupinePR}
                    onChange={(e) => store.set({ lowestSupinePR: e.target.value })}
                    className="mt-3 h-16 text-center font-mono !text-2xl tabular-nums"
                    placeholder="e.g., 68 bpm"
                  />
                  {lowestSupinePR && (
                    <p className="mt-2 text-sm text-muted-foreground">
                      ✓ Lowest HR recorded: {lowestSupinePR} bpm
                    </p>
                  )}
                </div>
              </div>

              <Separator className="my-8" />

              <div className="flex flex-col gap-4 sm:flex-row">
                <div className="flex w-full gap-4">
                  <Button
                    onClick={() => store.set({ isRunning: !isRunning })}
                    variant={isRunning ? 'secondary' : 'default'}
                    size="lg"
                    className="h-14 flex-1 text-lg sm:h-16 sm:text-xl"
                  >
                    {isRunning ? (
                      <Pause className="mr-3 h-6 w-6" aria-hidden />
                    ) : (
                      <Play className="mr-3 h-6 w-6" aria-hidden />
                    )}
                    {isRunning ? 'Pause' : 'Resume'}
                  </Button>
                  <Button
                    onClick={() => {
                      store.set({ isRunning: false, phase: 'complete' });
                      toast.warning('Test stopped by operator');
                    }}
                    variant="destructive"
                    size="lg"
                    className="h-14 px-6 sm:h-16 sm:px-8"
                  >
                    <Square className="mr-2 h-6 w-6" aria-hidden />
                    Stop
                  </Button>
                </div>
                <Button
                  onClick={startStandingPhase}
                  size="lg"
                  className="h-14 w-full text-lg sm:h-16 sm:w-auto sm:text-xl"
                >
                  Continue to Standing Phase
                  <ChevronRight className="ml-1 h-6 w-6" aria-hidden />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {phase === 'standing' && (
          <div className="py-4">
            <StandingPhase />
          </div>
        )}

        {phase === 'complete' && (
          <>
            <div className="space-y-6 pb-28 pt-4">
              <div className="text-center">
                <p className="text-2xl font-bold sm:text-3xl">Test Results</p>
                <p className="text-muted-foreground">
                  Clinical summary and data visualization
                </p>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-xl font-bold sm:text-2xl">
                    Clinical Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6 sm:gap-8 md:grid-cols-2">
                    <div className="space-y-4">
                      <div>
                        <p className="mb-2 text-base font-semibold sm:text-lg">
                          Patient Information
                        </p>
                        <p>
                          <strong>Name:</strong> {patientName}
                        </p>
                        <p>
                          <strong>Date:</strong> {testDate}
                        </p>
                      </div>
                      <div>
                        <p className="mb-2 text-base font-semibold sm:text-lg">
                          Baseline Measurements
                        </p>
                        <p>
                          <strong>Blood Pressure:</strong> {bpSystolic}/{bpDiastolic} mmHg
                        </p>
                        <p>
                          <strong>Initial Pulse Rate:</strong> {initialPR} bpm
                        </p>
                        <p>
                          <strong>Lowest Supine HR:</strong> {lowestSupinePR || '—'} bpm
                        </p>
                      </div>
                    </div>
                    <div>
                      <p className="mb-2 text-base font-semibold sm:text-lg">Test Results</p>
                      <p>
                        <strong>Measurements Taken:</strong> {measurements.length}
                      </p>
                      <p>
                        <strong>Highest Standing HR:</strong> {stats.highest ?? '—'} bpm
                      </p>
                      <p>
                        <strong>Heart Rate Increase (Δ):</strong> {stats.delta ?? '—'} bpm
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* NL-03/NL-04: baseline, lowest, and highest are editable after
                  the test; the delta and graph labels update immediately. */}
              <div>
                <p className="mb-2 text-sm text-muted-foreground">
                  Values below are editable for post-test corrections. The Δ updates
                  automatically.
                </p>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
                  <EditableStat
                    label="Baseline HR"
                    value={stats.baseline}
                    isOverridden={baselineOverride != null}
                    onChange={(v) => store.set({ baselineOverride: v })}
                    onClearOverride={() => store.set({ baselineOverride: null })}
                  />
                  <EditableStat
                    label="Lowest Standing HR"
                    value={stats.lowest}
                    isOverridden={lowestOverride != null}
                    onChange={(v) => store.set({ lowestOverride: v })}
                    onClearOverride={() => store.set({ lowestOverride: null })}
                  />
                  <EditableStat
                    label="Highest Standing HR"
                    value={stats.highest}
                    isOverridden={highestOverride != null}
                    onChange={(v) => store.set({ highestOverride: v })}
                    onClearOverride={() => store.set({ highestOverride: null })}
                  />
                  <Card>
                    <CardContent className="p-4 text-center sm:p-6">
                      <div className="font-mono text-2xl font-bold tabular-nums text-primary sm:text-3xl">
                        {stats.delta ?? '—'}
                      </div>
                      <div className="text-sm font-medium text-muted-foreground">
                        HR Increase (Δ)
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              <HeartRateChart
                chartData={chartData}
                showTrendLine={showTrendLine}
                onToggleTrendLine={() => store.set({ showTrendLine: !showTrendLine })}
                onExportChart={exportChart}
              />

              <Card>
                <CardHeader>
                  <CardTitle>All Measurements</CardTitle>
                  <p className="text-muted-foreground">
                    Complete measurement data with edit and management capabilities
                  </p>
                </CardHeader>
                <CardContent>
                  <MeasurementCRUD
                    measurements={measurements}
                    onUpdateMeasurement={(i, hr, symptoms) =>
                      store.updateMeasurement(i, hr, symptoms.join(', '))
                    }
                    onDeleteMeasurement={store.deleteMeasurement}
                    onAddMissedMeasurement={(mins, secs, hr, symptoms) =>
                      store.addMeasurement(
                        makeMeasurement(mins * 60 + secs, hr, symptoms.join(', ')),
                      )
                    }
                    showAddButton
                    title="Standing Phase Measurements"
                    className="max-h-96 overflow-y-auto"
                  />
                </CardContent>
              </Card>

              <Button variant="secondary" className="w-full" nativeButton={false} render={<Link to="/report" />}>
                <FileText className="mr-2 h-4 w-4" aria-hidden />
                Use these results in a Patient Evaluation Report
              </Button>
            </div>

            <div className="fixed bottom-0 left-0 right-0 z-40 border-t bg-card shadow-lg">
              <div className="mx-auto max-w-3xl p-3 sm:p-4">
                <div className="flex items-center justify-between gap-2 sm:gap-3">
                  <Button
                    onClick={resetTest}
                    variant="outline"
                    size="lg"
                    className="h-12 text-base sm:h-14"
                  >
                    <RotateCcw size={18} className="sm:mr-2" aria-hidden />
                    <span className="hidden sm:block">New Test</span>
                  </Button>
                  <div className="flex flex-1 justify-end gap-2 sm:gap-3">
                    <PDFReportGenerator
                      patientName={patientName}
                      testDate={testDate}
                      initialBP={{ systolic: bpSystolic, diastolic: bpDiastolic }}
                      initialPR={initialPR}
                      lowestSupinePR={lowestSupinePR}
                      measurements={measurements}
                      stats={stats}
                      size="lg"
                      className="h-12 flex-1 text-base sm:h-14"
                    />
                    <Button
                      onClick={exportChart}
                      size="lg"
                      variant="secondary"
                      className="h-12 px-4 text-base sm:h-14"
                    >
                      <Download size={18} className="sm:mr-2" aria-hidden />
                      <span className="hidden sm:block">Chart</span>
                    </Button>
                    <Button
                      onClick={copyToClipboard}
                      size="lg"
                      variant="secondary"
                      className="h-12 px-4 text-base sm:h-14"
                    >
                      <Copy size={18} className="sm:mr-2" aria-hidden />
                      <span className="hidden sm:block">Text</span>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default NasaLeanTest;
