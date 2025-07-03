'use client';

import { ArrowRight } from 'lucide-react';
import type { ActionCardProps } from './types';

const ActionCard = ({ 
  icon, 
  title, 
  subtitle, 
  isPrimary = false, 
  onClick 
}: ActionCardProps) => (
  <button
    onClick={onClick}
    className={`
      group rounded-2xl p-5 text-left
      active:scale-95 duration-150
      shadow-sm hover:shadow-md transition-shadow
      min-h-[120px] flex flex-col justify-between
      ${isPrimary 
        ? 'bg-brand-500 text-white' 
        : 'bg-white border border-gray-200 text-gray-900'
      }
    `}
  >
    <div className="flex items-center justify-between mb-4">
      <div className={`
        w-9 h-9 rounded-xl flex items-center justify-center
        ${isPrimary 
          ? 'bg-white/20' 
          : 'bg-gray-100'
        }
      `}>
        {icon}
      </div>
      <ArrowRight className={`
        w-4 h-4 group-active:translate-x-0.5 transition-transform
        ${isPrimary ? 'text-white/70' : 'text-gray-400'}
      `} />
    </div>
    <div>
      <h3 className="font-semibold text-lg mb-1">{title}</h3>
      <p className={`text-sm ${isPrimary ? 'opacity-90' : 'text-gray-600'}`}>
        {subtitle}
      </p>
    </div>
  </button>
);

export default ActionCard; 