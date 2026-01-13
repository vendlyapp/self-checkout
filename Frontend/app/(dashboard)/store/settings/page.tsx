'use client'

import StoreSettingsForm from '@/components/dashboard/store/StoreSettingsForm'
import HeaderNav from '@/components/navigation/HeaderNav'
import { useResponsive } from '@/hooks'

export default function StoreSettingsPage() {
  const { isMobile } = useResponsive()

  return (
    <div className="w-full h-full gpu-accelerated animate-fade-in">
      {/* Mobile Layout - Optimizado para iOS */}
      {isMobile && (
        <div className="w-full min-h-screen bg-[#F2EDE8] safe-area-bottom">
          {/* Header Navigation */}
          <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-xl border-b border-gray-100/50 safe-area-top">
            <HeaderNav title="Mi Tienda" closeDestination="/store" />
          </div>
          
          {/* Content Container - Con padding optimizado para móvil */}
          <div className="px-4 py-6 pb-32 max-w-full mx-auto">
            {/* Header Section - Más compacto y elegante */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight mb-1.5">
                Configuración de Tienda
              </h1>
              <p className="text-sm text-gray-500 leading-relaxed">
                Personaliza la información de tu tienda
              </p>
            </div>
            
            {/* Form Container */}
            <div className="w-full">
              <StoreSettingsForm />
            </div>
          </div>
        </div>
      )}

      {/* Desktop Layout */}
      {!isMobile && (
        <div className="w-full min-h-screen bg-[#F2EDE8] py-8">
          <div className="max-w-4xl mx-auto px-6">
            {/* Header Section */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-2">
                Configuración de Tienda
              </h1>
              <p className="text-gray-500 text-base leading-relaxed">
                Personaliza la información de tu tienda
              </p>
            </div>
            
            {/* Form Container */}
            <StoreSettingsForm />
          </div>
        </div>
      )}
    </div>
  )
}

