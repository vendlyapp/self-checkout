import React from "react";
import { ChevronRight } from "lucide-react";
import { ShopActivity } from "./types";

interface ActiveCustomersProps {
  data: ShopActivity;
  loading?: boolean;
}

const ActiveCustomers: React.FC<ActiveCustomersProps> = ({
  data,
  loading = false,
}) => {
  if (loading) {
    return (
      <div className="bg-card border border-border/50 rounded-2xl">
        <div className="p-5">
          <div className="animate-pulse">
            <div className="h-6 bg-muted rounded-lg mb-4 w-1/3"></div>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((_, index) => (
                    <div
                      key={index}
                      className="w-10 h-10 bg-muted border-2 border-background rounded-xl"
                    >
                      <div></div>
                    </div>
                  ))}
                </div>
                <div className="h-4 bg-muted rounded w-24"></div>
              </div>
              <div className="h-2 bg-muted rounded-full"></div>
              <div className="h-4 bg-muted rounded w-32"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const {
    activeCustomers,
    totalActive,
    totalInactive,
    openCartsValue,
    progressPercentage,
  } = data;

  return (
    <div className="bg-card border border-border/50 transition-ios hover:shadow-md w-full max-w-md lg:max-w-none rounded-xl">
      <div className="p-5 lg:p-6">
        <div className="flex justify-between items-center mb-4 lg:mb-6">
          <h3 className="text-lg lg:text-xl font-semibold text-foreground">
            Jetzt im Shop:
          </h3>
          <button
            className="p-1 lg:p-2 rounded-lg hover:bg-muted transition-ios tap-highlight-transparent"
            aria-label="Mehr Details anzeigen"
          >
            <ChevronRight className="w-5 h-5 lg:w-6 lg:h-6 text-muted-foreground" />
          </button>
        </div>

        <div className="space-y-4 lg:space-y-6">
          {/* Avatare und Zähler - Mejorado para desktop */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 lg:gap-4">
              {/* Kundenavatare */}
              <div
                className="flex -space-x-3 lg:-space-x-2"
                aria-label={`${totalActive} aktive Kunden`}
              >
                {activeCustomers.slice(0, 2).map((customer, idx) => (
                  <div
                    key={customer.id}
                    className="w-10 h-10 lg:w-14 lg:h-14 rounded-full border-2 border-white bg-muted flex items-center justify-center text-sm lg:text-lg font-medium relative shadow-sm hover:shadow-md transition-ios"
                    style={{ zIndex: idx + 1 }}
                    title={customer.name}
                  >
                    {customer.avatar}
                  </div>
                ))}
                {totalInactive > 0 && (
                  <div
                    className="w-10 h-10 lg:w-14 lg:h-14 rounded-full border-2 border-white bg-muted flex items-center justify-center text-sm lg:text-lg font-medium text-muted-foreground relative shadow-sm hover:shadow-md transition-shadow duration-200"
                    style={{ zIndex: 10 }}
                    title={`+${totalInactive} weitere Kunden`}
                  >
                    +{totalInactive}
                  </div>
                )}
              </div>

              {/* Kundenstatistiken - Mejorado para desktop */}
              <div className="flex items-center justify-end w-full gap-2 lg:gap-4 text-sm lg:text-base">
                <div className="flex items-baseline gap-1 lg:gap-2">
                  <span
                    className="font-bold text-3xl lg:text-5xl text-[#373F49]"
                    aria-label="Aktive Kunden"
                  >
                    {totalActive}
                  </span>
                  <span className="font-semibold text-[#373F49] lg:text-lg">
                    Kunden aktiv
                  </span>
                </div>
                <div className="hidden lg:block w-px h-8 bg-border mx-2"></div>
                <span className="text-muted-foreground lg:text-lg">
                  {totalInactive} inaktiv
                </span>
              </div>
            </div>
          </div>

          {/* Fortschrittsbalken - Mejorado para desktop */}
          <div className="relative h-2 lg:h-4 bg-muted rounded-full overflow-hidden">
            <div
              className="absolute left-0 h-full bg-primary rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progressPercentage}%` }}
              aria-label={`${progressPercentage}% Auslastung`}
            />
            {/* Indicador de porcentaje en desktop */}
            <div className="hidden lg:block absolute right-2 top-1/2 transform -translate-y-1/2 text-xs font-medium text-primary">
              {progressPercentage}%
            </div>
          </div>

          {/* Warenkorb-Information - Mejorado para desktop */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 lg:gap-3">
              <div className="w-2 h-2 lg:w-3 lg:h-3 bg-primary rounded-full"></div>
              <p className="text-sm lg:text-base text-muted-foreground">
                <span className="font-semibold text-[#373F49] lg:text-lg">
                  CHF {openCartsValue}.–
                </span>{" "}
                in offenen Warenkörben
              </p>
            </div>
            {/* Información adicional para desktop */}
            <div className="hidden lg:flex items-center gap-2 text-xs text-muted-foreground">
              <span>Letzte Aktivität: vor 2 Min</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActiveCustomers;
