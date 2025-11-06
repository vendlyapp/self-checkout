'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Store as StoreIcon, Settings, BarChart3, Package, ShoppingCart, History, QrCode } from 'lucide-react';
import { SuperAdminService, type Store } from '@/lib/services/superAdminService';
import { useSuperAdminStore } from '@/lib/stores/superAdminStore';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import StoreAnalytics from '@/components/admin/stores/StoreAnalytics';  
import StoreConfiguration from '@/components/admin/stores/StoreConfiguration';
import StoreProducts from '@/components/admin/stores/StoreProducts';
import StoreOrders from '@/components/admin/stores/StoreOrders';
import StoreHistory from '@/components/admin/stores/StoreHistory';
import StoreQRManagement from '@/components/admin/stores/StoreQRManagement';

export default function StoreDetailPage() {
  const router = useRouter();
  const params = useParams();
  const storeId = params.id as string;
  const { stores } = useSuperAdminStore();
  
  const [store, setStore] = useState<Store | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('qr');

  const fetchStoreDetails = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true);
      }
      setError(null);
      
      // Try to fetch from API, but don't wait too long
      const fetchPromise = SuperAdminService.getStoreDetails(storeId);
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), 5000)
      );
      
      try {
        const response = await Promise.race([fetchPromise, timeoutPromise]) as { success: boolean; data?: Store } | Error;
        
        if (response && !(response instanceof Error) && response.success && response.data) {
          setStore(response.data);
          return;
        }
      } catch (apiError) {
        console.log('API call failed, using cached data:', apiError);
      }
      
      const storeFromList = stores.find((s: Store) => s.id === storeId);
      if (storeFromList) {
        setStore(storeFromList);
        setError(null);
      } else if (!store) {
        setError('No se pudo cargar la tienda');
      }
    } catch (err) {
      console.error('Error fetching store details:', err);
      
      const storeFromList = stores.find((s: Store) => s.id === storeId);
      if (storeFromList && !store) {
        setStore(storeFromList);
        setError(null);
      } else if (!store) {
        setError('Error al cargar los detalles de la tienda');
      }
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  }, [storeId, stores, store]);

  useEffect(() => {
    if (storeId) {
      // First check if we already have the store in the list
      const storeFromList = stores.find((s: Store) => s.id === storeId);
      if (storeFromList) {
        console.log('Using store from cached list');
        setStore(storeFromList);
        setLoading(false);
        // Still fetch fresh data in background (without showing loading)
        fetchStoreDetails(false);
      } else {
        // If not in list, fetch from API (with loading)
        fetchStoreDetails(true);
      }
    }
  }, [storeId, stores, fetchStoreDetails]);

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-brand-500 mx-auto" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">Cargando tienda...</p>
        </div>
      </div>
    );
  }

  if (error || !store) {
    return (
      <div className="p-8">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver</span>
        </button>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl dark:bg-red-500/15 dark:border-red-500/50 dark:text-red-400">
          {error || 'Tienda no encontrada'}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="flex items-center justify-center w-10 h-10 rounded-lg border border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Volver"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
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
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white/90">{store.name}</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">{store.slug}</p>
              </div>
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                  store.isActive
                    ? 'bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-400'
                    : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-500'
                }`}
              >
                {store.isActive ? 'Activa' : 'Inactiva'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-gray-200 dark:border-gray-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Revenue Total</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white/90">
                  CHF {Number(store.totalRevenue || 0).toLocaleString('de-CH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-gray-200 dark:border-gray-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Productos</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white/90">{store.productCount || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-gray-200 dark:border-gray-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Órdenes</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white/90">{store.orderCount || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-gray-200 dark:border-gray-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Propietario</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white/90 truncate">{store.ownerName}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6 bg-gray-100 dark:bg-gray-900">
          <TabsTrigger value="qr" className="flex items-center gap-2">
            <QrCode className="w-4 h-4" />
            <span className="hidden sm:inline">QR & Gestión</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            <span className="hidden sm:inline">Analytics</span>
          </TabsTrigger>
          <TabsTrigger value="products" className="flex items-center gap-2">
            <Package className="w-4 h-4" />
            <span className="hidden sm:inline">Productos</span>
          </TabsTrigger>
          <TabsTrigger value="orders" className="flex items-center gap-2">
            <ShoppingCart className="w-4 h-4" />
            <span className="hidden sm:inline">Ventas</span>
          </TabsTrigger>
          <TabsTrigger value="configuration" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            <span className="hidden sm:inline">Configuración</span>
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="w-4 h-4" />
            <span className="hidden sm:inline">Historial</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="qr" className="mt-6">
          <StoreQRManagement storeId={storeId} store={store} onUpdate={fetchStoreDetails} />
        </TabsContent>

        <TabsContent value="analytics" className="mt-6">
          <StoreAnalytics storeId={storeId} store={store} />
        </TabsContent>

        <TabsContent value="products" className="mt-6">
          <StoreProducts storeId={storeId} store={store} />
        </TabsContent>

        <TabsContent value="orders" className="mt-6">
          <StoreOrders storeId={storeId} store={store} />
        </TabsContent>

        <TabsContent value="configuration" className="mt-6">
          <StoreConfiguration store={store} onUpdate={fetchStoreDetails} />
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          <StoreHistory storeId={storeId} store={store} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

