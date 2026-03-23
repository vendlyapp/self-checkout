"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

const OPTIONS = [
  {
    param: null as null,
    label: "Alle",
    activeClass: "bg-warm-800 text-white shadow-sm shadow-warm-900/30",
  },
  {
    param: "pending" as const,
    label: "Ausstehend",
    activeClass: "bg-amber-600 text-white shadow-sm shadow-amber-900/20",
  },
  {
    param: "completed" as const,
    label: "Abgeschlossen",
    activeClass: "bg-emerald-700 text-white shadow-sm shadow-emerald-900/15",
  },
  {
    param: "cancelled" as const,
    label: "Storniert",
    activeClass: "bg-red-600 text-white shadow-sm shadow-red-900/15",
  },
] as const;

interface OrderStatusFilterChipsProps {
  className?: string;
}

export function OrderStatusFilterChips({ className }: OrderStatusFilterChipsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const raw = searchParams?.get("status");
  const statusFilter =
    raw === "pending" || raw === "completed" || raw === "cancelled" ? raw : undefined;

  return (
    <div
      className={cn(
        "flex w-full max-w-full flex-wrap items-stretch justify-start gap-2 py-0.5",
        className
      )}
      role="listbox"
      aria-label="Bestellstatus filtern"
    >
      {OPTIONS.map(({ param, label, activeClass }) => {
        const isActive = param === null ? statusFilter === undefined : statusFilter === param;
        const href = param ? `/sales/orders?status=${param}` : "/sales/orders";

        return (
          <button
            key={label}
            type="button"
            role="option"
            aria-selected={isActive}
            onClick={() => router.push(href)}
            className={cn(
              "inline-flex min-h-[40px] max-w-full items-center justify-center rounded-md px-3 py-2 text-center text-xs font-medium leading-snug transition-ios sm:min-h-11 sm:px-3.5 sm:text-sm",
              "active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-1",
              isActive
                ? activeClass
                : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
            )}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
