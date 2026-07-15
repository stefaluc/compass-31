import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Edit2, Trash2, Plus, Clock } from 'lucide-react';
import { Measurement } from '../types';
import { CompactSymptomSelector } from './CompactSymptomSelector';
import { toast } from 'sonner';

interface MeasurementCRUDProps {
  measurements: Measurement[];
  onUpdateMeasurement: (index: number, heartRate: number | null, symptoms: string[]) => void;
  onDeleteMeasurement: (index: number) => void;
  onAddMissedMeasurement: (
    timeMinutes: number,
    timeSeconds: number,
    heartRate: number | null,
    symptoms: string[],
  ) => void;
  showAddButton?: boolean;
  maxDisplayed?: number;
  title?: string;
  className?: string;
}

/** Parse "M:SS"; returns null with a toast when invalid. */
function parseTimeInput(value: string): { minutes: number; seconds: number } | null {
  const match = value.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) {
    toast.error('Time must be in format MM:SS (e.g., 2:30)');
    return null;
  }
  const minutes = parseInt(match[1], 10);
  const seconds = parseInt(match[2], 10);
  if (seconds >= 60) {
    toast.error('Seconds must be less than 60');
    return null;
  }
  if (minutes > 10) {
    toast.error('Time cannot exceed 10 minutes');
    return null;
  }
  return { minutes, seconds };
}

/**
 * NL-02: a heart-rate value is optional as long as at least one symptom is
 * recorded — no dummy heart rate is required to save a symptom.
 */
function validateEntry(hrText: string, symptoms: string[]): { hr: number | null } | null {
  if (!hrText) {
    if (symptoms.length === 0) {
      toast.error('Enter a heart rate or record at least one symptom');
      return null;
    }
    return { hr: null };
  }
  const hr = parseInt(hrText, 10);
  if (isNaN(hr) || hr < 30 || hr > 200) {
    toast.error('Heart rate must be between 30-200 bpm');
    return null;
  }
  return { hr };
}

