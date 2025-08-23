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
    <div className="bg-card border border-border/50 transition-fast hover:shadow-md w-full max-w-md rounded-xl">
      <div className="p-5">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-foreground">
            Jetzt im Shop:
          </h3>
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
              <div
                className="flex -space-x-3"
                aria-label={`${totalActive} aktive Kunden`}
              >
                {activeCustomers.slice(0, 2).map((customer, idx) => (
                  <div
                    key={customer.id}
                    className="w-10 h-10 rounded-full border-2 border-white bg-muted flex items-center justify-center text-sm font-medium relative"
                    style={{ zIndex: idx + 1 }}
                    title={customer.name}
                  >
                    {customer.avatar}
                  </div>
                ))}
                {totalInactive > 0 && (
                  <div
                    className="w-10 h-10 rounded-full border-2 border-white bg-muted flex items-center justify-center text-sm font-medium text-muted-foreground relative"
                    style={{ zIndex: 10 }}
                    title={`+${totalInactive} weitere Kunden`}
                  >
                    +{totalInactive}
                  </div>
                )}
              </div>

              {/* Kundenstatistiken */}
              <div className="flex items-center justify-end w-full gap-2 text-sm">
                <span
                  className="font-bold text-3xl text-[#373F49]"
                  aria-label="Aktive Kunden"
                >
                  {totalActive}
                </span>
                <span className="font-semibold text-[#373F49]">
                  Kunden aktiv
                </span>
                <span className="text-muted-foreground pl-16">
                  {totalInactive} inaktiv
                </span>
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
              <span className="font-semibold text-[#373F49]">
                CHF {openCartsValue}.–
              </span>{" "}
              in offenen Warenkörben
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActiveCustomers;
