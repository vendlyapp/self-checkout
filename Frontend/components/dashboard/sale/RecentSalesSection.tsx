'use client';

import { ChevronRight, TrendingUp, Clock, DollarSign } from 'lucide-react';
import SaleCard from './SaleCard';
import type { RecentSalesSectionProps } from '../types';

const RecentSalesSection = ({ sales }: RecentSalesSectionProps) => (
  <section className="mb-6">
    {/* Header con estadísticas para desktop */}
    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4 lg:mb-6">
      <div className="flex items-center justify-between lg:justify-start mb-3 lg:mb-0">
        <h2 className="text-lg lg:text-xl font-semibold text-gray-900">Letzte Verkäufe</h2>
        <ChevronRight className="w-5 h-5 text-gray-400 lg:hidden" />
      </div>

      {/* Estadísticas rápidas para desktop */}
      <div className="hidden lg:flex items-center gap-6">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <TrendingUp className="w-4 h-4 text-green-500" />
          <span>+12% vs gestern</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Clock className="w-4 h-4 text-blue-500" />
          <span>Letzte: {sales[0]?.time || 'N/A'}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <DollarSign className="w-4 h-4 text-brand-500" />
          <span>Total: CHF {sales.reduce((sum, sale) => sum + sale.amount, 0).toFixed(2)}</span>
        </div>
      </div>
    </div>

    {/* Lista de ventas - responsive */}
    <div className="space-y-3 lg:space-y-2">
      {sales.map((sale) => (
        <SaleCard key={sale.id} sale={sale} />
      ))}
    </div>

    {/* Footer con acción para desktop */}
    <div className="hidden lg:block mt-4 pt-4 border-t border-gray-100">
      <button className="flex items-center gap-2 text-sm text-brand-600 hover:text-brand-700 font-medium transition-colors duration-200">
        <span>Alle Verkäufe anzeigen</span>
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  </section>
);

export default RecentSalesSection;
