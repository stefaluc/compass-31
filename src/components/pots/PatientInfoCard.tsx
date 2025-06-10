import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User } from 'lucide-react';

interface PatientInfoCardProps {
  patientName: string;
  setPatientName: (name: string) => void;
  testDate: string;
  setTestDate: (date: string) => void;
}

export const PatientInfoCard: React.FC<PatientInfoCardProps> = ({
  patientName,
  setPatientName,
  testDate,
  setTestDate
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
            <User size={20} className="text-primary" />
          </div>
          Patient Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="patientName">Patient Name</Label>
          <Input
            id="patientName"
            type="text"
            value={patientName}
            onChange={(e) => setPatientName(e.target.value)}
            placeholder="Enter patient name"
            className="mt-2"
          />
        </div>
        <div>
          <Label htmlFor="testDate">Date</Label>
          <Input
            id="testDate"
            type="date"
            value={testDate}
            onChange={(e) => setTestDate(e.target.value)}
            className="mt-2"
          />
        </div>
      </CardContent>
    </Card>
  );
};