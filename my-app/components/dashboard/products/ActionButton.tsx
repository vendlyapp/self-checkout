'use client';

import React from 'react';
import { ArrowRight } from 'lucide-react';
import { ActionButtonProps } from './types';

const ActionButton: React.FC<ActionButtonProps> = ({ 
  icon, 
  title, 
  subtitle, 
  onClick,
  variant = 'primary' 
}) => {
  const baseClasses = "w-full rounded-2xl p-5 flex items-center justify-between transition-all active:scale-[0.98] duration-150 group";
  const variantClasses = variant === 'primary' 
    ? "bg-primary text-primary-foreground hover:opacity-90 shadow-lg shadow-primary/20" 
    : "bg-card border border-border hover:bg-muted";

  return (
    <button 
      onClick={onClick}
      className={`${baseClasses} ${variantClasses}`}
    >
      <div className="flex items-center gap-4">
        <div className={`w-10 h-10 ${variant === 'primary' ? 'bg-white/20' : 'bg-muted'} rounded-xl flex items-center justify-center`}>
          {icon}
        </div>
        <div className="text-left">
          <h3 className="font-semibold text-base">{title}</h3>
          <p className={`text-sm ${variant === 'primary' ? 'opacity-90' : 'text-muted-foreground'}`}>
            {subtitle}
          </p>
        </div>
      </div>
      <ArrowRight className="w-5 h-5 opacity-70 group-hover:translate-x-0.5 transition-transform" />
    </button>
  );
};

export default ActionButton; 