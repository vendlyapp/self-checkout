// components/navigation/Header.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Store } from 'lucide-react';
import { useScannedStoreStore } from '@/lib/stores/scannedStoreStore';

interface HeaderUserProps {
  isDarkMode?: boolean;
}

export default function HeaderUser({ isDarkMode = false }: HeaderUserProps) {
  const { store } = useScannedStoreStore();
  const [storeLogo, setStoreLogo] = useState<string | null>(null);
  const headerBgClass = isDarkMode ? "bg-[#191F2D]" : "bg-background-cream";
  const borderClass = isDarkMode ? "border-slate-700" : "border-white";

  // Cargar logo de la tienda cuando cambie el store
  useEffect(() => {
    if (store?.logo) {
      setStoreLogo(store.logo);
    } else {
      setStoreLogo(null);
    }
  }, [store?.logo]);

  return (
    <>
      <header className="dashboard-header h-[calc(85px+env(safe-area-inset-top))] w-full flex items-center justify-center pt-[env(safe-area-inset-top)]">
        <div className={`dashboard-header-content ${headerBgClass} h-[85px] w-full flex items-center px-4`}>
           {/* Logo de la tienda - 50% izquierda */}
          <div className="w-1/2 flex items-center justify-start p-2 rounded">
            {storeLogo ? (
              <div className="relative max-w-[160px] sm:max-w-[180px] h-[65px] sm:h-[75px] flex items-center justify-center bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <img
                  src={storeLogo}
                  alt={store?.name || "Store Logo"}
                  className="max-w-full max-h-full w-auto h-auto object-contain p-1.5"
                  style={{ 
                    imageRendering: '-webkit-optimize-contrast'
                  }}
                  onError={() => {
                    // Si falla la carga, usar icono por defecto
                    setStoreLogo(null);
                  }}
                />
              </div>
            ) : (
              <div className="w-[120px] sm:w-[160px] h-[65px] sm:h-[75px] bg-gray-100 rounded-xl flex items-center justify-center p-2 border border-gray-200">
                <Store className="w-7 h-7 sm:w-8 sm:h-8 text-gray-400" />
              </div>
            )}
          </div>
          {/* Logo de checkout - 50% derecha */}
          <div className="w-1/2 flex items-center justify-end p-2 rounded">
            <Link href="/dashboard" className="dashboard-logo touch-target tap-highlight-transparent">
              <Image
                src={isDarkMode ? "/logo-b.svg" : "/logo.svg"}
                alt="Self-Checkout Logo"
                width={23}
                height={23}
                priority
                className="h-[23px] w-auto"
              />
            </Link>
          </div>
        </div>
      </header>
    </>
  );
}
