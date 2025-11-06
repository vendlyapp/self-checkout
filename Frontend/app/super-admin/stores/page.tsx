'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Store as StoreIcon, Search, Power, PowerOff, TrendingUp, RefreshCw, MapPin, Package, ShoppingCart, Mail, User, ExternalLink } from 'lucide-react';
import { useSuperAdminStore } from '@/lib/stores/superAdminStore';

export default function SuperAdminStores() {
  const router = useRouter();
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

  const handleToggleStatus = async (storeId: string, currentStatus: boolean, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent navigation when clicking toggle
    try {
      await toggleStoreStatus(storeId, !currentStatus);
    } catch (err) {
      console.error('Error al cambiar estado:', err);
      alert('Error al cambiar el estado de la tienda');
    }
  };

  const handleStoreClick = (storeId: string) => {
    router.push(`/super-admin/stores/${storeId}`);
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-brand-500 mx-auto" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">Cargando tiendas...</p>
        </div>
      </div>
    );
  }

  if (storesError) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl dark:bg-red-500/15 dark:border-red-500/50 dark:text-red-400">
          {storesError}
        </div>
      </div>
    );
  }

  const activeStores = stores.filter(s => s.isActive).length;
  const inactiveStores = stores.length - activeStores;
  const totalRevenue = stores.reduce((sum, s) => sum + (Number(s.totalRevenue) || 0), 0);
  const totalProducts = stores.reduce((sum, s) => sum + (Number(s.productCount) || 0), 0);
  const totalOrders = stores.reduce((sum, s) => sum + (Number(s.orderCount) || 0), 0);

  return (
    <div className="space-y-4 md:space-y-6">
      {/* ============================================ */}
      {/* HEADER */}
      {/* ============================================ */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white/90">Gestión de Tiendas</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Administra todas las tiendas de la plataforma</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative flex-1 sm:flex-none">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar tiendas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-300 w-full sm:w-64 dark:bg-gray-900 dark:border-gray-800 dark:text-white/90 dark:placeholder:text-gray-500"
            />
          </div>
          <button
            onClick={() => refreshAll()}
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
            title="Actualizar datos"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ============================================ */}
      {/* MÉTRICAS */}
      {/* ============================================ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Total Tiendas</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white/90">{stores.length}</p>
            </div>
            <div className="w-12 h-12 bg-brand-50 dark:bg-brand-500/15 rounded-xl flex items-center justify-center">
              <StoreIcon className="w-6 h-6 text-brand-600 dark:text-brand-400" />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Activas</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white/90">{activeStores}</p>
              <p className="text-xs text-green-600 dark:text-green-400 mt-0.5">{inactiveStores} inactivas</p>
            </div>
            <div className="w-12 h-12 bg-green-50 dark:bg-green-500/15 rounded-xl flex items-center justify-center">
              <Power className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Revenue Total</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white/90">
                CHF {totalRevenue.toLocaleString('de-CH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
            <div className="w-12 h-12 bg-orange-50 dark:bg-orange-500/15 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Productos</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white/90">{totalProducts}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{totalOrders} órdenes</p>
            </div>
            <div className="w-12 h-12 bg-blue-50 dark:bg-blue-500/15 rounded-xl flex items-center justify-center">
              <Package className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>
      </div>

      {/* ============================================ */}
      {/* LISTA DE TIENDAS */}
      {/* ============================================ */}
      {filteredStores.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200 dark:bg-white/[0.03] dark:border-gray-800">
          <StoreIcon className="w-16 h-16 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400 font-medium">No se encontraron tiendas</p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
            {searchTerm ? 'Intenta con otro término de búsqueda' : 'No hay tiendas registradas'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredStores.map((store) => (
            <div
              key={store.id}
              onClick={() => handleStoreClick(store.id)}
              className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] hover:shadow-md transition-all duration-200 cursor-pointer group"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    store.isActive 
                      ? 'bg-brand-50 dark:bg-brand-500/15' 
                      : 'bg-gray-100 dark:bg-gray-800'
                  }`}>
                    <StoreIcon className={`w-6 h-6 ${
                      store.isActive 
                        ? 'text-brand-600 dark:text-brand-400' 
                        : 'text-gray-400 dark:text-gray-600'
                    }`} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-gray-900 dark:text-white/90 truncate">{store.name}</h3>
                      <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-brand-500 transition-colors flex-shrink-0" />
                    </div>
                    <div className="flex items-center mt-1 text-xs text-gray-500 dark:text-gray-400">
                      <MapPin className="w-3 h-3 mr-1 flex-shrink-0" />
                      <span className="truncate">{store.slug}</span>
                    </div>
                  </div>
                </div>
                <span
                  className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold flex-shrink-0 ml-2 ${
                    store.isActive
                      ? 'bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-400'
                      : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-500'
                  }`}
                >
                  {store.isActive ? 'Activa' : 'Inactiva'}
                </span>
              </div>

              {/* Info */}
              <div className="space-y-2.5 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center text-gray-600 dark:text-gray-400">
                    <User className="w-4 h-4 mr-2" />
                    <span>Propietario</span>
                  </div>
                  <span className="font-semibold text-gray-900 dark:text-white/90 truncate ml-2 max-w-[60%]">
                    {store.ownerName}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center text-gray-600 dark:text-gray-400">
                    <Mail className="w-4 h-4 mr-2" />
                    <span>Email</span>
                  </div>
                  <span className="font-medium text-gray-700 dark:text-gray-300 truncate ml-2 max-w-[60%] text-xs">
                    {store.ownerEmail}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm pt-2 border-t border-gray-100 dark:border-gray-800">
                  <div className="flex items-center text-gray-600 dark:text-gray-400">
                    <Package className="w-4 h-4 mr-2" />
                    <span>Productos</span>
                  </div>
                  <span className="font-semibold text-gray-900 dark:text-white/90">{store.productCount}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center text-gray-600 dark:text-gray-400">
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    <span>Órdenes</span>
                  </div>
                  <span className="font-semibold text-gray-900 dark:text-white/90">{store.orderCount}</span>
                </div>
                <div className="flex items-center justify-between text-sm pt-2 border-t border-gray-100 dark:border-gray-800">
                  <span className="text-gray-600 dark:text-gray-400 font-medium">Revenue</span>
                  <span className="font-bold text-brand-600 dark:text-brand-400">
                    CHF {Number(store.totalRevenue || 0).toLocaleString('de-CH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                <button
                  onClick={(e) => handleToggleStatus(store.id, store.isActive, e)}
                  className={`w-full flex items-center justify-center space-x-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                    store.isActive
                      ? 'text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10'
                      : 'text-green-600 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-500/10'
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
