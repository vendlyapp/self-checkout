import React, { useState } from 'react';
import { ChevronDown, TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import {
  LineChart,
  Line,
  XAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { SalesData, TimePeriod, ChartTooltipProps } from './types';

interface SalesChartProps {
  data: SalesData[];
  totalSales: number;
  salesGrowth: number;
  period: TimePeriod;
  onPeriodChange: (period: TimePeriod) => void;
  loading?: boolean;
}

const CustomTooltip: React.FC<ChartTooltipProps> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-sm text-emerald-600">
          Diese Woche: CHF {payload[0]?.value?.toLocaleString()}.–
        </p>
        <p className="text-sm text-muted-foreground">
          Letzte Woche: CHF {payload[1]?.value?.toLocaleString()}.–
        </p>
      </div>
    );
  }
  return null;
};

const CustomDot: React.FC<{
  cx?: number;
  cy?: number;
  index?: number;
}> = (props) => {
  const { cx, cy, index } = props;
  // Highlight Saturday (index 5)
  if (index === 5) {
    return (
      <circle 
        cx={cx} 
        cy={cy} 
        r={6} 
        fill="#f59e0b" 
        stroke="#fff" 
        strokeWidth={2}
        className="drop-shadow-sm"
      />
    );
  }
  return null;
};

const periodOptions: { value: TimePeriod; label: string }[] = [
  { value: 'heute', label: 'Heute' },
  { value: 'woche', label: 'Woche' },
  { value: 'monat', label: 'Monat' },
  { value: 'jahr', label: 'Jahr' }
];

const SalesChart: React.FC<SalesChartProps> = ({ 
  data, 
  totalSales, 
  salesGrowth, 
  period, 
  onPeriodChange,
  loading = false 
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const isPositiveGrowth = salesGrowth >= 0;

  const handlePeriodSelect = (newPeriod: TimePeriod) => {
    onPeriodChange(newPeriod);
    setIsDropdownOpen(false);
  };

  if (loading) {
    return (
      <Card className="bg-card rounded-2xl border border-border/50">
        <CardContent className="p-5">
          <div className="animate-pulse">
            <div className="flex justify-between items-center mb-4">
              <div className="h-6 bg-muted rounded-lg w-20"></div>
              <div className="h-5 bg-muted rounded w-16"></div>
            </div>
            <div className="space-y-4">
              <div className="h-8 bg-muted rounded w-32"></div>
              <div className="h-40 bg-muted rounded-lg"></div>
              <div className="flex justify-between">
                <div className="h-3 bg-muted rounded w-24"></div>
                <div className="h-3 bg-muted rounded w-24"></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const currentPeriodLabel = periodOptions.find(option => option.value === period)?.label || 'Woche';

  return (
    <Card className="bg-card rounded-2xl border border-border/50 transition-fast hover:shadow-md">
      <CardContent className="p-5">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-foreground">Umsatz</h3>
          
          {/* Period Selector */}
          <div className="relative">
            <button 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-fast px-2 py-1 rounded-lg hover:bg-muted tap-highlight-transparent"
              aria-label="Zeitraum ändern"
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

        <div className="space-y-4">
          {/* Total und Vergleich */}
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-sm text-muted-foreground">CHF</span>
              <span className="text-3xl font-bold text-foreground">
                {totalSales.toLocaleString()}.–
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              {isPositiveGrowth ? (
                <TrendingUp className="w-4 h-4 text-emerald-500" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-500" />
              )}
              <span className={`font-medium ${isPositiveGrowth ? 'text-emerald-500' : 'text-red-500'}`}>
                {isPositiveGrowth ? '+' : ''}{salesGrowth}%
              </span>
              <span className="text-muted-foreground">vs letzte {currentPeriodLabel.toLowerCase()}</span>
            </div>
          </div>

          {/* Recharts Line Chart */}
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart 
                data={data} 
                margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
              >
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  stroke="hsl(var(--border))"
                  opacity={0.5}
                />
                <XAxis 
                  dataKey="day" 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                
                {/* Previous period line */}
                <Line 
                  type="monotone" 
                  dataKey="lastWeek" 
                  stroke="hsl(var(--muted-foreground))" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                  name="Letzte Woche"
                />
                
                {/* Current period line */}
                <Line 
                  type="monotone" 
                  dataKey="currentWeek" 
                  stroke="#10b981" 
                  strokeWidth={3}
                  dot={<CustomDot />}
                  name="Diese Woche"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Legende */}
          <div className="flex justify-between text-xs text-muted-foreground">
            <span className="flex items-center gap-2">
              <span className="w-4 h-0.5 bg-emerald-500 rounded"></span>
              6. Juni - 5. Juli 2025
            </span>
            <span className="flex items-center gap-2">
              <span className="w-4 h-0.5 bg-muted-foreground rounded border-dashed border-t border-muted-foreground"></span>
              7. Mai - 5. Juni 2025
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SalesChart; 