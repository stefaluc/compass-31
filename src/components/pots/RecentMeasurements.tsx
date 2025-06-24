import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Edit2, Trash2, Plus, Clock } from 'lucide-react';
import { Measurement } from '@/types/pots';
import { CompactSymptomSelector } from './CompactSymptomSelector';
import { toast } from 'sonner';

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
  // Edit dialog state
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editHR, setEditHR] = useState('');
  const [editSymptoms, setEditSymptoms] = useState<string[]>([]);

  // Add missed dialog state
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [missedTime, setMissedTime] = useState('');
  const [missedHR, setMissedHR] = useState('');
  const [missedSymptoms, setMissedSymptoms] = useState<string[]>([]);

  // Delete confirmation dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingIndex, setDeletingIndex] = useState<number | null>(null);

  const startEdit = (index: number, measurement: Measurement) => {
    setEditingIndex(index);
    setEditHR(measurement.pulseRate.toString());
    setEditSymptoms(measurement.symptoms ? measurement.symptoms.split(', ').filter(s => s) : []);
    setEditDialogOpen(true);
  };

  const cancelEdit = () => {
    setEditDialogOpen(false);
    setEditingIndex(null);
    setEditHR('');
    setEditSymptoms([]);
  };

  const saveEdit = () => {
    if (editingIndex === null) return;
    
    const hr = parseInt(editHR);
    if (!editHR || isNaN(hr) || hr < 30 || hr > 200) {
      toast.error('Heart rate must be between 30-200 bpm');
      return;
    }
    
    onUpdateMeasurement?.(editingIndex, hr, editSymptoms);
    toast.success('Measurement updated successfully');
    cancelEdit();
  };

  const handleSymptomToggle = (symptom: string) => {
    setEditSymptoms(prev =>
      prev.includes(symptom) ? prev.filter(s => s !== symptom) : [...prev, symptom]
    );
  };

  const handleMissedSymptomToggle = (symptom: string) => {
    setMissedSymptoms(prev =>
      prev.includes(symptom) ? prev.filter(s => s !== symptom) : [...prev, symptom]
    );
  };

  const startAddMissed = () => {
    setMissedTime('');
    setMissedHR('');
    setMissedSymptoms([]);
    setAddDialogOpen(true);
  };

  const cancelAddMissed = () => {
    setAddDialogOpen(false);
    setMissedTime('');
    setMissedHR('');
    setMissedSymptoms([]);
  };

  const saveAddMissed = () => {
    if (!missedTime || !missedHR) {
      toast.error('Please fill in both time and heart rate');
      return;
    }
    
    const timeMatch = missedTime.match(/^(\d{1,2}):(\d{2})$/);
    if (!timeMatch) {
      toast.error('Invalid time format');
      return;
    }
    
    const timeMinutes = parseInt(timeMatch[1]);
    const timeSeconds = parseInt(timeMatch[2]);
    const hr = parseInt(missedHR);
    
    if (isNaN(hr) || hr < 30 || hr > 200) {
      toast.error('Heart rate must be between 30-200 bpm');
      return;
    }
    
    if (timeSeconds >= 60) {
      toast.error('Seconds must be less than 60');
      return;
    }
    
    onAddMissedMeasurement?.(timeMinutes, timeSeconds, hr, missedSymptoms);
    toast.success('Missed measurement added successfully');
    cancelAddMissed();
  };

  const startDelete = (index: number) => {
    setDeletingIndex(index);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (deletingIndex !== null) {
      onDeleteMeasurement?.(deletingIndex);
      toast.success('Measurement deleted');
    }
    setDeleteDialogOpen(false);
    setDeletingIndex(null);
  };

  const cancelDelete = () => {
    setDeleteDialogOpen(false);
    setDeletingIndex(null);
  };

  // Generate time options for missed measurements
  const generateTimeOptions = () => {
    const options = [];
    const maxMinutes = Math.min(Math.floor(currentTimer / 60), 10);
    
    for (let min = 0; min <= maxMinutes; min++) {
      for (let sec = 0; sec < 60; sec += 30) {
        if (min === maxMinutes && (min * 60 + sec) > currentTimer) break;
        const timeString = `${min}:${sec.toString().padStart(2, '0')}`;
        const totalSeconds = min * 60 + sec;
        
        // Check if this time already has a measurement
        const hasExisting = measurements.some(m => m.totalSeconds === totalSeconds);
        if (!hasExisting) {
          options.push({ value: timeString, label: timeString });
        }
      }
    }
    return options;
  };

  if (measurements.length === 0) {
    return (
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Recent Measurements</CardTitle>
            {onAddMissedMeasurement && (
              <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    onClick={startAddMissed}
                    variant="outline"
                    size="sm"
                    className="h-8"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Add Missed
                  </Button>
                </DialogTrigger>
              </Dialog>
            )}
          </div>
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
    <>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Recent Measurements</CardTitle>
            {onAddMissedMeasurement && (
              <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    onClick={startAddMissed}
                    variant="outline"
                    size="sm"
                    className="h-8"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Add Missed
                  </Button>
                </DialogTrigger>
              </Dialog>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {measurements.slice(-6).reverse().map((m, displayIdx) => {
              const actualIndex = measurements.length - 1 - displayIdx;
              
              return (
                <div key={actualIndex} className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                  <div className="flex flex-col flex-1">
                    <span className="font-medium">{m.label}</span>
                    {m.symptoms && (
                      <span className="text-xs text-muted-foreground">{m.symptoms}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-primary">{m.pulseRate} bpm</span>
                    {(onUpdateMeasurement || onDeleteMeasurement) && (
                      <div className="flex gap-1">
                        {onUpdateMeasurement && (
                          <Button
                            onClick={() => startEdit(actualIndex, m)}
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0"
                          >
                            <Edit2 className="h-3 w-3" />
                          </Button>
                        )}
                        {onDeleteMeasurement && (
                          <Button
                            onClick={() => startDelete(actualIndex)}
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Edit Measurement Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit2 className="h-4 w-4" />
              Edit Measurement
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {editingIndex !== null && (
              <div className="text-sm text-muted-foreground mb-4">
                Time: {measurements[editingIndex]?.label}
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="edit-hr">Heart Rate (bpm)</Label>
              <Input
                id="edit-hr"
                type="number"
                value={editHR}
                onChange={(e) => setEditHR(e.target.value)}
                className="text-center"
                placeholder="85"
                min="30"
                max="200"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Symptoms (Optional)</Label>
              <CompactSymptomSelector
                selectedSymptoms={editSymptoms}
                onSymptomToggle={handleSymptomToggle}
                onClear={() => setEditSymptoms([])}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={cancelEdit}>
              Cancel
            </Button>
            <Button onClick={saveEdit} disabled={!editHR}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Missed Measurement Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Add Missed Measurement
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="missed-time">Time</Label>
              <Select value={missedTime} onValueChange={setMissedTime}>
                <SelectTrigger>
                  <SelectValue placeholder="Select time (e.g., 1:30)" />
                </SelectTrigger>
                <SelectContent>
                  {generateTimeOptions().map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="missed-hr">Heart Rate (bpm)</Label>
              <Input
                id="missed-hr"
                type="number"
                value={missedHR}
                onChange={(e) => setMissedHR(e.target.value)}
                className="text-center"
                placeholder="85"
                min="30"
                max="200"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Symptoms (Optional)</Label>
              <CompactSymptomSelector
                selectedSymptoms={missedSymptoms}
                onSymptomToggle={handleMissedSymptomToggle}
                onClear={() => setMissedSymptoms([])}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={cancelAddMissed}>
              Cancel
            </Button>
            <Button onClick={saveAddMissed} disabled={!missedTime || !missedHR}>
              Add Measurement
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trash2 className="h-4 w-4" />
              Delete Measurement
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              Are you sure you want to delete this measurement? This action cannot be undone.
            </p>
            {deletingIndex !== null && (
              <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                <div className="font-medium">{measurements[deletingIndex]?.label}</div>
                <div className="text-lg font-bold text-primary">
                  {measurements[deletingIndex]?.pulseRate} bpm
                </div>
                {measurements[deletingIndex]?.symptoms && (
                  <div className="text-xs text-muted-foreground">
                    {measurements[deletingIndex]?.symptoms}
                  </div>
                )}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={cancelDelete}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};