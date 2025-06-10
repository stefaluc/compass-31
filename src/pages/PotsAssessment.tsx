import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Copy, RotateCcw, Activity } from 'lucide-react';
import { BloodPressure, Measurement, TestPhase, TestStats, ChartDataPoint, TrendDataPoint } from '@/types/pots';

// Component imports
import { PatientInfoCard } from '@/components/pots/PatientInfoCard';
import { BaselineMeasurementsCard } from '@/components/pots/BaselineMeasurementsCard';
import { PhaseTimer } from '@/components/pots/PhaseTimer';
import { MeasurementInput } from '@/components/pots/MeasurementInput';
import { RecentMeasurements } from '@/components/pots/RecentMeasurements';
import { StatsCards } from '@/components/pots/StatsCards';
import { HeartRateChart } from '@/components/pots/HeartRateChart';
import { WarningModal } from '@/components/pots/WarningModal';

const PotsAssessment: React.FC = () => {
  const [patientName, setPatientName] = useState('');
  const [testDate, setTestDate] = useState(new Date().toISOString().split('T')[0]);
  const [phase, setPhase] = useState<TestPhase>('setup');
  const [timer, setTimer] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  
  const [initialBP, setInitialBP] = useState<BloodPressure>({ systolic: '', diastolic: '' });
  const [initialPR, setInitialPR] = useState('');
  const [lowestSupinePR, setLowestSupinePR] = useState('');
  
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [symptoms, setSymptoms] = useState<Record<number, string>>({});
  const [currentPR, setCurrentPR] = useState('');
  const [currentSymptoms, setCurrentSymptoms] = useState('');
  
  const [showTrendLine, setShowTrendLine] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isRunning && phase === 'standing') {
      intervalRef.current = setInterval(() => {
        setTimer(prev => {
          const newTime = prev + 1;
          const timeUntilNext30 = 30 - (newTime % 30);
          setShowWarning(timeUntilNext30 <= 5 && timeUntilNext30 > 0);
          return newTime;
        });
      }, 1000);
    } else if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, phase]);

  const startSupinePhase = () => {
    if (!patientName || !initialBP.systolic || !initialBP.diastolic || !initialPR) {
      alert('Please complete all required fields');
      return;
    }
    setPhase('supine');
    setTimer(0);
    setIsRunning(true);
  };

  const startStandingPhase = () => {
    if (!lowestSupinePR) {
      alert('Please record the lowest supine pulse rate');
      return;
    }
    setPhase('standing');
    setTimer(0);
    setIsRunning(true);
    setShowWarning(false);
    const standingMeasurement: Measurement = {
      timeMinutes: 0,
      timeSeconds: 0,
      totalSeconds: 0,
      pulseRate: parseInt(currentPR) || 0,
      symptoms: currentSymptoms || '',
      label: '0:00',
      chartTime: 0
    };
    setMeasurements([standingMeasurement]);
  };

  const addMeasurement = () => {
    if (!currentPR) {
      alert('Please enter pulse rate');
      return;
    }
    const timeMinutes = Math.floor(timer / 60);
    const timeSeconds = timer % 60;
    const measurement: Measurement = {
      timeMinutes,
      timeSeconds,
      totalSeconds: timer,
      pulseRate: parseInt(currentPR),
      symptoms: currentSymptoms,
      label: `${timeMinutes}:${timeSeconds.toString().padStart(2, '0')}`,
      chartTime: timer / 60
    };
    setMeasurements(prev => [...prev, measurement]);
    setSymptoms(prev => ({ ...prev, [timer]: currentSymptoms }));
    setCurrentPR('');
    setCurrentSymptoms('');
  };

  const stopTest = () => {
    setIsRunning(false);
    setPhase('complete');
    setShowWarning(false);
  };

  const resetTest = () => {
    setPhase('setup');
    setTimer(0);
    setIsRunning(false);
    setMeasurements([]);
    setSymptoms({});
    setCurrentPR('');
    setCurrentSymptoms('');
    setLowestSupinePR('');
    setShowWarning(false);
  };

  const getStats = (): TestStats => {
    if (measurements.length === 0) return { lowest: 0, highest: 0, delta: 0 };
    const pulseRates = measurements.map(m => m.pulseRate).filter(pr => pr && !isNaN(pr));
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
- Pulse Rate: ${initialPR} bpm
- Lowest Supine PR: ${lowestSupinePR} bpm

Heart Rate Measurements:
${measurements.map(m => 
  `${m.label}: ${m.pulseRate} bpm${m.symptoms ? ` (${m.symptoms})` : ''}`
).join('\n')}

Summary:
- Lowest PR: ${stats.lowest} bpm
- Highest PR: ${stats.highest} bpm
- Delta (∆): ${stats.delta} bpm

${Object.keys(symptoms).length > 0 ? `Symptoms:\n${Object.entries(symptoms).filter(([_, symptom]) => symptom).map(([time, symptom]) => `${Math.floor(parseInt(time) / 60)}:${(parseInt(time) % 60).toString().padStart(2, '0')}: ${symptom}`).join('\n')}` : 'No symptoms reported.'}`;
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generateSummary()).then(() => {
      alert('Summary copied!');
    });
  };

  const exportChart = () => {
    const svgElement = document.querySelector('.recharts-wrapper svg');
    if (!svgElement) return;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const img = new Image();
    const svgData = new XMLSerializer().serializeToString(svgElement);
    const svgBlob = new Blob([svgData], {type: 'image/svg+xml;charset=utf-8'});
    const svgUrl = URL.createObjectURL(svgBlob);
    
    img.onload = function() {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      const link = document.createElement('a');
      link.download = `nasa-lean-test-${patientName.replace(/\s+/g, '-')}-${testDate}.png`;
      link.href = canvas.toDataURL();
      link.click();
      URL.revokeObjectURL(svgUrl);
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

  return (
    <div className="min-h-screen bg-background">
      <WarningModal 
        isVisible={showWarning && phase === 'standing'} 
        secondsRemaining={30 - (timer % 30)} 
      />

      {/* Header */}
      <div className="bg-card shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <Activity size={24} className="text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">NASA Lean Test</h2>
                <p className="text-muted-foreground">10-Minute Orthostatic Assessment</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="w-32">
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                  <span>Progress</span>
                  <span>{Math.round(getPhaseProgress())}%</span>
                </div>
                <Progress value={getPhaseProgress()} className="h-2" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4">
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
          <PhaseTimer
            phase={phase}
            timer={timer}
            isRunning={isRunning}
            onToggleTimer={() => setIsRunning(!isRunning)}
            onNextPhase={startStandingPhase}
            lowestSupinePR={lowestSupinePR}
            setLowestSupinePR={setLowestSupinePR}
          />
        )}

        {/* Standing Phase */}
        {phase === 'standing' && (
          <div className="space-y-6">
            <PhaseTimer
              phase={phase}
              timer={timer}
              isRunning={isRunning}
              onToggleTimer={() => setIsRunning(!isRunning)}
              onNextPhase={stopTest}
            />
            
            <MeasurementInput
              currentPR={currentPR}
              setCurrentPR={setCurrentPR}
              currentSymptoms={currentSymptoms}
              setCurrentSymptoms={setCurrentSymptoms}
              onAddMeasurement={addMeasurement}
              isRunning={isRunning}
              onToggleTimer={() => setIsRunning(!isRunning)}
              onStopTest={stopTest}
              timer={timer}
              showMeasurementDue={true}
            />

            <RecentMeasurements measurements={measurements} />
          </div>
        )}

        {/* Results */}
        {(phase === 'complete' || measurements.length > 0) && (
          <div className="space-y-6 mt-8">
            <StatsCards stats={stats} />
            
            <HeartRateChart
              chartData={chartData}
              trendData={trendData}
              showTrendLine={showTrendLine}
              onToggleTrendLine={() => setShowTrendLine(!showTrendLine)}
              onExportChart={exportChart}
            />

            <div className="flex gap-4">
              <Button
                onClick={copyToClipboard}
                className="flex-1"
                size="lg"
              >
                <Copy size={20} className="mr-3" />
                Copy Summary
              </Button>
              <Button
                onClick={resetTest}
                variant="secondary"
                size="lg"
              >
                <RotateCcw size={20} className="mr-3" />
                New Test
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PotsAssessment;