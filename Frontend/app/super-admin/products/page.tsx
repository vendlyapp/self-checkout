'use client';

import React, { useEffect, useState } from 'react';
import { Package, Search, Store, RefreshCw, DollarSign, CheckCircle, XCircle, TrendingUp, Tag, ShoppingBag, ArrowLeft, BarChart3 } from 'lucide-react';
import { useSuperAdminStore } from '@/lib/stores/superAdminStore';
import type { Product } from '@/lib/services/superAdminService';
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/News/table";

interface StoreInfo {
  name: string;
  ownerName?: string;
  products: Product[];
}

export default function SuperAdminProducts() {
  const { 
    products,
    productsLoading,
    productsError,
    fetchProducts,
    refreshAll
  } = useSuperAdminStore();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStore, setSelectedStore] = useState<StoreInfo | null>(null);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Group products by store
  const productsByStore = products.reduce((acc: Record<string, StoreInfo>, product: Product) => {
    const storeName = product.storeName || 'Sin asignar';
    if (!acc[storeName]) {
      acc[storeName] = {
        name: storeName,
        ownerName: product.ownerName,
        products: []
      };
    }
    acc[storeName].products.push(product);
    return acc;
  }, {} as Record<string, StoreInfo>);

  const allStores = Object.values(productsByStore).sort((a, b) => b.products.length - a.products.length);

  // Filter products when a store is selected
  const filteredProducts = selectedStore
    ? selectedStore.products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  // Calculate store statistics
  const getStoreStats = (storeProducts: Product[]) => {
    const total = storeProducts.length;
    const active = storeProducts.filter(p => p.isActive).length;
    const inactive = total - active;
    const totalValue = storeProducts.reduce((sum, p) => sum + (Number(p.price) * Number(p.stock) || 0), 0);
    const avgPrice = total > 0 ? storeProducts.reduce((sum, p) => sum + Number(p.price), 0) / total : 0;
    const lowStock = storeProducts.filter(p => p.stock > 0 && p.stock < 10).length;
    const outOfStock = storeProducts.filter(p => p.stock === 0).length;
    const totalStock = storeProducts.reduce((sum, p) => sum + Number(p.stock), 0);
    
    return {
      total,
      active,
      inactive,
      totalValue,
      avgPrice,
      lowStock,
      outOfStock,
      totalStock
    };
  };

  const storeStats = selectedStore ? getStoreStats(selectedStore.products) : null;

  if (productsLoading && products.length === 0) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-brand-500 mx-auto" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">Cargando productos...</p>
        </div>
      </div>
    );
  }

  // If a store is selected, show products view
  if (selectedStore) {
    return (
      <div className="space-y-4 md:space-y-6">
        {/* ============================================ */}
        {/* HEADER - Store Products View */}
        {/* ============================================ */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSelectedStore(null)}
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Volver</span>
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white/90">{selectedStore.name}</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {selectedStore.ownerName && `Propietario: ${selectedStore.ownerName}`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative flex-1 sm:flex-none">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar productos..."
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
        {/* ESTADÍSTICAS DE LA TIENDA */}
        {/* ============================================ */}
        {storeStats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Total Productos</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white/90">{storeStats.total}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{storeStats.active} activos</p>
                </div>
                <div className="w-12 h-12 bg-brand-50 dark:bg-brand-500/15 rounded-xl flex items-center justify-center">
                  <Package className="w-6 h-6 text-brand-600 dark:text-brand-400" />
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Precio Promedio</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white/90">
                    CHF {storeStats.avgPrice.toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Por producto</p>
                </div>
                <div className="w-12 h-12 bg-blue-50 dark:bg-blue-500/15 rounded-xl flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Valor Total</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white/90">
                    CHF {storeStats.totalValue.toLocaleString('de-CH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">En inventario</p>
                </div>
                <div className="w-12 h-12 bg-orange-50 dark:bg-orange-500/15 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Stock Total</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white/90">{storeStats.totalStock}</p>
                  <p className="text-xs text-red-600 dark:text-red-400 mt-0.5">
                    {storeStats.lowStock} bajo, {storeStats.outOfStock} sin stock
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-50 dark:bg-green-500/15 rounded-xl flex items-center justify-center">
                  <ShoppingBag className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================ */}
        {/* ERROR STATE */}
        {/* ============================================ */}
        {productsError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl dark:bg-red-500/15 dark:border-red-500/50 dark:text-red-400">
            {productsError}
          </div>
        )}

        {/* ============================================ */}
        {/* TABLA DE PRODUCTOS */}
        {/* ============================================ */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-gray-200 dark:bg-white/[0.03] dark:border-gray-800">
            <Package className="w-16 h-16 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400 font-medium">No se encontraron productos</p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
              {searchTerm ? 'Intenta con otro término de búsqueda' : 'No hay productos en esta tienda'}
            </p>
          </div>
        ) : (
          <div className="rounded-xl border border-gray-200 bg-white overflow-hidden dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="border-gray-100 dark:border-gray-800 border-y bg-gray-50 dark:bg-gray-900/50">
                  <TableRow>
                    <TableCell
                      isHeader
                      className="py-3 px-6 font-medium text-gray-700 dark:text-gray-300 text-start text-xs"
                    >
                      Nombre del Producto
                    </TableCell>
                    <TableCell
                      isHeader
                      className="py-3 px-6 font-medium text-gray-700 dark:text-gray-300 text-start text-xs"
                    >
                      SKU
                    </TableCell>
                    <TableCell
                      isHeader
                      className="py-3 px-6 font-medium text-gray-700 dark:text-gray-300 text-start text-xs"
                    >
                      Categoría
                    </TableCell>
                    <TableCell
                      isHeader
                      className="py-3 px-6 font-medium text-gray-700 dark:text-gray-300 text-start text-xs"
                    >
                      Precio
                    </TableCell>
                    <TableCell
                      isHeader
                      className="py-3 px-6 font-medium text-gray-700 dark:text-gray-300 text-start text-xs"
                    >
                      Stock
                    </TableCell>
                    <TableCell
                      isHeader
                      className="py-3 px-6 font-medium text-gray-700 dark:text-gray-300 text-start text-xs"
                    >
                      Estado
                    </TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {filteredProducts.map((product) => (
                    <TableRow key={product.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30">
                      <TableCell className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-brand-50 dark:bg-brand-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Package className="w-5 h-5 text-brand-600 dark:text-brand-400" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-white/90 text-sm">{product.name}</p>
                            {product.description && (
                              <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1 mt-0.5">
                                {product.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <Tag className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-700 dark:text-gray-300 text-sm font-mono">{product.sku}</span>
                        </div>
                      </TableCell>
                      <TableCell className="py-4 px-6">
                        <span className="text-gray-700 dark:text-gray-300 text-sm">{product.category || '-'}</span>
                      </TableCell>
                      <TableCell className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                          <div>
                            <span className="text-gray-900 dark:text-white/90 font-semibold text-sm">
                              CHF {Number(product.price).toFixed(2)}
                            </span>
                            {product.originalPrice && product.originalPrice > product.price && (
                              <p className="text-xs text-gray-400 dark:text-gray-500 line-through">
                                CHF {Number(product.originalPrice).toFixed(2)}
                              </p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-4 px-6">
                        <span className={`font-semibold text-sm ${
                          product.stock === 0 
                            ? 'text-red-600 dark:text-red-400' 
                            : product.stock < 10 
                            ? 'text-orange-600 dark:text-orange-400' 
                            : 'text-green-600 dark:text-green-400'
                        }`}>
                          {product.stock}
                        </span>
                      </TableCell>
                      <TableCell className="py-4 px-6">
                        {product.isActive ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-400">
                            <CheckCircle className="w-3 h-3" />
                            Activo
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-500">
                            <XCircle className="w-3 h-3" />
                            Inactivo
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Default view: List of stores
  return (
    <div className="space-y-4 md:space-y-6">
      {/* ============================================ */}
      {/* HEADER */}
      {/* ============================================ */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white/90">Gestión de Productos</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Selecciona una tienda para ver sus productos</p>
        </div>
        <div className="flex items-center gap-3">
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
      {/* ERROR STATE */}
      {/* ============================================ */}
      {productsError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl dark:bg-red-500/15 dark:border-red-500/50 dark:text-red-400">
          {productsError}
        </div>
      )}

      {/* ============================================ */}
      {/* LISTA DE TIENDAS */}
      {/* ============================================ */}
      {allStores.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200 dark:bg-white/[0.03] dark:border-gray-800">
          <Store className="w-16 h-16 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400 font-medium">No hay tiendas con productos</p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">No se encontraron tiendas con productos registrados</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {allStores.map((store) => {
            const stats = getStoreStats(store.products);
            return (
              <button
                key={store.name}
                onClick={() => setSelectedStore(store)}
                className="text-left rounded-xl border border-gray-200 bg-white p-5 hover:shadow-md transition-all duration-200 dark:border-gray-800 dark:bg-white/[0.03] cursor-pointer"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-12 h-12 bg-brand-50 dark:bg-brand-500/15 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Store className="w-6 h-6 text-brand-600 dark:text-brand-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold text-gray-900 dark:text-white/90 truncate">{store.name}</h3>
                      {store.ownerName && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                          {store.ownerName}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Total Productos</span>
                    <span className="font-semibold text-gray-900 dark:text-white/90">{stats.total}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Precio Promedio</span>
                    <span className="font-semibold text-brand-600 dark:text-brand-400">
                      CHF {stats.avgPrice.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Valor Total</span>
                    <span className="font-semibold text-gray-900 dark:text-white/90">
                      CHF {stats.totalValue.toLocaleString('de-CH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm pt-2 border-t border-gray-100 dark:border-gray-800">
                    <span className="text-gray-600 dark:text-gray-400">Stock Total</span>
                    <span className="font-semibold text-gray-900 dark:text-white/90">{stats.totalStock}</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
