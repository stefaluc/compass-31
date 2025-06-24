import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { Toaster } from '@/components/ui/sonner';
import { theme } from '@/utils/theme';
import Navbar from '@/components/layout/Navbar';
import CompassTool from '@/pages/CompassTool';
import ClinicalPotsAssessment from '@/pages/ClinicalPotsAssessment';
import './App.css';

import "@fontsource/ibm-plex-sans";
import "@fontsource/plus-jakarta-sans";

function App() {
  return (
    <ThemeProvider theme={theme}>
      <Router>
        <div className="min-h-screen bg-background max-w-5xl mx-auto">
          <Navbar />
          <main className="pt-0">
            <Routes>
              <Route path="/" element={<CompassTool />} />
              <Route path="/pots" element={<ClinicalPotsAssessment />} />
            </Routes>
            <Toaster richColors position="top-right" />
          </main>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;