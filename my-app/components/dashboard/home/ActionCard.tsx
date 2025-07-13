'use client';

import { ArrowRight } from 'lucide-react';
import { Emoji3D } from '@/components/ui/emoji-3d';
import type { ActionCardProps } from '../types';
import React from 'react';

interface ExtendedActionCardProps extends Omit<ActionCardProps, 'icon'> {
  icon?: React.ReactNode;
  emoji?: string;
  className?: string;
}

const ActionCard = ({ 
  icon, 
  emoji,
  title, 
  subtitle, 
  isPrimary = false, 
  onClick,
  className = ""
}: ExtendedActionCardProps) => {
  // Renderizar icono o emoji
  const renderIcon = () => {
    if (emoji) {
      return (
        <Emoji3D 
          emoji={emoji}
          size={40}
          className="w-10 h-10"
        />
      );
    }
    return icon;
  };

  return (
    <button
      onClick={onClick}
      className={`group p-5 text-left active:scale-95 duration-150 transition-all flex-shrink-0 aspect-square flex flex-col justify-between card-shadow rounded-2xl ${isPrimary ? 'bg-brand-500 text-white' : 'bg-white text-gray-900'} ${className}`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="rounded-xl flex items-center justify-center w-12 h-12 bg-white/10">
          {renderIcon()}
        </div>
        <ArrowRight className={`w-4 h-4 group-active:translate-x-0.5 transition-transform ${isPrimary ? 'text-white/70' : 'text-gray-400'}`} />
      </div>
      <div>
        <h3 className="font-semibold text-lg mb-1">{title}</h3>
        <p className={`text-sm ${isPrimary ? 'opacity-90' : 'text-gray-600'}`}>{subtitle}</p>
      </div>
    </button>
  );
};

export default ActionCard; 