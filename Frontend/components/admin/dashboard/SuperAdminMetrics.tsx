"use client";
import React from "react";
import { Users, Store, ShoppingCart, TrendingUp } from "lucide-react";
import Badge from "@/components/admin/ui/Badge";

interface SuperAdminMetricsProps {
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

export const SuperAdminMetrics: React.FC<SuperAdminMetricsProps> = ({ stats }) => {
  // Calcular porcentajes de crecimiento (simulado por ahora, pueden venir de la API)
  const userGrowth = 12.5; // Porcentaje
  const orderGrowth = -5.2;
  
  const metrics = [
    {
      title: "Usuarios Totales",
      value: stats.users.total,
      subtitle: `${stats.users.admins} admins, ${stats.users.customers} clientes`,
      icon: Users,
      growth: userGrowth,
      bgColor: "bg-blue-50 dark:bg-blue-500/15",
      iconColor: "text-blue-600 dark:text-blue-400",
    },
    {
      title: "Tiendas",
      value: stats.stores.total,
      subtitle: `${stats.stores.active} activas`,
      icon: Store,
      growth: 8.3,
      bgColor: "bg-brand-50 dark:bg-brand-500/15",
      iconColor: "text-brand-600 dark:text-brand-400",
    },
    {
      title: "Productos",
      value: stats.products.total,
      subtitle: "En todas las tiendas",
      icon: ShoppingCart,
      growth: 15.7,
      bgColor: "bg-green-50 dark:bg-green-500/15",
      iconColor: "text-green-600 dark:text-green-400",
    },
    {
      title: "Órdenes",
      value: stats.orders.total,
      subtitle: `Revenue: CHF ${Number(stats.orders.revenue || 0).toFixed(2)}`,
      icon: TrendingUp,
      growth: orderGrowth,
      bgColor: "bg-orange-50 dark:bg-orange-500/15",
      iconColor: "text-orange-600 dark:text-orange-400",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric, index) => {
        const Icon = metric.icon;
        const isPositive = metric.growth > 0;
        
        return (
          <div
            key={index}
            className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03] md:p-5"
          >
            <div className={`flex items-center justify-center w-12 h-12 ${metric.bgColor} rounded-xl`}>
              <Icon className={`${metric.iconColor} size-6`} />
            </div>

            <div className="flex items-end justify-between mt-4">
              <div className="flex-1 min-w-0">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {metric.title}
                </span>
                <h4 className="mt-1.5 font-bold text-gray-800 text-xl dark:text-white/90">
                  {metric.value.toLocaleString()}
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">
                  {metric.subtitle}
                </p>
              </div>
              <Badge color={isPositive ? "success" : "error"} >
                {Math.abs(metric.growth).toFixed(1)}%
              </Badge>
            </div>
          </div>
        );
      })}
    </div>
  );
};

