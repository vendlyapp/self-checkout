'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Settings, Save, Power, PowerOff, Mail, User, MapPin, Calendar, AlertCircle, CheckCircle, StoreIcon } from 'lucide-react';
import { SuperAdminService, type Store } from '@/lib/services/superAdminService';

interface StoreConfigurationProps {
  store: Store | null;
  onUpdate: () => void;
}

export default function StoreConfiguration({ store, onUpdate }: StoreConfigurationProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: store?.name || '',
    slug: store?.slug || '',
    isActive: store?.isActive ?? true,
    isOpen: store?.isOpen ?? true,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    
    // Normalize slug to lowercase and remove invalid characters
    let processedValue = value;
    if (name === 'slug') {
      processedValue = value.toLowerCase().replace(/[^a-z0-9-]/g, '');
    }
    
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : processedValue,
    }));
    // Clear messages when user starts typing
    setSuccess(false);
    setError(null);
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(false);
      
      const response = await SuperAdminService.updateStore(store?.id || '', {
        name: formData.name,
        slug: formData.slug,
        isActive: formData.isActive,
        isOpen: formData.isOpen,
      });

      if (response.success) {
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
          onUpdate();
        }, 2000);
      } else {
        setError(response.error || 'Error al actualizar la tienda');
      }
    } catch (error) {
      console.error('Error updating store:', error);
      setError(error instanceof Error ? error.message : 'Error al actualizar la tienda');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(false);
      
      const response = await SuperAdminService.toggleStoreStatus(store?.id || '', !formData.isActive);
      if (response.success) {
        setFormData((prev) => ({ ...prev, isActive: !prev.isActive }));
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
          onUpdate();
        }, 2000);
      } else {
        setError(response.error || 'Error al cambiar el estado');
      }
    } catch (error) {
      console.error('Error toggling status:', error);
      setError(error instanceof Error ? error.message : 'Error al cambiar el estado');
    } finally {
      setLoading(false);
    }
  };

  const hasChanges = 
    formData.name !== store?.name ||
    formData.slug !== store?.slug ||
    formData.isActive !== store?.isActive ||
    formData.isOpen !== store?.isOpen;

  return (
    <div className="space-y-6">
      {/* Success/Error Messages */}
      {success && (
        <Card className="bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/30 rounded-xl">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
              <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
                Tienda actualizada exitosamente
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {error && (
        <Card className="bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/30 rounded-xl">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
              <p className="text-sm font-medium text-red-700 dark:text-red-400">{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Configuración General */}
      <Card className="bg-card rounded-2xl border border-border/50 transition-ios hover:shadow-md">
        <CardHeader className="pb-6">
          <CardTitle className="flex items-center gap-2 text-lg lg:text-xl mb-2 mt-4">
            <Settings className="w-5 h-5 text-brand-600 dark:text-brand-400" />
            Configuración General
          </CardTitle>
          <CardDescription className="text-sm">
            Administra la información básica y el estado de la tienda
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8 px-6 pb-6">
          {/* Información Básica */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2.5">
                Nombre de la Tienda
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-300 bg-background text-foreground placeholder:text-muted-foreground transition-all"
                placeholder="Nombre de la tienda"
              />
              <p className="text-xs text-muted-foreground mt-2">
                Este nombre será visible para los clientes
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-foreground mb-2.5">
                Slug (URL)
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="slug"
                  value={formData.slug}
                  onChange={handleInputChange}
                  pattern="[a-z0-9-]+"
                  className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-300 bg-background text-foreground placeholder:text-muted-foreground transition-all lowercase"
                  placeholder="slug-de-la-tienda"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                URL única para la tienda. Solo letras minúsculas, números y guiones. Se convertirá automáticamente a minúsculas.
              </p>
            </div>
          </div>

          {/* Estados */}
          <div className="pt-8 border-t border-border/50 space-y-6">
            <h3 className="text-sm font-semibold text-foreground mb-1">Estado de la Tienda</h3>
            
            <div className="flex items-center justify-between gap-4 p-5 bg-muted/30 rounded-xl border border-border/50">
              <div className="flex items-center gap-4 flex-1">
                <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${
                  formData.isActive 
                    ? 'bg-emerald-50 dark:bg-emerald-500/15' 
                    : 'bg-muted'
                }`}>
                  {formData.isActive ? (
                    <Power className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <PowerOff className="w-6 h-6 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground mb-1">
                    {formData.isActive ? 'Tienda Activa' : 'Tienda Inactiva'}
                  </p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {formData.isActive 
                      ? 'La tienda está operativa y visible para clientes' 
                      : 'La tienda está desactivada y no es accesible'}
                  </p>
                </div>
              </div>
              <button
                onClick={handleToggleStatus}
                disabled={loading}
                className={`flex-shrink-0 px-5 py-2.5 rounded-lg text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                  formData.isActive
                    ? 'bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20'
                    : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:hover:bg-emerald-500/20'
                }`}
              >
                {formData.isActive ? (
                  <>
                    <PowerOff className="w-4 h-4 inline mr-2" />
                    Desactivar
                  </>
                ) : (
                  <>
                    <Power className="w-4 h-4 inline mr-2" />
                    Activar
                  </>
                )}
              </button>
            </div>

            <div className="flex items-center justify-between gap-4 p-5 bg-muted/30 rounded-xl border border-border/50">
              <div className="flex items-center gap-4 flex-1">
                <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${
                  formData.isOpen 
                    ? 'bg-emerald-50 dark:bg-emerald-500/15' 
                    : 'bg-orange-50 dark:bg-orange-500/15'
                }`}>
                  <StoreIcon className={`w-6 h-6 ${
                    formData.isOpen 
                      ? 'text-emerald-600 dark:text-emerald-400' 
                      : 'text-orange-600 dark:text-orange-400'
                  }`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground mb-1">
                    {formData.isOpen ? 'Tienda Abierta' : 'Tienda Cerrada'}
                  </p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {formData.isOpen 
                      ? 'La tienda está abierta y acepta pedidos' 
                      : 'La tienda está cerrada temporalmente'}
                  </p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                <input
                  type="checkbox"
                  name="isOpen"
                  checked={formData.isOpen}
                  onChange={handleInputChange}
                  className="sr-only peer"
                  disabled={loading}
                />
                <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brand-500/20 dark:peer-focus:ring-brand-500/30 rounded-full peer dark:bg-muted peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
              </label>
            </div>
          </div>

          {/* Información del Propietario */}
          <div className="pt-8 border-t border-border/50">
            <h3 className="text-sm font-semibold text-foreground mb-4">Información del Propietario</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-xl border border-border/50">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-brand-50 dark:bg-brand-500/15 flex items-center justify-center">
                  <User className="w-6 h-6 text-brand-600 dark:text-brand-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground mb-1">Nombre</p>
                  <p className="text-sm font-semibold text-foreground truncate">{store?.ownerName || 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-xl border border-border/50">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-brand-50 dark:bg-brand-500/15 flex items-center justify-center">
                  <Mail className="w-6 h-6 text-brand-600 dark:text-brand-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground mb-1">Email</p>
                  <p className="text-sm font-semibold text-foreground truncate">{store?.ownerEmail || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Información Adicional */}
          <div className="pt-8 border-t border-border/50">
            <h3 className="text-sm font-semibold text-foreground mb-4">Información Adicional</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-xl border border-border/50">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground mb-1">Fecha de Creación</p>
                  <p className="text-sm font-semibold text-foreground">
                    {new Date(store?.createdAt || '').toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-xl border border-border/50">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground mb-1">ID de Tienda</p>
                  <p className="text-sm font-mono text-foreground font-semibold truncate">{store?.id}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Botón Guardar */}
          <div className="pt-8 border-t border-border/50">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex-1">
                <button
                  onClick={handleSave}
                  disabled={loading || !hasChanges}
                  className="w-full sm:w-auto px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Guardar Cambios
                    </>
                  )}
                </button>
              </div>
              {!hasChanges && (
                <p className="text-xs text-muted-foreground text-center sm:text-left">
                  Keine ausstehenden Änderungen zum Speichern
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
