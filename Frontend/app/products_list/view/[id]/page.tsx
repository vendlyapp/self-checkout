'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchProductById, deleteProduct } from '@/components/dashboard/products_list/data/mockProducts';
import HeaderNav from '@/components/navigation/HeaderNav';
import { Product } from '@/components/dashboard/products_list/data/mockProducts';
import { Package, Edit, Trash2, Tag, AlertCircle, CheckCircle, Download, QrCode } from 'lucide-react';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ViewProduct({ params }: PageProps) {
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [productId, setProductId] = useState<string>('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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
        }
      } catch (error) {
        console.error('Error loading product:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [productId]);

  const formatPrice = (price: number): string => {
    return price % 1 === 0 ? `CHF ${price}.-` : `CHF ${price.toFixed(2)}`;
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('de-CH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleEdit = () => router.push(`/products_list/edit/${productId}`);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteProduct(productId);
      router.push('/products_list');
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Error al eliminar el producto');
      setIsDeleting(false);
    }
  };

  const handleDownloadQR = () => {
    if (!product || !product.qrCode) return;
    
    const link = document.createElement('a');
    link.href = product.qrCode;
    link.download = `QR_${product.name.replace(/\s+/g, '_')}_${product.id}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
            onClick={() => router.push('/products_list')}
            className="mt-4 px-6 py-2 bg-brand-500 text-white rounded-xl hover:bg-brand-600 transition-colors font-semibold"
          >
            ← Zurück zur Liste
          </button>
        </div>
      </div>
    );
  }

  const stockDisplay = product.stock === 999 ? '∞' : product.stock;
  const stockLabel = product.stock === 999 ? 'Unbegrenzt' : 'Stück';

  return (
    <div className="w-full h-auto">
      <div className="block lg:hidden">
        <div className="w-full h-auto bg-background-cream min-h-screen">
          <HeaderNav title="Produktdetails" />
          
          <div className="p-4 pb-24 space-y-5">
            <div className="bg-white rounded-2xl p-4 border border-gray-200">
              <div className="flex justify-between pb-3">
                <p className="text-black text-sm font-medium">Produktbild</p>
              </div>
              <div className="flex items-center justify-center">
                <div className="w-[150px] h-[150px] rounded-2xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center shadow-md">
                  {product.image ? (
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                  ) : (
                    <Package className="w-20 h-20 text-gray-400" />
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Grunddaten</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Produktname</label>
                  <p className="text-gray-900 font-semibold text-base">{product.name}</p>
                </div>
                {product.description && (
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Beschreibung</label>
                    <p className="text-gray-900 text-base">{product.description}</p>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Kategorie</label>
                  <p className="text-gray-900 font-semibold text-base">{product.category}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Preis & Lagerbestand</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 rounded-xl p-4">
                  <label className="block text-sm font-medium text-gray-600 mb-2">Preis</label>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-brand-500">{formatPrice(product.price)}</span>
                    {product.originalPrice && (
                      <span className="text-sm text-gray-400 line-through">{formatPrice(product.originalPrice)}</span>
                    )}
                  </div>
                  {product.discountPercentage && (
                    <div className="mt-2 inline-flex items-center gap-1 bg-red-100 text-red-600 px-2 py-1 rounded-full text-xs font-semibold">
                      <Tag className="w-3 h-3" />
                      {product.discountPercentage}% Rabatt
                    </div>
                  )}
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <label className="block text-sm font-medium text-gray-600 mb-2">Lagerbestand</label>
                  <span className="text-2xl font-bold text-gray-900">{stockDisplay}</span>
                  <p className="text-xs text-gray-500 mt-1">{stockLabel}</p>
                </div>
              </div>
            </div>

            {(product.sku || product.rating) && (
              <div className="bg-white rounded-2xl p-5 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Zusätzliche Informationen</h3>
                <div className="space-y-3">
                  {product.sku && (
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-sm font-medium text-gray-600">SKU</span>
                      <span className="text-gray-900 font-mono text-sm">{product.sku}</span>
                    </div>
                  )}
                  {product.rating && (
                    <div className="flex justify-between items-center py-2">
                      <span className="text-sm font-medium text-gray-600">Bewertung</span>
                      <span className="text-gray-900 font-semibold">
                        ⭐ {product.rating.toFixed(1)} ({product.reviews || 0})
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="bg-white rounded-2xl p-5 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Status</h3>
              <div className="flex flex-wrap gap-2">
                {product.isActive ? (
                  <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1.5 rounded-full text-xs font-semibold">
                    <CheckCircle className="w-3 h-3" />
                    Aktiv
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-600 px-3 py-1.5 rounded-full text-xs font-semibold">
                    Inaktiv
                  </span>
                )}
                {product.isNew && (
                  <span className="bg-blue-100 text-blue-700 px-3 py-1.5 rounded-full text-xs font-semibold">Neu</span>
                )}
                {product.isPopular && (
                  <span className="bg-purple-100 text-purple-700 px-3 py-1.5 rounded-full text-xs font-semibold">Beliebt</span>
                )}
                {product.isOnSale && (
                  <span className="bg-red-100 text-red-700 px-3 py-1.5 rounded-full text-xs font-semibold">Im Angebot</span>
                )}
              </div>
              {product.tags && product.tags.length > 0 && (
                <div className="pt-3 border-t border-gray-100 mt-3">
                  <span className="text-sm font-medium text-gray-600 block mb-2">Tags</span>
                  <div className="flex flex-wrap gap-2">
                    {product.tags.map((tag, index) => (
                      <span key={index} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {product.qrCode && (
              <div className="bg-white rounded-2xl p-5 border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <QrCode className="w-5 h-5 text-gray-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Código QR</h3>
                  </div>
                  <button
                    onClick={handleDownloadQR}
                    className="flex items-center gap-2 px-3 py-1.5 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors text-sm font-medium"
                  >
                    <Download className="w-4 h-4" />
                    Descargar
                  </button>
                </div>
                <div className="flex flex-col items-center bg-gray-50 rounded-xl p-4">
                  <img 
                    src={product.qrCode} 
                    alt={`QR Code para ${product.name}`}
                    className="w-48 h-48 rounded-lg shadow-sm"
                  />
                  <p className="text-xs text-gray-500 mt-3 text-center">
                    Escanea este código para ver el producto
                  </p>
                </div>
              </div>
            )}

            {product.notes && (
              <div className="bg-white rounded-2xl p-5 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Notizen</h3>
                <p className="text-gray-700 text-base leading-relaxed">{product.notes}</p>
              </div>
            )}

            <div className="bg-white rounded-2xl p-5 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Zeitstempel</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm font-medium text-gray-600">Erstellt am</span>
                  <span className="text-gray-900 font-medium text-sm">{formatDate(product.createdAt)}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm font-medium text-gray-600">Zuletzt aktualisiert</span>
                  <span className="text-gray-900 font-medium text-sm">{formatDate(product.updatedAt)}</span>
                </div>
              </div>
            </div>

            {!showDeleteConfirm ? (
              <div className="flex flex-col gap-3 pb-4">
                <button
                  onClick={handleEdit}
                  className="w-full bg-brand-500 text-white h-[50px] rounded-xl hover:bg-brand-600 active:scale-98 transition-all flex items-center justify-center gap-2 shadow-md font-semibold text-base"
                >
                  <Edit className="w-5 h-5" />
                  Bearbeiten
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="w-full bg-red-500 text-white h-[50px] rounded-xl hover:bg-red-600 active:scale-98 transition-all flex items-center justify-center gap-2 shadow-md font-semibold text-base"
                >
                  <Trash2 className="w-5 h-5" />
                  Löschen
                </button>
              </div>
            ) : (
              <div className="space-y-3 pb-4">
                <div className="bg-red-50 border-2 border-red-200 rounded-xl p-5 flex items-start gap-3">
                  <AlertCircle className="w-7 h-7 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-red-900 font-bold text-base mb-2">Produkt wirklich löschen?</p>
                    <p className="text-red-700 text-sm leading-relaxed">
                      Diese Aktion kann nicht rückgängig gemacht werden. Das Produkt &quot;{product.name}&quot; wird permanent gelöscht.
                    </p>
                  </div>
                </div>
                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    disabled={isDeleting}
                    className="w-full bg-gray-200 text-gray-700 h-[50px] rounded-xl hover:bg-gray-300 active:scale-98 transition-all disabled:opacity-50 font-semibold text-base"
                  >
                    Abbrechen
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="w-full bg-red-600 text-white h-[50px] rounded-xl hover:bg-red-700 active:scale-98 transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-md font-semibold text-base"
                  >
                    {isDeleting ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                        Löschen...
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-5 h-5" />
                        Ja, löschen
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="hidden lg:block">
        <div className="p-6 space-y-6 h-auto max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Produktdetails</h1>
            <button
              onClick={() => router.push('/products_list')}
              className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors font-medium"
            >
              ← Zurück zur Liste
            </button>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200">
            <div className="flex items-start gap-6 mb-6">
              <div className="w-40 h-40 rounded-2xl overflow-hidden flex-shrink-0 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center shadow-md">
                {product.image ? (
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                ) : (
                  <Package className="w-20 h-20 text-gray-400" />
                )}
              </div>
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-3">{product.name}</h1>
                {product.description && (
                  <p className="text-gray-600 text-lg mb-4">{product.description}</p>
                )}
                <div className="flex flex-wrap gap-2">
                  {product.isActive ? (
                    <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1.5 rounded-full text-sm font-semibold">
                      <CheckCircle className="w-4 h-4" />
                      Aktiv
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-600 px-3 py-1.5 rounded-full text-sm font-semibold">
                      Inaktiv
                    </span>
                  )}
                  {product.isNew && <span className="bg-blue-100 text-blue-700 px-3 py-1.5 rounded-full text-sm font-semibold">Neu</span>}
                  {product.isPopular && <span className="bg-purple-100 text-purple-700 px-3 py-1.5 rounded-full text-sm font-semibold">Beliebt</span>}
                </div>
              </div>
              <div className="text-right">
                {product.originalPrice && (
                  <div className="text-gray-400 text-lg line-through mb-1">{formatPrice(product.originalPrice)}</div>
                )}
                <div className="text-4xl font-bold text-brand-500">{formatPrice(product.price)}</div>
                {product.discountPercentage && (
                  <div className="inline-flex items-center gap-1 bg-red-100 text-red-600 px-3 py-1 rounded-full text-sm font-semibold mt-2">
                    <Tag className="w-4 h-4" />
                    {product.discountPercentage}% Rabatt
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-gray-50 rounded-xl p-4">
                <span className="text-gray-600 text-sm font-medium block mb-2">Kategorie</span>
                <span className="text-gray-900 font-semibold text-lg">{product.category}</span>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <span className="text-gray-600 text-sm font-medium block mb-2">Lagerbestand</span>
                <span className="text-gray-900 font-semibold text-lg">
                  {product.stock === 999 ? 'Unbegrenzt' : `${product.stock} Stück`}
                </span>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <span className="text-gray-600 text-sm font-medium block mb-2">SKU</span>
                <span className="text-gray-900 font-mono text-sm">{product.sku}</span>
              </div>
            </div>

            {product.qrCode && (
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 mb-6 border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <QrCode className="w-6 h-6 text-brand-500" />
                    <h3 className="text-lg font-semibold text-gray-900">Código QR del Producto</h3>
                  </div>
                  <button
                    onClick={handleDownloadQR}
                    className="flex items-center gap-2 px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors font-medium shadow-sm"
                  >
                    <Download className="w-4 h-4" />
                    Descargar
                  </button>
                </div>
                <div className="flex justify-center bg-white rounded-xl p-6 shadow-sm">
                  <div className="text-center">
                    <img 
                      src={product.qrCode} 
                      alt={`QR Code para ${product.name}`}
                      className="w-64 h-64 mx-auto rounded-lg"
                    />
                    <p className="text-sm text-gray-600 mt-4">
                      Escanea este código para identificar el producto
                    </p>
                  </div>
                </div>
              </div>
            )}

            {!showDeleteConfirm ? (
              <div className="flex gap-4 pt-6 border-t border-gray-200">
                <button
                  onClick={handleEdit}
                  className="flex-1 bg-brand-500 text-white px-6 py-3 rounded-xl hover:bg-brand-600 transition-all flex items-center justify-center gap-2 shadow-md font-semibold active:scale-98"
                >
                  <Edit className="w-5 h-5" />
                  Bearbeiten
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="bg-red-500 text-white px-6 py-3 rounded-xl hover:bg-red-600 transition-all flex items-center justify-center gap-2 shadow-md font-semibold active:scale-98"
                >
                  <Trash2 className="w-5 h-5" />
                  Löschen
                </button>
              </div>
            ) : (
              <div className="pt-6 border-t border-gray-200 space-y-4">
                <div className="bg-red-50 border-2 border-red-200 rounded-xl p-5 flex items-start gap-3">
                  <AlertCircle className="w-7 h-7 text-red-600 flex-shrink-0" />
                  <div>
                    <p className="text-red-900 font-bold text-lg mb-2">Produkt wirklich löschen?</p>
                    <p className="text-red-700">
                      Diese Aktion kann nicht rückgängig gemacht werden. Das Produkt &quot;{product.name}&quot; wird permanent gelöscht.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    disabled={isDeleting}
                    className="flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-xl hover:bg-gray-300 transition-all disabled:opacity-50 font-semibold active:scale-98"
                  >
                    Abbrechen
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="flex-1 bg-red-600 text-white px-6 py-3 rounded-xl hover:bg-red-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-md font-semibold active:scale-98"
                  >
                    {isDeleting ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                        Löschen...
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-5 h-5" />
                        Ja, löschen
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
