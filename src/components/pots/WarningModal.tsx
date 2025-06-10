import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface WarningModalProps {
  isVisible: boolean;
  secondsRemaining: number;
}

export const WarningModal: React.FC<WarningModalProps> = ({
  isVisible,
  secondsRemaining
}) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-destructive text-destructive-foreground p-8 rounded-3xl shadow-2xl max-w-sm mx-4 text-center animate-pulse">
        <AlertTriangle size={48} className="mx-auto mb-4" />
        <div className="text-2xl font-bold mb-2">Measurement Due!</div>
        <div className="text-xl">{secondsRemaining} seconds</div>
      </div>
    </div>
  );
};