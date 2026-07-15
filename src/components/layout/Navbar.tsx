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
 * BR-03: clean text-based header using the working site name until the
 * final logo is ready. (Open question: final name/domain — "Autonomic
 * Compass" is the preferred option from §4.1 and is used as the working
 * name throughout.)
 */
function Navbar() {
  const location = useLocation();

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/75">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-0 px-4 sm:px-6">
        <Link
          to="/"
          className="flex h-14 items-center gap-2 transition-opacity hover:opacity-80"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Compass className="h-5 w-5" aria-hidden />
          </span>
          <span className="font-heading text-lg font-extrabold tracking-tight">
            Autonomic&nbsp;Compass
          </span>
        </Link>

        <nav
          aria-label="Tools"
          className="-mx-4 flex w-full items-center gap-1 overflow-x-auto px-4 pb-2 sm:mx-0 sm:ml-auto sm:w-auto sm:px-0 sm:pb-0"
        >
          {NAV_ITEMS.map((item) => {
            const active = location.pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  active
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
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
