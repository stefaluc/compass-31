import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Pause, Play, Square, AlertTriangle } from 'lucide-react';

interface MeasurementInputProps {
  currentPR: string;
  setCurrentPR: (pr: string) => void;
  currentSymptoms: string;
  setCurrentSymptoms: (symptoms: string) => void;
  onAddMeasurement: () => void;
  isRunning: boolean;
  onToggleTimer: () => void;
  onStopTest: () => void;
  timer: number;
  showMeasurementDue?: boolean;
}

export const MeasurementInput: React.FC<MeasurementInputProps> = ({
  currentPR,
  setCurrentPR,
  currentSymptoms,
  setCurrentSymptoms,
  onAddMeasurement,
  isRunning,
  onToggleTimer,
  onStopTest,
  timer,
  showMeasurementDue
}) => {
  const isDue = timer % 30 === 0 && timer > 0 && showMeasurementDue;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Record Measurement</CardTitle>
      </CardHeader>
      <CardContent>
        {isDue && (
          <Alert className="mb-6 border-primary bg-primary/5">
            <AlertTriangle className="h-4 w-4 text-primary" />
            <AlertDescription className="text-primary font-semibold">
              ⏰ Record measurement now!
            </AlertDescription>
          </Alert>
        )}

        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <Label htmlFor="currentPR">Current Pulse Rate (bpm)</Label>
            <Input
              id="currentPR"
              type="number"
              value={currentPR}
              onChange={(e) => setCurrentPR(e.target.value)}
              className="text-2xl text-center mt-2"
              placeholder="85"
            />
          </div>
          <div>
            <Label htmlFor="symptoms">Symptoms (optional)</Label>
            <Input
              id="symptoms"
              type="text"
              value={currentSymptoms}
              onChange={(e) => setCurrentSymptoms(e.target.value)}
              className="mt-2"
              placeholder="Dizziness, nausea..."
            />
          </div>
        </div>

        <div className="flex gap-4 mt-6">
          <Button
            onClick={onAddMeasurement}
            className="flex-1"
            size="lg"
            variant="default"
          >
            Record Measurement
          </Button>
          <Button
            onClick={onToggleTimer}
            variant="secondary"
            size="lg"
          >
            {isRunning ? <Pause size={20} /> : <Play size={20} />}
          </Button>
          <Button
            onClick={onStopTest}
            variant="destructive"
            size="lg"
          >
            <Square size={20} />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};