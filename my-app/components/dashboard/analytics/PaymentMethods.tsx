import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { PaymentMethod, TimePeriod } from './types';

interface PaymentMethodsProps {
  data: PaymentMethod[];
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

const PaymentMethods: React.FC<PaymentMethodsProps> = ({ 
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

  if (loading) {
    return (
      <Card className="bg-card rounded-2xl border border-border/50">
        <CardContent className="p-6">
          <div className="animate-pulse">
            <div className="flex justify-between items-center mb-6">
              <div className="h-6 bg-muted rounded-lg w-32"></div>
              <div className="h-5 bg-muted rounded w-16"></div>
            </div>
            <div className="h-4 bg-muted rounded-lg mb-6"></div>
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-3 bg-muted rounded"></div>
                    <div className="h-4 bg-muted rounded w-20"></div>
                  </div>
                  <div className="h-4 bg-muted rounded w-24"></div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const currentPeriodLabel = periodOptions.find(option => option.value === period)?.label || 'Heute';
  const totalAmount = data.reduce((sum, method) => sum + method.total, 0);

  return (
    <Card className="bg-card rounded-2xl border border-border/50 transition-fast hover:shadow-md">
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-foreground">Zahlungsmethoden</h3>
          
          {/* Period Selector */}
          <div className="relative">
            <button 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-fast px-3 py-1.5 rounded-lg hover:bg-muted tap-highlight-transparent"
              aria-label="Zeitraum für Zahlungsmethoden ändern"
            >
              {currentPeriodLabel}
              <ChevronDown className={`w-4 h-4 transition-fast ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {isDropdownOpen && (
              <div className="absolute right-0 top-10 z-20 bg-background border border-border rounded-lg shadow-lg py-1 min-w-[120px]">
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

        <div className="space-y-6">
          {/* Progress Bar - Segmented */}
          <div className="space-y-3">
            <div className="flex h-4 bg-muted rounded-lg overflow-hidden">
              {data.map((method, index) => (
                <div
                  key={method.type}
                  className={`h-full transition-all duration-300 hover:opacity-80 ${
                    index === 0 ? 'rounded-l-lg' : ''
                  } ${
                    index === data.length - 1 ? 'rounded-r-lg' : ''
                  }`}
                  style={{ 
                    width: `${method.percentage}%`,
                    backgroundColor: method.color
                  }}
                  title={`${method.type}: ${method.percentage}%`}
                />
              ))}
            </div>
          </div>

          {/* Payment Methods List */}
          <div className="space-y-3">
            {data.map((method, index) => (
              <div 
                key={method.type} 
                className="flex items-center justify-between group hover:bg-muted/30 -mx-3 px-3 py-3 rounded-xl transition-all duration-200"
              >
                <div className="flex items-center gap-4">
                  {/* Rectangular Color indicator */}
                  <div 
                    className="w-6 h-3 rounded-sm transition-transform duration-200 group-hover:scale-110 shadow-sm" 
                    style={{ backgroundColor: method.color }}
                    aria-hidden="true"
                  />
                  
                  {/* Percentage and type */}
                  <div className="flex items-baseline gap-3">
                    <span className="font-bold text-foreground text-lg">
                      {method.percentage}%
                    </span>
                    <span className="text-sm text-muted-foreground font-medium">
                      {method.type}
                    </span>
                  </div>
                </div>
                
                {/* Total amount and transactions */}
                <div className="text-right">
                  <div className="text-sm font-medium text-foreground">
                    Total CHF {method.total.toLocaleString()}.–
                  </div>
                  {method.transactions && (
                    <div className="text-xs text-muted-foreground/80 mt-0.5">
                      {method.transactions} Transaktionen
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Summary Section */}
          <div className="pt-4 border-t border-border/50">
            <div className="flex justify-between items-center">
              <div>
                <span className="text-sm text-muted-foreground">
                  Gesamt ({currentPeriodLabel.toLowerCase()})
                </span>
              </div>
              <div className="text-right">
                <span className="font-bold text-foreground text-lg">
                  CHF {totalAmount.toLocaleString()}.–
                </span>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {data.reduce((sum, method) => sum + (method.transactions || 0), 0)} Transaktionen
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PaymentMethods; 