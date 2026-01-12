'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { StatCardProps } from './types';

const StatCardWithBars: React.FC<StatCardProps> = ({ 
  icon, 
  value, 
  subtitle, 
  trend = 'neutral',
  trendData = [40, 55, 45, 60, 50, 65, 55],
  badge 
}) => {
  const trendColor = {
    up: '#10b981',
    down: '#ef4444',
    neutral: '#6b7280'
  }[trend];

  return (
    <Card className="bg-card rounded-2xl border-0 shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="w-10 h-10 bg-muted rounded-xl flex items-center justify-center">
            {icon}
          </div>
          {badge && (
            <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-md font-medium">
              {badge}
            </span>
          )}
        </div>

        <div className="mb-4">
          <h3 className="text-3xl font-bold text-foreground mb-1">{value}</h3>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        </div>

        {/* Mini gráfico de barras con gradiente */}
        <div className="flex items-end gap-1 h-12">
          {trendData.map((val, idx) => {
            const maxVal = Math.max(...trendData);
            const height = (val / maxVal) * 100;
            const isLast = idx === trendData.length - 1;
            
            return (
              <div
                key={idx}
                className="flex-1 bg-muted rounded-t-sm transition-ios-slow hover:opacity-80"
                style={{
                  height: `${height}%`,
                  background: isLast 
                    ? trendColor 
                    : `linear-gradient(to top, ${trendColor}20, ${trendColor}40)`
                }}
              />
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default StatCardWithBars; 