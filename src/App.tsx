import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import Navbar from '@/components/layout/Navbar';
import Home from '@/pages/Home';
import CompassTool from '@/pages/CompassTool';
import NasaLeanTest from '@/pages/NasaLeanTest';
import ActiveStandTest from '@/pages/ActiveStandTest';
import ReportGenerator from '@/pages/ReportGenerator';

import '@fontsource/ibm-plex-sans/400.css';
import '@fontsource/ibm-plex-sans/500.css';
import '@fontsource/ibm-plex-sans/600.css';
import '@fontsource/plus-jakarta-sans/700.css';
import '@fontsource/plus-jakarta-sans/800.css';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background">
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/compass-31" element={<CompassTool />} />
            <Route path="/nasa-lean" element={<NasaLeanTest />} />
            {/* Old bookmark from the previous site layout. */}
            <Route path="/pots" element={<Navigate to="/nasa-lean" replace />} />
            <Route path="/active-stand" element={<ActiveStandTest />} />
            <Route path="/report" element={<ReportGenerator />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <Toaster richColors position="top-right" />
      </div>
    </Router>
  );
}

export default App;
