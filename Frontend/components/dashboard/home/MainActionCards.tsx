'use client';

import ActionCard from './ActionCard';
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useProductStats } from '@/hooks/queries/useProductStats';
import { useLoadingProductsModal } from '@/lib/contexts/LoadingProductsModalContext';

const MainActionCards = () => {
  const router = useRouter();
  const { openModal, closeModal } = useLoadingProductsModal();
  const { data: productStats, isLoading, error } = useProductStats();

  useEffect(() => {
    if (isLoading && !error) {
      openModal();
      const timeoutId = setTimeout(() => closeModal(), 15000);
      return () => clearTimeout(timeoutId);
    } else if (!isLoading) {
      closeModal();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, error]);

  const productCount = productStats?.total || 0;

  const actions = [
    {
      emoji: <Image src="/Receipt.svg" alt="Receipt" width={60} height={60} className="w-[60px] h-[60px] md:w-10 md:h-10 lg:w-12 lg:h-12" />,
      title: 'Kassieren',
      subtitle: 'Verkauf starten',
      isPrimary: true,
      onClick: () => router.push('/charge'),
    },
    {
      emoji: <Image src="/Package.svg" alt="Package" width={60} height={60} className="w-[60px] h-[60px] md:w-10 md:h-10 lg:w-12 lg:h-12" />,
      title: 'Produkte',
      subtitle: `${productCount} Artikel`,
      onClick: () => router.push('/products_list'),
    },
  ];

  return (
    <div className="w-full">
      <div className="grid grid-cols-2 gap-3 md:gap-4 min-h-[160px] md:min-h-[180px] lg:min-h-[200px]">
        {actions.map((action) => (
          <ActionCard
            key={action.title}
            {...action}
            className="active:scale-95 transition-transform duration-100 md:aspect-[2/1] md:min-h-[160px] lg:min-h-[180px] cursor-pointer"
          />
        ))}
      </div>
    </div>
  );
};

export default MainActionCards;
