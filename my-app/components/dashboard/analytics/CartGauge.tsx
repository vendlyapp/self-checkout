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
    <Card className="bg-card rounded-2xl border border-border/50 transition-fast hover:shadow-md">
      <CardContent className="p-5">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-foreground">Ø Warenkorb</h3>

          {/* Period Selector */}
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-fast px-2 py-1 rounded-lg hover:bg-muted tap-highlight-transparent"
              aria-label="Zeitraum für Warenkorb ändern"
            >
              {currentPeriodLabel}
              <ChevronDown className={`w-4 h-4 transition-fast ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 top-8 z-20 bg-background border border-border rounded-lg shadow-lg py-1 min-w-[120px]">
                {periodOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handlePeriodSelect(option.value)}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-muted transition-fast ${
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

        <div className="flex items-center gap-6">
          {/* Radial Gauge Chart */}
          <div className="relative w-32 h-32">
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

            {/* Min/Max Labels */}
            <div className="absolute bottom-2 left-1 text-xs text-muted-foreground">
              {formatSwissPrice(data.minValue)}
            </div>
            <div className="absolute bottom-2 right-1 text-xs text-muted-foreground">
              {formatSwissPrice(data.maxValue)}
            </div>

            {/* Central Value Display */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-lg font-bold text-foreground">
                  {formatSwissPrice(data.averageValue)}
                </div>
                <div className="text-xs text-muted-foreground -mt-1">
                  CHF
                </div>
              </div>
            </div>
          </div>

          {/* Information Section */}
          <div className="flex-1 space-y-3">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Ø Einkaufswert</p>
              <p className="text-2xl font-bold text-emerald-500">
                {formatSwissPriceWithCHF(data.averageValue)}
              </p>
            </div>

            {/* Growth Indicator */}
            <div className="flex items-center gap-1 text-sm">
              {isPositiveGrowth ? (
                <TrendingUp className="w-4 h-4 text-emerald-500" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-500" />
              )}
              <span className={`font-medium ${isPositiveGrowth ? 'text-emerald-500' : 'text-red-500'}`}>
                {isPositiveGrowth ? '+' : ''}{data.percentageChange}%
              </span>
              <span className="text-muted-foreground">vs {data.comparisonPeriod}</span>
            </div>


          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CartGauge;
