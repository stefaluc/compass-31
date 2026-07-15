import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { TrendingUp, Download } from 'lucide-react';
import { ChartDataPoint } from '../types';

interface HeartRateChartProps {
  chartData: ChartDataPoint[];
  showTrendLine: boolean;
  onToggleTrendLine: () => void;
  onExportChart?: () => void;
}

const MAROON = '#7A1F2B';

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

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="rounded-xl border-2 border-border bg-background p-3 shadow-lg">
        <p className="font-bold">{data.label}</p>
        <p>
          <span className="mr-2 inline-block h-3 w-3 rounded bg-primary"></span>
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
  onExportChart,
}) => {
  const heartRates = chartData.map((d) => d.heartRate);
  const minHR = heartRates.length ? Math.min(...heartRates) : 50;
  const maxHR = heartRates.length ? Math.max(...heartRates) : 120;
  const yAxisDomain = [minHR - 10, maxHR + 10];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Heart Rate Graph</CardTitle>
          <div className="flex gap-2">
            <Button
              onClick={onToggleTrendLine}
              variant={showTrendLine ? 'default' : 'outline'}
              size="sm"
            >
              <TrendingUp size={16} className="mr-2" aria-hidden />
              Trend
            </Button>
            {onExportChart && (
              <Button onClick={onExportChart} variant="outline" size="sm">
                <Download size={16} className="mr-2" aria-hidden />
                Export
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[320px] sm:h-[440px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 20, right: 30, left: 10, bottom: 60 }}>
              <CartesianGrid strokeDasharray="1 1" stroke="#d4d4d4" opacity={0.4} />
              <XAxis
                dataKey="time"
                type="number"
                scale="linear"
                domain={[-2.5, 10]}
                ticks={generateXTicks()}
                tickFormatter={formatXAxisTick}
                stroke="#737373"
                label={{ value: 'Time (minutes)', position: 'insideBottom', offset: -20 }}
                fontSize={12}
                interval={0}
                angle={-30}
                textAnchor="end"
              />
              <YAxis
                label={{ value: 'Heart Rate (bpm)', angle: -90, position: 'insideLeft' }}
                domain={yAxisDomain}
                stroke="#737373"
                tickCount={8}
                fontSize={12}
              />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine x={0} stroke="#AAAAAA" strokeWidth={1} strokeDasharray="5 5" />
              <ReferenceLine y={100} stroke="#BBBBBB" strokeWidth={1} strokeDasharray="5 5" />
              <Line
                type="linear"
                dataKey="heartRate"
                stroke={MAROON}
                strokeWidth={2}
                dot={{ fill: MAROON, strokeWidth: 1, r: 4 }}
                activeDot={{ r: 6, fill: MAROON, stroke: '#ffffff', strokeWidth: 2 }}
              />
              {showTrendLine && (
                <Line
                  type="linear"
                  dataKey="trendValue"
                  stroke="#404040"
                  strokeWidth={2}
                  strokeDasharray="6 6"
                  dot={false}
                  connectNulls={false}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
