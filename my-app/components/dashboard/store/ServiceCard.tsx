'use client';

import { ArrowRight } from 'lucide-react';
import React, { useState } from 'react';

type ServiceCardProps = {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
};

const ServiceCard = ({ icon, title, subtitle }: ServiceCardProps) => {
  const [pressed, setPressed] = useState(false);
  return (
    <button
      className={`group bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col items-start justify-between min-h-[110px] focus-visible:ring-2 focus-visible:ring-brand-500 transition-transform duration-150 ${pressed ? 'scale-95' : ''}`}
      tabIndex={0}
      aria-label={title}
      type="button"
      onTouchStart={() => setPressed(true)}
      onTouchEnd={() => setPressed(false)}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onMouseLeave={() => setPressed(false)}
    >
      <div className="flex items-center justify-between w-full mb-3">
        <div className="w-10 h-10 rounded-xl bg-warm-300 flex items-center justify-center">
          <span className="text-brand-700 bg-background-cream rounded-lg p-2">{icon}</span>
        </div>
        <ArrowRight className="w-4 h-4 text-gray-400 group-active:translate-x-0.5 transition-transform" />
      </div>
      <div>
        <div className="font-semibold text-gray-900 text-base leading-tight">{title}</div>
        <div className="text-xs text-brand-500 mt-0.5">{subtitle}</div>
      </div>
    </button>
  );
};

export default ServiceCard; 