export const MeasurementCRUD: React.FC<MeasurementCRUDProps> = ({
  measurements,
  onUpdateMeasurement,
  onDeleteMeasurement,
  onAddMissedMeasurement,
  showAddButton = true,
  maxDisplayed,
  title = 'Measurements',
  className = '',
}) => {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editTime, setEditTime] = useState('');
  const [editHR, setEditHR] = useState('');
  const [editSymptoms, setEditSymptoms] = useState<string[]>([]);

  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [missedTime, setMissedTime] = useState('');
  const [missedHR, setMissedHR] = useState('');
  const [missedSymptoms, setMissedSymptoms] = useState<string[]>([]);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingIndex, setDeletingIndex] = useState<number | null>(null);

  const startEdit = (index: number, measurement: Measurement) => {
    setEditingIndex(index);
    setEditTime(measurement.label);
    setEditHR(measurement.pulseRate != null ? measurement.pulseRate.toString() : '');
    setEditSymptoms(measurement.symptoms ? measurement.symptoms.split(', ').filter(Boolean) : []);
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
    const entry = validateEntry(editHR, editSymptoms);
    if (!entry) return;

    if (editTime !== measurements[editingIndex].label) {
      const time = parseTimeInput(editTime);
      if (!time) return;
      const totalSeconds = time.minutes * 60 + time.seconds;
      const hasExisting = measurements.some(
        (m, idx) => idx !== editingIndex && m.totalSeconds === totalSeconds,
      );
      if (hasExisting) {
        toast.error('A measurement already exists at this time');
        return;
      }
      onDeleteMeasurement(editingIndex);
      onAddMissedMeasurement(time.minutes, time.seconds, entry.hr, editSymptoms);
    } else {
      onUpdateMeasurement(editingIndex, entry.hr, editSymptoms);
    }

    toast.success('Measurement updated');
    cancelEdit();
  };

  const cancelAddMissed = () => {
    setAddDialogOpen(false);
    setMissedTime('');
    setMissedHR('');
    setMissedSymptoms([]);
  };

  const saveAddMissed = () => {
    if (!missedTime) {
      toast.error('Please enter the measurement time');
      return;
    }
    const time = parseTimeInput(missedTime);
    if (!time) return;
    const entry = validateEntry(missedHR, missedSymptoms);
    if (!entry) return;

    const totalSeconds = time.minutes * 60 + time.seconds;
    if (measurements.some((m) => m.totalSeconds === totalSeconds)) {
      toast.error('A measurement already exists at this time');
      return;
    }

    onAddMissedMeasurement(time.minutes, time.seconds, entry.hr, missedSymptoms);
    toast.success('Measurement added');
    cancelAddMissed();
  };

  const confirmDelete = () => {
    if (deletingIndex !== null) {
      onDeleteMeasurement(deletingIndex);
      toast.success('Measurement deleted');
    }
    setDeleteDialogOpen(false);
    setDeletingIndex(null);
  };

  const displayedMeasurements = maxDisplayed
    ? measurements.slice(-maxDisplayed).reverse()
    : measurements.slice().reverse();

  const toggle = (setter: React.Dispatch<React.SetStateAction<string[]>>) => (symptom: string) =>
    setter((prev) =>
      prev.includes(symptom) ? prev.filter((s) => s !== symptom) : [...prev, symptom],
    );

  return (
    <div className={className}>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-lg font-semibold">{title}</p>
        {showAddButton && (
          <Button
            onClick={() => {
              setMissedTime('');
              setMissedHR('');
              setMissedSymptoms([]);
              setAddDialogOpen(true);
            }}
            variant="outline"
            size="sm"
            className="h-8"
          >
            <Plus className="mr-1 h-3 w-3" aria-hidden />
            Add Measurement
          </Button>
        )}
      </div>

      {measurements.length === 0 ? (
        <p className="py-8 text-center text-muted-foreground">No measurements recorded yet</p>
      ) : (
        <div className="space-y-2">
          {displayedMeasurements.map((m, displayIdx) => {
            const actualIndex = measurements.length - 1 - displayIdx;
            return (
              <div
                key={`${m.totalSeconds}-${actualIndex}`}
                className="flex items-center justify-between rounded-lg bg-muted/50 p-3"
              >
                <div className="flex flex-1 flex-col">
                  <span className="font-medium tabular-nums">{m.label}</span>
                  {m.symptoms && (
                    <span className="text-xs text-muted-foreground">{m.symptoms}</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {m.pulseRate != null ? (
                    <span className="text-lg font-bold text-primary tabular-nums">
                      {m.pulseRate} bpm
                    </span>
                  ) : (
                    <span className="text-sm italic text-muted-foreground">symptoms only</span>
                  )}
                  <div className="flex gap-1">
                    <Button
                      onClick={() => startEdit(actualIndex, m)}
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      aria-label={`Edit measurement at ${m.label}`}
                    >
                      <Edit2 className="h-3.5 w-3.5" aria-hidden />
                    </Button>
                    <Button
                      onClick={() => {
                        setDeletingIndex(actualIndex);
                        setDeleteDialogOpen(true);
                      }}
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                      aria-label={`Delete measurement at ${m.label}`}
                    >
                      <Trash2 className="h-3.5 w-3.5" aria-hidden />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}

          {maxDisplayed && measurements.length > maxDisplayed && (
            <p className="pt-2 text-center text-sm text-muted-foreground">
              Showing {maxDisplayed} most recent measurements. See test results for full list.
            </p>
          )}
        </div>
      )}

      {/* Edit Measurement Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit2 className="h-4 w-4" aria-hidden />
              Edit Measurement
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="edit-time">Time (MM:SS)</Label>
              <Input
                id="edit-time"
                type="text"
                value={editTime}
                onChange={(e) => setEditTime(e.target.value)}
                className="text-center"
                placeholder="2:30"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-hr">Heart Rate (bpm) — optional with symptoms</Label>
              <Input
                id="edit-hr"
                type="number"
                value={editHR}
                onChange={(e) => setEditHR(e.target.value)}
                className="text-center"
                placeholder="85"
                min={30}
                max={200}
              />
            </div>
            <div className="space-y-2">
              <Label>Symptoms (Optional)</Label>
              <CompactSymptomSelector
                selectedSymptoms={editSymptoms}
                onSymptomToggle={toggle(setEditSymptoms)}
                onClear={() => setEditSymptoms([])}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={cancelEdit}>
              Cancel
            </Button>
            <Button onClick={saveEdit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Missed Measurement Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Clock className="h-4 w-4" aria-hidden />
              Add Measurement
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="missed-time">Time (MM:SS)</Label>
              <Input
                id="missed-time"
                type="text"
                value={missedTime}
                onChange={(e) => setMissedTime(e.target.value)}
                className="text-center"
                placeholder="2:30"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="missed-hr">Heart Rate (bpm) — optional with symptoms</Label>
              <Input
                id="missed-hr"
                type="number"
                value={missedHR}
                onChange={(e) => setMissedHR(e.target.value)}
                className="text-center"
                placeholder="85"
                min={30}
                max={200}
              />
            </div>
            <div className="space-y-2">
              <Label>Symptoms (Optional)</Label>
              <CompactSymptomSelector
                selectedSymptoms={missedSymptoms}
                onSymptomToggle={toggle(setMissedSymptoms)}
                onClear={() => setMissedSymptoms([])}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={cancelAddMissed}>
              Cancel
            </Button>
            <Button onClick={saveAddMissed}>Add Measurement</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trash2 className="h-4 w-4" aria-hidden />
              Delete Measurement
            </DialogTitle>
          </DialogHeader>
          <div className="py-2">
            <p className="text-sm text-muted-foreground">
              Are you sure you want to delete this measurement? This action cannot be undone.
            </p>
            {deletingIndex !== null && measurements[deletingIndex] && (
              <div className="mt-4 rounded-lg bg-muted/50 p-3">
                <div className="font-medium">{measurements[deletingIndex].label}</div>
                <div className="text-lg font-bold text-primary">
                  {measurements[deletingIndex].pulseRate != null
                    ? `${measurements[deletingIndex].pulseRate} bpm`
                    : 'symptoms only'}
                </div>
                {measurements[deletingIndex].symptoms && (
                  <div className="text-xs text-muted-foreground">
                    {measurements[deletingIndex].symptoms}
                  </div>
                )}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false);
                setDeletingIndex(null);
              }}
            >
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
