'use client'

import { useResponsive } from '@/hooks'
import { Download } from 'lucide-react'

export default function BackupsPage() {
  const { isMobile } = useResponsive()

  return (
    <div className="w-full h-full gpu-accelerated animate-fade-in">
      {/* Mobile Layout */}
      {isMobile && (
        <div className="w-full min-h-screen bg-[#F2EDE8] safe-area-bottom">
          <div className="px-4 py-6 pb-32 max-w-full mx-auto">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight mb-1.5">
                Backups
              </h1>
              <p className="text-sm text-gray-500 leading-relaxed">
                Verwalten Sie Ihre Sicherheitskopien
              </p>
            </div>
            
            {/* Placeholder Content */}
            <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200 text-center">
              <div className="w-20 h-20 rounded-xl bg-brand-100 flex items-center justify-center mx-auto mb-4">
                <Download className="w-10 h-10 text-brand-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                Backup-Verwaltung
              </h2>
              <p className="text-sm text-gray-500 mb-4">
                Diese Funktion wird bald verfügbar sein.
              </p>
              <p className="text-xs text-gray-400">
                Hier können Sie in Zukunft Sicherheitskopien Ihrer Daten erstellen, wiederherstellen und verwalten.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Layout */}
      {!isMobile && (
        <div className="w-full min-h-screen bg-[#F2EDE8] py-8">
          <div className="max-w-4xl mx-auto px-6">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-2">
                Backups
              </h1>
              <p className="text-gray-500 text-base leading-relaxed">
                Verwalten Sie Ihre Sicherheitskopien
              </p>
            </div>
            
            {/* Placeholder Content */}
            <div className="bg-white rounded-xl p-12 shadow-sm border border-gray-200 text-center">
              <div className="w-24 h-24 rounded-xl bg-brand-100 flex items-center justify-center mx-auto mb-6">
                <Download className="w-12 h-12 text-brand-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                Backup-Verwaltung
              </h2>
              <p className="text-base text-gray-500 mb-6">
                Diese Funktion wird bald verfügbar sein.
              </p>
              <p className="text-sm text-gray-400">
                Hier können Sie in Zukunft Sicherheitskopien Ihrer Daten erstellen, wiederherstellen und verwalten.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
