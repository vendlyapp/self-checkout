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
  );
} 