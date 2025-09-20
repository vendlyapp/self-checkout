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
      className={`group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md p-4 lg:p-5 flex flex-col items-start justify-between min-h-[110px] lg:min-h-[120px] focus-visible:ring-2 focus-visible:ring-brand-500 transition-all duration-200 ${pressed ? 'scale-95' : ''}`}
      tabIndex={0}
      aria-label={title}
      type="button"
      onTouchStart={() => setPressed(true)}
      onTouchEnd={() => setPressed(false)}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onMouseLeave={() => setPressed(false)}
    >
      <div className="flex items-center justify-between w-full mb-3 lg:mb-4">
        <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl bg-warm-300 flex items-center justify-center">
          <span className="text-brand-700 bg-background-cream rounded-lg p-2 lg:scale-110">{icon}</span>
        </div>
        <ArrowRight className="w-4 h-4 lg:w-5 lg:h-5 text-gray-400 group-active:translate-x-0.5 group-hover:translate-x-1 transition-transform" />
      </div>
      <div className="flex-1 flex flex-col justify-end">
        <div className="font-semibold text-gray-900 text-base lg:text-lg leading-tight">{title}</div>
        <div className="text-xs lg:text-sm text-gray-500 text-start mt-0.5 lg:mt-1">{subtitle}</div>
      </div>
    </button>
  );
};

export default ServiceCard;
