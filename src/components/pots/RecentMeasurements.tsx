import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Measurement } from '@/types/pots';

interface RecentMeasurementsProps {
  measurements: Measurement[];
}

export const RecentMeasurements: React.FC<RecentMeasurementsProps> = ({
  measurements
}) => {
  if (measurements.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Measurements</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-4">
            No measurements recorded yet
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Measurements</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {measurements.slice(-6).reverse().map((m, idx) => (
            <div key={idx} className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
              <div className="flex flex-col">
                <span className="font-medium">{m.label}</span>
                {m.symptoms && (
                  <span className="text-xs text-muted-foreground">{m.symptoms}</span>
                )}
              </div>
              <span className="text-lg sm:text-xl font-bold text-primary">{m.pulseRate} bpm</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};