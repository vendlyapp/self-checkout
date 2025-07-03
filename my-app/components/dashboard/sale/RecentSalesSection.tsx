'use client';

import { ChevronRight } from 'lucide-react';
import SaleCard from './SaleCard';
import type { RecentSalesSectionProps } from './types';

const RecentSalesSection = ({ sales }: RecentSalesSectionProps) => (
  <section className="mb-6">
    <div className="flex justify-between items-center mb-3">
      <h2 className="text-lg font-semibold text-gray-900">Letzte Verkäufe</h2>
      <ChevronRight className="w-5 h-5 text-gray-400" />
    </div>
    
    <div className="space-y-3">
      {sales.map((sale) => (
        <SaleCard key={sale.id} sale={sale} />
      ))}
    </div>
  </section>
);

export default RecentSalesSection; 