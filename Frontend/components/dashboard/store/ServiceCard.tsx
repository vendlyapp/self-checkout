'use client';

import { ArrowRight } from 'lucide-react';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

type ServiceCardProps = {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  href?: string;
};

const ServiceCard = ({ icon, title, subtitle, href }: ServiceCardProps) => {
  const [pressed, setPressed] = useState(false);
  const router = useRouter();

  const handleClick = () => {
    if (href) {
      router.push(href);
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`group bg-card rounded-2xl border border-border shadow-sm hover:shadow-md hover:border-border/80 p-3 lg:p-4 flex flex-col items-start justify-between min-h-[88px] lg:min-h-[100px] focus-visible:ring-2 focus-visible:ring-primary transition-ios ${pressed ? 'scale-[0.98]' : ''}`}
      tabIndex={0}
      aria-label={`${title}: ${subtitle}`}
      type="button"
      onTouchStart={() => setPressed(true)}
      onTouchEnd={() => setPressed(false)}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onMouseLeave={() => setPressed(false)}
    >
      <div className="flex items-center justify-between w-full mb-1.5 lg:mb-2">
        <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-lg bg-muted flex items-center justify-center text-muted-foreground shrink-0 [&>svg]:w-4 [&>svg]:h-4 lg:[&>svg]:w-5 lg:[&>svg]:h-5">
          {icon}
        </div>
        <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform shrink-0" />
      </div>
      <div className="flex-1 flex flex-col justify-end w-full min-w-0 text-left">
        <div className="font-semibold text-foreground text-xs lg:text-sm leading-snug break-words">{title}</div>
        <div className="text-[11px] lg:text-xs text-muted-foreground mt-0.5">{subtitle}</div>
      </div>
    </button>
  );
};

export default ServiceCard;
