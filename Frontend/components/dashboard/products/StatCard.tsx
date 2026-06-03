'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { StatCardProps } from './types';

const StatCardChart = dynamic(() => import('./StatCardChart'), { ssr: false });

const StatCard: React.FC<StatCardProps> = ({
  icon,
  value,
  subtitle,
  trend = 'neutral',
  trendData = [40, 55, 45, 60, 50, 65, 55],
  badge,
  className,
}) => {
  const chartData = trendData.map((val, idx) => ({
    index: idx,
    value: val,
  }));

  const lastValue = trendData[trendData.length - 1];
  const previousValue = trendData[trendData.length - 2];
  const percentChange = previousValue
    ? ((lastValue - previousValue) / previousValue) * 100
    : 0;

  return (
    <Card
      className={`bg-card rounded-2xl shadow-sm transition-ios border border-border ${className ?? ''}`}
    >
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
          <h3 className="text-3xl lg:text-4xl xl:text-[2.5rem] font-bold text-foreground mb-1 md:mb-2">
            {value}
          </h3>
          <p className="text-sm lg:text-base text-muted-foreground">{subtitle}</p>
        </div>

        <div className="h-12 md:h-14 lg:h-16 -mx-2">
          <StatCardChart chartData={chartData} trend={trend} />
        </div>

        {trend !== 'neutral' && (
          <div className="flex items-center gap-1 mt-2 lg:mt-3">
            {trend === 'up' ? (
              <TrendingUp className="w-3 h-3 lg:w-4 lg:h-4 text-emerald-500" />
            ) : (
              <TrendingDown className="w-3 h-3 lg:w-4 lg:h-4 text-red-500" />
            )}
            <span
              className={`text-xs lg:text-sm font-medium ${
                trend === 'up' ? 'text-emerald-500' : 'text-red-500'
              }`}
            >
              {percentChange.toFixed(1)}%
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StatCard;
