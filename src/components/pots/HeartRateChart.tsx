import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { TrendingUp, Download } from 'lucide-react';
import { ChartDataPoint, TrendDataPoint } from '@/types/pots';

interface HeartRateChartProps {
  chartData: ChartDataPoint[];
  trendData: TrendDataPoint[];
  showTrendLine: boolean;
  onToggleTrendLine: () => void;
  onExportChart: () => void;
}

const formatXAxisTick = (tickItem: number): string => {
  if (tickItem < 0) {
    return tickItem === -2 ? 'Initial' : 'Lowest';
  }
  return `${Math.floor(tickItem)}:${((tickItem % 1) * 60).toFixed(0).padStart(2, '0')}`;
};

const generateXTicks = (): number[] => {
  const ticks = [-2, -1];
  for (let i = 0; i <= 10; i += 0.5) {
    ticks.push(i);
  }
  return ticks;
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-background p-4 border-2 border-border rounded-xl shadow-lg">
        <p className="font-bold text-lg">{data.label}</p>
        <p className="text-lg">
          <span className="inline-block w-4 h-4 bg-primary rounded mr-2"></span>
          {payload[0].value} bpm
        </p>
      </div>
    );
  }
  return null;
};

export const HeartRateChart: React.FC<HeartRateChartProps> = ({
  chartData,
  trendData,
  showTrendLine,
  onToggleTrendLine,
  onExportChart
}) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Heart Rate Graph</CardTitle>
          <div className="flex gap-2">
            <Button
              onClick={onToggleTrendLine}
              variant={showTrendLine ? "default" : "outline"}
              size="sm"
            >
              <TrendingUp size={16} className="mr-2" />
              Trend
            </Button>
            <Button
              onClick={onExportChart}
              variant="outline"
              size="sm"
            >
              <Download size={16} className="mr-2" />
              Export
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
            <XAxis 
              dataKey="time"
              type="number"
              scale="linear"
              domain={[-2.5, 10]}
              ticks={generateXTicks()}
              tickFormatter={formatXAxisTick}
              stroke="hsl(var(--muted-foreground))"
            />
            <YAxis 
              label={{ value: 'Heart Rate (bpm)', angle: -90, position: 'insideLeft' }}
              domain={['dataMin - 10', 'dataMax + 10']}
              stroke="hsl(var(--muted-foreground))"
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine x={0} stroke="#ef4444" strokeWidth={2} strokeDasharray="5 5" />
            <ReferenceLine y={100} stroke="#10b981" strokeWidth={2} strokeDasharray="5 5" />
            <Line 
              type="monotone" 
              dataKey="heartRate" 
              stroke="#FACC14" 
              strokeWidth={4}
              dot={{ fill: '#FACC14', strokeWidth: 2, r: 6 }}
              activeDot={{ r: 8, fill: '#FACC14', stroke: '#ffffff', strokeWidth: 3 }}
            />
            {showTrendLine && trendData.length > 0 && (
              <Line 
                data={trendData}
                type="monotone" 
                dataKey="trendValue" 
                stroke="#6366f1" 
                strokeWidth={2}
                strokeDasharray="8 8"
                dot={false}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};