import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { FileText, CheckCircle, Info, ChevronDown, ChevronUp } from 'lucide-react';
import { TestPhase } from '@/types/pots';

interface ClinicalInstructionsProps {
  phase: TestPhase;
  timer?: number;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

const getPhaseInstructions = (phase: TestPhase, timer?: number) => {
  switch (phase) {
    case 'setup':
      return {
        title: 'Pre-Test Setup Instructions',
        steps: [
          'Ensure patient has removed shoes and socks',
          'Position patient supine with headrest in neutral position', 
          'Record initial pulse rate and blood pressure while supine',
          'Explain the test procedure to the patient',
          'Ensure wall is available for patient to lean against during standing phase'
        ],
        alerts: [
          'Patient should avoid caffeine 4+ hours before test',
          'Ensure room temperature is comfortable (68-72°F)'
        ]
      };
    
    case 'supine':
      return {
        title: 'Supine Rest Phase (10 minutes)',
        steps: [
          'Patient remains lying flat in supine position',
          'Monitor patient\'s pulse rate continuously',
          'Record the LOWEST observed pulse rate during this period',
          'Patient should remain still and relaxed',
          'No talking or movement except for breathing'
        ],
        alerts: timer && timer < 300 ? [
          'Minimum 5 minutes required before advancing to standing phase'
        ] : [
          'May advance to standing phase once lowest pulse rate is recorded'
        ]
      };
    
    case 'standing':
      return {
        title: 'Standing Phase Instructions',
        steps: [
          'Have patient stand and immediately lean back against wall',
          'Record pulse rate IMMEDIATELY at 0:00 (standing)',
          'Continue recording pulse rate every 30 seconds for 10 minutes',
          'Patient should remain standing and leaning against wall',
          'Monitor for symptoms: dizziness, nausea, weakness, etc.'
        ],
        alerts: [
          'Be ready to assist patient if they feel faint',
          'Stop test immediately if patient cannot tolerate standing'
        ]
      };
    
    default:
      return {
        title: 'Test Complete',
        steps: ['Review results and provide clinical interpretation'],
        alerts: []
      };
  }
};

export const ClinicalInstructions: React.FC<ClinicalInstructionsProps> = ({
  phase,
  timer,
  isCollapsed = false,
  onToggleCollapse
}) => {
  const instructions = getPhaseInstructions(phase, timer);
  
  if (isCollapsed) {
    return (
      <Alert className="border-muted bg-muted/50">
        <Info className="h-4 w-4 text-muted-foreground" />
        <div className="flex items-center justify-between w-full">
          <AlertDescription className="text-foreground font-medium">
            {instructions.title}
          </AlertDescription>
          {onToggleCollapse && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onToggleCollapse}
              className="text-muted-foreground hover:text-foreground"
            >
              <ChevronDown className="h-4 w-4" />
            </Button>
          )}
        </div>
      </Alert>
    );
  }

  return (
    <Card className="border-muted">
      <CardHeader className="bg-muted/50">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-foreground">
            <FileText className="h-5 w-5" />
            {instructions.title}
          </CardTitle>
          {onToggleCollapse && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onToggleCollapse}
              className="text-muted-foreground hover:text-foreground"
            >
              <ChevronUp className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        {/* Main Instructions */}
        <div className="space-y-4">
          <h4 className="font-semibold text-foreground">Protocol Steps:</h4>
          <ol className="space-y-2">
            {instructions.steps.map((step, index) => (
              <li key={index} className="flex items-start gap-3">
                <Badge variant="outline" className="min-w-[24px] h-6 flex items-center justify-center text-xs">
                  {index + 1}
                </Badge>
                <span className="text-sm text-muted-foreground">{step}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* Important Alerts */}
        {instructions.alerts.length > 0 && (
          <>
            <Separator className="my-4" />
            <div className="space-y-2">
              <h4 className="font-semibold text-foreground">Important Notes:</h4>
              {instructions.alerts.map((alert, index) => (
                <Alert key={index} className="border-amber-200 bg-amber-50">
                  <Info className="h-4 w-4 text-amber-600" />
                  <AlertDescription className="text-amber-800 text-sm">
                    {alert}
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          </>
        )}

        {/* NASA Lean Test Specific Notes */}
        {phase === 'setup' && (
          <>
            <Separator className="my-4" />
            <div className="bg-muted p-4 rounded-lg">
              <h4 className="font-semibold mb-2">NASA Lean Test Protocol:</h4>
              <p className="text-sm text-muted-foreground">
                Record the patient's initial pulse rate and blood pressure while supine. The patient should then remain supine for 10 minutes with shoes/socks off and the headrest in a neutral position. During this period, monitor the patient's pulse rate and identify the lowest observed pulse rate while they are resting. When the patient stands and leans against the wall, immediately record their pulse rate in the "0 min" box.
              </p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};