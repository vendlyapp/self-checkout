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
  onClick,
  compact = false,
}) => {
  const badgeClasses = badgeVariant === 'success'
    ? 'bg-emerald-100 text-emerald-700'
    : 'bg-muted text-muted-foreground';

  return (
    <button
      onClick={onClick}
      className={`btn-tap w-full flex items-center justify-between transition-ios group ${
        compact
          ? 'rounded-xl p-3 xl:p-4 bg-muted/40 hover:bg-muted/70'
          : 'bg-card rounded-2xl p-5 lg:p-6 hover:bg-muted hover:shadow-md'
      }`}
    >
      <div className={`flex items-center ${compact ? 'gap-3' : 'gap-4 lg:gap-5'}`}>
        <div className={`bg-muted rounded-xl flex items-center justify-center ${compact ? 'w-9 h-9' : 'w-10 h-10 lg:w-12 lg:h-12'}`}>
          <div className={compact ? '' : 'lg:scale-110'}>{icon}</div>
        </div>
        <div className="text-left flex-1 min-w-0">
          <h3 className={`font-semibold text-foreground ${compact ? 'text-sm' : 'text-base lg:text-lg'}`}>{title}</h3>
          <p className={`text-muted-foreground truncate ${compact ? 'text-xs' : 'text-sm lg:text-base'}`}>{subtitle}</p>
        </div>
      </div>

      <div className={`flex items-center shrink-0 ${compact ? 'gap-2' : 'gap-3 lg:gap-4'}`}>
        {badge && (
          <span className={`rounded-md font-medium ${badgeClasses} ${compact ? 'text-xs px-2 py-0.5' : 'text-xs lg:text-sm px-2 py-1 lg:px-3 lg:py-1.5'}`}>
            {badge}
          </span>
        )}
        <ArrowRight className={`text-muted-foreground transition-transform ${compact ? 'w-4 h-4 group-hover:translate-x-0.5' : 'w-5 h-5 lg:w-6 lg:h-6 group-hover:translate-x-0.5 lg:group-hover:translate-x-1'}`} />
      </div>
    </button>
  );
};

export default NavigationItem;
