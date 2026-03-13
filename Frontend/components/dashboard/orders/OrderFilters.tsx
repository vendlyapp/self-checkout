"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Filter, Search } from "lucide-react";
import { TOP_FILTER_SEARCH_BAR_PX, TOP_FILTER_SLIDER_BAR_PX } from "@/lib/constants/layoutHeights";

interface OrderFiltersProps {
  searchQuery: string;
  onSearch: (query: string) => void;
  isFixed?: boolean;
}

export default function OrderFilters({ searchQuery, onSearch, isFixed = false }: OrderFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const statusFilter = searchParams?.get('status') as 'completed' | 'cancelled' | undefined;

  const handleFilterClick = (status?: 'completed' | 'cancelled') => {
    if (status) {
      router.push(`/sales/orders?status=${status}`);
    } else {
      router.push('/sales/orders');
    }
  };

  return (
    <>
      {/* Barra de búsqueda - FIJOS (posición y padding alineados con Filter_Busqueda) */}
      <div
        className={`${isFixed ? "fixed" : ""} left-0 right-0 p-4 bg-background-cream ${isFixed ? "z-40" : ""} animate-slide-down gpu-accelerated`}
        style={isFixed ? { top: `${TOP_FILTER_SEARCH_BAR_PX}px` } : undefined}
      >
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Nach Bestellnummer, Kunde oder Zahlungsmethode suchen..."
            value={searchQuery}
            onChange={(e) => onSearch(e.target.value)}
            className="w-full pl-10 pr-4 h-[54px] min-h-[54px] border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 bg-white text-base"
          />
        </div>
      </div>

      {/* Filtros por Status - FIJOS (posición alineada con layoutHeights) */}
      <div
        className={`${isFixed ? "fixed" : ""} left-0 right-0 bg-background-cream ${isFixed ? "z-40" : ""} animate-slide-down gpu-accelerated`}
        style={isFixed ? { top: `${TOP_FILTER_SLIDER_BAR_PX}px`, animationDelay: "0.1s", animationFillMode: "both" } : { animationDelay: "0.1s", animationFillMode: "both" }}
      >
        <div className="p-4 pt-2">
          <div className="flex items-center gap-2 mb-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <span className="text-sm font-medium text-gray-700">Status:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => handleFilterClick()}
              className={`cursor-pointer px-4 py-2.5 min-h-[44px] rounded-lg text-sm font-medium transition-ios ${
                !statusFilter
                  ? 'bg-brand-500 text-white shadow-sm'
                  : 'bg-white text-gray-700 hover:bg-gray-100 active:scale-95 border border-gray-300'
              }`}
            >
              Alle
            </button>
            <button
              type="button"
              onClick={() => handleFilterClick('completed')}
              className={`cursor-pointer px-4 py-2.5 min-h-[44px] rounded-lg text-sm font-medium transition-ios ${
                statusFilter === 'completed'
                  ? 'bg-green-500 text-white shadow-sm'
                  : 'bg-white text-gray-700 hover:bg-gray-100 active:scale-95 border border-gray-300'
              }`}
            >
              Abgeschlossen
            </button>
            <button
              type="button"
              onClick={() => handleFilterClick('cancelled')}
              className={`cursor-pointer px-4 py-2.5 min-h-[44px] rounded-lg text-sm font-medium transition-ios ${
                statusFilter === 'cancelled'
                  ? 'bg-red-500 text-white shadow-sm'
                  : 'bg-white text-gray-700 hover:bg-gray-100 active:scale-95 border border-gray-300'
              }`}
            >
              Storniert
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
