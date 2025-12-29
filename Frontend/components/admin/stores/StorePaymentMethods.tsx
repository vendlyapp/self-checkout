'use client'

import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { usePaymentMethods } from '@/hooks/queries/usePaymentMethods'
import { useUpdatePaymentMethod } from '@/hooks/mutations/usePaymentMethodMutations'
import { getPaymentMethodIcon, isSvgIcon } from '@/lib/utils/paymentMethodIcons'
import Image from 'next/image'
import { CreditCard, Loader2 } from 'lucide-react'
import ModernSpinner from '@/components/ui/ModernSpinner'
import type { PaymentMethod as ApiPaymentMethod } from '@/hooks/queries/usePaymentMethods'

interface StorePaymentMethodsProps {
  storeId: string
}

interface PaymentMethodDisplay {
  id: string
  name: string
  icon: React.ReactNode
  isActive: boolean
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

  const activeMethods = paymentMethods.filter(method => method.isActive)
  const inactiveMethods = paymentMethods.filter(method => !method.isActive)

  const isLoadingModal = updatePaymentMethod.isPending && updatingMethodName && modalContainer

  if (isLoading) {
    return (
      <Card className="bg-card rounded-2xl border border-border/50">
        <CardContent className="p-8">
          <div className="flex items-center justify-center gap-3">
            <Loader2 className="w-5 h-5 animate-spin text-brand-600 dark:text-brand-400" />
            <p className="text-sm text-muted-foreground">Cargando métodos de pago...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      {/* Modal de carga */}
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
              <ModernSpinner size="lg" color="brand" className="mb-6" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {updatingMethodName ? (
                  <>
                    {paymentMethods.find(m => m.name === updatingMethodName)?.isActive
                      ? 'Zahlungsmethode wird deaktiviert...'
                      : 'Zahlungsmethode wird aktiviert...'}
                  </>
                ) : (
                  'Actualizando método de pago...'
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
          Métodos de Pago
        </CardTitle>
        <CardDescription className="text-sm">
          Administra los métodos de pago disponibles para esta tienda
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Métodos Activos */}
        {activeMethods.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3">Activos</h3>
            <div className="space-y-3">
              {activeMethods.map((method) => (
                <div
                  key={method.id}
                  className="bg-muted/30 rounded-xl p-4 border border-border/50 hover:shadow-sm transition-all"
                >
                  <div className="flex items-center justify-between">
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
                    <button
                      onClick={() => !updatePaymentMethod.isPending && handleToggle(method.id)}
                      disabled={updatePaymentMethod.isPending}
                      className={`relative inline-flex h-7 w-12 items-center rounded-full transition-all duration-300 ease-out focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${
                        method.isActive 
                          ? 'bg-emerald-500 shadow-sm shadow-emerald-500/30' 
                          : 'bg-gray-300 dark:bg-gray-600'
                      }`}
                      role="switch"
                      aria-checked={method.isActive}
                      aria-label={`Toggle ${method.name}`}
                    >
                      <span
                        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-all duration-300 ease-out ${
                          method.isActive 
                            ? 'translate-x-6' 
                            : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Métodos Inactivos */}
        {inactiveMethods.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3">Inactivos</h3>
            <div className="space-y-3">
              {inactiveMethods.map((method) => (
                <div
                  key={method.id}
                  className="bg-muted/30 rounded-xl p-4 border border-border/50 hover:shadow-sm transition-all opacity-75"
                >
                  <div className="flex items-center justify-between">
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
                    <button
                      onClick={() => !updatePaymentMethod.isPending && handleToggle(method.id)}
                      disabled={updatePaymentMethod.isPending}
                      className={`relative inline-flex h-7 w-12 items-center rounded-full transition-all duration-300 ease-out focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${
                        method.isActive 
                          ? 'bg-emerald-500 shadow-sm shadow-emerald-500/30' 
                          : 'bg-gray-300 dark:bg-gray-600'
                      }`}
                      role="switch"
                      aria-checked={method.isActive}
                      aria-label={`Toggle ${method.name}`}
                    >
                      <span
                        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-all duration-300 ease-out ${
                          method.isActive 
                            ? 'translate-x-6' 
                            : 'translate-x-1'
                        }`}
                      />
                    </button>
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

