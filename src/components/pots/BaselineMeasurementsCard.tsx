import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Play } from 'lucide-react';
import { BloodPressure } from '@/types/pots';

interface BaselineMeasurementsCardProps {
  initialBP: BloodPressure;
  setInitialBP: React.Dispatch<React.SetStateAction<BloodPressure>>;
  initialPR: string;
  setInitialPR: (pr: string) => void;
  onStartSupinePhase: () => void;
}

export const BaselineMeasurementsCard: React.FC<BaselineMeasurementsCardProps> = ({
  initialBP,
  setInitialBP,
  initialPR,
  setInitialPR,
  onStartSupinePhase
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Supine Baseline Measurements</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <Label>Blood Pressure (mmHg)</Label>
            <div className="flex gap-3 mt-2">
              <Input
                type="number"
                placeholder="120"
                value={initialBP.systolic}
                onChange={(e) => setInitialBP(prev => ({ ...prev, systolic: e.target.value }))}
                className="text-center"
              />
              <div className="flex items-center text-2xl text-muted-foreground">/</div>
              <Input
                type="number"
                placeholder="80"
                value={initialBP.diastolic}
                onChange={(e) => setInitialBP(prev => ({ ...prev, diastolic: e.target.value }))}
                className="text-center"
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="initialPR">Initial Pulse Rate (bpm)</Label>
            <Input
              id="initialPR"
              type="number"
              value={initialPR}
              onChange={(e) => setInitialPR(e.target.value)}
              className="text-center mt-2"
              placeholder="72"
            />
          </div>
        </div>

        <Button
          onClick={onStartSupinePhase}
          variant="default"
          className="w-full mt-8"
          size="lg"
        >
          <Play size={20} className="mr-3" />
          Begin 10-Minute Supine Rest
        </Button>
      </CardContent>
    </Card>
  );
};