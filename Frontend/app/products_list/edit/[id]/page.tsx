'use client';

import React, { useEffect, useState } from 'react';
import { fetchProductById } from '@/components/dashboard/products_list/data/mockProducts';

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
  const [productId, setProductId] = useState<string>('');

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
        setProduct(productData);
      } catch (error) {
        console.error('Error loading product:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [productId]);

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

              <div className="mt-6 pt-4 border-t border-gray-100">
                <p className="text-gray-600 text-center">
                  Formular zum Bearbeiten wird hier implementiert...
                </p>
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

                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">📝</span>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Bearbeitungsformular</h3>
                  <p className="text-gray-600 mb-6">
                    Das vollständige Bearbeitungsformular wird hier implementiert...
                  </p>
                  <div className="bg-gray-50 rounded-lg p-4 text-left">
                    <h4 className="font-medium text-gray-900 mb-2">Geplante Funktionen:</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Produktdaten bearbeiten</li>
                      <li>• Bilder hochladen/ändern</li>
                      <li>• Preise und Varianten verwalten</li>
                      <li>• Kategorien zuweisen</li>
                      <li>• Lagerbestand aktualisieren</li>
                    </ul>
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
