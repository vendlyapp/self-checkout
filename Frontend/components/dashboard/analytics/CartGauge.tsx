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
    <Card className="bg-card rounded-2xl border border-border shadow-sm transition-ios hover:shadow-md">
      <CardContent className="p-4 lg:p-6">
        <div className="flex justify-between items-center mb-3 lg:mb-6">
          <h3 className="text-lg lg:text-xl font-semibold text-foreground">Ø Warenkorb</h3>

          {/* Period Selector */}
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-1 text-sm lg:text-base text-muted-foreground hover:text-foreground transition-ios px-2 py-1 lg:px-3 lg:py-2 rounded-lg hover:bg-muted tap-highlight-transparent"
              aria-label="Zeitraum für Warenkorb ändern"
            >
              {currentPeriodLabel}
              <ChevronDown className={`w-4 h-4 lg:w-5 lg:h-5 transition-ios ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 top-8 z-20 bg-background border border-border rounded-lg shadow-lg py-1 min-w-[120px] lg:min-w-[140px]">
                {periodOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handlePeriodSelect(option.value)}
                    className={`w-full text-left px-3 py-2 lg:px-4 lg:py-2.5 text-sm lg:text-base hover:bg-muted transition-ios ${
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

        <div className="flex flex-col md:flex-row md:items-center gap-6 md:gap-8 min-w-0">
          {/* Radial Gauge - tamaño fijo para que no se deforme en tablet/desktop */}
          <div className="relative w-28 h-28 sm:w-32 sm:h-32 md:w-36 md:h-36 flex-shrink-0 mx-auto md:mx-0">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart
                cx="50%"
                cy="50%"
                innerRadius="58%"
                outerRadius="88%"
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

            {/* Min/Max solo en móvil/tablet compacto; en desktop van abajo en la sección de info */}
            <div className="md:hidden absolute bottom-0 left-0 text-[10px] text-muted-foreground">
              {formatSwissPrice(data.minValue)}
            </div>
            <div className="md:hidden absolute bottom-0 right-0 text-[10px] text-muted-foreground">
              {formatSwissPrice(data.maxValue)}
            </div>

            {/* Valor central */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <div className="text-base sm:text-lg md:text-xl font-bold text-foreground">
                  {formatSwissPrice(data.averageValue)}
                </div>
                <div className="text-[10px] sm:text-xs text-muted-foreground -mt-0.5">
                  CHF
                </div>
              </div>
            </div>
          </div>

          {/* Info derecha - con min-w-0 para truncate en tablet/desktop */}
          <div className="flex-1 min-w-0 space-y-2 md:space-y-3">
            <div>
              <p className="text-xs sm:text-sm text-muted-foreground mb-0.5">Ø Einkaufswert</p>
              <p className="text-xl sm:text-2xl md:text-2xl font-bold text-emerald-500 truncate">
                {formatSwissPriceWithCHF(data.averageValue)}
              </p>
            </div>

            <div className="flex items-center gap-1.5 text-xs sm:text-sm flex-wrap">
              {isPositiveGrowth ? (
                <TrendingUp className="w-4 h-4 text-emerald-500 shrink-0" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-500 shrink-0" />
              )}
              <span className={`font-medium shrink-0 ${isPositiveGrowth ? 'text-emerald-500' : 'text-red-500'}`}>
                {isPositiveGrowth ? '+' : ''}{data.percentageChange}%
              </span>
              <span className="text-muted-foreground truncate">vs {data.comparisonPeriod}</span>
            </div>

            {/* Min/Max en desktop; porcentaje integrado */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-2 border-t border-border/50 text-xs text-muted-foreground">
              <span className="truncate">Min: {formatSwissPrice(data.minValue)}</span>
              <span className="truncate">Max: {formatSwissPrice(data.maxValue)}</span>
              <span className="text-emerald-600 font-medium">{gaugePercentage}% des Max.</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CartGauge;
