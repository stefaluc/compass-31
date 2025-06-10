import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Measurement } from '@/types/pots';

interface RecentMeasurementsProps {
  measurements: Measurement[];
}

export const RecentMeasurements: React.FC<RecentMeasurementsProps> = ({
  measurements
}) => {
  if (measurements.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Measurements</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {measurements.slice(-5).map((m, idx) => (
            <div key={idx} className="flex justify-between items-center p-3 bg-muted rounded-lg">
              <span className="font-medium">{m.label}</span>
              <span className="text-xl font-bold text-primary">{m.pulseRate} bpm</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};