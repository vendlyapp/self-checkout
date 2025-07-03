'use client';

import React from 'react';
import { ChartTooltipProps } from './types';

const CustomTooltip: React.FC<ChartTooltipProps> = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background/95 backdrop-blur-sm border border-border rounded-lg px-2 py-1 shadow-lg">
        <p className="text-xs font-medium">{payload[0]?.value}</p>
      </div>
    );
  }
  return null;
};

export default CustomTooltip; 