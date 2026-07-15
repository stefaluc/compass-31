import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Eye, Trash2 } from 'lucide-react';
import { useReportStore } from '../store';
import type { ReportDocument } from '../types';
import { PatientInfoSection } from './sections/PatientInfoSection';
import {
  CompassSection,
  GradedSymptomsSection,
  MentalHealthSection,
} from './sections/ScoresSections';
import { NasaLeanReportSection } from './sections/NasaLeanSection';
import { ActiveStandReportSection } from './sections/ActiveStandSection';
import {
  BalanceSection,
  BeightonSection,
  CognitiveSection,
} from './sections/CognitiveBalanceSections';
import { OcularSection } from './sections/OcularSection';
import {
  CranialNerveSection,
  RecommendationsSection,
  SpecialTestsSection,
} from './sections/FinalSections';

/**
 * The expandable-sections form (§7.16 order). All sections are visible on one
 * page; each expands independently and can be completed in any order (RG-02).
 */
export function ReportForm({ report }: { report: ReportDocument }) {
  const setStage = useReportStore((s) => s.setStage);
  const clearReport = useReportStore((s) => s.clearReport);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-xl font-extrabold sm:text-2xl">
            {report.reportType === 'initial'
              ? 'Initial Evaluation Report'
              : 'Re-evaluation Report'}
          </h1>
          <p className="text-sm text-muted-foreground">
            Blank fields and sections are omitted from the PDF automatically. Entries
            save to this device as you type.
          </p>
        </div>
        <div className="flex gap-2">
          <AlertDialog>
            <AlertDialogTrigger render={<Button variant="outline" size="sm" />}>
              <Trash2 className="mr-2 h-4 w-4" aria-hidden />
              Discard
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Discard this report?</AlertDialogTitle>
                <AlertDialogDescription>
                  All entries for this report will be permanently removed from this
                  device. This cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Keep editing</AlertDialogCancel>
                <AlertDialogAction onClick={clearReport}>
                  Discard report
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <PatientInfoSection report={report} />
      <GradedSymptomsSection report={report} />
      <CompassSection report={report} />
      <MentalHealthSection report={report} />
      <NasaLeanReportSection report={report} />
      <ActiveStandReportSection report={report} />
      <CognitiveSection report={report} />
      <BalanceSection report={report} />
      <OcularSection report={report} />
      <BeightonSection report={report} />
      <CranialNerveSection report={report} />
      <SpecialTestsSection report={report} />
      <RecommendationsSection report={report} />

      <div className="sticky bottom-0 z-30 -mx-4 border-t bg-background/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6">
        <Button size="lg" className="w-full" onClick={() => setStage('preview')}>
          <Eye className="mr-2 h-5 w-5" aria-hidden />
          Preview Report
        </Button>
      </div>
    </div>
  );
}
