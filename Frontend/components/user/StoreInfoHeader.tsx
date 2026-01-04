"use client";

import { useScannedStoreStore } from "@/lib/stores/scannedStoreStore";

interface StoreInfoHeaderProps {
  isFixed?: boolean;
}

export default function StoreInfoHeader({ isFixed = false }: StoreInfoHeaderProps) {
  const { store } = useScannedStoreStore();

  return (
    <div 
      className={`${isFixed ? 'fixed' : ''} left-0 right-0 bg-background-cream border-b border-white ${isFixed ? 'z-40' : ''}`}
      style={isFixed ? { top: 'calc(85px + env(safe-area-inset-top))' } : {}}
    >
      <div className="flex items-center justify-between w-full px-4 py-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="flex flex-col items-start justify-start flex-1 min-w-0">
            {/* Título de la tienda con color #111827 */}
            <p className="text-[#111827] font-bold text-[17px] truncate w-full">
              {store?.name || 'Heinigers Hofladen'}
            </p>
            {/* Ciudad y puntuación en la misma línea - formato: "8305 Ciudad • ⭐ 4.8" */}
            <p className="text-gray-600 text-[12px] mt-0.5 flex items-center gap-1 truncate w-full">
              <span>{store?.address || '8305 Dietlikon'}</span>
              <span className="text-gray-400">•</span>
              <span className="text-yellow-500">⭐</span>
              <span className="text-gray-500">4.8</span>
            </p>
          </div>
        </div>
        <div className="flex items-center justify-end flex-shrink-0 ml-2">
          <button 
            className="bg-white text-gray-500 px-4 py-1 rounded-lg hover:bg-gray-50 whitespace-nowrap" 
            style={{ minHeight: '35px' }}
          >
            Kontakt
          </button>
        </div>
      </div>
    </div>
  );
}

