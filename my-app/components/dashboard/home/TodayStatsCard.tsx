'use client';

import { DollarSign, Users } from 'lucide-react';
import StatCard from './StatCard';

const TodayStatsCard = () => (
  <section className="mb-6">
    <div className="bg-background-cream rounded-2xl p-4 border border-gray-200/50 shadow-sm">

      {/* Section Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Heute</h2>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard
          icon={<DollarSign className="w-4 h-4" />}
          label="Verkäufe"
          amount={"1580"}
          count="24 Verkäufe"
          trend="+12% vs gestern"
          showCurrency={true}
          showCount={true}
        />

        <StatCard
          icon={<Users className="w-4 h-4" />}
          label="Kunden"
          amount="18"
          count=""
          trend="+8% vs gestern"
          isDark={true}
          showCurrency={false}
          showCount={false}
        />
      </div>
    </div>
  </section>
);

export default TodayStatsCard;
