import React from "react";
import { ChevronRight } from "lucide-react";
import { formatSwissPrice } from "@/lib/utils";
import { ShopActivity } from "./types";

function formatLastActivityDe(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return null;
  const diffSec = Math.max(0, Math.floor((Date.now() - t) / 1000));
  if (diffSec < 45) return "gerade eben";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `vor ${diffMin} Min.`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `vor ${diffH} Std.`;
  const diffD = Math.floor(diffH / 24);
  if (diffD === 1) return "vor 1 Tag";
  if (diffD < 7) return `vor ${diffD} Tagen`;
  return "vor längerer Zeit";
}

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
    openCartsValue,
    progressPercentage,
    lastSeenAt,
  } = data;

  const shownAvatars = activeCustomers.slice(0, 2);
  const moreOnline = Math.max(0, totalActive - shownAvatars.length);
  const lastActivityLabel = formatLastActivityDe(lastSeenAt);

  return (
    <div className="bg-card border border-border rounded-2xl shadow-sm transition-ios hover:shadow-md w-full min-w-0">
      <div className="p-4 lg:p-6">
        <div className="flex justify-between items-center mb-3 lg:mb-5">
          <h3 className="text-base lg:text-xl font-semibold text-foreground">
            Jetzt im Shop:
          </h3>
          <button
            className="p-1 lg:p-2 rounded-lg hover:bg-muted transition-ios tap-highlight-transparent"
            aria-label="Mehr Details anzeigen"
          >
            <ChevronRight className="w-5 h-5 lg:w-6 lg:h-6 text-muted-foreground" />
          </button>
        </div>

        <div className="space-y-3 lg:space-y-5">
          {/* Avatare und Zähler - Mejorado para desktop */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 lg:gap-4">
              {/* Kundenavatare */}
              <div
                className="flex -space-x-3 lg:-space-x-2"
                aria-label={`${totalActive} aktive Kunden`}
              >
                {shownAvatars.map((customer, idx) => (
                  <div
                    key={customer.id}
                    className="w-10 h-10 lg:w-14 lg:h-14 rounded-full border-2 border-white bg-muted flex items-center justify-center text-sm lg:text-lg font-medium relative shadow-sm hover:shadow-md transition-ios"
                    style={{ zIndex: idx + 1 }}
                    title={customer.name}
                  >
                    {customer.avatar}
                  </div>
                ))}
                {moreOnline > 0 && (
                  <div
                    className="w-10 h-10 lg:w-14 lg:h-14 rounded-full border-2 border-white bg-muted flex items-center justify-center text-sm lg:text-lg font-medium text-muted-foreground relative shadow-sm hover:shadow-md transition-shadow duration-200"
                    style={{ zIndex: 10 }}
                    title={`+${moreOnline} weitere Kunden`}
                  >
                    +{moreOnline}
                  </div>
                )}
              </div>

              {/* Kundenstatistiken - Mejorado para desktop */}
              <div className="flex items-center justify-end w-full gap-2 lg:gap-4 text-sm lg:text-base">
                <div className="flex items-baseline gap-1 lg:gap-2">
                  <span
                    className="font-bold text-3xl lg:text-5xl text-[#373F49]"
                    aria-label={totalActive === 1 ? '1 aktiver Kunde' : `${totalActive} aktive Kunden`}
                  >
                    {totalActive}
                  </span>
                  <span className="font-semibold text-[#373F49] lg:text-lg">
                    {totalActive === 1 ? 'Kunde aktiv' : 'Kunden aktiv'}
                  </span>
                </div>
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
                  CHF {formatSwissPrice(openCartsValue)}
                </span>{" "}
                in offenen Warenkörben
              </p>
            </div>
            {lastActivityLabel && (
              <div className="hidden lg:flex items-center gap-2 text-xs text-muted-foreground shrink-0">
                <span>Letzte Aktivität: {lastActivityLabel}</span>
              </div>
            )}
          </div>
          {lastActivityLabel && (
            <p className="lg:hidden text-xs text-muted-foreground mt-1">
              Letzte Aktivität: {lastActivityLabel}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ActiveCustomers;
