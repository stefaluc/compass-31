import React, { useState } from 'react';
import { pdf } from '@react-pdf/renderer';
import { saveAs } from 'file-saver';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { FileDown, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { PDFReportTemplate } from './PDFReportTemplate';
import { captureChartWhenReady } from '@/utils/chartCapture';
import { PDFReportData, PDFGenerationOptions } from '@/types/pdfReport';
import { Measurement, TestStats, BloodPressure } from '@/types/pots';

interface PDFReportGeneratorProps {
  // Patient data
  patientName: string;
  testDate: string;
  
  // Test data
  initialBP: BloodPressure;
  initialPR: string;
  lowestSupinePR: string;
  measurements: Measurement[];
  stats: TestStats;
  
  // Optional clinic information
  clinicName?: string;
  clinicAddress?: string;
  clinicPhone?: string;
  
  // UI props
  variant?: 'default' | 'outline' | 'secondary';
  size?: 'sm' | 'default' | 'lg';
  className?: string;
}

export const PDFReportGenerator: React.FC<PDFReportGeneratorProps> = ({
  patientName,
  testDate,
  initialBP,
  initialPR,
  lowestSupinePR,
  measurements,
  stats,
  clinicName = 'Medical Clinic',
  clinicAddress,
  clinicPhone,
  variant = 'default',
  size = 'default',
  className = '',
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // PDF generation options
  const [options, setOptions] = useState<PDFGenerationOptions>({
    includeChart: true,
    includeAllMeasurements: true,
    includeSymptoms: true,
    format: 'A4',
    orientation: 'portrait',
  });
  
  // Clinic information (editable)
  const [clinicInfo, setClinicInfo] = useState({
    name: clinicName,
    address: clinicAddress || '',
    phone: clinicPhone || '',
  });

  const generatePDFReport = async () => {
    if (!patientName.trim()) {
      toast.error('Patient name is required');
      return;
    }

    setIsGenerating(true);
    
    try {
      let chartImage: string | null = null;
      
      // Capture chart if requested
      if (options.includeChart) {
        toast.info('Capturing chart...');
        chartImage = await captureChartWhenReady('.recharts-wrapper svg', {
          backgroundColor: 'white',
          scale: 2,
          quality: 0.95,
          format: 'png'
        });
        
        if (!chartImage) {
          toast.warning('Could not capture chart, generating report without it');
        }
      }

      // Prepare report data
      const reportData: PDFReportData = {
        patientName: patientName.trim(),
        testDate,
        initialBP,
        initialPR,
        lowestSupinePR,
        measurements: options.includeAllMeasurements ? measurements : measurements.slice(0, 15),
        stats,
        chartImage: chartImage || undefined,
        clinicalInterpretation: stats.delta >= 30 
          ? `Positive for POTS criteria (ΔHR ≥30 bpm)`
          : `Negative for POTS criteria (ΔHR <30 bpm)`,
        testResult: stats.delta >= 30 ? 'POSITIVE' : 'NEGATIVE',
        generatedAt: new Date().toLocaleString(),
        clinicName: clinicInfo.name,
        clinicAddress: clinicInfo.address || undefined,
        clinicPhone: clinicInfo.phone || undefined,
      };

      // Generate PDF
      toast.info('Generating PDF...');
      const pdfBlob = await pdf(<PDFReportTemplate data={reportData} />).toBlob();
      
      // Download PDF
      const fileName = `POTS-Report-${patientName.replace(/\s+/g, '-')}-${testDate}.pdf`;
      saveAs(pdfBlob, fileName);
      
      toast.success('PDF report generated successfully!');
      setIsDialogOpen(false);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate PDF report');
    } finally {
      setIsGenerating(false);
    }
  };

  const updateOption = (key: keyof PDFGenerationOptions, value: any) => {
    setOptions(prev => ({ ...prev, [key]: value }));
  };

  const updateClinicInfo = (key: keyof typeof clinicInfo, value: string) => {
    setClinicInfo(prev => ({ ...prev, [key]: value }));
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button 
          variant={variant} 
          size={size} 
          className={className}
          disabled={measurements.length === 0}
        >
          <FileDown className="h-4 w-4 mr-2" />
          Generate PDF Report
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileDown className="h-5 w-5" />
            Generate Patient Report
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {/* Clinic Information */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Clinic Information</Label>
            
            <div className="space-y-2">
              <Input
                placeholder="Clinic Name"
                value={clinicInfo.name}
                onChange={(e) => updateClinicInfo('name', e.target.value)}
              />
              <Input
                placeholder="Address (optional)"
                value={clinicInfo.address}
                onChange={(e) => updateClinicInfo('address', e.target.value)}
              />
              <Input
                placeholder="Phone (optional)"
                value={clinicInfo.phone}
                onChange={(e) => updateClinicInfo('phone', e.target.value)}
              />
            </div>
          </div>

          {/* PDF Options */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Report Options</Label>
            
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="include-chart"
                  checked={options.includeChart}
                  onCheckedChange={(checked) => updateOption('includeChart', checked)}
                />
                <Label htmlFor="include-chart" className="text-sm">
                  Include heart rate chart
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="include-all-measurements"
                  checked={options.includeAllMeasurements}
                  onCheckedChange={(checked) => updateOption('includeAllMeasurements', checked)}
                />
                <Label htmlFor="include-all-measurements" className="text-sm">
                  Include all measurements (vs. first 15)
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="include-symptoms"
                  checked={options.includeSymptoms}
                  onCheckedChange={(checked) => updateOption('includeSymptoms', checked)}
                />
                <Label htmlFor="include-symptoms" className="text-sm">
                  Include recorded symptoms
                </Label>
              </div>
            </div>
          </div>

          {/* Preview Info */}
          <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded">
            <p>Report will include:</p>
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li>Patient information and test results</li>
              <li>Clinical interpretation</li>
              {options.includeChart && <li>Heart rate graph</li>}
              <li>{options.includeAllMeasurements ? 'All' : 'First 15'} measurements</li>
              {options.includeSymptoms && <li>Symptom data</li>}
            </ul>
          </div>
        </div>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => setIsDialogOpen(false)}
            disabled={isGenerating}
          >
            Cancel
          </Button>
          <Button 
            onClick={generatePDFReport}
            disabled={isGenerating || !patientName.trim()}
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <FileDown className="h-4 w-4 mr-2" />
                Generate PDF
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};