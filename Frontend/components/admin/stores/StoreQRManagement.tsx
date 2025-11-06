'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { QrCode, Download, Edit2, Save, Loader2, Copy, Share2 } from 'lucide-react';
import { toast } from 'sonner';
import { SuperAdminService, type Store } from '@/lib/services/superAdminService';

interface StoreQRManagementProps {
  storeId: string;
  store: Store | null;
  onUpdate?: () => void;
}

export default function StoreQRManagement({ storeId, store, onUpdate }: StoreQRManagementProps) {
  const [storeData, setStoreData] = useState<Store | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [storeName, setStoreName] = useState('');
  const [storeLogo, setStoreLogo] = useState('');

  useEffect(() => {
    loadStoreDetails();
  }, [storeId]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadStoreDetails = async () => {
    try {
      setLoading(true);
      // Get full store details including QR code
      const response = await SuperAdminService.getStoreDetails(storeId);
      
      if (response.success && response.data) {
        setStoreData(response.data);
        setStoreName(response.data.name || store?.name || '');
        setStoreLogo(response.data.logo || store?.logo || '');
      } else {
        // Fallback to passed store data
        setStoreData(store);
        setStoreName(store?.name || '');
        setStoreLogo(store?.logo || '');
      }
    } catch (error) {
      console.error('Error loading store details:', error);
      // Fallback to passed store data
      setStoreData(store);
      setStoreName(store?.name || '');
      setStoreLogo(store?.logo || '');
      toast.error('Error al cargar los detalles de la tienda');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const response = await SuperAdminService.updateStore(storeId, {
        name: storeName,
        logo: storeLogo || null,
      });

      if (response.success) {
        setStoreData(response.data);
        setEditing(false);
        toast.success('Tienda actualizada correctamente');
        if (onUpdate) {
          onUpdate();
        }
      } else {
        toast.error(response.error || 'Error al actualizar la tienda');
      }
    } catch (error) {
      console.error('Error updating store:', error);
      toast.error('Error al actualizar la tienda');
    } finally {
      setSaving(false);
    }
  };

  const handleDownloadQR = () => {
    if (!storeData?.qrCode) return;
    
    const link = document.createElement('a');
    link.href = storeData.qrCode;
    link.download = `qr-${storeData.slug || store?.slug || 'store'}.png`;
    link.click();
    toast.success('QR descargado');
  };

  const getStoreUrl = () => {
    if (typeof window === 'undefined') return '';
    return `${window.location.origin}/store/${storeData?.slug || store?.slug || ''}`;
  };

  const copyStoreUrl = () => {
    const url = getStoreUrl();
    navigator.clipboard.writeText(url);
    toast.success('URL copiada al portapapeles');
  };

  const shareStore = async () => {
    const url = getStoreUrl();
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: storeData?.name || store?.name || 'Store',
          text: `Visita ${storeData?.name || store?.name || 'Store'}`,
          url: url
        });
      } catch {
        // Share cancelled
      }
    } else {
      copyStoreUrl();
    }
  };

  if (loading) {
    return (
      <Card className="bg-card rounded-2xl border border-border/50">
        <CardContent className="p-8">
          <div className="flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const displayStore = storeData || store;
  
  if (!displayStore) {
    return (
      <Card className="bg-card rounded-2xl border border-border/50">
        <CardContent className="p-8">
          <div className="flex items-center justify-center">
            <p className="text-muted-foreground">No se encontró información de la tienda</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* QR Code Card */}
      <Card className="bg-card rounded-2xl border border-border/50 transition-all duration-200 hover:shadow-md">
        <CardHeader className="px-6 pt-6 pb-4">
          <CardTitle className="flex items-center gap-2 text-lg lg:text-xl mb-2">
            <QrCode className="w-5 h-5 text-brand-600 dark:text-brand-400" />
            Código QR de la Tienda
          </CardTitle>
          <CardDescription className="text-sm">
            Comparte este código QR para que los clientes accedan a tu tienda
          </CardDescription>
        </CardHeader>
        <CardContent className="px-6 pb-6 pt-4">
          {displayStore.qrCode ? (
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-brand-50 to-brand-100 dark:from-brand-500/10 dark:to-brand-500/20 rounded-2xl p-8 flex items-center justify-center">
                <div className="bg-white dark:bg-gray-900 p-4 rounded-xl shadow-lg">
                  <img
                    src={displayStore.qrCode}
                    alt="Store QR Code"
                    className="w-full max-w-[280px] h-auto"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={handleDownloadQR}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-xl transition-colors font-semibold text-sm"
                >
                  <Download className="w-4 h-4" />
                  Descargar QR
                </button>
                <button
                  onClick={shareStore}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors font-semibold text-sm"
                >
                  <Share2 className="w-4 h-4" />
                  Compartir
                </button>
              </div>

              <div className="bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/30 rounded-xl p-4">
                <p className="text-sm text-blue-900 dark:text-blue-300 font-medium mb-2">
                  💡 Cómo funciona:
                </p>
                <ol className="text-xs text-blue-800 dark:text-blue-400 space-y-1">
                  <li>1. Descarga el código QR</li>
                  <li>2. Imprímelo o muéstralo digitalmente</li>
                  <li>3. Los clientes escanean y ven los productos</li>
                </ol>
              </div>
            </div>
          ) : (
            <div className="bg-muted rounded-xl p-8 text-center">
              <QrCode className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">QR-Code wird generiert...</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Store Info Card */}
      <Card className="bg-card rounded-2xl border border-border/50 transition-all duration-200 hover:shadow-md">
        <CardHeader className="px-6 pt-6 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-lg lg:text-xl mb-2">
                Información de la Tienda
              </CardTitle>
              <CardDescription className="text-sm">
                Gestión de información básica de la tienda
              </CardDescription>
            </div>
            {!editing && (
              <button
                onClick={() => setEditing(true)}
                className="flex items-center gap-2 px-3 py-2 text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-500/10 rounded-lg transition-colors text-sm"
              >
                <Edit2 className="w-4 h-4" />
                Editar
              </button>
            )}
          </div>
        </CardHeader>
        <CardContent className="px-6 pb-6 pt-4">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                Nombre de la Tienda
              </label>
              {editing ? (
                <input
                  type="text"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-300 bg-background text-foreground text-sm"
                />
              ) : (
                <p className="text-base font-medium text-foreground">{displayStore.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                Slug (URL)
              </label>
              <div className="flex items-center gap-2">
                <p className="text-xs text-muted-foreground font-mono bg-muted px-3 py-2 rounded-lg flex-1 break-all">
                  {displayStore.slug}
                </p>
                <button
                  onClick={copyStoreUrl}
                  className="p-2 hover:bg-muted rounded-lg transition-colors flex-shrink-0"
                  title="Copiar URL"
                >
                  <Copy className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                Logo URL (opcional)
              </label>
              {editing ? (
                <input
                  type="text"
                  value={storeLogo}
                  onChange={(e) => setStoreLogo(e.target.value)}
                  placeholder="https://example.com/logo.png"
                  className="w-full px-4 py-3 border-2 border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-300 bg-background text-foreground placeholder:text-muted-foreground text-sm"
                />
              ) : (
                <p className="text-sm text-muted-foreground">
                  {displayStore.logo || 'Sin logo'}
                </p>
              )}
            </div>

            {editing && (
              <div className="flex gap-3 pt-4 border-t border-border">
                <button
                  onClick={() => {
                    setEditing(false);
                    setStoreName(displayStore.name);
                    setStoreLogo(displayStore.logo || '');
                  }}
                  className="flex-1 px-4 py-2.5 bg-muted hover:bg-muted/80 text-foreground rounded-xl font-semibold transition-colors text-sm"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-brand-600 text-white rounded-xl hover:bg-brand-700 transition-colors font-semibold disabled:opacity-50 text-sm"
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  Guardar Cambios
                </button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Public Link Card */}
      <Card className="bg-card rounded-2xl border border-border/50 transition-all duration-200 hover:shadow-md">
        <CardHeader className="px-6 pt-6 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-lg lg:text-xl mb-2">
                Enlace Público
              </CardTitle>
              <CardDescription className="text-sm">
                URL que los clientes pueden usar para acceder a la tienda
              </CardDescription>
            </div>
            <button
              onClick={copyStoreUrl}
              className="flex items-center gap-2 px-3 py-2 text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-500/10 rounded-lg transition-colors text-sm"
            >
              <Copy className="w-4 h-4" />
              Copiar
            </button>
          </div>
        </CardHeader>
        <CardContent className="px-6 pb-6 pt-4">
          <div className="bg-muted rounded-xl p-4 font-mono text-xs break-all mb-3" suppressHydrationWarning>
            {getStoreUrl()}
          </div>
          <p className="text-xs text-muted-foreground">
            Los clientes pueden visitar este enlace para ver los productos de la tienda
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

