'use client';

import ActionCard from './ActionCard';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useProductStats } from '@/hooks/queries/useProductStats';
import LoadingProductsModal from './LoadingProductsModal';

const MainActionCards = () => {
  const router = useRouter();
  const [pressedIndex, setPressedIndex] = useState<number | null>(null);
  const [showLoadingModal, setShowLoadingModal] = useState(false);
  
  // Usar React Query para obtener estadísticas de productos con cache
  const { data: productStats, isLoading, isFetching, error } = useProductStats();
  
  // Controlar el modal de carga con timeout de seguridad
  useEffect(() => {
    if (isLoading && !error) {
      // Mostrar modal cuando está cargando
      setShowLoadingModal(true);
      
      // Timeout de seguridad: ocultar modal después de 15 segundos
      const timeoutId = setTimeout(() => {
        setShowLoadingModal(false);
      }, 15000);
      
      return () => clearTimeout(timeoutId);
    } else {
      // Ocultar modal cuando termina de cargar o hay error
      setShowLoadingModal(false);
    }
  }, [isLoading, error]);
  
  const productCount = productStats?.total || 0;

  const actions = [
    {
      emoji:<Image src="/Receipt.svg" alt="Receipt" width={60} height={60} className="w-[60px] h-[60px] lg:w-[40px] lg:h-[40px]" />,
      title: 'Kassieren',
      subtitle: 'Verkauf starten',
      isPrimary: true,
      onClick: () => router.push('/charge'),
      link: '/charge',
    },
    {
      emoji: <Image src="/Package.svg" alt="Package" width={60} height={60} className="w-[60px] h-[60px] lg:w-[40px] lg:h-[40px]" />,
      title: 'Produkte',
      subtitle: `${productCount} Artikel`,
      onClick: () => router.push('/products_list'),
      link: '/products_list',
    },
  ];

  return (
    <>
      <LoadingProductsModal isOpen={showLoadingModal} />
      <div className="w-full">
        <div className="grid grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-3 lg:gap-4 text-xl  h-[200px]">
          {actions.map((action, idx) => (
            <ActionCard
              key={action.title}
              {...action}
              className={`${pressedIndex === idx ? 'scale-95 transition-transform duration-150' : 'transition-transform duration-150'} lg:aspect-[2/1] lg:h-[200px] lg:justify-center lg:items-center lg:flex lg:p-12 lg:text-2xl cursor-pointer`}
              onTouchStart={() => setPressedIndex(idx)}
              onTouchEnd={() => setPressedIndex(null)}
              onMouseDown={() => setPressedIndex(idx)}
              onMouseUp={() => setPressedIndex(null)}
              onMouseLeave={() => setPressedIndex(null)}
            />
          ))}
        </div>
      </div>
    </>
  );
};

export default MainActionCards;
