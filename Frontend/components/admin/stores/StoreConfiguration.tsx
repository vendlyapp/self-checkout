'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Settings, Save, Power, PowerOff, Mail, User, MapPin, Calendar, AlertCircle, CheckCircle, StoreIcon, CreditCard, Shield, ShieldOff, CheckCircle2, XCircle, PauseCircle } from 'lucide-react';
import { SuperAdminService, type Store } from '@/lib/services/superAdminService';
import { usePaymentMethods } from '@/hooks/queries/usePaymentMethods';
import { useUpdatePaymentMethod } from '@/hooks/mutations/usePaymentMethodMutations';
import { getPaymentMethodIcon, isSvgIcon } from '@/lib/utils/paymentMethodIcons';
import Image from 'next/image';
import { Loader } from '@/components/ui/Loader';
import type { PaymentMethod as ApiPaymentMethod } from '@/hooks/queries/usePaymentMethods';

interface StoreConfigurationProps {
  store: Store | null;
  onUpdate: () => void;
}

interface PaymentMethodDisplay {
  id: string;
  name: string;
  icon: React.ReactNode;
  isActive: boolean;
  disabledBySuperAdmin?: boolean;
  apiMethod: ApiPaymentMethod;
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

  // Payment Methods State
  const { data: paymentMethodsData, isLoading: methodsLoading, refetch: refetchPaymentMethods } = usePaymentMethods({
    storeId: store?.id || '',
    activeOnly: false,
  });
  const updatePaymentMethod = useUpdatePaymentMethod();
  const [modalContainer, setModalContainer] = useState<HTMLElement | null>(null);
  const [updatingMethodName, setUpdatingMethodName] = useState<string | null>(null);

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

  // Setup modal container for payment methods
  useEffect(() => {
    if (typeof window !== 'undefined') {
      let container = document.getElementById('global-modals-container');
      if (!container) {
        container = document.createElement('div');
        container.id = 'global-modals-container';
        container.style.position = 'fixed';
        container.style.top = '0';
        container.style.left = '0';
        container.style.width = '100%';
        container.style.height = '100%';
        container.style.pointerEvents = 'none';
        container.style.zIndex = '99999';
        document.body.appendChild(container);
      }
      setModalContainer(container);
    }
  }, []);

  // Map payment methods
  const paymentMethods: PaymentMethodDisplay[] = paymentMethodsData?.map((method) => {
    const isSvg = isSvgIcon(method.icon);
    const iconPath = method.icon;
    
    const iconElement = isSvg && iconPath ? (
      <div className="w-10 h-10 rounded-lg flex items-center justify-center overflow-hidden bg-white border border-gray-200 dark:border-gray-700">
        <Image 
          src={iconPath} 
          alt={`${method.displayName} icon`}
          width={40}
          height={40}
          className="object-contain"
        />
      </div>
    ) : (
      <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-gray-100 dark:bg-gray-800">
        {(() => {
          const IconComponent = getPaymentMethodIcon(method.icon);
          return <IconComponent className="w-6 h-6 text-gray-600 dark:text-gray-400" />;
        })()}
      </div>
    );

    return {
      id: method.id,
      name: method.displayName,
      icon: iconElement,
      isActive: method.isActive,
      disabledBySuperAdmin: method.disabledBySuperAdmin || false,
      apiMethod: method,
    };
  }) || [];

  const handleTogglePaymentMethod = async (id: string) => {
    const method = paymentMethods.find(m => m.id === id);
    if (!method) return;

    setUpdatingMethodName(method.name);

    try {
      await updatePaymentMethod.mutateAsync({
        id: method.id,
        data: {
          isActive: !method.isActive,
        },
      });
      await refetchPaymentMethods();
    } catch (error) {
      console.error('Fehler beim Aktualisieren der Zahlungsmethode:', error);
    } finally {
      setUpdatingMethodName(null);
    }
  };

