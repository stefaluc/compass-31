import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Copy, RotateCcw, Activity, CheckCircle, AlertTriangle, Clock, Play, Pause, Square, Download } from 'lucide-react';
import { BloodPressure, Measurement, TestPhase, TestStats, ChartDataPoint, TrendDataPoint } from '@/types/pots';
import { toast } from 'sonner';

// Component imports
import { PatientInfoCard } from '@/components/pots/PatientInfoCard';
import { BaselineMeasurementsCard } from '@/components/pots/BaselineMeasurementsCard';
import { RecentMeasurements } from '@/components/pots/RecentMeasurements';
import { StatsCards } from '@/components/pots/StatsCards';
import { HeartRateChart } from '@/components/pots/HeartRateChart';
import { CompactSymptomSelector } from '@/components/pots/CompactSymptomSelector';

// Standing Phase Component
const StandingPhase: React.FC<{
  timer: number;
  isRunning: boolean;
  measurements: Measurement[];
  nextMeasurementIn?: number;
  onAddMeasurement: (heartRate: number, symptoms: string[]) => void;
  onToggleTimer: () => void;
  onEmergencyStop: () => void;
  onCompleteTest: () => void;
}> = ({ timer, isRunning, measurements, nextMeasurementIn, onAddMeasurement, onToggleTimer, onEmergencyStop, onCompleteTest }) => {
  const [heartRate, setHeartRate] = useState('');
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [lastToastTime, setLastToastTime] = useState(0);

  // Timer reminders
  React.useEffect(() => {
    if (timer > 0 && nextMeasurementIn) {
      const isDue = nextMeasurementIn === 30; // Just hit 30 second mark
      const isWarning = nextMeasurementIn <= 5 && nextMeasurementIn > 0; // Countdown warning
      
      if (isDue && timer !== lastToastTime) {
        toast.info('⏰ Time to record heart rate measurement', {
          duration: 4000,
        });
        setLastToastTime(timer);
      } else if (isWarning && Math.floor(timer / 5) !== Math.floor(lastToastTime / 5)) {
        toast.warning(`Measurement due in ${nextMeasurementIn} seconds`, {
          duration: 2000,
        });
        setLastToastTime(timer);
      }
    }
  }, [timer, nextMeasurementIn, lastToastTime]);

  const handleRecord = () => {
    const hr = parseInt(heartRate);
    if (!heartRate || isNaN(hr)) {
      toast.error('Please enter a valid heart rate');
      return;
    }
    if (hr < 30 || hr > 200) {
      toast.error('Heart rate must be between 30-200 bpm');
      return;
    }
    onAddMeasurement(hr, selectedSymptoms);
    toast.success(`Measurement recorded: ${hr} bpm`);
    setHeartRate('');
    setSelectedSymptoms([]);
  };

  const handleSymptomToggle = (symptom: string) => {
    setSelectedSymptoms(prev =>
      prev.includes(symptom) ? prev.filter(s => s !== symptom) : [...prev, symptom]
    );
  };

  return (
    <div className="max-w-4xl mx-auto px-4">
      <Card>
        <CardContent className="">
          {/* Phase Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6 p-4 rounded-lg bg-muted/50">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-muted/50 rounded-full flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 sm:h-8 sm:w-8" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-foreground">
                  Standing Test Phase
                </h2>
                <p className="text-sm sm:text-base text-muted-foreground mt-1">
                  Record heart rate every 30 seconds
                </p>
              </div>
            </div>
            <div className="ml-auto">
              <Badge variant={isRunning ? "default" : "secondary"} className="text-sm">
                {isRunning ? 'Running' : 'Paused'}
              </Badge>
            </div>
          </div>

          {/* Prominent Timer Display */}
          <div className="text-center mb-8">
            <div className="text-6xl sm:text-8xl font-bold mb-4 text-foreground">
              {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}
            </div>
            <Progress value={Math.min((timer / 600) * 100, 100)} className="h-3 sm:h-4 mb-4" />
            <div className="text-sm text-muted-foreground">
              Next measurement in: {nextMeasurementIn}s | Recorded: {measurements.length}
            </div>
          </div>

          {/* Main Input Area */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {/* Heart Rate Input */}
            <div className="space-y-4">
              <p className="text-lg font-semibold flex items-center gap-2">
                <div className="w-3 h-3 bg-primary rounded-full"></div>
                Heart Rate Entry
              </p>
              <div className="space-y-2">
                <Label htmlFor="heartRate" className="text-base font-medium">
                  Pulse Rate (bpm)
                </Label>
                <Input
                  id="heartRate"
                  type="number"
                  value={heartRate}
                  onChange={(e) => setHeartRate(e.target.value)}
                  className="text-2xl text-center h-16"
                  placeholder="e.g., 85"
                  min="30"
                  max="200"
                />
              </div>
            </div>

            {/* Symptom Selection */}
            <div className="space-y-4">
              <p className="text-lg font-semibold flex items-center gap-2">
                <div className="w-3 h-3 bg-muted-foreground rounded-full"></div>
                Symptoms <span className="text-muted-foreground text-sm">(Optional)</span>
              </p>
              <CompactSymptomSelector
                selectedSymptoms={selectedSymptoms}
                onSymptomToggle={handleSymptomToggle}
                onClear={() => setSelectedSymptoms([])}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <Button
              onClick={handleRecord}
              disabled={!heartRate}
              size="lg"
              className="flex-1 h-12 sm:h-16 text-base sm:text-lg"
            >
              Record Measurement
            </Button>
            <Button
              onClick={onToggleTimer}
              variant={isRunning ? "secondary" : "outline"}
              size="lg"
              className="h-12 sm:h-16 px-4 sm:px-6"
            >
              {isRunning ? <Pause className="h-4 w-4 sm:h-5 sm:w-5 mr-2" /> : <Play className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />}
              {isRunning ? 'Pause' : 'Resume'}
            </Button>
            <Button
              onClick={onEmergencyStop}
              variant="destructive"
              size="lg"
              className="h-12 sm:h-16 px-4 sm:px-6"
            >
              <Square className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
              Stop
            </Button>
          </div>

          <Separator className="my-6" />

          {/* Recent Measurements */}
          <div>
            <p className="text-lg font-semibold mb-4">Recent Measurements</p>
            <RecentMeasurements measurements={measurements} />
          </div>

          {/* Complete Test Buttons */}
          {timer >= 600 && measurements.length >= 10 && (
            <div className="mt-6">
              <Button
                onClick={onCompleteTest}
                size="lg"
                className="w-full h-12 sm:h-16 text-base sm:text-xl"
              >
                <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 mr-3" />
                Complete Test
              </Button>
            </div>
          )}

          {/* Early completion option */}
          {timer >= 300 && measurements.length >= 5 && !(timer >= 600 && measurements.length >= 10) && (
            <div className="mt-6">
              <Button
                onClick={onCompleteTest}
                variant="outline"
                size="lg"
                className="w-full h-12"
              >
                Complete Early
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

const ClinicalPotsAssessment: React.FC = () => {
  const [patientName, setPatientName] = useState('');
  const [testDate, setTestDate] = useState(new Date().toISOString().split('T')[0]);
  const [phase, setPhase] = useState<TestPhase>('setup');
  const [timer, setTimer] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  const [initialBP, setInitialBP] = useState<BloodPressure>({ systolic: '', diastolic: '' });
  const [initialPR, setInitialPR] = useState('');
  const [lowestSupinePR, setLowestSupinePR] = useState('');

  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [showTrendLine, setShowTrendLine] = useState(false);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-advance supine phase after 10 minutes
  useEffect(() => {
    if (phase === 'supine' && timer >= 600) {
      setIsRunning(false);
      toast.success('Supine phase complete! Ready to start standing phase.', {
        duration: 5000,
        action: {
          label: 'Start Standing',
          onClick: () => startStandingPhase()
        }
      });
    }
  }, [phase, timer]);

  // Timer logic
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning]);

  const startSupinePhase = () => {
    if (!patientName.trim()) {
      toast.error('Please enter patient name');
      return;
    }
    if (!initialBP.systolic || !initialBP.diastolic || !initialPR) {
      toast.error('Please complete all baseline measurements');
      return;
    }

    setPhase('supine');
    setTimer(0);
    setIsRunning(true);
    toast.success('Starting 10-minute supine rest phase');
  };

  const startStandingPhase = () => {
    if (!lowestSupinePR) {
      toast.warning('Standing phase started without lowest supine HR recorded', {
        description: 'You can still complete the test, but consider recording it if possible'
      });
    } else {
      toast.success('Standing phase started - Record heart rate every 30 seconds');
    }

    setPhase('standing');
    setTimer(0);
    setIsRunning(true);
  };

  const manualAdvanceToStanding = () => {
    const timeStr = `${Math.floor(timer / 60)}:${(timer % 60).toString().padStart(2, '0')}`;

    if (!lowestSupinePR) {
      toast.warning('Lowest supine pulse rate not recorded', {
        description: 'Consider recording before advancing, but you may proceed if needed'
      });
    }

    if (timer < 180) {
      toast.warning(`Early advance at ${timeStr}`, {
        description: 'Typically recommend 3+ minutes supine, but clinician discretion applies'
      });
    } else if (timer < 300) {
      toast.info(`Supine phase completed at ${timeStr}`, {
        description: 'Standard protocol recommends 5-10 minutes'
      });
    } else {
      toast.success(`Supine phase completed at ${timeStr}`);
    }

    setIsRunning(false);
    startStandingPhase();
  };

  const handleMeasurementAdded = (heartRate: number, symptoms: string[]) => {
    const timeMinutes = Math.floor(timer / 60);
    const timeSeconds = timer % 60;
    const measurement: Measurement = {
      timeMinutes,
      timeSeconds,
      totalSeconds: timer,
      pulseRate: heartRate,
      symptoms: symptoms.join(', '),
      label: `${timeMinutes}:${timeSeconds.toString().padStart(2, '0')}`,
      chartTime: timer / 60
    };

    setMeasurements(prev => [...prev, measurement]);
  };

  const emergencyStop = () => {
    setIsRunning(false);
    setPhase('complete');
    toast.warning('Test stopped by operator');
  };

  const completeTest = () => {
    setIsRunning(false);
    setPhase('complete');
    toast.success('Test completed successfully!');
  };

  const resetTest = () => {
    setPhase('setup');
    setTimer(0);
    setIsRunning(false);
    setMeasurements([]);
    setLowestSupinePR('');
    toast.info('Test reset - ready for new patient');
  };

  const getStats = (): TestStats => {
    if (measurements.length === 0) return { lowest: 0, highest: 0, delta: 0 };
    const pulseRates = measurements.map(m => m.pulseRate).filter(pr => pr && !isNaN(pr));
    if (pulseRates.length === 0) return { lowest: 0, highest: 0, delta: 0 };

    const lowest = Math.min(...pulseRates);
    const highest = Math.max(...pulseRates);
    const delta = highest - lowest;
    return { lowest, highest, delta };
  };

  const prepareChartData = (): ChartDataPoint[] => {
    const chartData: ChartDataPoint[] = [];
    if (initialPR) {
      chartData.push({
        time: -2,
        heartRate: parseInt(initialPR),
        label: 'Initial (Supine)',
        isPreTest: true
      });
    }
    if (lowestSupinePR) {
      chartData.push({
        time: -1,
        heartRate: parseInt(lowestSupinePR),
        label: 'Lowest Supine',
        isPreTest: true
      });
    }
    measurements.forEach(m => {
      if (m.pulseRate && !isNaN(m.pulseRate)) {
        chartData.push({
          time: m.chartTime,
          heartRate: m.pulseRate,
          label: `${m.label} (Standing)`,
          isPreTest: false
        });
      }
    });
    return chartData.sort((a, b) => a.time - b.time);
  };

  const getTrendLineData = (): TrendDataPoint[] => {
    if (!showTrendLine) return [];
    const chartData = prepareChartData();
    const standingData = chartData.filter(d => !d.isPreTest);
    if (standingData.length < 2) return [];

    const n = standingData.length;
    const sumX = standingData.reduce((sum, d) => sum + d.time, 0);
    const sumY = standingData.reduce((sum, d) => sum + d.heartRate, 0);
    const sumXY = standingData.reduce((sum, d) => sum + d.time * d.heartRate, 0);
    const sumXX = standingData.reduce((sum, d) => sum + d.time * d.time, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    return standingData.map(d => ({
      time: d.time,
      trendValue: slope * d.time + intercept
    }));
  };

  const generateSummary = (): string => {
    const stats = getStats();
    return `NASA 10-Minute Lean Test Results

Patient: ${patientName}
Date: ${testDate}

Initial Measurements (Supine):
- Blood Pressure: ${initialBP.systolic}/${initialBP.diastolic} mmHg
- Initial Pulse Rate: ${initialPR} bpm
- Lowest Supine PR: ${lowestSupinePR} bpm

Standing Phase Measurements:
${measurements.map(m =>
      `${m.label}: ${m.pulseRate} bpm${m.symptoms ? ` (${m.symptoms})` : ''}`
    ).join('\n')}

Summary Statistics:
- Lowest Standing HR: ${stats.lowest} bpm
- Highest Standing HR: ${stats.highest} bpm
- Heart Rate Increase (Δ): ${stats.delta} bpm

Clinical Interpretation:
${stats.delta >= 30 ? '⚠️ Positive POTS criteria (ΔHR ≥30 bpm)' : '✓ Negative for POTS criteria'}

Test completed by: ${navigator.userAgent.includes('Mobile') ? 'Mobile Device' : 'Desktop'}
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
      link.download = `pots-test-${patientName.replace(/\s+/g, '-')}-${testDate}.png`;
      link.href = canvas.toDataURL();
      link.click();
      URL.revokeObjectURL(svgUrl);
      toast.success('Chart exported successfully');
    };
    img.src = svgUrl;
  };

  const getPhaseProgress = (): number => {
    if (phase === 'setup') return 0;
    if (phase === 'supine') return 25 + (timer / 600) * 25;
    if (phase === 'standing') return 50 + (timer / 600) * 50;
    return 100;
  };

  const chartData = prepareChartData();
  const trendData = getTrendLineData();
  const stats = getStats();
  const nextMeasurementIn = phase === 'standing' ? 30 - (timer % 30) : undefined;

  return (
    <div className="min-h-screen bg-background">
      {/* Clinical Header */}
      <div className="bg-card shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <Activity size={24} className="text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">NASA Lean Test</p>
                <p className="text-muted-foreground">Clinical POTS Assessment</p>
              </div>
              {patientName && (
                <Badge variant="outline" className="text-lg px-3 py-1">
                  {patientName}
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-6">
              {phase !== 'complete' &&
                <div className="w-48">
                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span>Test Progress</span>
                    <span>{Math.round(getPhaseProgress())}%</span>
                  </div>
                  <Progress value={getPhaseProgress()} className="h-3" />
                </div>
              }

              {phase === 'complete' && (
                <Badge variant="default" className="text-sm">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Complete
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="p-4">
        {/* Setup Phase */}
        {phase === 'setup' && (
          <div className="space-y-6">
            <PatientInfoCard
              patientName={patientName}
              setPatientName={setPatientName}
              testDate={testDate}
              setTestDate={setTestDate}
            />
            <BaselineMeasurementsCard
              initialBP={initialBP}
              setInitialBP={setInitialBP}
              initialPR={initialPR}
              setInitialPR={setInitialPR}
              onStartSupinePhase={startSupinePhase}
            />
          </div>
        )}

        {/* Supine Phase */}
        {phase === 'supine' && (
          <div>
            <Card>
              <CardContent className="">
                {/* Phase Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6 p-4 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-4">
                    <Clock className="h-6 w-6 sm:h-8 sm:w-8" />
                    <div>
                      <p className="text-xl sm:text-2xl font-bold text-foreground">
                        Supine Rest Phase
                      </p>
                      <p className="text-sm sm:text-base text-muted-foreground mt-1">
                        Patient resting flat for 10 minutes
                      </p>
                    </div>
                  </div>
                  <div className="ml-auto">
                    <Badge variant={isRunning ? "default" : "secondary"} className="text-sm">
                      {isRunning ? 'Running' : 'Paused'}
                    </Badge>
                  </div>
                </div>

                {/* Main Timer Display */}
                <div className="text-center mb-8">
                  <div className="text-6xl sm:text-8xl font-bold mb-4 text-foreground">
                    {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}
                  </div>
                  <Progress value={Math.min((timer / 600) * 100, 100)} className="h-3 sm:h-4 mb-4" />
                  <div className="text-sm text-muted-foreground">
                    {Math.round(Math.min((timer / 600) * 100, 100))}% Complete
                  </div>
                </div>

                <Separator className="my-8" />

                {/* Record Lowest HR */}
                <div className="mb-4 text-center">
                  <p className="text-xl font-semibold mb-2">Record Lowest Supine Heart Rate</p>
                  <div className="max-w-sm mx-auto">
                    <Input
                      id="lowestPR"
                      type="number"
                      value={lowestSupinePR}
                      onChange={(e) => setLowestSupinePR(e.target.value)}
                      className="text-2xl text-center mt-3 h-16"
                      placeholder="e.g., 68 bpm"
                    />
                    {lowestSupinePR && (
                      <p className="text-sm text-muted-foreground mt-2">
                        ✓ Lowest HR recorded: {lowestSupinePR} bpm
                      </p>
                    )}
                  </div>
                </div>

                <Separator className="my-8" />

                {/* Control Buttons */}
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <Button
                      onClick={() => setIsRunning(!isRunning)}
                      variant={isRunning ? "secondary" : "default"}
                      size="lg"
                      className="flex-1 h-16 text-xl"
                    >
                      {isRunning ? <Pause className="h-6 w-6 mr-3" /> : <Play className="h-6 w-6 mr-3" />}
                      {isRunning ? 'Pause' : 'Resume'}
                    </Button>


                    <Button
                      onClick={emergencyStop}
                      variant="destructive"
                      size="lg"
                      className="h-16 px-8"
                    >
                      <Square className="h-6 w-6 mr-2" />
                      Stop
                    </Button>
                  </div>

                  {/* Start Standing Button */}
                  {lowestSupinePR && (
                    <div>
                      <Button
                        onClick={startStandingPhase}
                        size="lg"
                        className="w-full h-16 text-xl"
                      >
                        <CheckCircle className="h-6 w-6 mr-3" />
                        Start Standing Phase
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Standing Phase - Single View Layout */}
        {phase === 'standing' && (
          <div className="py-4">
            <StandingPhase
            timer={timer}
            isRunning={isRunning}
            measurements={measurements}
            nextMeasurementIn={nextMeasurementIn}
            onAddMeasurement={handleMeasurementAdded}
            onToggleTimer={() => setIsRunning(!isRunning)}
            onEmergencyStop={emergencyStop}
            onCompleteTest={completeTest}
          />
          </div>
        )}

        {/* Results - Only show when test is complete */}
        {phase === 'complete' && (
          <>
            <div className="max-w-4xl mx-auto px-4 py-4 space-y-6 pb-24">
              <div className="text-center">
                <h2 className="text-2xl sm:text-3xl font-bold mb-2">Test Results</h2>
                <p className="text-muted-foreground">Clinical summary and data visualization</p>
              </div>

              {/* Clinical Summary Card */}
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl sm:text-2xl font-bold">Clinical Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-6 sm:gap-8">
                      <div className="space-y-4">
                        <div>
                          <p className="font-semibold mb-2 text-base sm:text-lg">Patient Information</p>
                          <p><strong>Name:</strong> {patientName}</p>
                          <p><strong>Date:</strong> {testDate}</p>
                        </div>

                        <div>
                          <p className="font-semibold mb-2 text-base sm:text-lg">Baseline Measurements</p>
                          <p><strong>Blood Pressure:</strong> {initialBP.systolic}/{initialBP.diastolic} mmHg</p>
                          <p><strong>Initial Pulse Rate:</strong> {initialPR} bpm</p>
                          <p><strong>Lowest Supine HR:</strong> {lowestSupinePR} bpm</p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <p className="font-semibold mb-2 text-base sm:text-lg">Test Results</p>
                          <p><strong>Measurements Taken:</strong> {measurements.length}</p>
                          <p><strong>Lowest Standing HR:</strong> {stats.lowest} bpm</p>
                          <p><strong>Highest Standing HR:</strong> {stats.highest} bpm</p>
                          <p><strong>Heart Rate Increase (Δ):</strong> {stats.delta} bpm</p>
                        </div>


                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <StatsCards stats={stats} />

              <HeartRateChart
                chartData={chartData}
                trendData={trendData}
                showTrendLine={showTrendLine}
                onToggleTrendLine={() => setShowTrendLine(!showTrendLine)}
                onExportChart={exportChart}
              />
            </div>

            {/* Fixed Bottom Footer */}
            <div className="fixed bottom-0 left-0 right-0 bg-card border-t shadow-lg z-50">
              <div className="max-w-4xl mx-auto p-4">
                <div className="flex items-center justify-between gap-3">
                  <Button
                    onClick={resetTest}
                    variant="outline"
                    size="lg"
                    className="h-12 sm:h-14 text-base"
                  >
                    <RotateCcw size={18} className="mr-2" />
                    New Test
                  </Button>
                  <div className="flex-1 flex justify-end gap-3">
                    <Button
                      onClick={exportChart}
                      size="lg"
                      className="h-12 sm:h-14 text-base flex-1 bg-secondary"
                    >
                      <Download size={18} className="mr-2" />
                      Export Chart
                    </Button>
                    <Button
                      onClick={copyToClipboard}
                      size="lg"
                      className="h-12 sm:h-14 text-base flex-1"
                    >
                      <Copy size={18} className="mr-2" />
                      Copy Summary
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
};

export default ClinicalPotsAssessment;