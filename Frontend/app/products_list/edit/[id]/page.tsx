'use client';

import React, { useEffect, useState } from 'react';
import { fetchProductById, updateProduct } from '@/components/dashboard/products_list/data/mockProducts';

interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  originalPrice?: number;
  category: string;
  categoryId: string;
  stock: number;
  barcode?: string;
  sku: string;
  tags: string[];
  isNew?: boolean;
  isPopular?: boolean;
  isOnSale?: boolean;
  rating?: number;
  reviews?: number;
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  createdAt: string;
  updatedAt: string;
  unit?: string;
  availableWeights?: string[];
  hasWeight?: boolean;
  discountPercentage?: number;
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function EditProduct({ params }: PageProps) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [productId, setProductId] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Formulario de edición
  const [formData, setFormData] = useState<Partial<Product>>({});

  useEffect(() => {
    const loadParams = async () => {
      const resolvedParams = await params;
      setProductId(resolvedParams.id);
    };
    loadParams();
  }, [params]);

  useEffect(() => {
    if (!productId) return;

    const loadProduct = async () => {
      try {
        const productData = await fetchProductById(productId);
        if (productData) {
          setProduct(productData);
          setFormData(productData);
        }
      } catch (error) {
        console.error('Error loading product:', error);
        setError('Error al cargar el producto');
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [productId]);

  // Función para manejar cambios en el formulario
  const handleInputChange = (field: keyof Product, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Función para guardar los cambios
  const handleSave = async () => {
    if (!product || !formData) return;

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const updatedProduct = await updateProduct(product.id, formData);
      setProduct(updatedProduct);
      setSuccess('Producto actualizado exitosamente');
      
      // Limpiar mensaje de éxito después de 3 segundos
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error('Error updating product:', error);
      setError(error instanceof Error ? error.message : 'Error al actualizar el producto');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="h-full w-full overflow-hidden">
        <div className="p-4">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500 mx-auto"></div>
            <p className="mt-2 text-sm text-muted-foreground">Produkt wird geladen...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="h-full w-full overflow-hidden">
        <div className="p-4">
          <div className="text-center py-8">
            <p className="text-muted-foreground">Produkt nicht gefunden</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Mobile Layout */}
      <div className="block lg:hidden">
        <div className="h-full w-full overflow-hidden">
          <div className="p-4">
            {/* Información del producto */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="mb-4">
                <h2 className="text-lg font-semibold mb-2">{product.name}</h2>
                <p className="text-gray-600 text-sm">{product.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Preis:</span>
                  <span className="ml-2">CHF {product.price.toFixed(2)}</span>
                </div>
                <div>
                  <span className="font-medium">Kategorie:</span>
                  <span className="ml-2">{product.category}</span>
                </div>
                <div>
                  <span className="font-medium">SKU:</span>
                  <span className="ml-2">{product.sku}</span>
                </div>
                <div>
                  <span className="font-medium">Lagerbestand:</span>
                  <span className="ml-2">{product.stock}</span>
                </div>
              </div>

              {/* Formulario de edición */}
              <div className="mt-6 pt-4 border-t border-gray-100 space-y-4">
                {/* Mensajes de estado */}
                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-600 text-sm">{error}</p>
                  </div>
                )}
                
                {success && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-green-600 text-sm">{success}</p>
                  </div>
                )}

                {/* Campos del formulario */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre del Producto
                    </label>
                    <input
                      type="text"
                      value={formData.name || ''}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Descripción
                    </label>
                    <textarea
                      value={formData.description || ''}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Precio (CHF)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.price || ''}
                        onChange={(e) => handleInputChange('price', parseFloat(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Stock
                      </label>
                      <input
                        type="number"
                        value={formData.stock || ''}
                        onChange={(e) => handleInputChange('stock', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Categoría
                    </label>
                    <select
                      value={formData.category || ''}
                      onChange={(e) => handleInputChange('category', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Brot">Brot</option>
                      <option value="Gebäck">Gebäck</option>
                      <option value="Kuchen">Kuchen</option>
                      <option value="Sandwiches">Sandwiches</option>
                    </select>
                  </div>

                  {/* Botones */}
                  <div className="flex gap-2 pt-4">
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {saving ? 'Guardando...' : 'Guardar Cambios'}
                    </button>
                    
                    <button
                      onClick={() => window.history.back()}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden lg:block">
        <div className="p-6 space-y-6">
          {/* Header Section */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Produkt bearbeiten</h1>
              <p className="text-gray-600 mt-1">Bearbeiten Sie die Details von &quot;{product.name}&quot;</p>
            </div>
            <button
              onClick={() => window.history.back()}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <span>← Zurück zur Liste</span>
            </button>
          </div>

          {/* Product Info & Edit Form */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Product Info */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 sticky top-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Produktinformationen</h2>

                <div className="space-y-4">
                  <div>
                    <span className="text-sm font-medium text-gray-500">Name:</span>
                    <p className="text-gray-900 font-medium">{product.name}</p>
                  </div>

                  <div>
                    <span className="text-sm font-medium text-gray-500">Beschreibung:</span>
                    <p className="text-gray-900">{product.description || 'Keine Beschreibung'}</p>
                  </div>

                  <div>
                    <span className="text-sm font-medium text-gray-500">Preis:</span>
                    <p className="text-gray-900 font-medium">CHF {product.price.toFixed(2)}</p>
                  </div>

                  <div>
                    <span className="text-sm font-medium text-gray-500">Kategorie:</span>
                    <p className="text-gray-900">{product.category}</p>
                  </div>

                  <div>
                    <span className="text-sm font-medium text-gray-500">SKU:</span>
                    <p className="text-gray-900 font-mono text-sm">{product.sku}</p>
                  </div>

                  <div>
                    <span className="text-sm font-medium text-gray-500">Lagerbestand:</span>
                    <p className="text-gray-900">{product.stock} Stück</p>
                  </div>

                  <div>
                    <span className="text-sm font-medium text-gray-500">Status:</span>
                    <p className="text-gray-900">{product.isNew ? 'Neu' : 'Etabliert'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Edit Form */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Produkt bearbeiten</h2>

                {/* Mensajes de estado */}
                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-600 text-sm">{error}</p>
                  </div>
                )}
                
                {success && (
                  <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-green-600 text-sm">{success}</p>
                  </div>
                )}

                {/* Formulario completo */}
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nombre del Producto
                      </label>
                      <input
                        type="text"
                        value={formData.name || ''}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Categoría
                      </label>
                      <select
                        value={formData.category || ''}
                        onChange={(e) => handleInputChange('category', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="Brot">Brot</option>
                        <option value="Gebäck">Gebäck</option>
                        <option value="Kuchen">Kuchen</option>
                        <option value="Sandwiches">Sandwiches</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Descripción
                    </label>
                    <textarea
                      value={formData.description || ''}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Precio (CHF)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.price || ''}
                        onChange={(e) => handleInputChange('price', parseFloat(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Stock
                      </label>
                      <input
                        type="number"
                        value={formData.stock || ''}
                        onChange={(e) => handleInputChange('stock', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        SKU
                      </label>
                      <input
                        type="text"
                        value={formData.sku || ''}
                        onChange={(e) => handleInputChange('sku', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  {/* Botones */}
                  <div className="flex gap-4 pt-6 border-t border-gray-200">
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                    >
                      {saving ? 'Guardando...' : 'Guardar Cambios'}
                    </button>
                    
                    <button
                      onClick={() => window.history.back()}
                      className="px-6 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 font-medium"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
