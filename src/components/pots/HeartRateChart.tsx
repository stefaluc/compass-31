import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { TrendingUp, Download } from 'lucide-react';
import { ChartDataPoint, TrendDataPoint } from '@/types/pots';

interface HeartRateChartProps {
  chartData: ChartDataPoint[];
  showTrendLine: boolean;
  onToggleTrendLine: () => void;
  onExportChart: () => void;
}

const formatXAxisTick = (tickItem: number): string => {
  if (tickItem < 0) {
    return tickItem === -2 ? 'Initial' : 'Lowest';
  }
  return tickItem.toString();
};

const generateXTicks = (): number[] => {
  const ticks = [-2, -1];
  for (let i = 0; i <= 10; i += 1) {
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
  showTrendLine,
  onToggleTrendLine,
  onExportChart
}) => {
  // Calculate Y-axis domain based only on heartRate values to prevent axis scaling issues
  const heartRates = chartData.map(d => d.heartRate);
  const minHR = Math.min(...heartRates);
  const maxHR = Math.max(...heartRates);
  const yAxisDomain = [minHR - 10, maxHR + 10];
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
        <ResponsiveContainer width="100%" height={500}>
          <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
            <CartesianGrid 
              strokeDasharray="1 1" 
              stroke="hsl(var(--muted))" 
              opacity={0.3}
              horizontalPoints={[0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10]}
            />
            <XAxis 
              dataKey="time"
              type="number"
              scale="linear"
              domain={[-2.5, 10]}
              ticks={generateXTicks()}
              tickFormatter={formatXAxisTick}
              stroke="hsl(var(--muted-foreground))"
              label={{ value: 'Time (minutes)', position: 'insideBottom', offset: -20 }}
              fontSize={12}
              interval={0}
              angle={-30}
              textAnchor="end"
            />
            <YAxis 
              label={{ value: 'Heart Rate (bpm)', angle: -90, position: 'insideLeft' }}
              domain={yAxisDomain}
              stroke="hsl(var(--muted-foreground))"
              tickCount={8}
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine x={0} stroke="#AAAAAA" strokeWidth={1} strokeDasharray="5 5" />
            <ReferenceLine y={100} stroke="#BBBBBB" strokeWidth={1} strokeDasharray="5 5" />
            <Line 
              type="linear" 
              dataKey="heartRate" 
              stroke="#FACC14" 
              strokeWidth={2}
              dot={{ fill: '#FACC14', strokeWidth: 1, r: 4 }}
              activeDot={{ r: 6, fill: '#FACC14', stroke: '#ffffff', strokeWidth: 2 }}
            />
            {showTrendLine && (
              <Line 
                type="linear" 
                dataKey="trendValue" 
                stroke="#000000" 
                strokeWidth={2}
                strokeDasharray="6 6"
                dot={false}
                connectNulls={false}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};