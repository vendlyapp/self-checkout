"use client";
import React from "react";
import Link from "next/link";
import {
  Store,
  Users,
  Package,
  BarChart3,
  Settings,
  FileText,
} from "lucide-react";

interface QuickAction {
  id: string;
  title: string;
  description: string;
  href: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
}

export default function SuperAdminQuickActions() {
  const actions: QuickAction[] = [
    {
      id: "stores",
      title: "Gestionar Tiendas",
      description: "Ver y administrar todas las tiendas",
      href: "/super-admin/stores",
      icon: Store,
      color: "text-brand-600 dark:text-brand-400",
      bgColor: "bg-brand-50 dark:bg-brand-500/15",
    },
    {
      id: "users",
      title: "Gestionar Usuarios",
      description: "Administrar usuarios y permisos",
      href: "/super-admin/users",
      icon: Users,
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-50 dark:bg-blue-500/15",
    },
    {
      id: "products",
      title: "Ver Productos",
      description: "Explorar todos los productos",
      href: "/super-admin/products",
      icon: Package,
      color: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-50 dark:bg-green-500/15",
    },
    {
      id: "analytics",
      title: "Analíticas",
      description: "Ver análisis detallados",
      href: "/super-admin/analytics",
      icon: BarChart3,
      color: "text-orange-600 dark:text-orange-400",
      bgColor: "bg-orange-50 dark:bg-orange-500/15",
    },
    {
      id: "settings",
      title: "Configuración",
      description: "Ajustes del sistema",
      href: "/super-admin/settings",
      icon: Settings,
      color: "text-gray-600 dark:text-gray-400",
      bgColor: "bg-gray-50 dark:bg-gray-500/15",
    },
    {
      id: "reports",
      title: "Reportes",
      description: "Generar reportes",
      href: "/super-admin/reports",
      icon: FileText,
      color: "text-indigo-600 dark:text-indigo-400",
      bgColor: "bg-indigo-50 dark:bg-indigo-500/15",
    },
  ];

  return (
    <div className="h-full flex flex-col rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6">
      <div className="mb-4 sm:mb-5">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Acciones Rápidas
        </h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Acceso rápido a las funciones principales
        </p>
      </div>

      <div className="flex-1 grid grid-cols-1 gap-2.5 sm:gap-3">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.id}
              href={action.href}
              className="group flex items-start gap-3 p-4 rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all duration-200 dark:border-gray-800 dark:hover:border-gray-700 cursor-pointer"
            >
              <div
                className={`${action.bgColor} p-2.5 rounded-lg group-hover:scale-110 transition-transform duration-200`}
              >
                <Icon className={`w-5 h-5 ${action.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-sm text-gray-900 dark:text-white/90 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                  {action.title}
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  {action.description}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

