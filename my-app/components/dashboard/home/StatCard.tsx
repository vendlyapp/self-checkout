'use client';

import { TrendingUp } from 'lucide-react';
import type { StatCardProps } from '../types';

const StatCard = ({ 
  icon, 
  label, 
  amount, 
  count, 
  trend, 
  isDark = false,
  showCurrency = true,
  showCount = true
}: StatCardProps) => (
  <div className={`
    rounded-xl p-4 shadow-sm
    ${isDark 
      ? 'bg-warm-800 text-white' 
      : 'bg-white border border-gray-200/50 text-gray-900'
    }
  `}>
    <div className="flex items-center gap-2.5 mb-3">
      <div className={`
        w-7 h-7 rounded-xl flex items-center justify-center
        ${isDark ? 'bg-white' : 'bg-warm-800'}
      `}>
        <div className={isDark ? 'text-warm-800' : 'text-white'}>
          {icon}
        </div>
      </div>
      <span className={`text-sm font-medium ${isDark ? 'text-white/90' : ''}`}>
        {label}
      </span>
    </div>
    
    <div className="space-y-1">
      <div className="flex items-baseline gap-1">
        {showCurrency && (
          <span className={`text-xs ${isDark ? 'text-white/70' : 'text-gray-500'}`}>CHF</span>
        )}
        <span className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
          {amount}
        </span>
      </div>
      {showCount && (
        <div className="flex items-center gap-1">
          <span className={`text-sm ${isDark ? 'text-white/70' : 'text-gray-600'}`}>
            {count}
          </span>
        </div>
      )}
      <div className={`flex items-center gap-1 text-xs ${isDark ? 'text-white/80' : 'text-brand-600'}`}>
        <TrendingUp className="w-3 h-3" />
        <span>{trend}</span>
      </div>
    </div>
  </div>
);

export default StatCard; 