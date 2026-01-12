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
      className="btn-tap w-full bg-card rounded-2xl p-5 lg:p-6 flex items-center justify-between hover:bg-muted hover:shadow-md transition-ios group"
    >
      <div className="flex items-center gap-4 lg:gap-5">
        <div className="w-10 h-10 lg:w-12 lg:h-12 bg-muted rounded-xl flex items-center justify-center">
          <div className="lg:scale-110">{icon}</div>
        </div>
        <div className="text-left flex-1">
          <h3 className="font-semibold text-base lg:text-lg text-foreground">{title}</h3>
          <p className="text-sm lg:text-base text-muted-foreground">{subtitle}</p>
        </div>
      </div>

      <div className="flex items-center gap-3 lg:gap-4">
        {badge && (
          <span className={`text-xs lg:text-sm px-2 py-1 lg:px-3 lg:py-1.5 rounded-md font-medium ${badgeClasses}`}>
            {badge}
          </span>
        )}
        <ArrowRight className="w-5 h-5 lg:w-6 lg:h-6 text-muted-foreground group-hover:translate-x-0.5 lg:group-hover:translate-x-1 transition-transform" />
      </div>
    </button>
  );
};

export default NavigationItem;
