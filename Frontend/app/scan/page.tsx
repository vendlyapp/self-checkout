'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import SnanerDash from '@/components/user/SnanerDash'

export default function ScanProductPage() {
  const router = useRouter()

  return (
    <div 
      className="w-full flex flex-col items-center justify-center bg-background-cream relative"
      style={{
        height: '100vh',
        minHeight: '100vh',
        maxHeight: '100vh',
        overflow: 'hidden',
      }}
    >
      {/* Botón de volver atrás - Fijo en la parte superior */}
      <button
        onClick={() => router.push('/')}
        className="fixed top-4 left-4 z-50 w-12 h-12 flex items-center justify-center 
                 bg-white rounded-full shadow-lg hover:bg-gray-50 active:scale-95 
                 transition-all duration-200 touch-target tap-highlight-transparent"
        style={{
          top: 'calc(16px + env(safe-area-inset-top))',
          left: 'calc(16px + env(safe-area-inset-left))',
        }}
        aria-label="Zurück"
        tabIndex={0}
      >
        <ArrowLeft className="w-6 h-6 text-gray-700" strokeWidth={2.5} />
      </button>

      {/* Contenedor del scanner centrado */}
      <div className="w-full flex items-center justify-center flex-1">
        <SnanerDash />
      </div>
    </div>
  )
}

