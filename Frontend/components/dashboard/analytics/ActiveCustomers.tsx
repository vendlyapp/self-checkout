import React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { ShopActivity } from "./types";

const ORDERS_TODAY_HREF = "/sales/orders?heute=1";

interface ActiveCustomersProps {
  data: ShopActivity;
  loading?: boolean;
  /** IANA-Zeitzone aus API (z. B. Europe/Zurich); sonst statischer Hinweis CH. */
  timeZone?: string;
}

const ActiveCustomers: React.FC<ActiveCustomersProps> = ({
  data,
  loading = false,
  timeZone,
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
            </div>
          </div>
        </div>
      </div>
    );
  }

  const { activeCustomers, totalActive, progressPercentage } = data;

  const shownAvatars = activeCustomers.slice(0, 2);
  const moreOnline = Math.max(0, totalActive - shownAvatars.length);

  return (
    <div className="bg-card border border-border rounded-2xl shadow-sm transition-ios hover:shadow-md w-full min-w-0">
      <div className="p-4 lg:p-6">
        <div className="flex justify-between items-center mb-3 lg:mb-5">
          <h3 className="text-base lg:text-xl font-semibold text-foreground">
            Kunden heute
          </h3>
          <Link
            href={ORDERS_TODAY_HREF}
            className="p-1 lg:p-2 rounded-lg hover:bg-muted transition-ios tap-highlight-transparent inline-flex"
            aria-label="Bestellungen von heute anzeigen"
          >
            <ChevronRight className="w-5 h-5 lg:w-6 lg:h-6 text-muted-foreground" />
          </Link>
        </div>

        <p className="text-xs text-muted-foreground mb-3 lg:mb-4">
          Mit Bestellung heute
          {timeZone ? ` · ${timeZone}` : " · Zeitzone Schweiz"}
        </p>

        {totalActive === 0 ? (
          <div className="rounded-xl border border-dashed border-border/80 bg-muted/30 px-4 py-6 text-center">
            <p className="text-sm font-medium text-foreground">
              Heute noch keine Bestellungen
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Sobald Kunden bestellen, erscheinen sie hier — nach{" "}
              <Link
                href={ORDERS_TODAY_HREF}
                className="text-primary underline-offset-2 hover:underline"
              >
                Bestellungen von heute
              </Link>
              .
            </p>
          </div>
        ) : (
          <div className="space-y-3 lg:space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 lg:gap-4">
                <div
                  className="flex -space-x-3 lg:-space-x-2"
                  aria-label={
                    totalActive === 1
                      ? "1 Kunde heute"
                      : `${totalActive} Kunden heute`
                  }
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

                <div className="flex items-center justify-end w-full gap-2 lg:gap-4 text-sm lg:text-base">
                  <div className="flex items-baseline gap-1 lg:gap-2">
                    <span
                      className="font-bold text-3xl lg:text-5xl text-[#373F49]"
                      aria-label={
                        totalActive === 1
                          ? "1 Kunde heute"
                          : `${totalActive} Kunden heute`
                      }
                    >
                      {totalActive}
                    </span>
                    <span className="font-semibold text-[#373F49] lg:text-lg">
                      {totalActive === 1 ? "Kunde" : "Kunden"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative h-2 lg:h-4 bg-muted rounded-full overflow-hidden">
              <div
                className="absolute left-0 h-full bg-primary rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progressPercentage}%` }}
                aria-label={`${progressPercentage}% im heutigen Kontext`}
              />
              <div className="hidden lg:block absolute right-2 top-1/2 transform -translate-y-1/2 text-xs font-medium text-primary">
                {progressPercentage}%
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActiveCustomers;
