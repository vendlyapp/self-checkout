import React from 'react';
import { ChevronRight } from 'lucide-react';
import Squircle from '@/components/ui/squircle';
import { useSquircle, type SquirclePreset } from '@/lib/hooks/useSquircle';
import { ShopActivity } from './types';

interface ActiveCustomersProps {
  data: ShopActivity;
  loading?: boolean;
  smoothingPreset?: SquirclePreset; // Preset predefinido
  customSmoothing?: number; // Smoothing personalizado (0-1)
}

const ActiveCustomers: React.FC<ActiveCustomersProps> = ({ 
  data, 
  loading = false,
  smoothingPreset = 'ios',
  customSmoothing
}) => {
  // Usar el hook para obtener valores de smoothing
  const { smoothing } = useSquircle({
    preset: smoothingPreset,
    customSmoothing,
    scale: 0.8
  });
  if (loading) {
    return (
      <Squircle 
        variant="medium"
        className="bg-card border border-border/50"
      >
        <div className="p-5">
          <div className="animate-pulse">
            <div className="h-6 bg-muted rounded-lg mb-4 w-1/3"></div>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((_, index) => (
                    <Squircle
                      key={index}
                      variant="sm"
                      className="w-10 h-10 bg-muted border-2 border-background"
                    >
                      <div></div>
                    </Squircle>
                  ))}
                </div>
                <div className="h-4 bg-muted rounded w-24"></div>
              </div>
              <div className="h-2 bg-muted rounded-full"></div>
              <div className="h-4 bg-muted rounded w-32"></div>
            </div>
          </div>
        </div>
      </Squircle>
    );
  }

  const { activeCustomers, totalActive, totalInactive, openCartsValue, progressPercentage } = data;

  return (
    <div className="bg-card border border-border/50 transition-fast hover:shadow-md w-full max-w-md rounded-xl">
      <div className="p-5">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-foreground">Jetzt im Shop:</h3>
          <button 
            className="p-1 rounded-lg hover:bg-muted transition-fast tap-highlight-transparent"
            aria-label="Mehr Details anzeigen"
          >
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Avatare und Zähler */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {/* Kundenavatare */}
              <div className="flex -space-x-2" aria-label={`${totalActive} aktive Kunden`}>
                {activeCustomers.slice(0, 3).map((customer, index) => (
                  <Squircle
                    key={customer.id}
                    variant="sm"
                    className="w-10 h-10 bg-muted flex items-center justify-center border-2 rounded-full border-background text-sm font-medium transition-fast hover:scale-110 hover:z-10"
                    style={{ zIndex: activeCustomers.length - index }}
                    title={customer.name}
                  >
                    {customer.avatar}
                  </Squircle>
                ))}
                {totalInactive > 0 && (
                  <Squircle 
                    variant="sm"
                    className="w-10 h-10 bg-muted flex items-center justify-center border-2 rounded-full  border-background text-sm font-medium text-muted-foreground"
                    title={`+${totalInactive} weitere Kunden`}
                  >
                    +{totalInactive}
                  </Squircle>
                )}
              </div>
              
              {/* Kundenstatistiken */}
              <div className="flex items-center gap-6 text-sm">
                <span className="font-bold text-foreground text-xl" aria-label="Aktive Kunden">
                  {totalActive}
                </span>
                <span className="text-muted-foreground">Kunden aktiv</span>
                <span className="text-muted-foreground">{totalInactive} inaktiv</span>
              </div>
            </div>
          </div>

          {/* Fortschrittsbalken */}
          <div className="relative h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className="absolute left-0 h-full bg-primary rounded-full transition-all duration-500 ease-out" 
              style={{ width: `${progressPercentage}%` }}
              aria-label={`${progressPercentage}% Auslastung`}
            />
          </div>

          {/* Warenkorb-Information */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              CHF {openCartsValue}.– in offenen Warenkörben
            </p>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
              <span className="text-xs text-primary font-medium">Live</span>
            </div>
          </div>
        </div>
      </div>
      </div>
  );
};

export default ActiveCustomers; 