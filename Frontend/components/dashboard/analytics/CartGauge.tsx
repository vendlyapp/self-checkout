import React, { useState } from 'react';
import { ChevronDown, TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import {
  RadialBarChart,
  RadialBar,
  ResponsiveContainer
} from 'recharts';
import { CartData, TimePeriod } from './types';
import { formatSwissPrice, formatSwissPriceWithCHF } from '@/lib/utils';

interface CartGaugeProps {
  data: CartData;
  period: TimePeriod;
  onPeriodChange: (period: TimePeriod) => void;
  loading?: boolean;
}

const periodOptions: { value: TimePeriod; label: string }[] = [
  { value: 'heute', label: 'Heute' },
  { value: 'woche', label: 'Woche' },
  { value: 'monat', label: 'Monat' },
  { value: 'jahr', label: 'Jahr' }
];

const CartGauge: React.FC<CartGaugeProps> = ({
  data,
  period,
  onPeriodChange,
  loading = false
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handlePeriodSelect = (newPeriod: TimePeriod) => {
    onPeriodChange(newPeriod);
    setIsDropdownOpen(false);
  };

  // Calculate gauge value as percentage
  const gaugePercentage = Math.round((data.averageValue / data.maxValue) * 100);

  const gaugeData = [
    {
      name: 'cart',
      value: gaugePercentage,
      fill: '#10b981'
    }
  ];

  const isPositiveGrowth = data.trend === 'up';

  if (loading) {
    return (
      <Card className="bg-card rounded-2xl border border-border/50">
        <CardContent className="p-5">
          <div className="animate-pulse">
            <div className="flex justify-between items-center mb-4">
              <div className="h-6 bg-muted rounded-lg w-24"></div>
              <div className="h-5 bg-muted rounded w-16"></div>
            </div>
            <div className="flex items-center gap-6">
              <div className="w-32 h-32 bg-muted rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-muted rounded w-20"></div>
                <div className="h-8 bg-muted rounded w-24"></div>
                <div className="h-4 bg-muted rounded w-28"></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const currentPeriodLabel = periodOptions.find(option => option.value === period)?.label || 'Heute';

  return (
    <Card className="bg-card rounded-2xl border border-border/50 transition-all duration-200 hover:shadow-md">
      <CardContent className="p-5 lg:p-6">
        <div className="flex justify-between items-center mb-4 lg:mb-6">
          <h3 className="text-lg lg:text-xl font-semibold text-foreground">Ø Warenkorb</h3>

          {/* Period Selector */}
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-1 text-sm lg:text-base text-muted-foreground hover:text-foreground transition-all duration-200 px-2 py-1 lg:px-3 lg:py-2 rounded-lg hover:bg-muted tap-highlight-transparent"
              aria-label="Zeitraum für Warenkorb ändern"
            >
              {currentPeriodLabel}
              <ChevronDown className={`w-4 h-4 lg:w-5 lg:h-5 transition-all duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 top-8 z-20 bg-background border border-border rounded-lg shadow-lg py-1 min-w-[120px] lg:min-w-[140px]">
                {periodOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handlePeriodSelect(option.value)}
                    className={`w-full text-left px-3 py-2 lg:px-4 lg:py-2.5 text-sm lg:text-base hover:bg-muted transition-all duration-200 ${
                      period === option.value ? 'text-primary font-medium' : 'text-foreground'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-6 lg:gap-8">
          {/* Radial Gauge Chart - Mejorado para desktop */}
          <div className="relative w-32 h-32 lg:w-40 lg:h-40">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart
                cx="50%"
                cy="50%"
                innerRadius="60%"
                outerRadius="90%"
                data={gaugeData}
                startAngle={225}
                endAngle={-45}
              >
                <RadialBar
                  dataKey="value"
                  cornerRadius={10}
                  fill="#10b981"
                />
              </RadialBarChart>
            </ResponsiveContainer>

            {/* Min/Max Labels - Mejorados para desktop */}
            <div className="absolute bottom-2 left-1 text-xs lg:text-sm text-muted-foreground">
              {formatSwissPrice(data.minValue)}
            </div>
            <div className="absolute bottom-2 right-1 text-xs lg:text-sm text-muted-foreground">
              {formatSwissPrice(data.maxValue)}
            </div>

            {/* Central Value Display - Mejorado para desktop */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-lg lg:text-2xl font-bold text-foreground">
                  {formatSwissPrice(data.averageValue)}
                </div>
                <div className="text-xs lg:text-sm text-muted-foreground -mt-1">
                  CHF
                </div>
              </div>
            </div>

            {/* Indicador de porcentaje en desktop */}
            <div className="hidden lg:block absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs font-medium text-emerald-500 bg-emerald-50 px-2 py-1 rounded-full">
              {gaugePercentage}% des Maximums
            </div>
          </div>

          {/* Information Section - Mejorado para desktop */}
          <div className="flex-1 space-y-3 lg:space-y-4">
            <div>
              <p className="text-sm lg:text-base text-muted-foreground mb-1 lg:mb-2">Ø Einkaufswert</p>
              <p className="text-2xl lg:text-3xl font-bold text-emerald-500">
                {formatSwissPriceWithCHF(data.averageValue)}
              </p>
            </div>

            {/* Growth Indicator - Mejorado para desktop */}
            <div className="flex items-center gap-1 lg:gap-2 text-sm lg:text-base">
              {isPositiveGrowth ? (
                <TrendingUp className="w-4 h-4 lg:w-5 lg:h-5 text-emerald-500" />
              ) : (
                <TrendingDown className="w-4 h-4 lg:w-5 lg:h-5 text-red-500" />
              )}
              <span className={`font-medium ${isPositiveGrowth ? 'text-emerald-500' : 'text-red-500'}`}>
                {isPositiveGrowth ? '+' : ''}{data.percentageChange}%
              </span>
              <span className="text-muted-foreground">vs {data.comparisonPeriod}</span>
            </div>

            {/* Información adicional para desktop */}
            <div className="hidden lg:block pt-2 border-t border-border/50">
              <div className="flex justify-between items-center text-xs text-muted-foreground">
                <span>Minimum: {formatSwissPrice(data.minValue)}</span>
                <span>Maximum: {formatSwissPrice(data.maxValue)}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CartGauge;
