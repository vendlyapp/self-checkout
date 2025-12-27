'use client'

import { useState, useEffect, useRef } from 'react'
import { Save, X, Loader2, Store, Image as ImageIcon, MapPin, Phone, Mail, FileText, Upload } from 'lucide-react'
import { toast } from 'sonner'
import { buildApiUrl, getAuthHeaders } from '@/lib/config/api'

interface StoreData {
  id: string
  ownerId: string
  name: string
  slug: string
  logo: string | null
  address?: string | null
  phone?: string | null
  email?: string | null
  description?: string | null
  isActive: boolean
  isOpen: boolean
  createdAt: string
  updatedAt: string
}

interface StoreSettingsFormProps {
  onUpdate?: (store: StoreData) => void
}

export default function StoreSettingsForm({ onUpdate }: StoreSettingsFormProps) {
  const [store, setStore] = useState<StoreData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editing, setEditing] = useState(false)

  // Form fields
  const [name, setName] = useState('')
  const [logo, setLogo] = useState('')
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [useDefaultLogo, setUseDefaultLogo] = useState(false)
  const [address, setAddress] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [description, setDescription] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    loadStore()
  }, [])

  const loadStore = async () => {
    try {
      setLoading(true)
      const { supabase } = await import('@/lib/supabase/client')
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session?.access_token) {
        toast.error('No estás autenticado')
        return
      }

      const url = buildApiUrl('/api/store/my-store')
      const headers = getAuthHeaders(session.access_token)

      const response = await fetch(url, { headers })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()

      if (result.success) {
        setStore(result.data)
        setName(result.data.name || '')
        setLogo(result.data.logo || '')
        setLogoPreview(result.data.logo || null)
        setUseDefaultLogo(!result.data.logo)
        setAddress(result.data.address || '')
        setPhone(result.data.phone || '')
        setEmail(result.data.email || '')
        setDescription(result.data.description || '')
      } else {
        toast.error(result.error || 'Error al cargar tienda')
      }
    } catch (error) {
      console.error('Error al cargar tienda:', error)
      toast.error('Error al cargar tienda')
    } finally {
      setLoading(false)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('La imagen es demasiado grande. Máximo 5MB')
        return
      }
      if (!file.type.startsWith('image/')) {
        toast.error('Bitte wählen Sie ein gültiges Bild aus')
        return
      }
      setLogoFile(file)
      setUseDefaultLogo(false)
      const reader = new FileReader()
      reader.onloadend = () => {
        setLogoPreview(reader.result as string)
        setLogo(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveLogo = () => {
    setLogoFile(null)
    setLogoPreview(null)
    setLogo('')
    setUseDefaultLogo(true)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleUseDefaultLogo = () => {
    setUseDefaultLogo(true)
    setLogoFile(null)
    setLogoPreview(null)
    setLogo('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      const { supabase } = await import('@/lib/supabase/client')
      const { data: { session } } = await supabase.auth.getSession()

      if (!session?.access_token) {
        toast.error('No estás autenticado')
        return
      }

      // Si hay un archivo, convertirlo a base64 o subirlo
      let finalLogo: string | null = logo || null
      if (logoFile && logoPreview) {
        // Usar la preview que ya está en base64
        finalLogo = logoPreview
      } else if (useDefaultLogo) {
        finalLogo = null
      }

      const url = buildApiUrl('/api/store/my-store')
      const headers = getAuthHeaders(session.access_token)

      const response = await fetch(url, {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          name: name.trim(),
          logo: finalLogo || null,
          address: address.trim() || null,
          phone: phone.trim() || null,
          email: email.trim() || null,
          description: description.trim() || null
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()

      if (result.success) {
        setStore(result.data)
        setEditing(false)
        toast.success('Tienda actualizada exitosamente')
        if (onUpdate) {
          onUpdate(result.data)
        }
      } else {
        toast.error(result.error || 'Error al actualizar')
      }
    } catch (error) {
      console.error('Error al actualizar tienda:', error)
      toast.error('Error al actualizar tienda')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    if (store) {
      setName(store.name || '')
      setLogo(store.logo || '')
      setLogoPreview(store.logo || null)
      setUseDefaultLogo(!store.logo)
      setLogoFile(null)
      setAddress(store.address || '')
      setPhone(store.phone || '')
      setEmail(store.email || '')
      setDescription(store.description || '')
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    setEditing(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
      </div>
    )
  }

  if (!store) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
        <p className="text-yellow-800">Ihr Geschäft wurde nicht gefunden</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6">
      {/* Header - Mejorado para móvil */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div className="flex-1 min-w-0">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 truncate">Konfiguration</h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5 sm:mt-1 hidden sm:block">Personalisiere dein Geschäft</p>
        </div>
        {!editing ? (
          <button
            onClick={() => setEditing(true)}
            className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-brand-500 text-white rounded-xl hover:bg-brand-600 transition-colors font-semibold text-sm sm:text-base whitespace-nowrap"
          >
            <Save className="w-4 h-4" />
            <span className="hidden sm:inline">Bearbeiten</span>
            <span className="sm:hidden">Edit</span>
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={handleCancel}
              className="flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-semibold text-sm sm:text-base"
            >
              <X className="w-4 h-4" />
              <span className="hidden sm:inline">Abbrechen</span>
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !name.trim()}
              className="flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 bg-brand-500 text-white rounded-xl hover:bg-brand-600 transition-colors font-semibold disabled:opacity-50 text-sm sm:text-base"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span className="hidden sm:inline">Speichern</span>
            </button>
          </div>
        )}
      </div>

      <div className="space-y-4 sm:space-y-5">
        {/* Nombre */}
        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
            <Store className="w-4 h-4 flex-shrink-0" />
            <span>Geschäftsname *</span>
          </label>
          {editing ? (
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="z.B. Heinigers Hofladen"
              className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent text-sm sm:text-base"
              required
            />
          ) : (
            <p className="text-sm sm:text-base font-medium text-gray-900 bg-gray-50 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl">
              {store.name}
            </p>
          )}
        </div>

        {/* Logo */}
        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
            <ImageIcon className="w-4 h-4 flex-shrink-0" />
            <span>Logo</span>
          </label>
          {editing ? (
            <div className="space-y-3">
              {/* Preview del logo */}
              <div className="flex items-center gap-4">
                {(logoPreview || (!useDefaultLogo && logo)) ? (
                  <div className="relative">
                    <img
                      src={logoPreview || logo}
                      alt="Logo preview"
                      className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-xl border-2 border-gray-200"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                      }}
                    />
                    <button
                      onClick={handleRemoveLogo}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-100 rounded-xl flex items-center justify-center border-2 border-dashed border-gray-300">
                    <Store className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" />
                  </div>
                )}
                <div className="flex-1 space-y-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full flex items-center justify-center gap-2 px-3 sm:px-4 py-2.5 bg-brand-500 text-white rounded-xl hover:bg-brand-600 transition-colors font-semibold text-sm"
                  >
                    <Upload className="w-4 h-4" />
                    Bild hochladen
                  </button>
                  <button
                    type="button"
                    onClick={handleUseDefaultLogo}
                    className={`w-full flex items-center justify-center gap-2 px-3 sm:px-4 py-2.5 rounded-xl transition-colors font-semibold text-sm ${
                      useDefaultLogo
                        ? 'bg-brand-100 text-brand-700 border-2 border-brand-500'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <Store className="w-4 h-4" />
                    Standard-Icon
                  </button>
                </div>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              {/* Opción de URL (opcional) */}
              <div>
                <p className="text-xs text-gray-500 mb-1">Oder URL eingeben:</p>
                <input
                  type="url"
                  value={useDefaultLogo ? '' : logo}
                  onChange={(e) => {
                    setLogo(e.target.value)
                    setLogoPreview(e.target.value)
                    setUseDefaultLogo(false)
                  }}
                  placeholder="https://example.com/logo.png"
                  className="w-full px-3 sm:px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent text-sm"
                  disabled={useDefaultLogo}
                />
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              {store.logo ? (
                <img
                  src={store.logo}
                  alt="Store logo"
                  className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-xl border border-gray-200 flex-shrink-0"
                />
              ) : (
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Store className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" />
                </div>
              )}
              <p className="text-sm text-gray-600 truncate">{store.logo ? 'Logo gesetzt' : 'Standard-Icon'}</p>
            </div>
          )}
        </div>

        {/* Dirección */}
        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
            <MapPin className="w-4 h-4 flex-shrink-0" />
            <span>Adresse</span>
          </label>
          {editing ? (
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="z.B. Grundhof 3, 8305 Dietlikon"
              className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent text-sm sm:text-base"
            />
          ) : (
            <p className="text-sm sm:text-base text-gray-900 bg-gray-50 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl">
              {store.address || 'Keine Adresse angegeben'}
            </p>
          )}
        </div>

        {/* Teléfono */}
        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
            <Phone className="w-4 h-4 flex-shrink-0" />
            <span>Telefon</span>
          </label>
          {editing ? (
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="z.B. +41 44 123 45 67"
              className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent text-sm sm:text-base"
            />
          ) : (
            <p className="text-sm sm:text-base text-gray-900 bg-gray-50 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl">
              {store.phone || 'Keine Telefonnummer angegeben'}
            </p>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
            <Mail className="w-4 h-4 flex-shrink-0" />
            <span>E-Mail</span>
          </label>
          {editing ? (
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="z.B. info@mein-geschäft.ch"
              className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent text-sm sm:text-base"
            />
          ) : (
            <p className="text-sm sm:text-base text-gray-900 bg-gray-50 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl">
              {store.email || 'Keine E-Mail angegeben'}
            </p>
          )}
        </div>

        {/* Descripción */}
        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
            <FileText className="w-4 h-4 flex-shrink-0" />
            <span>Beschreibung</span>
          </label>
          {editing ? (
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Beschreibe dein Geschäft..."
              rows={4}
              className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-none text-sm sm:text-base"
            />
          ) : (
            <p className="text-sm sm:text-base text-gray-900 bg-gray-50 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl min-h-[80px] sm:min-h-[100px]">
              {store.description || 'Keine Beschreibung'}
            </p>
          )}
        </div>

        {/* Slug (solo lectura) */}
        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
            <Store className="w-4 h-4 flex-shrink-0" />
            <span>URL-Slug</span>
          </label>
          <p className="text-xs sm:text-sm text-gray-600 font-mono bg-gray-50 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl break-all">
            {store.slug}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Dieser Wert kann nicht geändert werden
          </p>
        </div>
      </div>
    </div>
  )
}

