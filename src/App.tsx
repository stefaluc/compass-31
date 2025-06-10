import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { theme } from '@/utils/theme';
import Navbar from '@/components/layout/Navbar';
import CompassTool from '@/pages/CompassTool';
import PotsAssessment from '@/pages/PotsAssessment';
import './App.css';

import "@fontsource/ibm-plex-sans";
import "@fontsource/plus-jakarta-sans";

function App() {
  return (
    <ThemeProvider theme={theme}>
      <Router>
        <div className="min-h-screen bg-background">
          <Navbar />
          <main className="pt-0">
            <Routes>
              <Route path="/" element={<CompassTool />} />
              <Route path="/pots" element={<PotsAssessment />} />
            </Routes>
          </main>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;