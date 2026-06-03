'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useProductStats } from '@/hooks/queries/useProductStats';
import { useProducts, PRODUCT_CATALOG_FILTERS } from '@/hooks/queries/useProducts';

const MainActionCards = () => {
  const router = useRouter();
  const { data: productStats } = useProductStats();
  const { data: catalogProducts } = useProducts(PRODUCT_CATALOG_FILTERS);
  const productCount =
    (productStats?.total ?? 0) > 0
      ? productStats!.total
      : (catalogProducts?.length ?? 0);

  useEffect(() => {
    router.prefetch('/charge');
    router.prefetch('/products_list');
  }, [router]);

  return (
    <div className="w-full">
      <div className="grid grid-cols-2 gap-3 md:gap-4 min-h-[160px] md:min-h-[180px] lg:min-h-[200px]">
        {/* Kassieren */}
        <Link
          href="/charge"
          prefetch
          className="dashboard-tap-target group p-4 lg:p-5 text-left flex-shrink-0 aspect-square md:aspect-[2/1] flex flex-col justify-between card-shadow rounded-2xl w-full h-full bg-brand-500 text-white active:scale-95 transition-transform duration-100 md:min-h-[160px] lg:min-h-[180px] relative z-[1]"
        >
          <div className="hidden md:flex items-center gap-3 lg:gap-4 w-full flex-1 min-w-0">
            <div className="rounded-xl flex items-center justify-center w-10 h-10 lg:w-12 lg:h-12 flex-shrink-0">
              <Image src="/Receipt.svg" alt="Receipt" width={40} height={40} className="w-10 h-10 lg:w-12 lg:h-12" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-base md:text-lg lg:text-xl mb-0.5">Kassieren</h3>
              <p className="text-xs md:text-sm opacity-90">Verkauf starten</p>
            </div>
            <ArrowRight className="w-5 h-5 lg:w-6 lg:h-6 group-active:translate-x-0.5 transition-transform flex-shrink-0 text-white" />
          </div>
          <div className="md:hidden flex flex-col h-full">
            <div className="flex items-center justify-between mb-4">
              <div className="rounded-xl flex items-center justify-center w-[60px] h-[60px]">
                <Image src="/Receipt.svg" alt="Receipt" width={60} height={60} className="w-[60px] h-[60px]" />
              </div>
              <ArrowRight className="w-6 h-6 group-active:translate-x-0.5 transition-transform text-white" />
            </div>
            <div className="flex-1 flex flex-col justify-end">
              <h3 className="font-semibold text-[24px] mb-1">Kassieren</h3>
              <p className="text-sm opacity-90">Verkauf starten</p>
            </div>
          </div>
        </Link>

        {/* Produkte */}
        <Link
          href="/products_list"
          prefetch
          className="dashboard-tap-target group p-4 lg:p-5 text-left flex-shrink-0 aspect-square md:aspect-[2/1] flex flex-col justify-between card-shadow rounded-2xl w-full h-full bg-white text-gray-900 active:scale-95 transition-transform duration-100 md:min-h-[160px] lg:min-h-[180px] relative z-[1]"
        >
          <div className="hidden md:flex items-center gap-3 lg:gap-4 w-full flex-1 min-w-0">
            <div className="rounded-xl flex items-center justify-center w-10 h-10 lg:w-12 lg:h-12 flex-shrink-0">
              <Image src="/Package.svg" alt="Package" width={40} height={40} className="w-10 h-10 lg:w-12 lg:h-12" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-base md:text-lg lg:text-xl mb-0.5">Produkte</h3>
              <p className="text-xs md:text-sm text-gray-600">{productCount} Artikel</p>
            </div>
            <ArrowRight className="w-5 h-5 lg:w-6 lg:h-6 group-active:translate-x-0.5 transition-transform flex-shrink-0 text-gray-900" />
          </div>
          <div className="md:hidden flex flex-col h-full">
            <div className="flex items-center justify-between mb-4">
              <div className="rounded-xl flex items-center justify-center w-[60px] h-[60px]">
                <Image src="/Package.svg" alt="Package" width={60} height={60} className="w-[60px] h-[60px]" />
              </div>
              <ArrowRight className="w-6 h-6 group-active:translate-x-0.5 transition-transform text-gray-900" />
            </div>
            <div className="flex-1 flex flex-col justify-end">
              <h3 className="font-semibold text-[24px] mb-1">Produkte</h3>
              <p className="text-sm text-gray-600">{productCount} Artikel</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default MainActionCards;
