'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, Search, AlertCircle, RefreshCw, TrendingUp, Edit } from 'lucide-react';
import { SuperAdminService, type Product, type Store } from '@/lib/services/superAdminService';
import { formatSwissPrice } from '@/lib/utils';
import EditProductModal from './EditProductModal';
import { ProductService } from '@/lib/services/productService';

interface StoreProductsProps {
  storeId: string;
  store: Store | null;
}

export default function StoreProducts({ storeId }: StoreProductsProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, [storeId]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await SuperAdminService.getAllProducts({ storeId, limit: 100 });
      
      if (response.success && response.data) {
        setProducts(response.data);
      } else {
        setError(response.error || 'Error al cargar los productos');
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setError(error instanceof Error ? error.message : 'Error al cargar los productos');
    } finally {
      setLoading(false);
    }
  };

  const handleEditProduct = async (product: Product) => {
    // Fetch full product details
    try {
      const response = await ProductService.getProductById(product.id);
      if (response.success && response.data) {
        // Convert to the Product type expected by the modal
        setEditingProduct(response.data as any);
        setIsEditModalOpen(true);
      } else {
        setError('No se pudo cargar la información del producto');
      }
    } catch (err) {
      console.error('Error loading product:', err);
      setError('Error al cargar el producto');
    }
  };

  const handleEditSuccess = () => {
    fetchProducts(); // Refresh products list
  };

  const filteredProducts = products.filter((product) =>
    product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeProducts = products.filter(p => p.isActive).length;
  const lowStockProducts = products.filter(p => p.stock < 10 && p.stock > 0).length;
  const outOfStockProducts = products.filter(p => p.stock === 0).length;
  const totalValue = products.reduce((sum, p) => sum + (p.price * p.stock), 0);

  if (loading) {
    return (
      <div className="space-y-6">
        <Card className="bg-card rounded-2xl border border-border/50">
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-muted rounded-lg w-1/3"></div>
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-24 bg-muted rounded-xl" />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error && products.length === 0) {
    return (
      <Card className="bg-card rounded-2xl border border-border/50">
        <CardContent className="p-8 text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">Error al cargar productos</h3>
          <p className="text-sm text-muted-foreground mb-4">{error}</p>
          <button
            onClick={fetchProducts}
            className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Reintentar
          </button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card rounded-xl border border-border/50">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-2">Total Productos</p>
                <p className="text-2xl font-bold text-foreground mb-1">{products.length}</p>
                <p className="text-xs text-emerald-600 dark:text-emerald-400">
                  {activeProducts} activos
                </p>
              </div>
              <div className="w-12 h-12 bg-brand-50 dark:bg-brand-500/15 rounded-xl flex items-center justify-center flex-shrink-0">
                <Package className="w-6 h-6 text-brand-600 dark:text-brand-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card rounded-xl border border-border/50">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-2">Valor Total</p>
                <p className="text-xl font-bold text-foreground mb-1">
                  CHF {formatSwissPrice(totalValue)}
                </p>
                <p className="text-xs text-muted-foreground">Inventario</p>
              </div>
              <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-500/15 rounded-xl flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card rounded-xl border border-border/50">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-2">Stock Bajo</p>
                <p className="text-2xl font-bold text-orange-600 dark:text-orange-400 mb-1">{lowStockProducts}</p>
                <p className="text-xs text-muted-foreground">Menos de 10 unidades</p>
              </div>
              <div className="w-12 h-12 bg-orange-50 dark:bg-orange-500/15 rounded-xl flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card rounded-xl border border-border/50">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-2">Sin Stock</p>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400 mb-1">{outOfStockProducts}</p>
                <p className="text-xs text-muted-foreground">Productos agotados</p>
              </div>
              <div className="w-12 h-12 bg-red-50 dark:bg-red-500/15 rounded-xl flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Products List */}
      <Card className="bg-card rounded-2xl border border-border/50 transition-all duration-200 hover:shadow-md">
        <CardHeader className="px-6 pt-6 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2 text-lg lg:text-xl mb-2">
                <Package className="w-5 h-5 text-brand-600 dark:text-brand-400" />
                Productos
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {filteredProducts.length} de {products.length} productos
              </p>
            </div>
            <div className="relative flex-1 sm:flex-none sm:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <input
                type="text"
                placeholder="Nach Name, SKU oder Kategorie suchen..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-300 bg-background text-foreground placeholder:text-muted-foreground"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-6 pb-6 pt-4">
          {error && products.length > 0 && (
            <div className="mb-6 p-4 bg-orange-50 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/30 rounded-lg flex items-center justify-between">
              <p className="text-sm text-orange-700 dark:text-orange-400">{error}</p>
              <button
                onClick={fetchProducts}
                className="text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          )}

          {filteredProducts.length === 0 ? (
            <div className="text-center py-16">
              <Package className="w-20 h-20 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {searchTerm ? 'Keine Produkte gefunden' : 'Keine Produkte in diesem Geschäft'}
              </h3>
              <p className="text-sm text-muted-foreground">
                {searchTerm 
                  ? 'Intenta con otro término de búsqueda' 
                  : 'Los productos de esta tienda aparecerán aquí'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="group flex items-center gap-4 p-5 border border-border rounded-xl hover:bg-muted/30 hover:border-brand-300/50 dark:hover:border-brand-500/30 transition-all duration-200"
                >
                  {/* Product Image */}
                  <div className="flex-shrink-0">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-20 h-20 object-cover rounded-xl border border-border"
                      />
                    ) : (
                      <div className="w-20 h-20 bg-muted rounded-xl flex items-center justify-center border border-border">
                        <Package className="w-10 h-10 text-muted-foreground" />
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground text-base mb-1.5 truncate group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                          {product.name || 'Sin nombre'}
                        </h3>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                          <span className="font-mono">SKU: {product.sku || 'N/A'}</span>
                          {product.category && (
                            <>
                              <span>•</span>
                              <span>{product.category}</span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditProduct(product);
                          }}
                          className="flex items-center gap-2 px-3 py-1.5 text-sm text-brand-600 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-500/10 rounded-lg transition-colors border border-brand-200 dark:border-brand-500/30"
                          title="Editar producto"
                        >
                          <Edit className="w-4 h-4" />
                          <span className="hidden sm:inline">Editar</span>
                        </button>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            product.isActive
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400'
                              : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          {product.isActive ? 'Activo' : 'Inactivo'}
                        </span>
                      </div>
                    </div>

                    {/* Product Details */}
                    <div className="flex items-center gap-6 mt-4 pt-4 border-t border-border/50">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Stock:</span>
                        <span className={`text-sm font-semibold ${
                          product.stock === 0 
                            ? 'text-red-600 dark:text-red-400' 
                            : product.stock < 10 
                            ? 'text-orange-600 dark:text-orange-400' 
                            : 'text-foreground'
                        }`}>
                          {product.stock || 0} unidades
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Precio:</span>
                        <span className="text-base font-bold text-brand-600 dark:text-brand-400">
                          CHF {formatSwissPrice(product.price || 0)}
                        </span>
                      </div>
                      {product.originalPrice && product.originalPrice > product.price && (
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground line-through">
                            CHF {formatSwissPrice(product.originalPrice)}
                          </span>
                          <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                            -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Product Modal */}
      <EditProductModal
        product={editingProduct}
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingProduct(null);
        }}
        onSuccess={handleEditSuccess}
      />
    </div>
  );
}
