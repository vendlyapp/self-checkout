"use client";
import React from "react";
import {
  Users,
  Store,
  TrendingUp,
  Package,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import Link from "next/link";

interface PlatformOverviewProps {
  stats: {
    users: {
      total: number;
      admins: number;
      customers: number;
    };
    stores: {
      total: number;
      active: number;
    };
    products: {
      total: number;
    };
    orders: {
      total: number;
      revenue: number;
    };
  };
}

export default function SuperAdminPlatformOverview({
  stats,
}: PlatformOverviewProps) {
  const overviewItems = [
    {
      id: "users",
      label: "Benutzer insgesamt",
      value: stats.users.total,
      subtitle: `${stats.users.admins} Admins, ${stats.users.customers} Kunden`,
      icon: Users,
      iconColor: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-50 dark:bg-blue-500/15",
      growth: "+12.5%",
      isPositive: true,
      href: "/super-admin/users",
    },
    {
      id: "stores",
      label: "Aktive Geschäfte",
      value: stats.stores.active,
      subtitle: `Von ${stats.stores.total} insgesamt`,
      icon: Store,
      iconColor: "text-brand-600 dark:text-brand-400",
      bgColor: "bg-brand-50 dark:bg-brand-500/15",
      growth: "+8.3%",
      isPositive: true,
      href: "/super-admin/stores",
    },
    {
      id: "products",
      label: "Produkte insgesamt",
      value: stats.products.total,
      subtitle: "In allen Geschäften",
      icon: Package,
      iconColor: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-50 dark:bg-green-500/15",
      growth: "+15.7%",
      isPositive: true,
      href: "/super-admin/products",
    },
    {
      id: "revenue",
      label: "Gesamtumsatz",
      value: `CHF ${Number(stats.orders.revenue || 0).toLocaleString("de-CH", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
      subtitle: "Seit Beginn",
      icon: TrendingUp,
      iconColor: "text-orange-600 dark:text-orange-400",
      bgColor: "bg-orange-50 dark:bg-orange-500/15",
      growth: "+23.1%",
      isPositive: true,
      href: "/super-admin/analytics",
    },
  ];

  return (
    <div className="h-full flex flex-col rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6">
      <div className="mb-4 sm:mb-5">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Plattformübersicht
        </h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Übersicht der wichtigsten Indikatoren
        </p>
      </div>

      <div className="flex-1 space-y-3">
        {overviewItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.id}
              href={item.href}
              className="group flex items-center justify-between py-2.5 px-3 rounded-xl border border-gray-100 hover:border-gray-200 hover:bg-gray-50 transition-ios dark:border-gray-800 dark:hover:border-gray-700 dark:hover:bg-gray-800/50 cursor-pointer"
            >
              <div className="flex items-center space-x-4">
                <div
                  className={`${item.bgColor} p-3 rounded-xl group-hover:scale-110 transition-transform duration-200`}
                >
                  <Icon className={`w-5 h-5 ${item.iconColor}`} />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white/90 text-sm">
                    {item.label}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {item.subtitle}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900 dark:text-white/90">
                    {item.value}
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    {item.isPositive ? (
                      <ArrowUpRight className="w-3 h-3 text-green-600 dark:text-green-400" />
                    ) : (
                      <ArrowDownRight className="w-3 h-3 text-red-600 dark:text-red-400" />
                    )}
                    <span
                      className={`text-xs font-medium ${
                        item.isPositive
                          ? "text-green-600 dark:text-green-400"
                          : "text-red-600 dark:text-red-400"
                      }`}
                    >
                      {item.growth}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

