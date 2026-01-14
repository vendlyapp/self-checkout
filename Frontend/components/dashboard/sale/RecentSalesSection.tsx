'use client';

import { useRouter } from 'next/navigation';
import { ChevronRight, ShoppingCart } from 'lucide-react';
import SaleCard from './SaleCard';
import type { RecentSalesSectionProps } from '../types';

const MAX_VISIBLE_SALES = 4; // Mostrar máximo 4 ventas

const RecentSalesSection = ({ sales }: RecentSalesSectionProps) => {
  const router = useRouter();
  const hasMoreSales = sales.length > MAX_VISIBLE_SALES;
  const visibleSales = sales.slice(0, MAX_VISIBLE_SALES);

  // Si no hay ventas, mostrar mensaje
  if (sales.length === 0) {
    return (
      <section className="mb-6">
        <div className="flex items-center justify-between mb-4 lg:mb-6">
          <h2 className="text-lg lg:text-xl font-semibold text-gray-900">Letzte Verkäufe</h2>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
          <ShoppingCart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-600 font-medium">Keine Verkäufe vorhanden</p>
          <p className="text-sm text-gray-500 mt-1">Es wurden noch keine Bestellungen erstellt</p>
        </div>
      </section>
    );
  }

  return (
    <section className="mb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 lg:mb-6">
        <h2 className="text-lg lg:text-xl font-semibold text-gray-900">Letzte Verkäufe</h2>
        {hasMoreSales && (
          <button
            onClick={() => router.push('/sales/orders')}
            className="hidden lg:flex items-center gap-2 text-sm text-[#25D076] hover:text-[#25D076]/80 font-medium transition-colors"
          >
            <span>Alle anzeigen</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Lista de ventas - responsive */}
      <div className="space-y-3 lg:space-y-2">
        {visibleSales.map((sale) => (
          <SaleCard key={sale.id} sale={sale} />
        ))}
      </div>

      {/* Botón "Ver más" - solo si hay más de MAX_VISIBLE_SALES */}
      {hasMoreSales && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <button
            onClick={() => router.push('/sales/orders')}
            className="flex items-center justify-center gap-2 w-full text-sm text-[#25D076] hover:text-[#25D076]/80 font-medium transition-colors py-2.5 rounded-lg hover:bg-[#25D076]/5 touch-target"
          >
            <span>
              {sales.length - MAX_VISIBLE_SALES} weitere Verkäufe anzeigen
            </span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </section>
  );
};

export default RecentSalesSection;
