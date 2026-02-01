'use client'

import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { usePaymentMethods } from '@/hooks/queries/usePaymentMethods'
import { useUpdatePaymentMethod } from '@/hooks/mutations/usePaymentMethodMutations'
import { getPaymentMethodIcon, isSvgIcon } from '@/lib/utils/paymentMethodIcons'
import Image from 'next/image'
import { CreditCard, AlertTriangle, Shield } from 'lucide-react'
import { Loader } from '@/components/ui/Loader'
import type { PaymentMethod as ApiPaymentMethod } from '@/hooks/queries/usePaymentMethods'

interface StorePaymentMethodsProps {
  storeId: string
}

interface PaymentMethodDisplay {
  id: string
  name: string
  icon: React.ReactNode
  isActive: boolean
  disabledBySuperAdmin?: boolean
  disabledGlobally?: boolean
  apiMethod: ApiPaymentMethod
}

const StorePaymentMethods = ({ storeId }: StorePaymentMethodsProps) => {
  const { data: paymentMethodsData, isLoading, refetch } = usePaymentMethods({
    storeId,
    activeOnly: false, // Obtener todos, activos e inactivos
  })

  const updatePaymentMethod = useUpdatePaymentMethod()
  const [modalContainer, setModalContainer] = useState<HTMLElement | null>(null)
  const [updatingMethodName, setUpdatingMethodName] = useState<string | null>(null)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      let container = document.getElementById('global-modals-container')
      if (!container) {
        container = document.createElement('div')
        container.id = 'global-modals-container'
        container.style.position = 'fixed'
        container.style.top = '0'
        container.style.left = '0'
        container.style.width = '100%'
        container.style.height = '100%'
        container.style.pointerEvents = 'none'
        container.style.zIndex = '99999'
        document.body.appendChild(container)
      }
      setModalContainer(container)
    }
  }, [])

  const paymentMethods: PaymentMethodDisplay[] = paymentMethodsData?.map((method) => {
    const isSvg = isSvgIcon(method.icon)
    const iconPath = method.icon
    
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
    )

    return {
      id: method.id,
      name: method.displayName,
      icon: iconElement,
      isActive: method.isActive,
      disabledBySuperAdmin: method.disabledBySuperAdmin || false,
      disabledGlobally: method.disabledGlobally || false,
      apiMethod: method,
    }
  }) || []

  const handleToggle = async (id: string) => {
    const method = paymentMethods.find(m => m.id === id)
    if (!method) return

    setUpdatingMethodName(method.name)

    try {
      await updatePaymentMethod.mutateAsync({
        id: method.id,
        data: {
          isActive: !method.isActive,
        },
      })
      await refetch()
    } catch (error) {
      console.error('Fehler beim Aktualisieren der Zahlungsmethode:', error)
    } finally {
      setUpdatingMethodName(null)
    }
  }

  const handleToggleDisabled = async (id: string) => {
    const method = paymentMethods.find(m => m.id === id)
    if (!method) return

    setUpdatingMethodName(method.name)

    try {
      await updatePaymentMethod.mutateAsync({
        id: method.id,
        data: {
          disabledBySuperAdmin: !method.disabledBySuperAdmin,
        },
      })
      await refetch()
    } catch (error) {
      console.error('Fehler beim Aktualisieren der Zahlungsmethode:', error)
    } finally {
      setUpdatingMethodName(null)
    }
  }

  // Separar métodos por estado
  // Activos: isActive = true y no restringidos
  const activeMethods = paymentMethods.filter(method => 
    method.isActive && !method.disabledBySuperAdmin && !method.disabledGlobally
  )
  // Inactivos: isActive = false y no restringidos
  const inactiveMethods = paymentMethods.filter(method => 
    !method.isActive && !method.disabledBySuperAdmin && !method.disabledGlobally
  )
  // Restringidos por super admin local: disabledBySuperAdmin = true
  const disabledBySuperAdminMethods = paymentMethods.filter(method => 
    method.disabledBySuperAdmin && !method.disabledGlobally
  )
  // Restringidos globalmente: disabledGlobally = true
  const globallyRestrictedMethods = paymentMethods.filter(method => method.disabledGlobally)

  const isLoadingModal = updatePaymentMethod.isPending && updatingMethodName && modalContainer

  if (isLoading) {
    return (
      <Card className="bg-card rounded-2xl border border-border/50">
        <CardContent className="p-8">
          <div className="flex items-center justify-center gap-3">
            <Loader size="sm" />
            <p className="text-sm text-muted-foreground">Zahlungsmethoden werden geladen...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      {/* Loading Modal */}
      {isLoadingModal && createPortal(
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          style={{ pointerEvents: 'auto' }}
        >
          {/* Backdrop */}
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm animate-fade-in" />

          {/* Modal */}
          <div className="relative w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-xl animate-scale-in gpu-accelerated">
            <div className="p-8 text-center">
              <Loader size="lg" className="mb-6" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {updatingMethodName ? (() => {
                  const method = paymentMethods.find(m => m.name === updatingMethodName)
                  if (!method) return 'Zahlungsmethode wird aktualisiert...'
                  
                  // Verificar si se está habilitando/deshabilitando (disabledBySuperAdmin)
                  const isTogglingDisabled = method.disabledBySuperAdmin !== undefined
                  if (isTogglingDisabled && method.disabledBySuperAdmin) {
                    return 'Einschränkung wird aufgehoben...'
                  } else if (isTogglingDisabled && !method.disabledBySuperAdmin) {
                    return 'Zahlungsmethode wird eingeschränkt...'
                  }
                  
                  // Verificar si se está activando/desactivando (isActive)
                  return method.isActive
                    ? 'Zahlungsmethode wird deaktiviert...'
                    : 'Zahlungsmethode wird aktiviert...'
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

      <Card className="bg-card rounded-2xl border border-border/50 p-6">
      <CardHeader className="pb-6">
        <CardTitle className="flex items-center gap-2 text-lg lg:text-xl mb-2">
          <CreditCard className="w-5 h-5 text-brand-600 dark:text-brand-400" />
          Zahlungsmethoden
        </CardTitle>
        <CardDescription className="text-sm">
          Verwalten Sie die Zahlungsmethoden für dieses Geschäft
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Aktive Methoden */}
        {activeMethods.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3">Aktiv</h3>
            <div className="space-y-3">
              {activeMethods.map((method) => (
                <div
                  key={method.id}
                  className="bg-muted/30 rounded-xl p-4 border border-border/50 hover:shadow-sm transition-all"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      {method.icon}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold text-foreground truncate">
                          {method.name}
                        </h4>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {method.apiMethod.code}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {/* Toggle Activar/Desactivar */}
                      <button
                        onClick={() => !updatePaymentMethod.isPending && handleToggle(method.id)}
                        disabled={updatePaymentMethod.isPending}
                        className={`relative inline-flex h-7 w-12 items-center rounded-full transition-ios-slow focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${
                          method.isActive 
                            ? 'bg-emerald-500 shadow-sm shadow-emerald-500/30' 
                            : 'bg-gray-300 dark:bg-gray-600'
                        }`}
                        role="switch"
                        aria-checked={method.isActive}
                        aria-label={`Toggle ${method.name}`}
                        title={method.isActive ? 'Deaktivieren' : 'Aktivieren'}
                      >
                        <span
                          className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-ios-slow ${
                            method.isActive 
                              ? 'translate-x-6' 
                              : 'translate-x-1'
                          }`}
                        />
                      </button>
                      {/* Button Deaktivieren */}
                      <button
                        onClick={() => !updatePaymentMethod.isPending && handleToggleDisabled(method.id)}
                        disabled={updatePaymentMethod.isPending}
                        className="px-3 py-1.5 text-xs font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/15 rounded-lg hover:bg-red-100 dark:hover:bg-red-500/25 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Zahlungsmethode einschränken"
                      >
                        Einschränken
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Inaktive Methoden */}
        {inactiveMethods.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3">Inaktiv</h3>
            <div className="space-y-3">
              {inactiveMethods.map((method) => (
                <div
                  key={method.id}
                  className="bg-muted/30 rounded-xl p-4 border border-border/50 hover:shadow-sm transition-all opacity-75"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      {method.icon}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold text-foreground truncate">
                          {method.name}
                        </h4>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {method.apiMethod.code}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {/* Toggle Activar/Desactivar */}
                      <button
                        onClick={() => !updatePaymentMethod.isPending && handleToggle(method.id)}
                        disabled={updatePaymentMethod.isPending}
                        className={`relative inline-flex h-7 w-12 items-center rounded-full transition-ios-slow focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${
                          method.isActive 
                            ? 'bg-emerald-500 shadow-sm shadow-emerald-500/30' 
                            : 'bg-gray-300 dark:bg-gray-600'
                        }`}
                        role="switch"
                        aria-checked={method.isActive}
                        aria-label={`Toggle ${method.name}`}
                        title={method.isActive ? 'Deaktivieren' : 'Aktivieren'}
                      >
                        <span
                          className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-ios-slow ${
                            method.isActive 
                              ? 'translate-x-6' 
                              : 'translate-x-1'
                          }`}
                        />
                      </button>
                      {/* Button Deaktivieren */}
                      <button
                        onClick={() => !updatePaymentMethod.isPending && handleToggleDisabled(method.id)}
                        disabled={updatePaymentMethod.isPending}
                        className="px-3 py-1.5 text-xs font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/15 rounded-lg hover:bg-red-100 dark:hover:bg-red-500/25 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Zahlungsmethode einschränken"
                      >
                        Einschränken
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Von Super Admin lokal eingeschränkte Methoden */}
        {disabledBySuperAdminMethods.length > 0 && (
          <div className="mt-6">
            <h3 className="text-sm font-semibold text-foreground mb-3">
              Eingeschränkt (lokal)
              <span className="ml-2 text-xs text-muted-foreground font-normal">
                ({disabledBySuperAdminMethods.length})
              </span>
            </h3>
            <div className="space-y-3">
              {disabledBySuperAdminMethods.map((method) => (
                <div
                  key={method.id}
                  className="bg-muted/30 rounded-xl p-4 border border-orange-200 dark:border-orange-500/30 hover:shadow-sm transition-all"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="opacity-70">
                        {method.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-sm font-semibold text-foreground truncate">
                            {method.name}
                          </h4>
                          <span className="px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400">
                            Eingeschränkt
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {method.apiMethod.code}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {/* Toggle Activar/Desactivar */}
                      <button
                        onClick={() => !updatePaymentMethod.isPending && handleToggle(method.id)}
                        disabled={updatePaymentMethod.isPending}
                        className={`relative inline-flex h-7 w-12 items-center rounded-full transition-ios-slow focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${
                          method.isActive 
                            ? 'bg-emerald-500 shadow-sm shadow-emerald-500/30' 
                            : 'bg-gray-300 dark:bg-gray-600'
                        }`}
                        role="switch"
                        aria-checked={method.isActive}
                        aria-label={`Toggle ${method.name}`}
                        title={method.isActive ? 'Deaktivieren' : 'Aktivieren'}
                      >
                        <span
                          className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-ios-slow ${
                            method.isActive 
                              ? 'translate-x-6' 
                              : 'translate-x-1'
                          }`}
                        />
                      </button>
                      {/* Botón Freischalten */}
                      <button
                        onClick={() => !updatePaymentMethod.isPending && handleToggleDisabled(method.id)}
                        disabled={updatePaymentMethod.isPending}
                        className="px-3 py-1.5 text-xs font-medium text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-500/15 rounded-lg hover:bg-brand-100 dark:hover:bg-brand-500/25 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Einschränkung aufheben"
                      >
                        Freischalten
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Global eingeschränkte Methoden - vom Super Admin */}
        {globallyRestrictedMethods.length > 0 && (
          <div className="mt-6 pt-6 border-t-2 border-orange-200 dark:border-orange-500/30">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1.5 rounded-lg bg-orange-50 dark:bg-orange-500/10">
                <Shield className="w-4 h-4 text-orange-600 dark:text-orange-400" />
              </div>
              <h3 className="text-sm font-semibold text-foreground">
                Eingeschränkt (global)
                <span className="ml-2 text-xs text-muted-foreground font-normal">
                  ({globallyRestrictedMethods.length})
                </span>
              </h3>
            </div>
            <div className="mb-3 p-3 bg-orange-50 dark:bg-orange-500/10 rounded-lg border border-orange-200 dark:border-orange-500/30">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-orange-700 dark:text-orange-400">
                  Diese Zahlungsmethoden wurden vom Super Admin global eingeschränkt und sind für alle Geschäfte nicht verfügbar.
                </p>
              </div>
            </div>
            <div className="space-y-3">
              {globallyRestrictedMethods.map((method) => (
                <div
                  key={method.id}
                  className="bg-muted/30 rounded-xl p-4 border-2 border-orange-200 dark:border-orange-500/30 hover:shadow-sm transition-all opacity-60"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="opacity-50">
                        {method.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-sm font-semibold text-foreground truncate">
                            {method.name}
                          </h4>
                          <span className="px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400">
                            Global eingeschränkt
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {method.apiMethod.code}
                        </p>
                        <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                          Vom Super Admin eingeschränkt
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <div className="px-3 py-1.5 text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 rounded-lg cursor-not-allowed">
                        Nicht verfügbar
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {paymentMethods.length === 0 && !isLoading && (
          <div className="text-center py-8">
            <CreditCard className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              Keine Zahlungsmethoden für dieses Geschäft konfiguriert
            </p>
          </div>
        )}
      </CardContent>
    </Card>
    </>
  )
}

export default StorePaymentMethods

