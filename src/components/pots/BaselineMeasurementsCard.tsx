import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Play, Activity } from 'lucide-react';
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
  const isComplete = initialBP.systolic && initialBP.diastolic && initialPR;
  
  return (
    <Card>
      <CardHeader className="">
        <CardTitle className="flex items-center gap-3 text-xl">
          <div className="w-12 h-12 bg-secondary/5 rounded-full flex items-center justify-center">
            <Activity size={24} className="text-secondary" />
          </div>
          <div>
            <div>Supine Baseline Measurements</div>
            <p className="text-muted-foreground text-sm font-normal">
              Take initial measurements while patient is lying flat and relaxed
            </p>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-3">
            <Label className="text-base font-medium">Blood Pressure (mmHg) *</Label>
            <div className="flex gap-3">
              <div className="flex-1">
                <Input
                  type="number"
                  placeholder="120"
                  value={initialBP.systolic}
                  onChange={(e) => setInitialBP(prev => ({ ...prev, systolic: e.target.value }))}
                  className="text-center h-12 text-lg"
                />
                <Label className="text-xs text-muted-foreground mt-1 block text-center">
                  Systolic
                </Label>
              </div>
              <div className="flex items-center text-3xl text-muted-foreground pt-2">/</div>
              <div className="flex-1">
                <Input
                  type="number"
                  placeholder="80"
                  value={initialBP.diastolic}
                  onChange={(e) => setInitialBP(prev => ({ ...prev, diastolic: e.target.value }))}
                  className="text-center h-12 text-lg"
                />
                <Label className="text-xs text-muted-foreground mt-1 block text-center">
                  Diastolic
                </Label>
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <Label htmlFor="initialPR" className="text-base font-medium">
              Initial Pulse Rate (bpm) *
            </Label>
            <Input
              id="initialPR"
              type="number"
              value={initialPR}
              onChange={(e) => setInitialPR(e.target.value)}
              className="text-center h-12 text-lg"
              placeholder="e.g., 72"
            />
          </div>
        </div>

        <div className="pt-4 border-t flex flex-col items-center">
          <Button
            onClick={onStartSupinePhase}
            disabled={!isComplete}
            className="w-full h-16 text-xl max-w-lg mx-auto"
            size="lg"
          >
            <Play size={24} className="mr-3" />
            Begin 10-Minute Supine Rest
          </Button>
          {!isComplete && (
            <p className="text-sm text-muted-foreground text-center mt-2">
              Please complete all baseline measurements above
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};