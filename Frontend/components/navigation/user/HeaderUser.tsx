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
          <div className="flex items-center justify-center w-1/2 sm:pl-6">
            {storeLogo ? (
              <div className="relative w-[100%] h-[70px] p-2  overflow-hidden">
                <img
                  src={storeLogo}
                  alt={store?.name || "Store Logo"}
                  className="w-full h-full object-cover rounded-lg"
                  onError={() => {
                    // Si falla la carga, usar icono por defecto
                    setStoreLogo(null);
                  }}
                />
              </div>
            ) : (
              <div className="w-32 sm:w-40 bg-gray-100 rounded-xl flex items-center justify-center p-2 border border-gray-200" style={{ aspectRatio: '10/7' }}>
                <Store className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400" />
              </div>
            )}
          </div>
          <div className="flex items-center justify-center w-1/2">
            <Link href="/dashboard" className="dashboard-logo touch-target tap-highlight-transparent">
              <Image
                src={isDarkMode ? "/logo-b.svg" : "/logo.svg"}
                alt="Self-Checkout Logo"
                width={50}
                height={50}
                priority
              />
            </Link>
          </div>
        </div>
      </header>
    </>
  );
}
