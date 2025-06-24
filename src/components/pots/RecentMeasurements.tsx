import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Measurement } from '@/types/pots';
import { MeasurementCRUD } from './MeasurementCRUD';

interface RecentMeasurementsProps {
  measurements: Measurement[];
  onUpdateMeasurement?: (index: number, heartRate: number, symptoms: string[]) => void;
  onDeleteMeasurement?: (index: number) => void;
  onAddMissedMeasurement?: (timeMinutes: number, timeSeconds: number, heartRate: number, symptoms: string[]) => void;
  currentTimer?: number;
}

export const RecentMeasurements: React.FC<RecentMeasurementsProps> = ({
  measurements,
  onUpdateMeasurement,
  onDeleteMeasurement,
  onAddMissedMeasurement,
  currentTimer = 0
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
      <CardContent className="p-4">
        <MeasurementCRUD
          measurements={measurements}
          onUpdateMeasurement={onUpdateMeasurement || (() => {})}
          onDeleteMeasurement={onDeleteMeasurement || (() => {})}
          onAddMissedMeasurement={onAddMissedMeasurement || (() => {})}
          showAddButton={!!onAddMissedMeasurement}
          maxDisplayed={6}
          title="Recent Measurements"
        />
      </CardContent>
    </Card>
  );
};