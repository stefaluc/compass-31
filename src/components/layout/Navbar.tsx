import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Compass } from 'lucide-react';

const NAV_ITEMS = [
  { to: '/compass-31', label: 'COMPASS-31' },
  { to: '/nasa-lean', label: 'NASA Lean' },
  { to: '/active-stand', label: 'Active Stand' },
  { to: '/report', label: 'Report Generator' },
];

/**
 * BR-03: the app-wide "instrument bar" — dark maroon with underline tabs,
 * using the working site name until the final logo is ready. (Open question:
 * final name/domain — "Autonomic Compass" is the preferred option from §4.1
 * and is used as the working name throughout.)
 */
function Navbar() {
  const location = useLocation();

  return (
    <header className="sticky top-0 z-40 bg-bar text-bar-foreground">
      <div className="mx-auto flex max-w-6xl flex-wrap items-stretch gap-x-6 px-4 sm:px-6">
        <Link
          to="/"
          className="flex h-14 items-center gap-2.5 transition-opacity hover:opacity-90"
        >
          <Compass className="h-5 w-5" aria-hidden />
          <span className="font-heading text-lg font-extrabold tracking-tight">
            Autonomic&nbsp;Compass
          </span>
        </Link>

        <nav
          aria-label="Tools"
          className="-mx-4 flex w-full items-stretch overflow-x-auto px-4 sm:mx-0 sm:ml-auto sm:w-auto sm:px-0"
        >
          {NAV_ITEMS.map((item) => {
            const active = location.pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'flex items-center whitespace-nowrap border-b-2 px-3 pt-0.5 text-sm font-medium transition-colors',
                  'h-11 sm:h-14',
                  active
                    ? 'border-bar-foreground/70 text-bar-foreground'
                    : 'border-transparent text-bar-muted hover:text-bar-foreground',
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}

export default Navbar;
