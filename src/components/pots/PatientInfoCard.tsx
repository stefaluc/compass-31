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
      <CardHeader className="">
        <CardTitle className="flex items-center gap-3 text-xl">
          <div className="w-12 h-12 bg-secondary/5 rounded-full flex items-center justify-center">
            <User size={24} className="text-secondary" />
          </div>
          <div>
            <div>Patient Information</div>
            <p className="text-muted-foreground text-sm font-normal">
              Enter patient details to begin the NASA Lean Test assessment
            </p>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="patientName" className="text-base font-medium">
              Patient Name *
            </Label>
            <Input
              id="patientName"
              type="text"
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
              placeholder="Enter full name"
              className="h-12 text-lg"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="testDate" className="text-base font-medium">
              Test Date
            </Label>
            <Input
              id="testDate"
              type="date"
              value={testDate}
              onChange={(e) => setTestDate(e.target.value)}
              className="h-12 text-lg"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};