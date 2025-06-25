import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Copy, RotateCcw, Activity, CheckCircle, AlertTriangle, Clock, Play, Pause, Square, Download, ChevronRight } from 'lucide-react';
import { BloodPressure, Measurement, TestPhase, TestStats, ChartDataPoint, TrendDataPoint } from '@/types/pots';
import { toast } from 'sonner';

// Component imports
import { PatientInfoCard } from '@/components/pots/PatientInfoCard';
import { BaselineMeasurementsCard } from '@/components/pots/BaselineMeasurementsCard';
import { RecentMeasurements } from '@/components/pots/RecentMeasurements';
import { StatsCards } from '@/components/pots/StatsCards';
import { HeartRateChart } from '@/components/pots/HeartRateChart';
import { CompactSymptomSelector } from '@/components/pots/CompactSymptomSelector';
import { MeasurementCRUD } from '@/components/pots/MeasurementCRUD';
import { PDFReportGenerator } from '@/components/pots/PDFReportGenerator';
import { LinearProgress } from '@mui/material';

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
  isInitialHRRecording: boolean;
  onRecordInitialHR: (heartRate: number, symptoms: string[]) => void;
  onUpdateMeasurement: (index: number, heartRate: number, symptoms: string[]) => void;
  onDeleteMeasurement: (index: number) => void;
  onAddMissedMeasurement: (timeMinutes: number, timeSeconds: number, heartRate: number, symptoms: string[]) => void;
}> = ({ timer, isRunning, measurements, nextMeasurementIn, onAddMeasurement, onToggleTimer, onEmergencyStop, onCompleteTest, isInitialHRRecording, onRecordInitialHR, onUpdateMeasurement, onDeleteMeasurement, onAddMissedMeasurement }) => {
  const [heartRate, setHeartRate] = useState('');
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [lastToastTime, setLastToastTime] = useState(0);

  // Timer reminders
  React.useEffect(() => {
    if (timer > 0 && nextMeasurementIn && !isInitialHRRecording) {
      const isDue = nextMeasurementIn === 30; // Just hit 30 second mark
      const isWarning = nextMeasurementIn <= 5 && nextMeasurementIn > 0; // Countdown warning

      if (isDue && timer !== lastToastTime) {
        toast.info('⏰ Time to record heart rate measurement', {
          duration: 2000,
        });
        setLastToastTime(timer);
      } else if (isWarning) {
        // Show individual countdown toasts for 5, 4, 3, 2, 1
        const currentSecond = nextMeasurementIn;
        const lastSecond = Math.ceil((timer - 1) % 30);
        if (currentSecond !== lastSecond && currentSecond <= 5) {
          toast.warning(`Record measurement in ${currentSecond} second${currentSecond === 1 ? '' : 's'}`, {
            duration: 800,
          });
        }
      }
    }
  }, [timer, nextMeasurementIn, lastToastTime, isInitialHRRecording]);

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
    
    if (isInitialHRRecording) {
      onRecordInitialHR(hr, selectedSymptoms);
      toast.success(`Initial standing HR recorded: ${hr} bpm - Timer started!`);
    } else {
      onAddMeasurement(hr, selectedSymptoms);
      toast.success(`Measurement recorded: ${hr} bpm`);
    }
    
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
                <p className="text-xl sm:text-2xl font-bold text-foreground">
                  Standing Test Phase
                </p>
                <p className="text-sm sm:text-base text-muted-foreground">
                  {isInitialHRRecording ? 'Record initial standing heart rate to start timer' : 'Record heart rate every 30 seconds'}
                </p>
              </div>
            </div>
            <div className="ml-auto">
              <Badge variant={isInitialHRRecording ? "outline" : (isRunning ? "default" : "secondary")} className="text-sm">
                {isInitialHRRecording ? 'Ready to Start' : (isRunning ? 'Running' : 'Paused')}
              </Badge>
            </div>
          </div>

          {/* Prominent Timer Display */}
          {!isInitialHRRecording && (
            <div className="text-center mb-8">
              <div className="text-6xl sm:text-8xl font-bold mb-4 text-foreground">
                {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}
              </div>
              <Progress value={Math.min((timer / 600) * 100, 100)} className="h-3 sm:h-4 mb-4" />
              <div className="text-sm text-muted-foreground">
                Next measurement in: {nextMeasurementIn}s | Recorded: {measurements.length}
              </div>
            </div>
          )}

          {/* Initial HR Recording Display */}
          {isInitialHRRecording && (
            <div className="text-center mb-8">
              <div className="text-lg sm:text-xl font-bold text-foreground">
                Record Initial Standing HR
              </div>
              <p className="text-muted-foreground mb-4">
                Have the patient stand up, then immediately record their heart rate to start the 10-minute timer.
              </p>
            </div>
          )}

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
              className="sm:flex-1 h-12 sm:h-16 text-base sm:text-lg"
            >
              {isInitialHRRecording ? <Play className="h-4 w-4 sm:h-5 sm:w-5 mr-2" /> : <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />}
              {isInitialHRRecording ? 'Record Initial HR & Start Timer' : 'Record Measurement'}
            </Button>
            {!isInitialHRRecording && (
              <Button
                onClick={onToggleTimer}
                variant={isRunning ? "secondary" : "outline"}
                size="lg"
                className="h-12 sm:h-16 px-4 sm:px-6"
              >
                {isRunning ? <Pause className="h-4 w-4 sm:h-5 sm:w-5 mr-2" /> : <Play className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />}
                {isRunning ? 'Pause' : 'Resume'}
              </Button>
            )}
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
            <RecentMeasurements 
              measurements={measurements} 
              onUpdateMeasurement={onUpdateMeasurement}
              onDeleteMeasurement={onDeleteMeasurement}
              onAddMissedMeasurement={onAddMissedMeasurement}
              currentTimer={timer}
            />
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
  const [isInitialHRRecording, setIsInitialHRRecording] = useState(false);

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
    }

    setPhase('standing');
    setTimer(0);
    setIsRunning(false);
    setIsInitialHRRecording(true);
    toast.info('Patient should now stand up. Record their initial standing heart rate to start the timer.');
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

  const handleInitialHRRecorded = (heartRate: number, symptoms: string[]) => {
    // Add the initial 0-second measurement
    const measurement: Measurement = {
      timeMinutes: 0,
      timeSeconds: 0,
      totalSeconds: 0,
      pulseRate: heartRate,
      symptoms: symptoms.join(', '),
      label: '0:00',
      chartTime: 0
    };

    setMeasurements([measurement]);
    setIsInitialHRRecording(false);
    setIsRunning(true);
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

  const handleUpdateMeasurement = (index: number, heartRate: number, symptoms: string[]) => {
    setMeasurements(prev => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        pulseRate: heartRate,
        symptoms: symptoms.join(', ')
      };
      return updated;
    });
  };

  const handleDeleteMeasurement = (index: number) => {
    setMeasurements(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddMissedMeasurement = (timeMinutes: number, timeSeconds: number, heartRate: number, symptoms: string[]) => {
    const totalSeconds = timeMinutes * 60 + timeSeconds;
    const measurement: Measurement = {
      timeMinutes,
      timeSeconds,
      totalSeconds,
      pulseRate: heartRate,
      symptoms: symptoms.join(', '),
      label: `${timeMinutes}:${timeSeconds.toString().padStart(2, '0')}`,
      chartTime: totalSeconds / 60
    };

    setMeasurements(prev => {
      const updated = [...prev, measurement];
      // Sort by total seconds to maintain chronological order
      return updated.sort((a, b) => a.totalSeconds - b.totalSeconds);
    });
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
    setIsInitialHRRecording(false);
    toast.info('Test reset - ready for new patient');
  };

  const getStats = (): TestStats => {
    // Get lowest from supine phase (either initial or lowest supine PR)
    const supineHR = lowestSupinePR ? parseInt(lowestSupinePR) : (initialPR ? parseInt(initialPR) : 0);
    
    // Get highest from all measurements (standing phase)
    const standingRates = measurements.map(m => m.pulseRate).filter(pr => pr && !isNaN(pr));
    const highestStanding = standingRates.length > 0 ? Math.max(...standingRates) : 0;
    
    // Calculate delta between supine lowest and standing highest
    const delta = supineHR > 0 && highestStanding > 0 ? highestStanding - supineHR : 0;
    
    return { 
      lowest: supineHR, 
      highest: highestStanding, 
      delta 
    };
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
    
    const sortedData = chartData.sort((a, b) => a.time - b.time);
    
    // Add trend values to the same data if trend line is enabled
    if (showTrendLine && sortedData.length >= 2) {
      const n = sortedData.length;
      const sumX = sortedData.reduce((sum, d) => sum + d.time, 0);
      const sumY = sortedData.reduce((sum, d) => sum + d.heartRate, 0);
      const sumXY = sortedData.reduce((sum, d) => sum + d.time * d.heartRate, 0);
      const sumXX = sortedData.reduce((sum, d) => sum + d.time * d.time, 0);

      const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
      const intercept = (sumY - slope * sumX) / n;

      sortedData.forEach(d => {
        d.trendValue = slope * d.time + intercept;
      });
    }
    
    return sortedData;
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
- Highest Standing HR: ${stats.highest} bpm
- Heart Rate Increase (Δ): ${stats.delta} bpm

Clinical Interpretation:
${stats.delta >= 30 ? '⚠️ Positive POTS criteria (ΔHR ≥30 bpm)' : '✓ Negative for POTS criteria'}

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
  const stats = getStats();
  const nextMeasurementIn = phase === 'standing' && !isInitialHRRecording ? 30 - (timer % 30) : undefined;

  return (
    <div className="min-h-screen bg-background">
            <LinearProgress
        sx={{ width: '100vw', position: 'fixed', left: 0, top: 0, zIndex: '40' }}
        variant="determinate"
        value={getPhaseProgress()}
        color="secondary"
      />
      {/* Clinical Header */}
      <div className="bg-card border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between text-center sm:text-left">
            <div className="flex items-center gap-4">
              {/* <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <Activity size={24} className="text-primary" />
              </div> */}
              <div>
                <h2 className="text-2xl font-bold mb-0">
                  <span className='title'>NASA Lean</span> Test
                </h2>
                <p className="text-muted-foreground">Monitor the patient's heart rate while supine and standing to assess for Orthostatic Intolerance.</p>
              </div>
            </div>

            <div className="flex items-center gap-6">
              {patientName && (
                <Badge variant="outline" className="text-lg px-3 py-1">
                  {patientName}
                </Badge>
              )}
              {/*
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
              )}*/}
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 max-w-3xl mx-auto">
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
                  <Progress value={Math.min((timer / 600) * 100, 100)} className="h-3 sm:h-4 mb-4 max-w-xl mx-auto" />
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
                  <div className="flex flex-col sm:flex-row gap-4 w-full">
                    <div className="flex gap-4 w-full">
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

                    <Button
                      onClick={startStandingPhase}
                      size="lg"
                      className="w-full sm:w-auto h-16 text-xl"
                    >
                      Continue to Standing Phase
                      <ChevronRight className="h-6 w-6 md:ml-3" />
                    </Button>
                  </div>
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
              isInitialHRRecording={isInitialHRRecording}
              onRecordInitialHR={handleInitialHRRecorded}
              onUpdateMeasurement={handleUpdateMeasurement}
              onDeleteMeasurement={handleDeleteMeasurement}
              onAddMissedMeasurement={handleAddMissedMeasurement}
            />
          </div>
        )}

        {/* Results - Only show when test is complete */}
        {phase === 'complete' && (
          <>
            <div className="max-w-4xl mx-auto px-4 py-4 space-y-6 pb-24">
              <div className="text-center">
                <p className="text-2xl sm:text-3xl font-bold">Test Results</p>
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
                showTrendLine={showTrendLine}
                onToggleTrendLine={() => setShowTrendLine(!showTrendLine)}
                onExportChart={exportChart}
              />

              {/* All Measurements Management */}
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
                    onUpdateMeasurement={handleUpdateMeasurement}
                    onDeleteMeasurement={handleDeleteMeasurement}
                    onAddMissedMeasurement={handleAddMissedMeasurement}
                    showAddButton={true}
                    title="Standing Phase Measurements"
                    className="max-h-96 overflow-y-auto"
                  />
                </CardContent>
              </Card>
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
                    <RotateCcw size={18} className="sm:mr-2" />
                    <span className="hidden sm:block">New Test</span>
                  </Button>
                  <div className="flex-1 flex justify-end gap-3">
                    <PDFReportGenerator
                      patientName={patientName}
                      testDate={testDate}
                      initialBP={initialBP}
                      initialPR={initialPR}
                      lowestSupinePR={lowestSupinePR}
                      measurements={measurements}
                      stats={stats}
                      size="lg"
                      className="h-12 sm:h-14 text-base flex-1"
                    />
                    <Button
                      onClick={exportChart}
                      size="lg"
                      variant="outline"
                      className="h-12 sm:h-14 text-base px-4"
                    >
                      <Download size={18} className="sm:mr-2" />
                      <span className="hidden sm:block">Chart</span>
                    </Button>
                    <Button
                      onClick={copyToClipboard}
                      size="lg"
                      variant="outline"
                      className="h-12 sm:h-14 text-base px-4"
                    >
                      <Copy size={18} className="sm:mr-2" />
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
};

export default ClinicalPotsAssessment;