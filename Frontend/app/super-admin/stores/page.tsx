'use client';

import React, { useEffect, useState } from 'react';
import { Store as StoreIcon, Search, Power, PowerOff, TrendingUp, RefreshCw, MapPin } from 'lucide-react';
import { useSuperAdminStore } from '@/lib/stores/superAdminStore';

export default function SuperAdminStores() {
  const { 
    stores, 
    storesLoading, 
    storesError, 
    fetchStores,
    toggleStoreStatus,
    refreshAll
  } = useSuperAdminStore();
  
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchStores();
  }, [fetchStores]);

  const handleToggleStatus = async (storeId: string, currentStatus: boolean) => {
    try {
      await toggleStoreStatus(storeId, !currentStatus);
    } catch (err) {
      console.error('Error al cambiar estado:', err);
      alert('Error al cambiar el estado de la tienda');
    }
  };

  const filteredStores = stores.filter(store =>
    store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    store.ownerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
    store.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Solo mostrar loader si está cargando Y no hay datos
  if (storesLoading && stores.length === 0) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-purple-600 mx-auto" />
          <p className="mt-4 text-gray-600">Cargando tiendas...</p>
        </div>
      </div>
    );
  }

  if (storesError) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
          {storesError}
        </div>
      </div>
    );
  }

  const activeStores = stores.filter(s => s.isActive).length;
  const totalRevenue = stores.reduce((sum, s) => sum + (Number(s.totalRevenue) || 0), 0);

  return (
    <div className="p-4 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Tiendas</h1>
          <p className="text-gray-600 mt-2">Administra todas las tiendas de la plataforma</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => refreshAll()}
            className="flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Actualizar
          </button>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar tiendas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 w-full md:w-64"
            />
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <StoreIcon className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stores.length}</p>
              <p className="text-sm text-gray-600">Total Tiendas</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Power className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{activeStores}</p>
              <p className="text-sm text-gray-600">Tiendas Activas</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">CHF {totalRevenue.toFixed(2)}</p>
              <p className="text-sm text-gray-600">Revenue Total</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stores List */}
      {filteredStores.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <StoreIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600">No se encontraron tiendas</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStores.map((store) => (
            <div
              key={store.id}
              className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3 flex-1">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <StoreIcon className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-gray-900 truncate">{store.name}</h3>
                    <div className="flex items-center mt-1 text-sm text-gray-500">
                      <MapPin className="w-3 h-3 mr-1" />
                      <span className="truncate">{store.slug}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-sm py-2 border-b border-gray-100">
                  <span className="text-gray-600">Propietario</span>
                  <span className="font-semibold text-gray-900 truncate ml-2">{store.ownerName}</span>
                </div>
                <div className="flex items-center justify-between text-sm py-2 border-b border-gray-100">
                  <span className="text-gray-600">Email</span>
                  <span className="font-medium text-gray-700 truncate ml-2 text-xs">{store.ownerEmail}</span>
                </div>
                <div className="flex items-center justify-between text-sm py-2 border-b border-gray-100">
                  <span className="text-gray-600">Productos</span>
                  <span className="font-semibold text-gray-900">{store.productCount}</span>
                </div>
                <div className="flex items-center justify-between text-sm py-2 border-b border-gray-100">
                  <span className="text-gray-600">Órdenes</span>
                  <span className="font-semibold text-gray-900">{store.orderCount}</span>
                </div>
                <div className="flex items-center justify-between text-sm py-2">
                  <span className="text-gray-600">Revenue</span>
                  <span className="font-semibold text-purple-600">
                    CHF {Number(store.totalRevenue || 0).toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                    store.isActive
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {store.isActive ? 'Activa' : 'Inactiva'}
                </span>
                <button
                  onClick={() => handleToggleStatus(store.id, store.isActive)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    store.isActive
                      ? 'text-red-600 hover:bg-red-50'
                      : 'text-green-600 hover:bg-green-50'
                  }`}
                >
                  {store.isActive ? (
                    <>
                      <PowerOff className="w-4 h-4" />
                      <span>Desactivar</span>
                    </>
                  ) : (
                    <>
                      <Power className="w-4 h-4" />
                      <span>Activar</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

