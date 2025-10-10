'use client';

import React, { useEffect, useState } from 'react';
import { fetchProductById, updateProduct } from '@/components/dashboard/products_list/data/mockProducts';
import { Product } from '@/components/dashboard/products_list/data/mockProducts';
import HeaderNav from '@/components/navigation/HeaderNav';

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

  const handleInputChange = (field: keyof Product, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!product || !formData) return;

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const updatedProduct = await updateProduct(product.id, formData);
      setProduct(updatedProduct);
      setSuccess('Produkt erfolgreich aktualisiert');
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error('Error updating product:', error);
      setError(error instanceof Error ? error.message : 'Fehler beim Aktualisieren');
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => window.history.back();

  if (loading) {
    return (
      <div className="w-full h-auto min-h-[50vh] flex items-center justify-center">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-brand-500 mx-auto" />
          <p className="mt-4 text-base text-gray-600 font-medium">Produkt wird geladen...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="w-full h-auto min-h-[50vh] flex items-center justify-center">
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📦</div>
          <p className="text-lg text-gray-600 font-medium">Produkt nicht gefunden</p>
          <button
            onClick={handleBack}
            className="mt-4 px-6 py-2 bg-brand-500 text-white rounded-xl hover:bg-brand-600 transition-colors font-semibold"
          >
            ← Zurück
          </button>
        </div>
      </div>
    );
  }

  const formatPrice = (price: number): string => {
    return price % 1 === 0 ? `CHF ${price}.-` : `CHF ${price.toFixed(2)}`;
  };

  const stockDisplay = product.stock === 999 ? 'Unbegrenzt' : `${product.stock} Stück`;

  return (
    <div className="w-full h-auto">
      <div className="block lg:hidden">
        <div className="w-full h-auto bg-background-cream min-h-screen">
          <HeaderNav title="Produkt bearbeiten" />
          
          <div className="p-4 pb-24 space-y-5">
            <div className="bg-white rounded-2xl p-5 border border-gray-200">
              <div className="mb-5">
                <h2 className="text-xl font-bold text-gray-900 mb-2">{product.name}</h2>
                <p className="text-gray-600 text-base">{product.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 rounded-xl p-3">
                  <span className="text-gray-600 font-medium block mb-1 text-xs">Preis</span>
                  <span className="text-brand-500 font-bold text-base">{formatPrice(product.price)}</span>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <span className="text-gray-600 font-medium block mb-1 text-xs">Kategorie</span>
                  <span className="text-gray-900 font-semibold text-sm">{product.category}</span>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <span className="text-gray-600 font-medium block mb-1 text-xs">SKU</span>
                  <span className="text-gray-900 font-mono text-xs">{product.sku}</span>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <span className="text-gray-600 font-medium block mb-1 text-xs">Stock</span>
                  <span className="text-gray-900 font-semibold text-sm">{stockDisplay}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Bearbeiten</h3>

              {error && (
                <div className="mb-4 p-4 bg-red-50 border-2 border-red-200 rounded-xl flex items-start gap-2">
                  <span className="text-red-600 text-lg">⚠️</span>
                  <p className="text-red-600 text-sm font-medium flex-1">{error}</p>
                </div>
              )}
              
              {success && (
                <div className="mb-4 p-4 bg-green-50 border-2 border-green-200 rounded-xl flex items-start gap-2">
                  <span className="text-green-600 text-lg">✓</span>
                  <p className="text-green-600 text-sm font-medium flex-1">{success}</p>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-base font-semibold text-gray-700 mb-2">Produktname</label>
                  <input
                    type="text"
                    value={formData.name || ''}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full h-[46px] px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent bg-white text-base"
                  />
                </div>

                <div>
                  <label className="block text-base font-semibold text-gray-700 mb-2">Beschreibung</label>
                  <textarea
                    value={formData.description || ''}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-none bg-white text-base"
                  />
                </div>

                <div>
                  <label className="block text-base font-semibold text-gray-700 mb-2">Preis (CHF)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price || ''}
                    onChange={(e) => handleInputChange('price', parseFloat(e.target.value))}
                    className="w-full h-[46px] px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent bg-white text-base font-medium"
                  />
                </div>

                <div>
                  <label className="block text-base font-semibold text-gray-700 mb-2">Kategorie</label>
                  <select
                    value={formData.category || ''}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    className="w-full h-[46px] px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent bg-white text-base"
                  >
                    <option value="Brot">Brot</option>
                    <option value="Gebäck">Gebäck</option>
                    <option value="Kuchen">Kuchen</option>
                    <option value="Sandwiches">Sandwiches</option>
                  </select>
                </div>

                <div className="flex flex-col gap-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="w-full bg-brand-500 text-white h-[50px] rounded-xl hover:bg-brand-600 active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-base shadow-sm transition-all"
                  >
                    {saving ? '💾 Speichern...' : '✓ Änderungen speichern'}
                  </button>
                  
                  <button
                    onClick={handleBack}
                    className="w-full h-[50px] border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 active:scale-98 font-semibold text-base transition-all"
                  >
                    ← Abbrechen
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="hidden lg:block">
        <div className="p-6 space-y-6 h-auto max-w-4xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Produkt bearbeiten</h1>
              <p className="text-gray-600 mt-1">Bearbeiten Sie die Details von &quot;{product.name}&quot;</p>
            </div>
            <button
              onClick={handleBack}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <span>← Zurück zur Liste</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 sticky top-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Aktuelle Informationen</h2>
                <div className="space-y-4">
                  <div>
                    <span className="text-sm font-medium text-gray-500">Name:</span>
                    <p className="text-gray-900 font-medium">{product.name}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Preis:</span>
                    <p className="text-gray-900 font-medium">{formatPrice(product.price)}</p>
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
                    <span className="text-sm font-medium text-gray-500">Stock:</span>
                    <p className="text-gray-900">{stockDisplay}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Produkt bearbeiten</h2>

                {error && (
                  <div className="mb-4 p-4 bg-red-50 border-2 border-red-200 rounded-xl flex items-start gap-2">
                    <span className="text-red-600 text-xl">⚠️</span>
                    <p className="text-red-600 text-sm font-medium flex-1">{error}</p>
                  </div>
                )}
                
                {success && (
                  <div className="mb-4 p-4 bg-green-50 border-2 border-green-200 rounded-xl flex items-start gap-2">
                    <span className="text-green-600 text-xl">✓</span>
                    <p className="text-green-600 text-sm font-medium flex-1">{success}</p>
                  </div>
                )}

                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Produktname</label>
                      <input
                        type="text"
                        value={formData.name || ''}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className="w-full h-12 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Kategorie</label>
                      <select
                        value={formData.category || ''}
                        onChange={(e) => handleInputChange('category', e.target.value)}
                        className="w-full h-12 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent bg-white"
                      >
                        <option value="Brot">Brot</option>
                        <option value="Gebäck">Gebäck</option>
                        <option value="Kuchen">Kuchen</option>
                        <option value="Sandwiches">Sandwiches</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Beschreibung</label>
                    <textarea
                      value={formData.description || ''}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-none bg-white"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Preis (CHF)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.price || ''}
                        onChange={(e) => handleInputChange('price', parseFloat(e.target.value))}
                        className="w-full h-12 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent bg-white font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Stock (Auto: 999)</label>
                      <input
                        type="text"
                        value="999 (Unbegrenzt)"
                        disabled
                        className="w-full h-12 px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 font-medium text-gray-500 cursor-not-allowed"
                      />
                    </div>
                  </div>

                  <div className="flex gap-4 pt-6 border-t border-gray-200">
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="flex-1 bg-brand-500 text-white px-6 py-3 rounded-xl hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-sm transition-all active:scale-98"
                    >
                      {saving ? '💾 Speichern...' : '✓ Änderungen speichern'}
                    </button>
                    <button
                      onClick={handleBack}
                      className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-semibold transition-all active:scale-98"
                    >
                      ← Abbrechen
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
