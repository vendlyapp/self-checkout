'use client';

import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import {
  LineChart,
  Line,
  ResponsiveContainer,
  YAxis,
  Tooltip
} from 'recharts';
import { StatCardProps } from './types';
import CustomTooltip from './CustomTooltip';

const StatCard: React.FC<StatCardProps> = ({
  icon,
  value,
  subtitle,
  trend = 'neutral',
  trendData = [40, 55, 45, 60, 50, 65, 55],
  badge,
  className
}) => {
  // Convertir array de números a formato que Recharts espera
  const chartData = trendData.map((val, idx) => ({
    index: idx,
    value: val
  }));

  const trendColor = {
    up: '#10b981',
    down: '#ef4444',
    neutral: '#6b7280'
  }[trend];

  // Calcular el cambio porcentual
  const lastValue = trendData[trendData.length - 1];
  const previousValue = trendData[trendData.length - 2];
  const percentChange = previousValue ? ((lastValue - previousValue) / previousValue * 100).toFixed(1) : 0;

  return (
    <Card className={`bg-card rounded-2xl shadow-sm transition-ios border border-border ${className ?? ''}`}>
      <CardContent className="p-5 md:p-6 lg:p-7">
        <div className="flex items-center justify-between mb-3 md:mb-4 lg:mb-5">
          <div className="w-10 h-10 md:w-11 md:h-11 lg:w-12 lg:h-12 bg-[#C4BAAF] rounded-xl flex items-center justify-center">
            <div className="lg:scale-110">{icon}</div>
          </div>
          {badge && (
            <span className="text-xs lg:text-sm text-muted-foreground bg-white px-2 py-1 lg:px-3 lg:py-1.5 rounded-md font-medium">
              {badge}
            </span>
          )}
        </div>

        <div className="mb-4 md:mb-5 lg:mb-6">
          <h3 className="text-3xl lg:text-4xl xl:text-[2.5rem] font-bold text-foreground mb-1 md:mb-2">{value}</h3>
          <p className="text-sm lg:text-base text-muted-foreground">{subtitle}</p>
        </div>

        {/* Mini gráfico de tendencia con Recharts */}
        <div className="h-12 md:h-14 lg:h-16 -mx-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
              <Tooltip
                content={<CustomTooltip />}
                cursor={false}
              />
              <YAxis hide domain={['dataMin - 10', 'dataMax + 10']} />
              <Line
                type="monotone"
                dataKey="value"
                stroke={trendColor}
                strokeWidth={2}
                dot={false}
                animationDuration={1000}
                animationBegin={0}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Indicador de tendencia */}
        {trend !== 'neutral' && (
          <div className="flex items-center gap-1 mt-2 lg:mt-3">
            {trend === 'up' ? (
              <TrendingUp className="w-3 h-3 lg:w-4 lg:h-4 text-emerald-500" />
            ) : (
              <TrendingDown className="w-3 h-3 lg:w-4 lg:h-4 text-red-500" />
            )}
            <span className={`text-xs lg:text-sm font-medium ${trend === 'up' ? 'text-emerald-500' : 'text-red-500'}`}>
              {percentChange}%
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StatCard;
