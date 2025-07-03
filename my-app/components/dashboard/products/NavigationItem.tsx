'use client';

import React from 'react';
import { ArrowRight } from 'lucide-react';
import { NavigationItemProps } from './types';

const NavigationItem: React.FC<NavigationItemProps> = ({ 
  icon, 
  title, 
  subtitle, 
  badge,
  badgeVariant = 'default',
  onClick 
}) => {
  const badgeClasses = badgeVariant === 'success' 
    ? 'bg-emerald-100 text-emerald-700' 
    : 'bg-muted text-muted-foreground';

  return (
    <button 
      onClick={onClick}
      className="w-full bg-card rounded-2xl p-5 flex items-center justify-between hover:bg-muted transition-all active:scale-[0.98] duration-150 group"
    >
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 bg-muted rounded-xl flex items-center justify-center">
          {icon}
        </div>
        <div className="text-left">
          <h3 className="font-semibold text-base text-foreground">{title}</h3>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        {badge && (
          <span className={`text-xs px-2 py-1 rounded-md font-medium ${badgeClasses}`}>
            {badge}
          </span>
        )}
        <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
      </div>
    </button>
  );
};

export default NavigationItem; 