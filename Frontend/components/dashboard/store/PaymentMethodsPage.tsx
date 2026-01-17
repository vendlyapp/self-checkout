'use client'

import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import PaymentMethodCard from './PaymentMethodCard'
import ConfigurePaymentMethodModal from './ConfigurePaymentMethodModal'
import { useMyStore } from '@/hooks/queries/useMyStore'
import { usePaymentMethods, PaymentMethod as ApiPaymentMethod } from '@/hooks/queries/usePaymentMethods'
import { useUpdatePaymentMethod, useCreatePaymentMethod } from '@/hooks/mutations/usePaymentMethodMutations'
import { Loader } from '@/components/ui/Loader'
import { getPaymentMethodIcon, isSvgIcon } from '@/lib/utils/paymentMethodIcons'
import Image from 'next/image'
import { AVAILABLE_PAYMENT_METHODS, getAvailablePaymentMethod } from '@/lib/constants/paymentMethods'
import { Check, Settings, ChevronRight, AlertCircle } from 'lucide-react'
import type { PaymentMethodConfig } from './ConfigurePaymentMethodModal'

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
  const createPaymentMethod = useCreatePaymentMethod()
  const [modalContainer, setModalContainer] = useState<HTMLElement | null>(null)
  const [updatingMethodName, setUpdatingMethodName] = useState<string | null>(null)
  const [configureModalOpen, setConfigureModalOpen] = useState(false)
  const [selectedMethod, setSelectedMethod] = useState<{ method: PaymentMethod | null; availableMethod: typeof AVAILABLE_PAYMENT_METHODS[0] | null }>({
    method: null,
    availableMethod: null,
  })

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

  // Separar métodos configurados y no configurados
  // Bargeld (efectivo) es especial: siempre está "configurado" y activo por defecto
  const configuredMethods = paymentMethods.filter((method) => {
    // Bargeld siempre se considera configurado (no necesita config técnica)
    if (method.apiMethod.code.toLowerCase() === 'bargeld') {
      return true;
    }
    // Otros métodos: deben tener config no nulo y no vacío
    return method.apiMethod.config && Object.keys(method.apiMethod.config).length > 0
  })

  const unconfiguredMethods = paymentMethods.filter((method) => {
    // Bargeld nunca aparece aquí (siempre está configurado)
    if (method.apiMethod.code.toLowerCase() === 'bargeld') {
      return false;
    }
    // Excluir métodos inhabilitados por super admin o globalmente
    if (method.apiMethod.disabledBySuperAdmin || method.apiMethod.disabledGlobally) {
      return false;
    }
    // Métodos que existen en la BD pero no tienen configuración
    return !method.apiMethod.config || Object.keys(method.apiMethod.config).length === 0
  })

  // Obtener métodos disponibles que aún no están creados
  // Solo mostrar métodos que no existen en la BD
  // Los métodos globalmente deshabilitados que ya existen en la BD aparecerán en globallyDisabledMethods
  const availableMethodsToCreate = AVAILABLE_PAYMENT_METHODS.filter((availableMethod) => {
    // Verificar si ya existe un método con este código
    return !paymentMethodsData?.some((method) => method.code === availableMethod.code);
  })

  // Métodos globalmente deshabilitados (no pueden ser configurados ni activados por el admin)
  const globallyDisabledMethods = paymentMethods.filter(method => {
    return method.apiMethod.disabledGlobally === true;
  })

  // Filtrar métodos inhabilitados por super admin o globalmente
  // Los métodos inhabilitados NO pueden ser configurados ni activados por el admin de tienda
  const enabledMethods = configuredMethods.filter(method => {
    return !method.apiMethod.disabledBySuperAdmin && !method.apiMethod.disabledGlobally;
  })

  // Métodos activos e inactivos (solo los configurados y habilitados)
  // Bargeld siempre aparece como activo (aunque técnicamente pueda estar inactivo en BD, lo forzamos activo)
  const activeMethods = enabledMethods.filter(method => {
    // Bargeld siempre aparece como activo
    if (method.apiMethod.code.toLowerCase() === 'bargeld') {
      return true;
    }
    return method.isActive;
  })
  const inactiveMethods = enabledMethods.filter(method => {
    // Bargeld nunca aparece como inactivo
    if (method.apiMethod.code.toLowerCase() === 'bargeld') {
      return false;
    }
    return !method.isActive;
  })

  // Métodos inhabilitados por super admin (mostrar en gris, sin permitir configuración)
  const disabledMethods = paymentMethods.filter(method => {
    return method.apiMethod.disabledBySuperAdmin === true;
  })

  const handleToggle = async (id: string) => {
    const method = paymentMethods.find(m => m.id === id)
    if (!method) return

    // Bargeld no se puede desactivar (siempre debe estar activo)
    if (method.apiMethod.code.toLowerCase() === 'bargeld') {
      return; // No hacer nada si intentan desactivar Bargeld
    }

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

  const handleOpenConfigureModal = (method: PaymentMethod | null, availableMethod: typeof AVAILABLE_PAYMENT_METHODS[0] | null) => {
    setSelectedMethod({ method, availableMethod })
    setConfigureModalOpen(true)
  }

  const handleCloseConfigureModal = () => {
    if (!updatePaymentMethod.isPending && !createPaymentMethod.isPending) {
      setConfigureModalOpen(false)
      setSelectedMethod({ method: null, availableMethod: null })
    }
  }

  const handleSaveConfiguration = async (config: PaymentMethodConfig) => {
    if (!store?.id) return

    try {
      // Determinar si es Bargeld (efectivo) - debe estar activo por defecto
      const methodCode = selectedMethod.method?.apiMethod.code || selectedMethod.availableMethod?.code || ''
      const isBargeld = methodCode.toLowerCase() === 'bargeld'

      if (selectedMethod.method) {
        // Actualizar método existente
        const wasConfigured = selectedMethod.method.apiMethod.config && 
          Object.keys(selectedMethod.method.apiMethod.config).length > 0
        
        // Si el método ya estaba configurado antes, solo actualizar config
        // NO cambiar isActive para mantener su estado actual (activo/inactivo)
        if (wasConfigured) {
          // Solo actualizar la configuración, mantener isActive como está
          await updatePaymentMethod.mutateAsync({
            id: selectedMethod.method.id,
            data: {
              config: config as Record<string, unknown>,
              // NO incluir isActive para mantener el valor actual
            },
          })
        } else {
          // Primera configuración: establecer isActive según reglas
          await updatePaymentMethod.mutateAsync({
            id: selectedMethod.method.id,
            data: {
              config: config as Record<string, unknown>,
              isActive: isBargeld ? true : false, // Bargeld activo por defecto, otros desactivados
            },
          })
        }
      } else if (selectedMethod.availableMethod) {
        // Crear nuevo método
        const availableMethodData = AVAILABLE_PAYMENT_METHODS.find(
          (m) => m.code === selectedMethod.availableMethod?.code
        )
        if (!availableMethodData) return

        await createPaymentMethod.mutateAsync({
          storeId: store.id,
          data: {
            name: availableMethodData.name,
            displayName: availableMethodData.displayName,
            code: availableMethodData.code,
            icon: availableMethodData.icon,
            isActive: isBargeld ? true : false, // Bargeld activo por defecto, otros desactivados
            config: config as Record<string, unknown>,
          },
        })
      }

      await refetch()
      handleCloseConfigureModal()
    } catch (error) {
      console.error('Fehler beim Speichern der Konfiguration:', error)
    }
  }

  // Obtener el método disponible seleccionado o el del método existente
  const getAvailableMethodForConfig = (): typeof AVAILABLE_PAYMENT_METHODS[0] | null => {
    if (selectedMethod.method) {
      return getAvailablePaymentMethod(selectedMethod.method.apiMethod.code) || null
    }
    return selectedMethod.availableMethod || null
  }

  if (storeLoading || methodsLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader size="lg" />
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

  const isLoadingModal = (updatePaymentMethod.isPending || createPaymentMethod.isPending) && (updatingMethodName || configureModalOpen)

  return (
    <>
      {/* Modal de carga */}
      {isLoadingModal && modalContainer && createPortal(
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
                {configureModalOpen
                  ? 'Konfiguration wird gespeichert...'
                  : updatingMethodName
                  ? (
                      <>
                        {paymentMethods.find(m => m.name === updatingMethodName)?.isActive
                          ? 'Zahlungsmethode wird deaktiviert...'
                          : 'Zahlungsmethode wird aktiviert...'}
                      </>
                    )
                  : 'Actualizando método de pago...'}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Bitte warten Sie einen Moment
              </p>
            </div>
          </div>
        </div>,
        modalContainer
      )}

      {/* Modal de configuración */}
      {configureModalOpen && modalContainer && (
        <ConfigurePaymentMethodModal
          isOpen={configureModalOpen}
          method={selectedMethod.method}
          availableMethod={getAvailableMethodForConfig()}
          onSave={handleSaveConfiguration}
          onCancel={handleCloseConfigureModal}
          isLoading={updatePaymentMethod.isPending || createPaymentMethod.isPending}
        />
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
                    isLoading={updatePaymentMethod.isPending && updatingMethodName === method.name}
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
                    isLoading={updatePaymentMethod.isPending && updatingMethodName === method.name}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Zahlungsarten Einstellungen Section - TODOS los métodos (configurados y no configurados) */}
        <div className="animate-slide-down">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Zahlungsarten Einstellungen</h2>
          <div className="bg-white rounded-xl shadow-sm border border-[#ECE2D7] overflow-hidden">
            {/* Métodos configurados (con check verde) - EXCEPTO Bargeld que siempre está activo y métodos inhabilitados */}
            {configuredMethods
              .filter(method => 
                method.apiMethod.code.toLowerCase() !== 'bargeld' && // Bargeld no aparece aquí
                !method.apiMethod.disabledBySuperAdmin // Excluir métodos inhabilitados
              )
              .map((method, index, array) => {
                // Determinar si es el último de los configurados
                const isLastConfigured = index === array.length - 1 && unconfiguredMethods.length === 0 && availableMethodsToCreate.length === 0 && index === configuredMethods.filter(m => m.apiMethod.code.toLowerCase() !== 'bargeld').length - 1
                const hasNext = index < array.length - 1 || unconfiguredMethods.length > 0 || availableMethodsToCreate.length > 0
                const availableMethod = getAvailablePaymentMethod(method.apiMethod.code)
                if (!availableMethod) return null

                // Para métodos configurados: mostrar fondo verde con check blanco
                const iconElement = (
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#25D076' }}>
                    <Check className="w-6 h-6 text-white" strokeWidth={3} />
                  </div>
                )

                return (
                  <div
                    key={method.id}
                    className="animate-fade-in-scale"
                    style={{
                      animationDelay: `${index * 50}ms`,
                      animationFillMode: 'both',
                    }}
                  >
                    <button
                      onClick={() => handleOpenConfigureModal(method, null)}
                      className={`w-full p-4 hover:bg-gray-50 transition-all touch-target active:scale-[0.98] text-left ${
                        hasNext ? 'border-b border-[#ECE2D7]' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                          {iconElement}
                          <div className="flex-1 min-w-0">
                            <h3 className="text-base font-medium text-gray-900 truncate">
                              {method.name}
                            </h3>
                            <p className="text-sm text-gray-500 truncate">
                              bereits eingerichtet
                            </p>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      </div>
                    </button>
                  </div>
                )
              })}

            {/* Métodos no configurados existentes (que ya están en la BD pero sin config) */}
            {unconfiguredMethods.map((method, index, array) => {
              const isLastUnconfigured = index === array.length - 1 && availableMethodsToCreate.length === 0
              const hasNext = index < array.length - 1 || availableMethodsToCreate.length > 0
              const availableMethod = getAvailablePaymentMethod(method.apiMethod.code)
              if (!availableMethod) return null

              const isSvg = isSvgIcon(method.apiMethod.icon)
              const iconPath = method.apiMethod.icon

              const iconElement = isSvg && iconPath ? (
                <div className="w-10 h-10 rounded-lg flex items-center justify-center overflow-hidden bg-white border border-gray-200">
                  <Image 
                    src={iconPath} 
                    alt={`${method.name} icon`}
                    width={40}
                    height={40}
                    className="object-contain"
                  />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-gray-100">
                  {React.createElement(getPaymentMethodIcon(method.apiMethod.icon), { className: 'w-6 h-6 text-gray-600' })}
                </div>
              )

              return (
                <div
                  key={method.id}
                  className="animate-fade-in-scale"
                  style={{
                    animationDelay: `${(configuredMethods.filter(m => m.apiMethod.code.toLowerCase() !== 'bargeld').length + index) * 50}ms`,
                    animationFillMode: 'both',
                  }}
                >
                  <button
                    onClick={() => handleOpenConfigureModal(method, null)}
                    className={`w-full p-4 hover:bg-gray-50 transition-all touch-target active:scale-[0.98] text-left ${
                      hasNext ? 'border-b border-[#ECE2D7]' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        {iconElement}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-base font-medium text-gray-900 truncate">
                            {method.name}
                          </h3>
                          <p className="text-sm text-gray-500 truncate">
                            konfigurieren
                          </p>
                        </div>
                      </div>
                      <Settings className="w-5 h-5 text-gray-400" />
                    </div>
                  </button>
                </div>
              )
            })}

            {/* Métodos disponibles para crear (que no existen en la BD todavía) */}
            {availableMethodsToCreate.map((availableMethod, index, array) => {
              const isLast = index === array.length - 1
              const hasNext = index < array.length - 1
              const isSvg = isSvgIcon(availableMethod.icon)
              const iconPath = availableMethod.icon

              const iconElement = isSvg && iconPath ? (
                <div className="w-10 h-10 rounded-lg flex items-center justify-center overflow-hidden bg-white border border-gray-200">
                  <Image 
                    src={iconPath} 
                    alt={`${availableMethod.displayName} icon`}
                    width={40}
                    height={40}
                    className="object-contain"
                  />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-gray-100">
                  {React.createElement(getPaymentMethodIcon(availableMethod.icon), { className: 'w-6 h-6 text-gray-600' })}
                </div>
              )

              return (
                <div
                  key={availableMethod.code}
                  className="animate-fade-in-scale"
                  style={{
                    animationDelay: `${(configuredMethods.filter(m => m.apiMethod.code.toLowerCase() !== 'bargeld').length + unconfiguredMethods.length + index) * 50}ms`,
                    animationFillMode: 'both',
                  }}
                >
                  <button
                    onClick={() => handleOpenConfigureModal(null, availableMethod)}
                    className={`w-full p-4 hover:bg-gray-50 transition-all touch-target active:scale-[0.98] text-left ${
                      hasNext ? 'border-b border-[#ECE2D7]' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        {iconElement}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-base font-medium text-gray-900 truncate">
                            {availableMethod.displayName}
                          </h3>
                          <p className="text-sm text-gray-500 truncate">
                            konfigurieren
                          </p>
                        </div>
                      </div>
                      <Settings className="w-5 h-5 text-gray-400" />
                    </div>
                  </button>
                </div>
              )
            })}

            {/* Métodos globalmente deshabilitados - Solo mostrar si hay alguno */}
            {globallyDisabledMethods.length > 0 && globallyDisabledMethods.map((method, index, array) => {
              const isLast = index === array.length - 1 && availableMethodsToCreate.length === 0
              const hasNext = index < array.length - 1 || availableMethodsToCreate.length > 0
              const availableMethod = getAvailablePaymentMethod(method.apiMethod.code)
              if (!availableMethod) return null

              const isSvg = isSvgIcon(method.apiMethod.icon)
              const iconPath = method.apiMethod.icon

              const iconElement = isSvg && iconPath ? (
                <div className="w-10 h-10 rounded-lg flex items-center justify-center overflow-hidden bg-white border border-gray-200 opacity-50">
                  <Image 
                    src={iconPath} 
                    alt={`${method.name} icon`}
                    width={40}
                    height={40}
                    className="object-contain grayscale"
                  />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-gray-100 opacity-50">
                  {React.createElement(getPaymentMethodIcon(method.apiMethod.icon), { className: 'w-6 h-6 text-gray-400' })}
                </div>
              )

              return (
                <div
                  key={method.id}
                  className="animate-fade-in-scale opacity-60"
                  style={{
                    animationDelay: `${(configuredMethods.filter(m => m.apiMethod.code.toLowerCase() !== 'bargeld').length + unconfiguredMethods.length + availableMethodsToCreate.length + index) * 50}ms`,
                    animationFillMode: 'both',
                  }}
                >
                  <div
                    className={`w-full p-4 cursor-not-allowed text-left ${
                      hasNext ? 'border-b border-[#ECE2D7]' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        {iconElement}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-base font-medium text-gray-500 truncate">
                            {method.name}
                          </h3>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <AlertCircle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                            <p className="text-sm text-amber-600 truncate">
                              Globalmente inactivo
                            </p>
                          </div>
                        </div>
                      </div>
                      <AlertCircle className="w-5 h-5 text-amber-500" />
                    </div>
                  </div>
                </div>
              )
            })}

            {/* Weitere Einstellungen */}
            <div className="animate-fade-in-scale border-t border-[#ECE2D7]">
              <button
                onClick={() => {
                  // Navegar a página de configuraciones generales o abrir modal
                  console.log('Weitere Einstellungen')
                }}
                className="w-full p-4 hover:bg-gray-50 transition-all touch-target active:scale-[0.98] text-left"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-gray-100">
                      <Settings className="w-5 h-5 text-gray-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-medium text-gray-900 truncate">
                        Weitere Einstellungen
                      </h3>
                      <p className="text-sm text-gray-500 truncate">
                        ansehen
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
              </button>
            </div>
          </div>
        </div>

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
