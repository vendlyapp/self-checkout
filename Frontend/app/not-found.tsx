'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Home, ArrowLeft, HelpCircle } from 'lucide-react'

export default function NotFound() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-background-cream to-brand-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full text-center">
        {/* Ilustración 404 */}
        <div className="mb-8">
          <div className="relative inline-block">
            <h1 className="text-[180px] font-bold text-brand-500/10 leading-none select-none">
              404
            </h1>
            <div className="absolute inset-0 flex items-center justify-center">
              <HelpCircle className="w-32 h-32 text-brand-500" strokeWidth={1.5} />
            </div>
          </div>
        </div>

        {/* Mensaje */}
        <div className="mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Seite nicht gefunden
          </h2>
          <p className="text-lg text-gray-600 mb-2">
            Die von Ihnen gesuchte Seite existiert nicht oder wurde verschoben.
          </p>
          <p className="text-base text-gray-500">
            Möglicherweise haben Sie eine falsche URL eingegeben oder die Seite wurde gelöscht.
          </p>
        </div>

        {/* Acciones */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          {/* Botón volver */}
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-3 px-6 py-3.5 bg-white border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-ios font-semibold shadow-sm"
          >
            <ArrowLeft className="w-5 h-5" />
            Zurück
          </button>

          {/* Botón inicio */}
          <Link
            href="/"
            className="inline-flex items-center gap-3 px-6 py-3.5 bg-brand-500 text-white rounded-xl hover:bg-brand-600 transition-ios font-semibold shadow-lg shadow-brand-500/30"
          >
            <Home className="w-5 h-5" />
            Zur Startseite
          </Link>
        </div>

        {/* Enlaces útiles */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500 mb-4">Vielleicht suchen Sie nach:</p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link
              href="/dashboard"
              className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 hover:border-brand-300 hover:text-brand-600 transition-ios-fast"
            >
              Dashboard
            </Link>
            <Link
              href="/products"
              className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 hover:border-brand-300 hover:text-brand-600 transition-ios-fast"
            >
              Produkte
            </Link>
            <Link
              href="/sales"
              className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 hover:border-brand-300 hover:text-brand-600 transition-ios-fast"
            >
              Verkäufe
            </Link>
            <Link
              href="/login"
              className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 hover:border-brand-300 hover:text-brand-600 transition-ios-fast"
            >
              Anmelden
            </Link>
          </div>
        </div>

        {/* Código de error */}
        <div className="mt-8">
          <p className="text-xs text-gray-400 font-mono">
            ERROR_CODE: 404_NOT_FOUND
          </p>
        </div>
      </div>
    </div>
  )
}

