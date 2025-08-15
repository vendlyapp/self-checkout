'use client';

import { ArrowRight } from 'lucide-react';
import type { ActionCardProps } from '../types';
import React from 'react';

interface ExtendedActionCardProps extends Omit<ActionCardProps, 'icon'> {
  icon?: React.ReactNode;
  emoji?: React.ReactNode;
  className?: string;
  onTouchStart?: React.TouchEventHandler<HTMLButtonElement>;
  onTouchEnd?: React.TouchEventHandler<HTMLButtonElement>;
  onMouseDown?: React.MouseEventHandler<HTMLButtonElement>;
  onMouseUp?: React.MouseEventHandler<HTMLButtonElement>;
  onMouseLeave?: React.MouseEventHandler<HTMLButtonElement>;
}

const ActionCard = ({ 
  icon, 
  emoji,
  title, 
  subtitle, 
  isPrimary = false, 
  onClick,
  className = "",
  onTouchStart,
  onTouchEnd,
  onMouseDown,
  onMouseUp,
  onMouseLeave
}: ExtendedActionCardProps) => {
  // Renderizar icono o emoji
  const renderIcon = () => {
    if (emoji) {
      // Si es un ReactNode (como img), renderizarlo directamente
      return emoji;
    }
    return icon;
  };

  return (
    <button
      onClick={onClick}
      className={`group p-5 text-left transition-all flex-shrink-0 aspect-square flex flex-col justify-between card-shadow rounded-2xl ${isPrimary ? 'bg-brand-500 text-white' : 'bg-white text-gray-900'} ${className}`}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseLeave}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="rounded-xl flex items-center justify-center w-[60px] h-[60px]">
          {renderIcon()}
        </div>
        <ArrowRight className={`w-6 h-6 group-active:translate-x-0.5 transition-transform ${isPrimary ? 'text-white' : 'text-gray-900'}`} />
      </div>
      <div>
        <h3 className="font-semibold text-[24px] mb-1 ">{title}</h3>
        <p className={`text-sm ${isPrimary ? 'opacity-90' : 'text-gray-600'}`}>{subtitle}</p>
      </div>
    </button>
  );
};

export default ActionCard; 