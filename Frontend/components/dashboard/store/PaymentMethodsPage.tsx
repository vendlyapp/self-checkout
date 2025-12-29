'use client'

import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import PaymentMethodCard from './PaymentMethodCard'
import { useMyStore } from '@/hooks/queries/useMyStore'
import { usePaymentMethods } from '@/hooks/queries/usePaymentMethods'
import { useUpdatePaymentMethod } from '@/hooks/mutations/usePaymentMethodMutations'
import { ModernSpinner } from '@/components/ui'
import ModernSpinnerComponent from '@/components/ui/ModernSpinner'
import { getPaymentMethodIcon, isSvgIcon } from '@/lib/utils/paymentMethodIcons'
import Image from 'next/image'
import type { PaymentMethod as ApiPaymentMethod } from '@/hooks/queries/usePaymentMethods'

export interface PaymentMethod {
  id: string
  name: string
  icon: React.ReactNode
  isActive: boolean
  apiMethod: ApiPaymentMethod
}

const PaymentMethodsPage = () => {
  // Obtener la tienda del usuario
  const { data: store, isLoading: storeLoading } = useMyStore()
  
  // Obtener métodos de pago de la API (todos, no solo activos)
  const { data: paymentMethodsData, isLoading: methodsLoading, refetch } = usePaymentMethods({
    storeId: store?.id || '',
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

  // Mapear métodos de la API al formato del componente
  const paymentMethods: PaymentMethod[] = paymentMethodsData?.map((method) => {
    const isSvg = isSvgIcon(method.icon)
    const iconPath = method.icon
    
    const iconElement = isSvg && iconPath ? (
      <div className="w-10 h-10 rounded-lg flex items-center justify-center overflow-hidden bg-white border border-gray-200">
        <Image 
          src={iconPath} 
          alt={`${method.displayName} icon`}
          width={40}
          height={40}
          className="object-contain"
        />
      </div>
    ) : (
      <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-gray-100">
        {React.createElement(getPaymentMethodIcon(method.icon), { className: 'w-6 h-6 text-gray-600' })}
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
      // Actualizar el método en el backend (invertir isActive)
      await updatePaymentMethod.mutateAsync({
        id: method.id,
        data: {
          isActive: !method.isActive,
        },
      })

      // Refetch para obtener los datos actualizados
      await refetch()
    } catch (error) {
      console.error('Fehler beim Aktualisieren der Zahlungsmethode:', error)
    } finally {
      setUpdatingMethodName(null)
    }
  }

  const activeMethods = paymentMethods.filter(method => method.isActive)
  const inactiveMethods = paymentMethods.filter(method => !method.isActive)

  if (storeLoading || methodsLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <ModernSpinner />
      </div>
    )
  }

  if (!store) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Keine Geschäftsinformationen gefunden</p>
      </div>
    )
  }

  const isLoadingModal = updatePaymentMethod.isPending && updatingMethodName && modalContainer

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
              <ModernSpinnerComponent size="lg" color="brand" className="mb-6" />
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

      <div className="space-y-6 animate-fade-in">
      {/* Aktive Section */}
      {activeMethods.length > 0 && (
        <div className="animate-slide-down">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Aktive</h2>
          <div className="space-y-3">
            {activeMethods.map((method, index) => (
              <div
                key={method.id}
                className="animate-fade-in-scale"
                style={{
                  animationDelay: `${index * 50}ms`,
                  animationFillMode: 'both',
                }}
              >
                <PaymentMethodCard
                  method={method}
                  onToggle={handleToggle}
                  isLoading={updatePaymentMethod.isPending}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Inaktive Section */}
      {inactiveMethods.length > 0 && (
        <div className="animate-slide-down">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Inaktive</h2>
          <div className="space-y-3">
            {inactiveMethods.map((method, index) => (
              <div
                key={method.id}
                className="animate-fade-in-scale"
                style={{
                  animationDelay: `${index * 50}ms`,
                  animationFillMode: 'both',
                }}
              >
                <PaymentMethodCard
                  method={method}
                  onToggle={handleToggle}
                  isLoading={updatePaymentMethod.isPending}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {paymentMethods.length === 0 && !methodsLoading && (
        <div className="text-center py-12">
          <p className="text-gray-500">Keine Zahlungsmethoden verfügbar</p>
        </div>
      )}
    </div>
    </>
  )
}

export default PaymentMethodsPage
