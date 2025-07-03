'use client';

import { Calendar, Clock } from 'lucide-react';
import type { GreetingSectionProps } from './types';

const GreetingSection = ({ 
  isStoreOpen, 
  onToggleStore 
}: GreetingSectionProps) => (
  <section className="mb-6">
    {/* Top Row: Greeting + Store Toggle */}
    <div className="flex items-start justify-between mb-2">
      <div className="flex-1">
        <h1 className="text-2xl font-bold text-gray-900 leading-tight">
          Hoi Peter
          <span className="ml-2">👋</span>
        </h1>
      </div>
      
      {/* Store Status Toggle */}
      <div className="flex items-center gap-2 ml-4">
        <span className="text-sm font-medium text-gray-600">
          {isStoreOpen ? 'Geöffnet' : 'Geschlossen'}
        </span>
        <button
          onClick={onToggleStore}
          className={`
            relative inline-flex h-6 w-10 items-center rounded-full 
            transition-colors duration-200 ease-in-out 
            focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2
            ${isStoreOpen ? 'bg-brand-500' : 'bg-gray-300'}
          `}
          role="switch"
          aria-checked={isStoreOpen}
          aria-label="Toggle store status"
        >
          <span
            className={`
              inline-block h-4 w-4 transform rounded-full bg-white 
              transition duration-200 ease-in-out shadow-sm
              ${isStoreOpen ? 'translate-x-5' : 'translate-x-1'}
            `}
          />
        </button>
      </div>
    </div>

    {/* Status Info */}
    <div className="flex items-center gap-4 text-sm text-gray-600">
      <div className="flex items-center gap-1.5">
        <Calendar className="w-4 h-4" />
        <span>18°C • Di, 24. März</span>
      </div>
      <div className="flex items-center gap-1.5">
        <Clock className="w-4 h-4" />
        <span>seit 08:03</span>
      </div>
    </div>
  </section>
);

export default GreetingSection; 