'use client';

import { Banknote, Users, TrendingUp, Clock } from 'lucide-react';
import StatCard from './StatCard';
import { useMemo } from 'react';
import { useOrderStats } from '@/hooks/queries';
import { useMyStore } from '@/hooks/queries/useMyStore';
import { formatSwissPrice, getLocalDateString } from '@/lib/utils';

const TodayStatsCard = () => {
  // Obtener store del usuario para filtrar estadísticas (ownerId = dueño de la tienda para contar órdenes)
  const { data: store } = useMyStore();
  const ownerId = store?.ownerId ?? (store as { ownerid?: string } | undefined)?.ownerid ?? store?.id;

  // Obtener fecha de hoy en formato YYYY-MM-DD (local, no UTC)
  const today = useMemo(() => getLocalDateString(), []);
  
  // Usar React Query para obtener estadísticas del día (con cache) - filtrado por tienda
  const { data: orderStats, isLoading: loading } = useOrderStats(today, ownerId);

  // Calcular estadísticas desde los datos
  const stats = useMemo(() => {
    if (!orderStats) {
      return {
        totalSales: 0,
        totalCustomers: 0,
        totalTransactions: 0,
        averagePerSale: 0,
        revenuePerHour: 0,
      };
    }

    const totalSales = orderStats.totalRevenue || 0;
    const totalTransactions = orderStats.totalOrders || 0;
    const totalCustomers = orderStats.uniqueCustomers || 0;
    const averagePerSale = totalTransactions > 0 
      ? (totalSales / totalTransactions) 
      : 0;
    
    // Calcular ingresos por hora (asumiendo 24 horas de operación)
    const hoursInDay = 24;
    const revenuePerHour = totalSales / hoursInDay;
    
    return {
      totalSales,
      totalCustomers,
      totalTransactions,
      averagePerSale,
      revenuePerHour,
    };
  }, [orderStats]);

  // Mostrar loading state
  if (loading) {
    return (
      <div className="w-full">
        <div className="flex items-center justify-between mb-4 lg:mb-6">
          <h2 className="text-lg lg:text-xl font-semibold text-gray-900">Heute</h2>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-gray-200 animate-pulse rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  const { totalSales, totalCustomers, totalTransactions, averagePerSale, revenuePerHour } = stats;

  return (
    <div className="w-full">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-4 lg:mb-6">
        <h2 className="text-lg lg:text-xl font-semibold text-gray-900">Heute</h2>
      </div>

      {/* Stats Grid - Responsive */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        {/* Móvil: 2 cards principales, Desktop: 4 cards en una fila */}
        <StatCard
          icon={<Banknote className="w-4 h-4" />}
          label="Verkäufe"
          amount={formatSwissPrice(totalSales)}
          count={`${totalTransactions} Transaktionen`}
          trend={totalTransactions > 0 ? "Heute" : "Keine Verkäufe"}
          showCurrency={true}
          showCount={true}
        />

        <StatCard
          icon={<Users className="w-4 h-4" />}
          label="Kunden"
          amount={totalCustomers.toString()}
          count=""
          trend={totalCustomers > 0 ? "Heute" : "Keine Kunden"}
          isDark={true}
          showCurrency={false}
          showCount={false}
        />

        {/* Desktop: 2 cards adicionales con información complementaria */}
        <div className="hidden lg:block">
          <StatCard
            icon={<TrendingUp className="w-4 h-4" />}
            label="Durchschnitt"
            amount={formatSwissPrice(averagePerSale)}
            count="pro Verkauf"
            trend={totalTransactions > 0 ? "Heute" : "N/A"}
            showCurrency={true}
            showCount={true}
          />
        </div>

        <div className="hidden lg:block">
          <StatCard
            icon={<Clock className="w-4 h-4" />}
            label="Umsatz/Stunde"
            amount={formatSwissPrice(revenuePerHour)}
            count="pro Stunde"
            trend="Heute"
            isDark={true}
            showCurrency={true}
            showCount={true}
          />
        </div>
      </div>
    </div>
  );
};

export default TodayStatsCard;
