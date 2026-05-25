'use client';

import { ArrowRight } from 'lucide-react';
import React from 'react';
import Link from 'next/link';

type ServiceCardProps = {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  href?: string;
};

const ServiceCard = ({ icon, title, subtitle, href }: ServiceCardProps) => {
  const Wrapper = href ? Link : 'div';

  return (
    <Wrapper
      href={href ?? '#'}
      className="group cursor-pointer bg-card rounded-2xl border border-border shadow-sm hover:shadow-md hover:border-border/80 p-3.5 sm:p-4 lg:p-4 flex flex-col items-start justify-between min-h-[96px] lg:min-h-[100px] focus-visible:ring-2 focus-visible:ring-primary active:scale-[0.98] transition-transform duration-100"
      aria-label={`${title}: ${subtitle}`}
    >
      <div className="flex items-center justify-between w-full mb-1.5 lg:mb-2">
        <div className="w-10 h-10 lg:w-10 lg:h-10 rounded-lg bg-muted flex items-center justify-center text-muted-foreground shrink-0 [&>svg]:w-5 [&>svg]:h-5 lg:[&>svg]:w-5 lg:[&>svg]:h-5">
          {icon}
        </div>
        <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-0.5 transition-transform shrink-0" />
      </div>
      <div className="w-full">
        <h3 className="font-semibold text-foreground text-sm lg:text-base leading-snug">{title}</h3>
        <p className="text-muted-foreground text-xs lg:text-sm mt-0.5 leading-snug">{subtitle}</p>
      </div>
    </Wrapper>
  );
};

export default ServiceCard;
