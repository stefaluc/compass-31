import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PersonStanding, RotateCcw, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { useActiveStandStore } from '@/features/active-stand/store';
import { ActiveStandTable } from '@/features/active-stand/ActiveStandTable';

/**
 * AS-01: stand-alone Active Stand Test documentation tool. Table only, no
 * graph (AS-02). Intended for patients with concerns such as lightheadedness,
 * syncope, or presyncope during sudden postural change.
 */
function ActiveStandTest() {
  const store = useActiveStandStore();

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
      <div className="mb-6">
        <h1 className="flex items-center gap-2 text-2xl font-extrabold sm:text-3xl">
          <PersonStanding className="h-7 w-7 text-primary" aria-hidden />
          <span>
            <span className="text-primary">Active Stand</span> Test
          </span>
        </h1>
        <p className="mt-1 text-sm text-muted-foreground sm:text-base">
          Record a supine baseline (measured at minute 5 of rest), then blood pressure
          and heart rate for each of five standing minutes. Changes from baseline are
          calculated automatically.
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Patient</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="as-patient">Patient Name</Label>
              <Input
                id="as-patient"
                value={store.patientName}
                onChange={(e) => store.setPatientName(e.target.value)}
                placeholder="Enter full name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="as-date">Test Date</Label>
              <Input
                id="as-date"
                type="date"
                value={store.testDate}
                onChange={(e) => store.setTestDate(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Measurements</CardTitle>
        </CardHeader>
        <CardContent>
          <ActiveStandTable
            values={store.values}
            onBaselineChange={store.setBaseline}
            onMinuteChange={store.setMinute}
          />
        </CardContent>
      </Card>

      <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
        <Button
          variant="outline"
          onClick={() => {
            store.reset();
            toast.info('Active Stand Test reset — ready for new patient');
          }}
        >
          <RotateCcw className="mr-2 h-4 w-4" aria-hidden />
          New Test
        </Button>
        <Button variant="secondary" nativeButton={false} render={<Link to="/report" />}>
          <FileText className="mr-2 h-4 w-4" aria-hidden />
          Use in Report
        </Button>
      </div>
    </div>
  );
}

export default ActiveStandTest;
