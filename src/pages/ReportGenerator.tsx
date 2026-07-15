import { useEffect } from 'react';
import { useReportStore } from '@/features/report/store';
import { StartScreen } from '@/features/report/components/StartScreen';
import { ReportForm } from '@/features/report/components/ReportForm';
import { ReportPreview } from '@/features/report/components/ReportPreview';

function ReportGenerator() {
  const report = useReportStore((s) => s.report);
  const stage = useReportStore((s) => s.stage);
  const setStage = useReportStore((s) => s.setStage);

  // Recover from any stale persisted stage pointing at a missing report.
  useEffect(() => {
    if (!report && stage !== 'start') setStage('start');
  }, [report, stage, setStage]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
      {stage === 'start' || !report ? (
        <StartScreen />
      ) : stage === 'form' ? (
        <ReportForm report={report} />
      ) : (
        <ReportPreview report={report} />
      )}
    </div>
  );
}

export default ReportGenerator;
