import type { ReactNode } from 'react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { TextAreaField } from './fields';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * RG-02/RG-03: every clinical section is an independently expandable card;
 * sections can be completed in any order. RG-04/RG-05: an optional provider
 * interpretation field sits at the bottom of each section.
 */
export function SectionShell({
  title,
  subtitle,
  defaultOpen = false,
  hasContent = false,
  interpretation,
  onInterpretationChange,
  interpretationLabel = 'Provider Interpretation (optional)',
  children,
}: {
  title: string;
  subtitle?: string;
  defaultOpen?: boolean;
  hasContent?: boolean;
  interpretation?: string;
  onInterpretationChange?: (v: string) => void;
  interpretationLabel?: string;
  children: ReactNode;
}) {
  return (
    <Card className="overflow-hidden py-0">
      <Collapsible defaultOpen={defaultOpen}>
        <CollapsibleTrigger
          className={cn(
            'group flex w-full items-center justify-between gap-3 bg-section px-4 py-3 text-left text-section-foreground sm:px-6',
            'transition-colors hover:bg-section/70',
          )}
        >
          <div>
            <span className="text-sm font-semibold uppercase tracking-[0.08em]">
              {title}
            </span>
            {subtitle && (
              <span className="block text-xs normal-case tracking-normal text-muted-foreground">
                {subtitle}
              </span>
            )}
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {hasContent && (
              <span className="hidden font-mono text-[10px] uppercase tracking-[0.1em] opacity-80 sm:inline">
                documented ✓
              </span>
            )}
            <ChevronDown
              className="h-4 w-4 opacity-70 transition-transform group-data-[panel-open]:rotate-180"
              aria-hidden
            />
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <Separator />
          <div className="space-y-5 px-4 py-5 sm:px-6">
            {children}
            {onInterpretationChange && (
              <TextAreaField
                label={interpretationLabel}
                value={interpretation ?? ''}
                onChange={onInterpretationChange}
                placeholder="Clinical context, correlation, and interpretation for this section…"
              />
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
