import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Edit2, Trash2, Plus, Clock } from 'lucide-react';
import { Measurement } from '@/types/pots';
import { CompactSymptomSelector } from './CompactSymptomSelector';
import { toast } from 'sonner';

interface MeasurementCRUDProps {
  measurements: Measurement[];
  onUpdateMeasurement: (index: number, heartRate: number, symptoms: string[]) => void;
  onDeleteMeasurement: (index: number) => void;
  onAddMissedMeasurement: (timeMinutes: number, timeSeconds: number, heartRate: number, symptoms: string[]) => void;
  showAddButton?: boolean;
  maxDisplayed?: number;
  title?: string;
  className?: string;
}

export const MeasurementCRUD: React.FC<MeasurementCRUDProps> = ({
  measurements,
  onUpdateMeasurement,
  onDeleteMeasurement,
  onAddMissedMeasurement,
  showAddButton = true,
  maxDisplayed,
  title = "Measurements",
  className = ""
}) => {
  // Edit dialog state
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editTime, setEditTime] = useState('');
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
    setEditTime(measurement.label);
    setEditHR(measurement.pulseRate.toString());
    setEditSymptoms(measurement.symptoms ? measurement.symptoms.split(', ').filter(s => s) : []);
    setEditDialogOpen(true);
  };

  const cancelEdit = () => {
    setEditDialogOpen(false);
    setEditingIndex(null);
    setEditTime('');
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

    // If time was changed, validate and update
    if (editTime !== measurements[editingIndex].label) {
      const timeMatch = editTime.match(/^(\d{1,2}):(\d{2})$/);
      if (!timeMatch) {
        toast.error('Time must be in format MM:SS (e.g., 2:30)');
        return;
      }
      
      const timeMinutes = parseInt(timeMatch[1]);
      const timeSeconds = parseInt(timeMatch[2]);
      
      if (timeSeconds >= 60) {
        toast.error('Seconds must be less than 60');
        return;
      }

      if (timeMinutes > 10) {
        toast.error('Time cannot exceed 10 minutes');
        return;
      }
      
      // Check for duplicate time (excluding current measurement)
      const totalSeconds = timeMinutes * 60 + timeSeconds;
      const hasExisting = measurements.some((m, idx) => 
        idx !== editingIndex && m.totalSeconds === totalSeconds
      );
      if (hasExisting) {
        toast.error('A measurement already exists at this time');
        return;
      }

      // Delete old measurement and add new one with updated time
      onDeleteMeasurement(editingIndex);
      onAddMissedMeasurement(timeMinutes, timeSeconds, hr, editSymptoms);
    } else {
      // Just update HR and symptoms
      onUpdateMeasurement(editingIndex, hr, editSymptoms);
    }
    
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
      toast.error('Time must be in format MM:SS (e.g., 2:30)');
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

    if (timeMinutes > 10) {
      toast.error('Time cannot exceed 10 minutes');
      return;
    }
    
    // Check for duplicate time
    const totalSeconds = timeMinutes * 60 + timeSeconds;
    const hasExisting = measurements.some(m => m.totalSeconds === totalSeconds);
    if (hasExisting) {
      toast.error('A measurement already exists at this time');
      return;
    }
    
    onAddMissedMeasurement(timeMinutes, timeSeconds, hr, missedSymptoms);
    toast.success('Measurement added successfully');
    cancelAddMissed();
  };

  const startDelete = (index: number) => {
    setDeletingIndex(index);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (deletingIndex !== null) {
      onDeleteMeasurement(deletingIndex);
      toast.success('Measurement deleted');
    }
    setDeleteDialogOpen(false);
    setDeletingIndex(null);
  };

  const cancelDelete = () => {
    setDeleteDialogOpen(false);
    setDeletingIndex(null);
  };

  // Determine which measurements to display
  const displayedMeasurements = maxDisplayed 
    ? measurements.slice(-maxDisplayed).reverse()
    : measurements.slice().reverse();

  return (
    <div className={className}>
      <div className="flex justify-between items-center mb-4">
        <p className="text-lg font-semibold">{title}</p>
        {showAddButton && (
          <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={startAddMissed}
                variant="outline"
                size="sm"
                className="h-8"
              >
                <Plus className="h-3 w-3 mr-1" />
                Add Measurement
              </Button>
            </DialogTrigger>
          </Dialog>
        )}
      </div>

      {measurements.length === 0 ? (
        <p className="text-muted-foreground text-center py-8">
          No measurements recorded yet
        </p>
      ) : (
        <div className="space-y-2">
          {displayedMeasurements.map((m, displayIdx) => {
            // Calculate the actual index in the original array
            const actualIndex = maxDisplayed 
              ? measurements.length - 1 - displayIdx
              : measurements.length - 1 - displayIdx;
            
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
                  <div className="flex gap-1">
                    <Button
                      onClick={() => startEdit(actualIndex, m)}
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0"
                    >
                      <Edit2 className="h-3 w-3" />
                    </Button>
                    <Button
                      onClick={() => startDelete(actualIndex)}
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
          
          {maxDisplayed && measurements.length > maxDisplayed && (
            <p className="text-sm text-muted-foreground text-center pt-2">
              Showing {maxDisplayed} most recent measurements. See test results for full list.
            </p>
          )}
        </div>
      )}

      {/* Edit Measurement Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <p className="flex items-center gap-2 text-xl font-bold text-foreground">
              <Edit2 className="h-4 w-4" />
              Edit Measurement
            </p>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-time">Time (MM:SS)</Label>
              <Input
                id="edit-time"
                type="text"
                value={editTime}
                onChange={(e) => setEditTime(e.target.value)}
                className="text-center"
                placeholder="2:30"
                pattern="^[0-9]{1,2}:[0-5][0-9]$"
              />
              <p className="text-xs text-muted-foreground">
                Enter time in MM:SS format (e.g., 2:30 for 2 minutes 30 seconds)
              </p>
            </div>
            
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
            <p className="flex items-center gap-2 text-xl font-bold text-foreground">
              <Clock className="h-4 w-4" />
              Add Measurement
            </p>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="missed-time">Time (MM:SS)</Label>
              <Input
                id="missed-time"
                type="text"
                value={missedTime}
                onChange={(e) => setMissedTime(e.target.value)}
                className="text-center"
                placeholder="2:30"
                pattern="^[0-9]{1,2}:[0-5][0-9]$"
              />
              <p className="text-xs text-muted-foreground">
                Enter time in MM:SS format (e.g., 2:30 for 2 minutes 30 seconds)
              </p>
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
            <p className="flex items-center gap-2 text-xl font-bold text-foreground">
              <Trash2 className="h-4 w-4" />
              Delete Measurement
            </p>
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
    </div>
  );
};