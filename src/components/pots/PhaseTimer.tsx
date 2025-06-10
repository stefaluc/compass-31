import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Clock, Play, Pause } from 'lucide-react';
import { TestPhase } from '@/types/pots';

interface PhaseTimerProps {
  phase: TestPhase;
  timer: number;
  isRunning: boolean;
  onToggleTimer: () => void;
  onNextPhase?: () => void;
  lowestSupinePR?: string;
  setLowestSupinePR?: (pr: string) => void;
  maxTime?: number;
}

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export const PhaseTimer: React.FC<PhaseTimerProps> = ({
  phase,
  timer,
  isRunning,
  onToggleTimer,
  onNextPhase,
  lowestSupinePR,
  setLowestSupinePR,
  maxTime = 600
}) => {
  const progress = Math.min((timer / maxTime) * 100, 100);
  const isSupinePhase = phase === 'supine';
  
  return (
    <Card>
      <CardContent className="p-8 text-center">
        <div className="mb-8">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Clock size={32} className="text-primary" />
          </div>
          <h2 className="text-2xl font-semibold mb-2">
            {isSupinePhase ? 'Supine Rest Phase' : 'Standing Phase'}
          </h2>
          <p className="text-muted-foreground">
            {isSupinePhase 
              ? 'Patient resting supine for 10 minutes' 
              : 'Record Every 30 Seconds'
            }
          </p>
        </div>

        <div className="mb-8">
          <div className="text-6xl font-bold text-primary mb-4">
            {formatTime(timer)}
          </div>
          <Progress value={progress} className="h-3" />
        </div>

        {isSupinePhase && setLowestSupinePR && (
          <div className="max-w-sm mx-auto mb-8">
            <Label htmlFor="lowestPR" className="text-lg font-medium">
              Record Lowest Pulse Rate
            </Label>
            <Input
              id="lowestPR"
              type="number"
              value={lowestSupinePR}
              onChange={(e) => setLowestSupinePR(e.target.value)}
              className="text-2xl text-center mt-3"
              placeholder="68"
            />
          </div>
        )}

        <div className="flex gap-4 justify-center">
          <Button
            onClick={onToggleTimer}
            variant="secondary"
            size="lg"
          >
            {isRunning ? <Pause size={20} /> : <Play size={20} />}
            <span className="ml-2">{isRunning ? 'Pause' : 'Resume'}</span>
          </Button>
          {onNextPhase && (
            <Button onClick={onNextPhase} size="lg">
              {isSupinePhase ? 'Start Standing Phase' : 'Complete Test'}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};