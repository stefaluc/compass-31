import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { TestStats } from '@/types/pots';

interface StatsCardsProps {
  stats: TestStats;
}

export const StatsCards: React.FC<StatsCardsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-3 gap-4">
      <Card>
        <CardContent className="p-6 text-center">
          <div className="text-3xl font-bold text-green-600">{stats.lowest}</div>
          <div className="text-sm text-muted-foreground font-medium">Lowest</div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-6 text-center">
          <div className="text-3xl font-bold text-red-600">{stats.highest}</div>
          <div className="text-sm text-muted-foreground font-medium">Highest</div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-6 text-center">
          <div className="text-3xl font-bold text-primary">{stats.delta}</div>
          <div className="text-sm text-muted-foreground font-medium">Delta</div>
        </CardContent>
      </Card>
    </div>
  );
};