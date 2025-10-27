'use client';

import React, { useEffect, useState } from 'react';
import { Package, Search, Store, User, DollarSign, CheckCircle, XCircle } from 'lucide-react';
import { useSuperAdminStore } from '@/lib/stores/superAdminStore';
import type { Product } from '@/lib/services/superAdminService';

export default function SuperAdminProducts() {
  const { 
    products,
    productsLoading,
    productsError,
    fetchProducts
  } = useSuperAdminStore();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStore, setFilterStore] = useState<string>('ALL');

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Group products by store
  const productsByStore = products.reduce((acc: Record<string, Product[]>, product: Product) => {
    const storeName = product.storeName || 'Unassigned';
    if (!acc[storeName]) {
      acc[storeName] = [];
    }
    acc[storeName].push(product);
    return acc;
  }, {} as Record<string, Product[]>);

  // Filter products based on search and store filter
  const filteredProductsByStore = Object.entries(productsByStore).reduce((acc: Record<string, Product[]>, [storeName, products]: [string, Product[]]) => {
    const filtered = products.filter(product =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if ((filterStore === 'ALL' || storeName === filterStore) && filtered.length > 0) {
      acc[storeName] = filtered;
    }
    return acc;
  }, {} as Record<string, Product[]>);

  const allStores = Object.keys(productsByStore);

  if (productsLoading && products.length === 0) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-purple-600 mx-auto" />
          <p className="mt-4 text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-600 mt-2">View all products from all stores</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 w-full md:w-64"
            />
          </div>
        </div>
      </div>

      {/* Filter by Store */}
      {allStores.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilterStore('ALL')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filterStore === 'ALL'
                ? 'bg-purple-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            All Stores
          </button>
          {allStores.map((storeName) => (
            <button
              key={storeName}
              onClick={() => setFilterStore(storeName)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterStore === storeName
                  ? 'bg-purple-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              {storeName}
            </button>
          ))}
        </div>
      )}

      {/* Error State */}
      {productsError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
          {productsError}
        </div>
      )}

      {/* Empty State */}
      {Object.keys(filteredProductsByStore).length === 0 && !productsLoading && (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600">No products found</p>
        </div>
      )}

      {/* Functions by Store */}
      {Object.entries(filteredProductsByStore).map(([storeName, storeProducts]) => (
        <div key={storeName} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          {/* Store Header */}
          <div className="bg-gray-50 border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Store className="w-5 h-5 text-purple-600" />
                <div>
                  <h3 className="font-semibold text-gray-900">{storeName}</h3>
                  {storeProducts[0]?.ownerName && (
                    <p className="text-sm text-gray-500">Owner: {storeProducts[0].ownerName}</p>
                  )}
                </div>
              </div>
              <span className="text-sm text-gray-600">{storeProducts.length} products</span>
            </div>
          </div>

          {/* Products Grid */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {storeProducts.map((product) => (
                <div key={product.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  {/* Product Image */}
                  {product.image && (
                    <img 
                      src={product.image} 
                      alt={product.name}
                      className="w-full h-32 object-cover rounded-lg mb-3"
                    />
                  )}
                  
                  {/* Product Info */}
                  <div className="space-y-2">
                    <h4 className="font-semibold text-gray-900 line-clamp-2">{product.name}</h4>
                    <p className="text-xs text-gray-500">SKU: {product.sku}</p>
                    
                    {/* Price */}
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-green-600" />
                      <span className="text-lg font-bold text-gray-900">${product.price}</span>
                      {product.originalPrice && product.originalPrice > product.price && (
                        <span className="text-sm text-gray-400 line-through">
                          ${product.originalPrice}
                        </span>
                      )}
                    </div>

                    {/* Stock */}
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-gray-600">Stock:</span>
                      <span className={`font-medium ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {product.stock}
                      </span>
                    </div>

                    {/* Status */}
                    <div className="flex items-center gap-2">
                      {product.isActive ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                          <CheckCircle className="w-3 h-3" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">
                          <XCircle className="w-3 h-3" />
                          Inactive
                        </span>
                      )}
                    </div>

                    {/* Category */}
                    {product.category && (
                      <div className="pt-2 border-t border-gray-200">
                        <span className="text-xs text-gray-500">Category: {product.category}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
