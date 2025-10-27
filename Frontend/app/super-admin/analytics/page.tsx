'use client';

import React, { useEffect } from 'react';
import { TrendingUp, RefreshCw, BarChart3 } from 'lucide-react';
import { useSuperAdminStore } from '@/lib/stores/superAdminStore';

export default function SuperAdminAnalytics() {
  const { 
    stats,
    statsLoading,
    statsError,
    refreshAll
  } = useSuperAdminStore();

  // Solo mostrar loader si está cargando Y no hay datos
  if (statsLoading && !stats) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-purple-600 mx-auto" />
          <p className="mt-4 text-gray-600">Cargando analytics...</p>
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

  return (
    <div className="p-4 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600 mt-2">Analíticas de la plataforma</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => refreshAll()}
            className="flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Actualizar
          </button>
        </div>
      </div>

      {/* Coming Soon */}
      <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
        <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-600 text-lg">Página de Analytics</p>
        <p className="text-gray-500 mt-2">Próximamente...</p>
        {stats && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-purple-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">Total Usuarios</p>
              <p className="text-2xl font-bold text-purple-700">{stats.users.total}</p>
            </div>
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">Total Tiendas</p>
              <p className="text-2xl font-bold text-blue-700">{stats.stores.total}</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">Total Productos</p>
              <p className="text-2xl font-bold text-green-700">{stats.products.total}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