  const handleToggleDisabledPaymentMethod = async (id: string) => {
    const method = paymentMethods.find(m => m.id === id);
    if (!method) return;

    setUpdatingMethodName(method.name);

    try {
      await updatePaymentMethod.mutateAsync({
        id: method.id,
        data: {
          disabledBySuperAdmin: !method.disabledBySuperAdmin,
        },
      });
      // Forzar refetch inmediato y limpiar caché
      setTimeout(() => {
        refetchPaymentMethods();
      }, 500);
    } catch (error) {
      console.error('Fehler beim Aktualisieren der Zahlungsmethode:', error);
    } finally {
      setUpdatingMethodName(null);
    }
  };

  // Separate payment methods by status
  const activePaymentMethods = paymentMethods.filter(method => method.isActive && !method.disabledBySuperAdmin);
  const inactivePaymentMethods = paymentMethods.filter(method => !method.isActive && !method.disabledBySuperAdmin);
  const disabledPaymentMethods = paymentMethods.filter(method => method.disabledBySuperAdmin);

  const isLoadingPaymentModal = updatePaymentMethod.isPending && updatingMethodName && modalContainer;

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
                Dieser Name wird für Kunden sichtbar sein
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
            <h3 className="text-sm font-semibold text-foreground mb-1">Geschäftsstatus</h3>
            
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
                    {formData.isActive ? 'Geschäft Aktiv' : 'Geschäft Inaktiv'}
                  </p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {formData.isActive 
                      ? 'Das Geschäft ist betriebsbereit und für Kunden sichtbar' 
                      : 'Das Geschäft ist deaktiviert und nicht zugänglich'}
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
                    Deaktivieren
                  </>
                ) : (
                  <>
                    <Power className="w-4 h-4 inline mr-2" />
                    Aktivieren
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
                    {formData.isOpen ? 'Geschäft Geöffnet' : 'Geschäft Geschlossen'}
                  </p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {formData.isOpen 
                      ? 'Das Geschäft ist geöffnet und nimmt Bestellungen entgegen' 
                      : 'Das Geschäft ist vorübergehend geschlossen'}
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

      {/* Payment Methods Section */}
      <Card className="bg-card rounded-2xl border border-border/50 transition-ios hover:shadow-md">
        <CardHeader className="pb-6">
          <CardTitle className="flex items-center gap-2 text-lg lg:text-xl mb-2 mt-4">
            <CreditCard className="w-5 h-5 text-brand-600 dark:text-brand-400" />
            Métodos de Pago
          </CardTitle>
          <CardDescription className="text-sm">
            Administra los métodos de pago disponibles para esta tienda
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8 px-6 pb-6">
          {/* Payment Methods Loading Modal */}
          {isLoadingPaymentModal && createPortal(
            <div
              className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
              style={{ pointerEvents: 'auto' }}
            >
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm animate-fade-in" />
              <div className="relative w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-xl animate-scale-in gpu-accelerated">
                <div className="p-8 text-center">
                  <Loader size="lg" className="mb-6" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {updatingMethodName ? (() => {
                      const method = paymentMethods.find(m => m.name === updatingMethodName);
                      if (!method) return 'Zahlungsmethode wird aktualisiert...';
                      const isTogglingDisabled = method.disabledBySuperAdmin !== undefined;
                      if (isTogglingDisabled && method.disabledBySuperAdmin) {
                        return 'Zahlungsmethode wird aktiviert...';
                      } else if (isTogglingDisabled && !method.disabledBySuperAdmin) {
                        return 'Zahlungsmethode wird deaktiviert...';
                      }
                      return method.isActive
                        ? 'Zahlungsmethode wird deaktiviert...'
                        : 'Zahlungsmethode wird aktiviert...';
                    })() : (
                      'Zahlungsmethode wird aktualisiert...'
                    )}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Bitte warten Sie einen Moment
                  </p>
                </div>
              </div>
            </div>,
            modalContainer
          )}

          {methodsLoading ? (
            <div className="flex items-center justify-center gap-3 py-8">
              <Loader size="sm" />
              <p className="text-sm text-muted-foreground">Cargando métodos de pago...</p>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Active Payment Methods */}
              {activePaymentMethods.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-500/10">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-foreground">Métodos Activos</h3>
                      <p className="text-xs text-muted-foreground">Disponibles para los clientes</p>
                    </div>
                    <span className="ml-auto px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400">
                      {activePaymentMethods.length}
                    </span>
                  </div>
                  <div className="grid gap-3">
                    {activePaymentMethods.map((method) => (
                      <div
                        key={method.id}
                        className="group p-4 bg-gradient-to-r from-emerald-50/50 to-transparent dark:from-emerald-500/5 dark:to-transparent rounded-xl border-2 border-emerald-200/50 dark:border-emerald-500/20 hover:border-emerald-300 dark:hover:border-emerald-500/30 hover:shadow-md transition-all duration-200"
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-4 flex-1 min-w-0">
                            <div className="relative">
                              {method.icon}
                              <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white dark:border-gray-900 flex items-center justify-center">
                                <CheckCircle2 className="w-2.5 h-2.5 text-white" />
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <h4 className="text-sm font-semibold text-foreground truncate">
                                  {method.name}
                                </h4>
                                <span className="px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400">
                                  Activo
                                </span>
                              </div>
                              <p className="text-xs text-muted-foreground mt-0.5 font-mono">
                                {method.apiMethod.code}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => !updatePaymentMethod.isPending && handleTogglePaymentMethod(method.id)}
                              disabled={updatePaymentMethod.isPending}
                              className={`relative inline-flex h-7 w-12 items-center rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${
                                method.isActive 
                                  ? 'bg-emerald-500 shadow-sm shadow-emerald-500/30' 
                                  : 'bg-gray-300 dark:bg-gray-600'
                              }`}
                              role="switch"
                              aria-checked={method.isActive}
                              title={method.isActive ? 'Deaktivieren' : 'Aktivieren'}
                            >
                              <span
                                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-all duration-200 ${
                                  method.isActive ? 'translate-x-6' : 'translate-x-1'
                                }`}
                              />
                            </button>
                            <button
                              onClick={() => !updatePaymentMethod.isPending && handleToggleDisabledPaymentMethod(method.id)}
                              disabled={updatePaymentMethod.isPending}
                              className="px-3 py-1.5 text-xs font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/15 rounded-lg hover:bg-red-100 dark:hover:bg-red-500/25 border border-red-200 dark:border-red-500/30 transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                              title="Zahlungsmethode deaktivieren"
                            >
                              <ShieldOff className="w-3.5 h-3.5" />
                              Deaktivieren
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Inactive Payment Methods */}
              {inactivePaymentMethods.length > 0 && (
                <div className="space-y-4 pt-6 border-t border-border/50">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800">
                      <PauseCircle className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-foreground">Inaktive Methoden</h3>
                      <p className="text-xs text-muted-foreground">Nicht verfügbar für Kunden</p>
                    </div>
                    <span className="ml-auto px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400">
                      {inactivePaymentMethods.length}
                    </span>
                  </div>
                  <div className="grid gap-3">
                    {inactivePaymentMethods.map((method) => (
                      <div
                        key={method.id}
                        className="group p-4 bg-muted/30 rounded-xl border border-border/50 hover:border-gray-300 dark:hover:border-gray-700 hover:shadow-sm transition-all duration-200"
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-4 flex-1 min-w-0">
                            <div className="opacity-60">{method.icon}</div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <h4 className="text-sm font-semibold text-foreground truncate">
                                  {method.name}
                                </h4>
                                <span className="px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400">
                                  Inaktiv
                                </span>
                              </div>
                              <p className="text-xs text-muted-foreground mt-0.5 font-mono">
                                {method.apiMethod.code}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => !updatePaymentMethod.isPending && handleTogglePaymentMethod(method.id)}
                              disabled={updatePaymentMethod.isPending}
                              className={`relative inline-flex h-7 w-12 items-center rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${
                                method.isActive 
                                  ? 'bg-emerald-500 shadow-sm shadow-emerald-500/30' 
                                  : 'bg-gray-300 dark:bg-gray-600'
                              }`}
                              role="switch"
                              aria-checked={method.isActive}
                              title={method.isActive ? 'Deaktivieren' : 'Aktivieren'}
                            >
                              <span
                                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-all duration-200 ${
                                  method.isActive ? 'translate-x-6' : 'translate-x-1'
                                }`}
                              />
                            </button>
                            <button
                              onClick={() => !updatePaymentMethod.isPending && handleToggleDisabledPaymentMethod(method.id)}
                              disabled={updatePaymentMethod.isPending}
                              className="px-3 py-1.5 text-xs font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/15 rounded-lg hover:bg-red-100 dark:hover:bg-red-500/25 border border-red-200 dark:border-red-500/30 transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                              title="Zahlungsmethode deaktivieren"
                            >
                              <ShieldOff className="w-3.5 h-3.5" />
                              Deaktivieren
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Disabled Payment Methods */}
              {disabledPaymentMethods.length > 0 && (
                <div className="space-y-4 pt-6 border-t-2 border-orange-200 dark:border-orange-500/30">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-orange-50 dark:bg-orange-500/10">
                      <Shield className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-foreground">Deaktiviert durch Super Admin</h3>
                      <p className="text-xs text-muted-foreground">Gesperrt für Geschäftsadmin</p>
                    </div>
                    <span className="ml-auto px-2.5 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400">
                      {disabledPaymentMethods.length}
                    </span>
                  </div>
                  <div className="grid gap-3">
                    {disabledPaymentMethods.map((method) => (
                      <div
                        key={method.id}
                        className="group p-4 bg-gradient-to-r from-orange-50/30 to-transparent dark:from-orange-500/5 dark:to-transparent rounded-xl border-2 border-orange-200/50 dark:border-orange-500/20 hover:border-orange-300 dark:hover:border-orange-500/30 hover:shadow-md transition-all duration-200"
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-4 flex-1 min-w-0">
                            <div className="relative opacity-60">
                              {method.icon}
                              <div className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 rounded-full border-2 border-white dark:border-gray-900 flex items-center justify-center">
                                <Shield className="w-2.5 h-2.5 text-white" />
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <h4 className="text-sm font-semibold text-foreground truncate">
                                  {method.name}
                                </h4>
                                <span className="px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400">
                                  Deaktiviert
                                </span>
                              </div>
                              <p className="text-xs text-muted-foreground mt-0.5 font-mono">
                                {method.apiMethod.code}
                              </p>
                              <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                                {method.isActive ? 'Aktiv aber gesperrt' : 'Inaktiv und gesperrt'}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => !updatePaymentMethod.isPending && handleTogglePaymentMethod(method.id)}
                              disabled={updatePaymentMethod.isPending}
                              className={`relative inline-flex h-7 w-12 items-center rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${
                                method.isActive 
                                  ? 'bg-emerald-500 shadow-sm shadow-emerald-500/30' 
                                  : 'bg-gray-300 dark:bg-gray-600'
                              }`}
                              role="switch"
                              aria-checked={method.isActive}
                              title={method.isActive ? 'Deaktivieren' : 'Aktivieren'}
                            >
                              <span
                                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-all duration-200 ${
                                  method.isActive ? 'translate-x-6' : 'translate-x-1'
                                }`}
                              />
                            </button>
                            <button
                              onClick={() => !updatePaymentMethod.isPending && handleToggleDisabledPaymentMethod(method.id)}
                              disabled={updatePaymentMethod.isPending}
                              className="px-3 py-1.5 text-xs font-semibold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-500/15 rounded-lg hover:bg-brand-100 dark:hover:bg-brand-500/25 border-2 border-brand-300 dark:border-brand-500/40 transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 shadow-sm"
                              title="Zahlungsmethode aktivieren - Erlauben, dass der Geschäftsadmin es wieder verwendet"
                            >
                              <Shield className="w-3.5 h-3.5" />
                              Aktivieren
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {paymentMethods.length === 0 && !methodsLoading && (
                <div className="text-center py-8">
                  <CreditCard className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">
                    Keine Zahlungsmethoden für dieses Geschäft konfiguriert
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
