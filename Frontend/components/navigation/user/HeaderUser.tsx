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
        <div className={`dashboard-header-content ${headerBgClass} h-[85px] w-full flex border-b ${borderClass} items-center justify-center`}>
           {/* Logo de la tienda */}
          <div className="flex items-center justify-center w-1/2 sm:pl-6 px-2">
            {storeLogo ? (
              <div className="relative w-full max-w-[120px] sm:max-w-[160px] h-[60px] sm:h-[70px] p-2 overflow-hidden transition-interactive">
                <img
                  src={storeLogo}
                  alt={store?.name || "Store Logo"}
                  className="w-full h-full object-cover rounded-lg transition-interactive gpu-accelerated"
                  onError={() => {
                    // Si falla la carga, usar icono por defecto
                    setStoreLogo(null);
                  }}
                />
              </div>
            ) : (
              <div className="w-[100px] sm:w-[140px] h-[60px] sm:h-[70px] bg-gray-100 rounded-xl flex items-center justify-center p-2 border border-gray-200 transition-interactive">
                <Store className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400 transition-interactive" />
              </div>
            )}
          </div>
          <div className="flex items-center justify-center w-1/2">
            <Link href="/dashboard" className="dashboard-logo touch-target tap-highlight-transparent transition-interactive gpu-accelerated active:scale-95">
              <Image
                src={isDarkMode ? "/logo-b.svg" : "/logo.svg"}
                alt="Self-Checkout Logo"
                width={50}
                height={50}
                priority
                className="transition-interactive"
                style={{ width: 'auto', height: 'auto' }}
              />
            </Link>
          </div>
        </div>
      </header>
    </>
  );
}
