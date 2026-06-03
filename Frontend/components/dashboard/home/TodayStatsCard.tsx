'use client';

import { Banknote, Users } from 'lucide-react';
import StatCard from './StatCard';
import { useMemo } from 'react';
import { useOrderStats } from '@/hooks/queries';
import { useMyStore } from '@/hooks/queries/useMyStore';
import { useAuth } from '@/lib/auth/AuthContext';
import { formatSwissPrice, getLocalDateString } from '@/lib/utils';

const TodayStatsCard = () => {
  const { session, loading: authLoading } = useAuth();
  const { data: store } = useMyStore();
  const ownerId = store?.ownerId ?? session?.user?.id;

  const today = useMemo(() => getLocalDateString(), []);

  const { data: orderStats, isFetched, isFetching } = useOrderStats(today, ownerId);

  const stats = useMemo(() => {
    const base = {
      totalSales: orderStats?.totalRevenue ?? 0,
      totalCustomers: orderStats?.uniqueCustomers ?? 0,
      totalTransactions: orderStats?.totalOrders ?? 0,
    };
    return {
      ...base,
      averagePerSale:
        base.totalTransactions > 0 ? base.totalSales / base.totalTransactions : 0,
      revenuePerHour: base.totalSales / 24,
    };
  }, [orderStats]);

  const showSkeleton =
    !authLoading && !!ownerId && !isFetched && isFetching;

  if (showSkeleton) {
    return (
      <div className="w-full">
        <div className="flex items-center justify-between mb-4 md:mb-5 lg:mb-6">
          <h2 className="text-lg md:text-xl font-semibold text-gray-900">Heute</h2>
        </div>
        <div className="grid grid-cols-2 gap-3 md:gap-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-24 bg-gray-200 animate-pulse rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  const { totalSales, totalCustomers, totalTransactions } = stats;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4 md:mb-5 lg:mb-6">
        <h2 className="text-lg md:text-xl font-semibold text-gray-900">Heute</h2>
      </div>

      <div className="grid grid-cols-2 gap-3 md:gap-4">
        <StatCard
          icon={<Banknote className="w-4 h-4" />}
          label="Verkäufe"
          amount={formatSwissPrice(totalSales)}
          count={`${totalTransactions} Transaktionen`}
          trend={totalTransactions > 0 ? 'Heute' : 'Keine Verkäufe'}
          showCurrency={true}
          showCount={true}
        />

        <StatCard
          icon={<Users className="w-4 h-4" />}
          label={totalCustomers === 1 ? 'Kunde' : 'Kunden'}
          amount={totalCustomers.toString()}
          count=""
          trend={totalCustomers > 0 ? 'Heute' : 'Keine Kunden'}
          isDark={true}
          showCurrency={false}
          showCount={false}
        />
      </div>
    </div>
  );
};

export default TodayStatsCard;
