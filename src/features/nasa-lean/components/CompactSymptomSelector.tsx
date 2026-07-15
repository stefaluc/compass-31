import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

interface CompactSymptomSelectorProps {
  selectedSymptoms: string[];
  onSymptomToggle: (symptom: string) => void;
  onClear: () => void;
}

const commonSymptoms = [
  'Dizziness', 'Nausea', 'Fatigue', 'Palpitations', 'Weakness', 'Blurred vision'
];

export const CompactSymptomSelector: React.FC<CompactSymptomSelectorProps> = ({
  selectedSymptoms,
  onSymptomToggle,
  onClear
}) => {
  const [customSymptom, setCustomSymptom] = React.useState('');

  const handleAddCustom = () => {
    if (customSymptom.trim()) {
      onSymptomToggle(customSymptom.trim());
      setCustomSymptom('');
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">Symptoms</Label>
        {selectedSymptoms.length > 0 && (
          <Button variant="ghost" size="sm" onClick={onClear} className="h-6 text-xs">
            Clear
          </Button>
        )}
      </div>



      {/* Quick Symptom Buttons */}
      <div className="grid grid-cols-3 gap-1">
        {commonSymptoms.map((symptom) => (
          <Button
            key={symptom}
            variant={selectedSymptoms.includes(symptom) ? "default" : "outline"}
            size="sm"
            className="h-8 text-xs px-2"
            onClick={() => onSymptomToggle(symptom)}
          >
            {symptom}
          </Button>
        ))}
      </div>
      {/* Selected Symptoms */}
      {selectedSymptoms.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {selectedSymptoms.map((symptom, index) => (
            <Badge key={index} variant="secondary" className="text-xs py-1">
              {symptom}
            </Badge>
          ))}
        </div>
      )}

      {/* Custom Input */}
      <div className="flex gap-2">
        <Input
          value={customSymptom}
          onChange={(e) => setCustomSymptom(e.target.value)}
          placeholder="Other symptom..."
          className="text-base h-12"
          onKeyDown={(e) => e.key === 'Enter' && handleAddCustom()}
        />
        {customSymptom && (
          <Button size="lg" onClick={handleAddCustom} className="h-12 px-4">
            Add
          </Button>
        )}
      </div>
    </div>
  );
};