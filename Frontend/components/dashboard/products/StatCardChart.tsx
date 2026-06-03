'use client';

import {
  LineChart,
  Line,
  ResponsiveContainer,
  YAxis,
  Tooltip,
} from 'recharts';
import CustomTooltip from './CustomTooltip';

interface StatCardChartProps {
  chartData: { index: number; value: number }[];
  trend: 'up' | 'down' | 'neutral';
}

export default function StatCardChart({ chartData, trend }: StatCardChartProps) {
  const strokeColor =
    trend === 'up' ? '#22c55e' : trend === 'down' ? '#ef4444' : '#9ca3af';

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={chartData}>
        <YAxis hide domain={['dataMin - 5', 'dataMax + 5']} />
        <Tooltip content={<CustomTooltip />} />
        <Line
          type="monotone"
          dataKey="value"
          stroke={strokeColor}
          strokeWidth={2}
          dot={false}
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
