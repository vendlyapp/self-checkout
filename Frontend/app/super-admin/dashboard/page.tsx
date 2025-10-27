'use client';

import React, { useEffect } from 'react';
import { Users, Store, ShoppingCart, TrendingUp, Package, RefreshCw } from 'lucide-react';
import { useSuperAdminStore } from '@/lib/stores/superAdminStore';

export default function SuperAdminDashboard() {
  const { 
    stats, 
    statsLoading, 
    statsError, 
    fetchStats, 
    refreshAll 
  } = useSuperAdminStore();

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const handleRefresh = () => {
    refreshAll();
  };

  // Solo mostrar loader si está cargando Y no hay datos
  if (statsLoading && !stats) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-purple-600 mx-auto" />
          <p className="mt-4 text-gray-600">Cargando estadísticas...</p>
        </div>
      </div>
    );
  }

  if (statsError) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
          {statsError}
        </div>
      </div>
    );
  }

  if (!stats) return null;

  const statCards = [
    {
      title: 'Total Usuarios',
      value: stats.users.total,
      subtitle: `${stats.users.admins} admins, ${stats.users.customers} clientes`,
      icon: Users,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700',
    },
    {
      title: 'Total Tiendas',
      value: stats.stores.total,
      subtitle: `${stats.stores.active} activas`,
      icon: Store,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-700',
    },
    {
      title: 'Total Productos',
      value: stats.products.total,
      subtitle: 'En todas las tiendas',
      icon: Package,
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-700',
    },
    {
      title: 'Total Órdenes',
      value: stats.orders.total,
      subtitle: `Revenue: CHF ${Number(stats.orders.revenue || 0).toFixed(2)}`,
      icon: ShoppingCart,
      color: 'bg-orange-500',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-700',
    },
  ];

  const quickStats = [
    {
      label: 'Usuarios Admin',
      value: stats.users.admins,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      label: 'Usuarios Cliente',
      value: stats.users.customers,
      icon: Users,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      label: 'Tiendas Activas',
      value: stats.stores.active,
      icon: Store,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      label: 'Ingresos Totales',
      value: `CHF ${Number(stats.orders.revenue || 0).toFixed(2)}`,
      icon: TrendingUp,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
  ];

  return (
    <div className="p-4 lg:p-8 space-y-6">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Super Admin</h1>
          <p className="text-gray-600 mt-2">Gestión completa de la plataforma Vendly</p>
        </div>
        <button
          onClick={handleRefresh}
          className="flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Actualizar
        </button>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div
              key={index}
              className={`${card.bgColor} rounded-2xl p-6 border border-gray-200 shadow-sm`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 mb-1">{card.title}</p>
                  <p className={`text-3xl font-bold ${card.textColor} mb-2`}>
                    {card.value.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-600">{card.subtitle}</p>
                </div>
                <div className={`${card.color} p-3 rounded-xl`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {quickStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm"
            >
              <div className="flex items-center space-x-3">
                <div className={`${stat.bgColor} p-2 rounded-lg`}>
                  <Icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-xs text-gray-600">{stat.label}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Platform Overview */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Resumen de la Plataforma</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Usuarios Totales</p>
                  <p className="text-sm text-gray-500">Administradores y Clientes</p>
                </div>
              </div>
              <span className="text-2xl font-bold text-gray-900">{stats.users.total}</span>
            </div>

            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Store className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Tiendas Activas</p>
                  <p className="text-sm text-gray-500">De {stats.stores.total} total</p>
                </div>
              </div>
              <span className="text-2xl font-bold text-purple-600">{stats.stores.active}</span>
            </div>

            <div className="flex items-center justify-between py-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Ingresos Totales</p>
                  <p className="text-sm text-gray-500">Desde el inicio</p>
                </div>
              </div>
              <span className="text-2xl font-bold text-green-600">
                CHF {Number(stats.orders.revenue || 0).toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Acciones Rápidas</h2>
          <div className="space-y-3">
            <a
              href="/super-admin/stores"
              className="flex items-center px-4 py-3 bg-white rounded-xl hover:shadow-md transition-shadow"
            >
              <Store className="w-5 h-5 text-purple-600 mr-3" />
              <span className="font-medium text-gray-900">Gestionar Tiendas</span>
            </a>
            <a
              href="/super-admin/users"
              className="flex items-center px-4 py-3 bg-white rounded-xl hover:shadow-md transition-shadow"
            >
              <Users className="w-5 h-5 text-blue-600 mr-3" />
              <span className="font-medium text-gray-900">Gestionar Usuarios</span>
            </a>
            <a
              href="/super-admin/products"
              className="flex items-center px-4 py-3 bg-white rounded-xl hover:shadow-md transition-shadow"
            >
              <Package className="w-5 h-5 text-green-600 mr-3" />
              <span className="font-medium text-gray-900">Ver Productos</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
