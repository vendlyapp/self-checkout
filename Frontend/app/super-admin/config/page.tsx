'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Settings, CreditCard, Shield, ShieldOff, CheckCircle2, AlertCircle, Loader as LoaderIcon } from 'lucide-react';
import { AVAILABLE_PAYMENT_METHODS } from '@/lib/constants/paymentMethods';
import { getPaymentMethodIcon, isSvgIcon } from '@/lib/utils/paymentMethodIcons';
import Image from 'next/image';
import { Loader } from '@/components/ui/Loader';
import { AdminPageHeader } from '@/components/admin/common';
import { buildApiUrl, getAuthHeaders } from '@/lib/config/api';
import { toast } from 'sonner';

interface GlobalPaymentMethodConfig {
  code: string;
  disabledGlobally: boolean;
}

export default function SuperAdminConfigPage() {
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [globalConfigs, setGlobalConfigs] = useState<Record<string, GlobalPaymentMethodConfig>>({});
  const [error, setError] = useState<string | null>(null);

  // Initialize with all available payment methods
  useEffect(() => {
    const initialConfigs: Record<string, GlobalPaymentMethodConfig> = {};
    AVAILABLE_PAYMENT_METHODS.forEach((method) => {
      if (method.code.toLowerCase() !== 'bargeld') {
        // Bargeld no puede ser deshabilitado globalmente
        initialConfigs[method.code] = {
          code: method.code,
          disabledGlobally: false,
        };
      }
    });
    setGlobalConfigs(initialConfigs);
    fetchGlobalConfigs();
  }, []);

  const fetchGlobalConfigs = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { supabase } = await import('@/lib/supabase/client');
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        throw new Error('No estás autenticado');
      }

      const url = buildApiUrl('/api/super-admin/payment-methods/global-config');
      const headers = getAuthHeaders(session.access_token);

      const response = await fetch(url, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success && result.data) {
        // Merge fetched configs with initial configs
        setGlobalConfigs((prev) => {
          const merged = { ...prev };
          result.data.forEach((config: GlobalPaymentMethodConfig) => {
            merged[config.code] = config;
          });
          return merged;
        });
      }
    } catch (error) {
      console.error('Error fetching global configs:', error);
      setError(error instanceof Error ? error.message : 'Error al cargar configuraciones');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleGlobalDisable = async (code: string) => {
    const method = AVAILABLE_PAYMENT_METHODS.find((m) => m.code === code);
    if (!method) return;

    // Bargeld no puede ser deshabilitado
    if (method.code.toLowerCase() === 'bargeld') {
      toast.error('Die Zahlungsmethode "Bargeld" kann nicht global deaktiviert werden');
      return;
    }

    setUpdating(code);

    try {
      const { supabase } = await import('@/lib/supabase/client');
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        throw new Error('No estás autenticado');
      }

      const currentState = globalConfigs[code]?.disabledGlobally || false;
      const newState = !currentState;

      const url = buildApiUrl('/api/super-admin/payment-methods/global-config');
      const headers = getAuthHeaders(session.access_token);

      const response = await fetch(url, {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          code,
          disabledGlobally: newState,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        setGlobalConfigs((prev) => ({
          ...prev,
          [code]: {
            code,
            disabledGlobally: newState,
          },
        }));
        toast.success(
          newState
            ? `Método "${method.displayName}" inhabilitado globalmente`
            : `Método "${method.displayName}" habilitado globalmente`
        );
      } else {
        throw new Error(result.error || 'Error al actualizar configuración');
      }
    } catch (error) {
      console.error('Error updating global config:', error);
      toast.error(error instanceof Error ? error.message : 'Error al actualizar configuración');
    } finally {
      setUpdating(null);
    }
  };

  const paymentMethodsToShow = AVAILABLE_PAYMENT_METHODS.filter(
    (method) => method.code.toLowerCase() !== 'bargeld'
  );

  const disabledMethods = paymentMethodsToShow.filter(
    (method) => globalConfigs[method.code]?.disabledGlobally === true
  );
  const enabledMethods = paymentMethodsToShow.filter(
    (method) => !globalConfigs[method.code]?.disabledGlobally
  );

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Configuración Global"
        description="Verwalten Sie Zahlungsmethoden auf Plattformebene. Deaktivierte Methoden sind für keine Geschäfte verfügbar."
      />

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

      <Card className="bg-card rounded-2xl border border-border/50 transition-ios hover:shadow-md">
        <CardHeader className="pb-6">
          <CardTitle className="flex items-center gap-2 text-lg lg:text-xl mb-2 mt-4">
            <CreditCard className="w-5 h-5 text-brand-600 dark:text-brand-400" />
            Globale Zahlungsmethoden
          </CardTitle>
          <CardDescription className="text-sm">
            Deaktivieren Sie Zahlungsmethoden für alle Geschäfte (nützlich für Wartung oder Probleme mit Integrationen)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8 px-6 pb-6">
          {loading ? (
            <div className="flex items-center justify-center gap-3 py-8">
              <Loader size="sm" />
              <p className="text-sm text-muted-foreground">Konfigurationen werden geladen...</p>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Enabled Methods */}
              {enabledMethods.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-500/10">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-foreground">Habilitados Globalmente</h3>
                      <p className="text-xs text-muted-foreground">Disponibles para todas las tiendas</p>
                    </div>
                    <span className="ml-auto px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400">
                      {enabledMethods.length}
                    </span>
                  </div>
                  <div className="grid gap-3">
                    {enabledMethods.map((method) => {
                      const isSvg = isSvgIcon(method.icon);
                      const iconElement = isSvg && method.icon ? (
                        <div className="w-12 h-12 rounded-lg flex items-center justify-center overflow-hidden bg-white border border-gray-200 dark:border-gray-700">
                          <Image 
                            src={method.icon} 
                            alt={`${method.displayName} icon`}
                            width={48}
                            height={48}
                            className="object-contain"
                          />
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                          {(() => {
                            const IconComponent = getPaymentMethodIcon(method.icon);
                            return <IconComponent className="w-6 h-6 text-gray-600 dark:text-gray-400" />;
                          })()}
                        </div>
                      );

                      return (
                        <div
                          key={method.code}
                          className="group p-4 bg-gradient-to-r from-emerald-50/50 to-transparent dark:from-emerald-500/5 dark:to-transparent rounded-xl border-2 border-emerald-200/50 dark:border-emerald-500/20 hover:border-emerald-300 dark:hover:border-emerald-500/30 hover:shadow-md transition-all duration-200"
                        >
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-4 flex-1 min-w-0">
                              {iconElement}
                              <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-semibold text-foreground">
                                  {method.displayName}
                                </h4>
                                <p className="text-xs text-muted-foreground mt-0.5 font-mono">
                                  {method.code}
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={() => handleToggleGlobalDisable(method.code)}
                              disabled={updating === method.code}
                              className="px-4 py-2 text-xs font-medium text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-500/15 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-500/25 border border-orange-200 dark:border-orange-500/30 transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                              title="Inhabilitar este método para todas las tiendas"
                            >
                              {updating === method.code ? (
                                <LoaderIcon className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <ShieldOff className="w-3.5 h-3.5" />
                              )}
                              Inhabilitar Globalmente
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Disabled Methods */}
              {disabledMethods.length > 0 && (
                <div className="space-y-4 pt-6 border-t-2 border-orange-200 dark:border-orange-500/30">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-orange-50 dark:bg-orange-500/10">
                      <Shield className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-foreground">Inhabilitados Globalmente</h3>
                      <p className="text-xs text-muted-foreground">Nicht verfügbar für Geschäfte</p>
                    </div>
                    <span className="ml-auto px-2.5 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400">
                      {disabledMethods.length}
                    </span>
                  </div>
                  <div className="grid gap-3">
                    {disabledMethods.map((method) => {
                      const isSvg = isSvgIcon(method.icon);
                      const iconElement = isSvg && method.icon ? (
                        <div className="w-12 h-12 rounded-lg flex items-center justify-center overflow-hidden bg-white border border-gray-200 dark:border-gray-700 opacity-60">
                          <Image 
                            src={method.icon} 
                            alt={`${method.displayName} icon`}
                            width={48}
                            height={48}
                            className="object-contain"
                          />
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-gray-100 dark:bg-gray-800 opacity-60">
                          {(() => {
                            const IconComponent = getPaymentMethodIcon(method.icon);
                            return <IconComponent className="w-6 h-6 text-gray-600 dark:text-gray-400" />;
                          })()}
                        </div>
                      );

                      return (
                        <div
                          key={method.code}
                          className="group p-4 bg-gradient-to-r from-orange-50/30 to-transparent dark:from-orange-500/5 dark:to-transparent rounded-xl border-2 border-orange-200/50 dark:border-orange-500/20 hover:border-orange-300 dark:hover:border-orange-500/30 hover:shadow-md transition-all duration-200"
                        >
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-4 flex-1 min-w-0">
                              {iconElement}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <h4 className="text-sm font-semibold text-foreground">
                                    {method.displayName}
                                  </h4>
                                  <span className="px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400">
                                    Inhabilitado
                                  </span>
                                </div>
                                <p className="text-xs text-muted-foreground mt-0.5 font-mono">
                                  {method.code}
                                </p>
                                <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                                  No disponible para ninguna tienda
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={() => handleToggleGlobalDisable(method.code)}
                              disabled={updating === method.code}
                              className="px-4 py-2 text-xs font-semibold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-500/15 rounded-lg hover:bg-brand-100 dark:hover:bg-brand-500/25 border-2 border-brand-300 dark:border-brand-500/40 transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm"
                              title="Habilitar este método para todas las tiendas"
                            >
                              {updating === method.code ? (
                                <LoaderIcon className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <Shield className="w-3.5 h-3.5" />
                              )}
                              Habilitar Globalmente
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

