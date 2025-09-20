'use client';

import { DollarSign, Users, TrendingUp, Clock } from 'lucide-react';
import StatCard from './StatCard';

const TodayStatsCard = () => {
  // Datos calculados para evitar duplicaciones
  const totalSales = 1580;
  const totalCustomers = 18;
  const totalTransactions = 24;
  const averagePerSale = (totalSales / totalTransactions).toFixed(2);

  return (
    <div className="w-full">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-4 lg:mb-6">
        <h2 className="text-lg lg:text-xl font-semibold text-gray-900">Heute</h2>
      </div>

      {/* Stats Grid - Responsive */}
      <div className="grid grid-cols-2 lg:grid-cols-2 gap-3 lg:gap-4">
        {/* Móvil: 2 cards principales */}
        <StatCard
          icon={<DollarSign className="w-4 h-4" />}
          label="Verkäufe"
          amount={totalSales.toString()}
          count={`${totalTransactions} Transaktionen`}
          trend="+12% vs gestern"
          showCurrency={true}
          showCount={true}
        />

        <StatCard
          icon={<Users className="w-4 h-4" />}
          label="Kunden"
          amount={totalCustomers.toString()}
          count=""
          trend="+8% vs gestern"
          isDark={true}
          showCurrency={false}
          showCount={false}
        />

        {/* Desktop: 2 cards adicionales con información complementaria */}
        <div className="hidden lg:block">
          <StatCard
            icon={<TrendingUp className="w-4 h-4" />}
            label="Durchschnitt"
            amount={averagePerSale}
            count="pro Verkauf"
            trend="+5% vs gestern"
            showCurrency={true}
            showCount={true}
          />
        </div>

        <div className="hidden lg:block">
          <StatCard
            icon={<Clock className="w-4 h-4" />}
            label="Umsatz/Stunde"
            amount="65.83"
            count="CHF pro Stunde"
            trend="+3% vs gestern"
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
