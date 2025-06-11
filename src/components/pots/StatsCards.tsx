import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { TestStats } from '@/types/pots';

interface StatsCardsProps {
  stats: TestStats;
}

export const StatsCards: React.FC<StatsCardsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <Card>
        <CardContent className="p-4 sm:p-6 text-center">
          <div className="text-2xl sm:text-3xl font-bold text-foreground">{stats.lowest}</div>
          <div className="text-sm text-muted-foreground font-medium">Lowest HR</div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4 sm:p-6 text-center">
          <div className="text-2xl sm:text-3xl font-bold text-foreground">{stats.highest}</div>
          <div className="text-sm text-muted-foreground font-medium">Highest HR</div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4 sm:p-6 text-center">
          <div className="text-2xl sm:text-3xl font-bold text-primary">{stats.delta}</div>
          <div className="text-sm text-muted-foreground font-medium">HR Increase (Δ)</div>
        </CardContent>
      </Card>
    </div>
  );
};