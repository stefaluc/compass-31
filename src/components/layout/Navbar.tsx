import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import logo from '@/assets/logo.png';

function Navbar() {
  const location = useLocation();

  return (
    <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
            <img src={logo} alt="Logo" className="h-10 w-10" />
            <div className="flex flex-col">
              <span className="text-lg font-bold text-foreground">Medical Assessment</span>
              <span className="text-sm text-muted-foreground -mt-1">Tools & Calculators</span>
            </div>
          </Link>
          
          <div className="flex items-center space-x-2">
            <Button
              asChild
              variant={location.pathname === '/' ? 'default' : 'ghost'}
              size="sm"
            >
              <Link to="/">
                <span className="hidden sm:inline">COMPASS-31</span>
                <span className="sm:hidden">COMPASS</span>
              </Link>
            </Button>
            <Button
              asChild
              variant={location.pathname === '/pots' ? 'default' : 'ghost'}
              size="sm"
            >
              <Link to="/pots">
                <span className="hidden sm:inline">POTS Assessment</span>
                <span className="sm:hidden">POTS</span>
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;