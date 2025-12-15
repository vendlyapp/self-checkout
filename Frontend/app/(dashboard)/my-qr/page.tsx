'use client'

import { useState, useEffect } from 'react'
import { QrCode, Download, Edit2, Save, X, Loader2, Copy, Share2, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import { useMyStore } from '@/hooks/queries'
import { useUpdateStore, useRegenerateQR } from '@/hooks/mutations'

export default function MyQRPage() {
  const { data: store, isLoading: loading, error } = useMyStore()
  const updateStoreMutation = useUpdateStore()
  const regenerateQRMutation = useRegenerateQR()
  
  const [editing, setEditing] = useState(false)
  const [storeName, setStoreName] = useState('')
  const [storeLogo, setStoreLogo] = useState('')

  // Sincronizar estado local con datos del store cuando cambian
  useEffect(() => {
    if (store) {
      setStoreName(store.name)
      setStoreLogo(store.logo || '')
    }
  }, [store])

  const handleSave = async () => {
    try {
      await updateStoreMutation.mutateAsync({
        name: storeName,
        logo: storeLogo || null
      })
      setEditing(false)
    } catch {
      // Error ya manejado por la mutation
    }
  }

  const handleDownloadQR = () => {
    if (!store?.qrCode) return
    
    const link = document.createElement('a')
    link.href = store.qrCode
    link.download = `qr-${store.slug}.png`
    link.click()
    toast.success('QR descargado')
  }

  const getStoreUrl = () => {
    if (typeof window === 'undefined') return '';
    return `${window.location.origin}/store/${store?.slug}`;
  };

  const copyStoreUrl = () => {
    const url = getStoreUrl();
    navigator.clipboard.writeText(url);
    toast.success('URL copiada al portapapeles');
  };

  const shareStore = async () => {
    const url = getStoreUrl();
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: store?.name,
          text: `Besuchen Sie ${store?.name}`,
          url: url
        })
      } catch {
        // Share cancelled
      }
    } else {
      copyStoreUrl()
    }
  }

  const handleRegenerateQR = async () => {
    try {
      await regenerateQRMutation.mutateAsync()
    } catch {
      // Error ya manejado por la mutation
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
      </div>
    )
  }

  if (error || !store) {
    return (
      <div className="p-4 md:p-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
          <p className="text-yellow-800">
            {error instanceof Error ? error.message : 'No se encontró tu tienda'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full h-full overflow-auto animate-page-enter gpu-accelerated">
      {/* MOBILE & TABLET */}
      <div className="block xl:hidden">
        <div className="p-4 space-y-6 max-w-2xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-3 animate-stagger-1">
            <div className="w-14 h-14 bg-brand-500 rounded-2xl flex items-center justify-center transition-interactive gpu-accelerated">
              <QrCode className="w-8 h-8 text-white" strokeWidth={2} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 transition-interactive">Mein QR-Code</h1>
              <p className="text-sm text-gray-500 transition-interactive">Teilen Sie Ihr Geschäft</p>
            </div>
          </div>

          {/* QR Code Card - Prioridad en móvil */}
          <div className="bg-white rounded-2xl shadow-lg p-6 animate-stagger-2 animate-fade-in-scale">
            <h2 className="text-lg font-bold text-gray-900 mb-4 transition-interactive">Ihr QR-Code</h2>

            {store.qrCode ? (
              <div className="space-y-4">
                <div className="bg-gradient-to-br from-brand-50 to-brand-100 rounded-2xl p-6 flex items-center justify-center">
                  <div className="bg-white p-3 rounded-xl shadow-lg">
                    <img
                      src={store.qrCode}
                      alt="Store QR Code"
                      className="w-full max-w-[280px] h-auto"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={handleDownloadQR}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-brand-500 text-white rounded-xl hover:bg-brand-600 transition-colors font-semibold text-sm"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </button>
                  <button
                    onClick={shareStore}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors font-semibold text-sm"
                  >
                    <Share2 className="w-4 h-4" />
                    Teilen
                  </button>
                </div>

                <button
                  onClick={handleRegenerateQR}
                  disabled={regenerateQRMutation.isPending}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {regenerateQRMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Wird regeneriert...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4" />
                      QR-Code regenerieren
                    </>
                  )}
                </button>

                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <p className="text-sm text-blue-900 font-medium mb-2">
                    💡 So funktioniert es:
                  </p>
                  <ol className="text-xs text-blue-800 space-y-1">
                    <li>1. Laden Sie den QR-Code herunter</li>
                    <li>2. Drucken oder digital anzeigen</li>
                    <li>3. Kunden scannen → sehen Produkte</li>
                  </ol>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-xl p-8 text-center">
                <QrCode className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">QR-Code wird generiert...</p>
              </div>
            )}
          </div>

          {/* Store Info Card */}
          <div className="bg-white rounded-2xl shadow-lg p-6 animate-stagger-3 animate-fade-in-scale">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900 transition-interactive">Geschäftsinfo</h2>
              {!editing && (
                <button
                  onClick={() => setEditing(true)}
                  className="flex items-center gap-2 px-3 py-2 text-brand-600 hover:bg-brand-50 rounded-lg transition-colors text-sm"
                >
                  <Edit2 className="w-4 h-4" />
                  Bearbeiten
                </button>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Name
                </label>
                {editing ? (
                  <input
                    type="text"
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent text-sm"
                  />
                ) : (
                  <p className="text-base font-medium text-gray-900">{store.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  URL
                </label>
                <div className="flex items-center gap-2">
                  <p className="text-xs text-gray-600 font-mono bg-gray-50 px-3 py-2 rounded-lg flex-1 break-all">
                    {store.slug}
                  </p>
                  <button
                    onClick={copyStoreUrl}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
                    title="URL kopieren"
                  >
                    <Copy className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Logo URL (optional)
                </label>
                {editing ? (
                  <input
                    type="text"
                    value={storeLogo}
                    onChange={(e) => setStoreLogo(e.target.value)}
                    placeholder="https://example.com/logo.png"
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent text-sm"
                  />
                ) : (
                  <p className="text-sm text-gray-600">
                    {store.logo || 'Kein Logo'}
                  </p>
                )}
              </div>

              {editing && (
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => {
                      setEditing(false)
                      setStoreName(store.name)
                      setStoreLogo(store.logo || '')
                    }}
                    className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold transition-colors text-sm"
                  >
                    Abbrechen
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={updateStoreMutation.isPending}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-brand-500 text-white rounded-xl hover:bg-brand-600 transition-colors font-semibold disabled:opacity-50 text-sm"
                  >
                    {updateStoreMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    Speichern
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Link público */}
          <div className="bg-white rounded-2xl shadow-lg p-6 animate-stagger-4 animate-fade-in-scale">
            <h2 className="text-lg font-bold text-gray-900 mb-4 transition-interactive">Öffentlicher Link</h2>
            <div className="bg-gray-50 rounded-xl p-3 font-mono text-xs break-all mb-3" suppressHydrationWarning>
              {getStoreUrl()}
            </div>
            <p className="text-xs text-gray-500">
              Kunden können diesen Link besuchen
            </p>
          </div>
        </div>
      </div>

      {/* DESKTOP */}
      <div className="hidden xl:block">
        <div className="p-8 max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8 animate-stagger-1">
            <div className="flex items-center gap-4 mb-2">
              <div className="w-16 h-16 bg-brand-500 rounded-2xl flex items-center justify-center transition-interactive gpu-accelerated">
                <QrCode className="w-9 h-9 text-white" strokeWidth={2} />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 transition-interactive">Mein QR-Code</h1>
                <p className="text-gray-500 transition-interactive">Verwalten Sie Ihr Geschäft und QR-Code</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Información de la tienda */}
            <div className="bg-white rounded-2xl shadow-lg p-6 animate-stagger-2 animate-fade-in-scale">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Geschäftsinformationen</h2>
                {!editing ? (
                  <button
                    onClick={() => setEditing(true)}
                    className="flex items-center gap-2 px-4 py-2 text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                    Bearbeiten
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditing(false)
                        setStoreName(store.name)
                        setStoreLogo(store.logo || '')
                      }}
                      className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={updateStoreMutation.isPending}
                      className="flex items-center gap-2 px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors disabled:opacity-50"
                    >
                      {updateStoreMutation.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4" />
                      )}
                      Speichern
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Name des Geschäfts
                  </label>
                  {editing ? (
                    <input
                      type="text"
                      value={storeName}
                      onChange={(e) => setStoreName(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-lg font-medium text-gray-900">{store.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Slug (URL)
                  </label>
                  <div className="flex items-center gap-2">
                    <p className="text-gray-600 font-mono bg-gray-50 px-4 py-2 rounded-lg flex-1 text-sm">
                      {store.slug}
                    </p>
                    <button
                      onClick={copyStoreUrl}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      title="URL kopieren"
                    >
                      <Copy className="w-5 h-5 text-gray-600" />
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Logo URL (optional)
                  </label>
                  {editing ? (
                    <input
                      type="text"
                      value={storeLogo}
                      onChange={(e) => setStoreLogo(e.target.value)}
                      placeholder="https://example.com/logo.png"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-gray-600">
                      {store.logo || 'Kein Logo'}
                    </p>
                  )}
                </div>

                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Status</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      store.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {store.isActive ? 'Aktiv' : 'Inaktiv'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* QR Code */}
            <div className="bg-white rounded-2xl shadow-lg p-6 animate-stagger-3 animate-fade-in-scale">
              <h2 className="text-xl font-bold text-gray-900 mb-6 transition-interactive">QR-Code</h2>

              {store.qrCode ? (
                <div className="space-y-6">
                  <div className="bg-gradient-to-br from-brand-50 to-brand-100 rounded-2xl p-8 flex items-center justify-center">
                    <div className="bg-white p-4 rounded-xl shadow-lg">
                      <img
                        src={store.qrCode}
                        alt="Store QR Code"
                        className="w-64 h-64"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <button
                      onClick={handleDownloadQR}
                      className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-brand-500 text-white rounded-xl hover:bg-brand-600 transition-colors font-semibold"
                    >
                      <Download className="w-5 h-5" />
                      QR-Code herunterladen
                    </button>

                    <button
                      onClick={shareStore}
                      className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors font-semibold"
                    >
                      <Share2 className="w-5 h-5" />
                      Teilen
                    </button>

                    <button
                      onClick={handleRegenerateQR}
                      disabled={regenerateQRMutation.isPending}
                      className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {regenerateQRMutation.isPending ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Wird regeneriert...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="w-5 h-5" />
                          QR-Code regenerieren
                        </>
                      )}
                    </button>

                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                      <p className="text-sm text-blue-900 font-medium mb-2">
                        💡 So funktioniert es:
                      </p>
                      <ol className="text-sm text-blue-800 space-y-1">
                        <li>1. Laden Sie den QR-Code herunter</li>
                        <li>2. Drucken Sie ihn aus oder zeigen Sie ihn digital</li>
                        <li>3. Kunden scannen und sehen Ihre Produkte</li>
                      </ol>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 rounded-xl p-8 text-center">
                  <QrCode className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">QR-Code wird generiert...</p>
                </div>
              )}
            </div>
          </div>

          {/* Vista previa del enlace */}
          <div className="bg-white rounded-2xl shadow-lg p-6 animate-stagger-4 animate-fade-in-scale">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 transition-interactive">Öffentlicher Link</h2>
              <button
                onClick={copyStoreUrl}
                className="flex items-center gap-2 px-4 py-2 text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
              >
                <Copy className="w-4 h-4" />
                Kopieren
              </button>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 font-mono text-sm break-all" suppressHydrationWarning>
              {getStoreUrl()}
            </div>
            <p className="text-sm text-gray-500 mt-3">
              Kunden können diesen Link besuchen, um Ihre Produkte anzuzeigen
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

