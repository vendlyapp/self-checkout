"use client";

import { useScannedStoreStore } from "@/lib/stores/scannedStoreStore";

interface StoreInfoHeaderProps {
  isFixed?: boolean;
}

export default function StoreInfoHeader({ isFixed = false }: StoreInfoHeaderProps) {
  const { store } = useScannedStoreStore();

  return (
    <div 
      className={`${isFixed ? 'fixed' : ''} left-0 right-0 bg-background-cream border-t border-b border-white ${isFixed ? 'z-45' : ''}`}
      style={isFixed ? { top: 'calc(85px + env(safe-area-inset-top))' } : {}}
    >
      <div className="flex items-center justify-between w-full px-3 sm:px-4 py-2.5 sm:py-3 ">
        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0 ">
          <div className="flex flex-col items-start justify-start flex-1 min-w-0 space-y-1 pl-4">
            {/* Título de la tienda con color #111827 - Responsive */}
            <p className="text-[#111827] font-bold text-[18px] sm:text-[18px] truncate w-full leading-tight">
              {store?.name || 'Heinigers Hofladen'}
            </p>
            {/* Ciudad y puntuación en la misma línea - Responsive */}
            <p className="text-gray-600 text-[13px] sm:text-[12px] mt-0.5 flex items-center gap-1 truncate w-full leading-tight">
              <span>{store?.address || '8305 Dietlikon'}</span>
              <span className="text-gray-400">•</span>
              <span className="text-yellow-500">⭐</span>
              <span className="text-gray-500">4.8</span>
            </p>
          </div>
        </div>
        <div className="flex items-center justify-end flex-shrink-0 ml-2">
          <button 
            className="bg-white text-gray-600 hover:text-gray-900 text-[13px] sm:text-sm font-medium px-3 sm:px-4 py-1.5 sm:py-1 rounded-lg hover:bg-gray-50 whitespace-nowrap transition-colors touch-target-sm" 
            style={{ minHeight: '32px' }}
            aria-label="Kontakt"
            tabIndex={0}
          >
            Kontakt
          </button>
        </div>
      </div>
    </div>
  );
}

