'use client'

import { useState, useEffect, useRef } from 'react'
import { Save, X, Store, Image as ImageIcon, MapPin, Phone, Mail, FileText, Upload, CheckCircle2, AlertCircle, Edit3 } from 'lucide-react'
import { toast } from 'sonner'
import { buildApiUrl, getAuthHeaders } from '@/lib/config/api'
import { Loader } from '@/components/ui/Loader'
import { useResponsive } from '@/hooks'

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
  const { isMobile } = useResponsive()
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
        toast.error('Sie sind nicht authentifiziert')
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
        toast.error(result.error || 'Fehler beim Laden des Geschäfts')
      }
    } catch (error) {
      console.error('Error al cargar tienda:', error)
      toast.error('Fehler beim Laden des Geschäfts')
    } finally {
      setLoading(false)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Das Bild ist zu groß. Maximum 5MB')
        return
      }
      if (!file.type.startsWith('image/')) {
        toast.error('Bitte wählen Sie ein gültiges Bild aus')
        return
      }
      
      const img = new Image()
      img.onload = () => {
        const recommendedWidth = 320
        const recommendedHeight = 180
        const aspectRatio = recommendedWidth / recommendedHeight
        const currentAspectRatio = img.width / img.height
        
        const widthDiff = Math.abs(img.width - recommendedWidth) / recommendedWidth
        const heightDiff = Math.abs(img.height - recommendedHeight) / recommendedHeight
        const aspectDiff = Math.abs(currentAspectRatio - aspectRatio)
        
        if (widthDiff > 0.5 || heightDiff > 0.5 || aspectDiff > 0.3) {
          toast.warning(
            `Empfohlene Abmessungen: ${recommendedWidth}x${recommendedHeight}px (16:9). ` +
            `Ihr Bild: ${img.width}x${img.height}px. ` +
            `Kann nicht optimal aussehen.`
          )
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
      img.onerror = () => {
        toast.error('Fehler beim Laden des Bildes')
      }
      img.src = URL.createObjectURL(file)
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
        toast.error('Sie sind nicht authentifiziert')
        return
      }

      let finalLogo: string | null = logo || null
      if (logoFile && logoPreview) {
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
        toast.success('Geschäft erfolgreich aktualisiert')
        if (onUpdate) {
          onUpdate(result.data)
        }
      } else {
        toast.error(result.error || 'Fehler beim Aktualisieren')
      }
    } catch (error) {
      console.error('Error al actualizar tienda:', error)
      toast.error('Fehler beim Aktualisieren des Geschäfts')
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
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-4">
          <Loader size="lg" />
          <p className="text-gray-600 font-medium">Einstellungen werden geladen...</p>
        </div>
      </div>
    )
  }

  if (!store) {
    return (
      <div className="bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-200 rounded-3xl p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-yellow-100 rounded-xl">
            <AlertCircle className="w-5 h-5 text-yellow-600" />
          </div>
          <p className="text-yellow-800 font-medium">Ihr Geschäft wurde nicht gefunden</p>
        </div>
      </div>
    )
  }

  // Componente de campo estilo iOS
  const FormField = ({ 
    icon: Icon, 
    label, 
    value, 
    onChange, 
    placeholder, 
    type = 'text', 
    required = false,
    multiline = false,
    rows = 4
  }: {
    icon: React.ElementType
    label: string
    value: string
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
    placeholder?: string
    type?: string
    required?: boolean
    multiline?: boolean
    rows?: number
  }) => {
    const InputComponent = multiline ? 'textarea' : 'input'
    const hasValue = value.trim().length > 0
    
    return (
      <div className="bg-white rounded-2xl overflow-hidden border border-gray-200/60 shadow-sm">
        <div className="px-4 py-3 border-b border-gray-100/50">
          <label className="flex items-center gap-2.5 text-sm font-semibold text-gray-700">
            <Icon className="w-4 h-4 text-brand-500" />
            <span>{label}</span>
            {required && <span className="text-red-500 text-xs ml-1">*</span>}
          </label>
        </div>
        {editing ? (
          <InputComponent
            type={type}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            required={required}
            rows={multiline ? rows : undefined}
            className="w-full px-4 py-3.5 text-base text-gray-900 placeholder:text-gray-400 bg-transparent focus:outline-none"
          />
        ) : (
          <div className="px-4 py-3.5 min-h-[3rem] flex items-center">
            <p className={`text-base ${hasValue ? 'text-gray-900 font-medium' : 'text-gray-400 italic'}`}>
              {value || 'Nicht angegeben'}
            </p>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="w-full space-y-4">
      {/* Header integrado estilo iOS */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className={`font-bold text-gray-900 tracking-tight ${isMobile ? 'text-2xl' : 'text-3xl'}`}>
            Geschäftseinstellungen
          </h1>
          <p className={`text-gray-500 mt-1 ${isMobile ? 'text-sm' : 'text-base'}`}>
            Personalisieren Sie die Informationen Ihres Geschäfts
          </p>
        </div>
        
        {!editing ? (
          <button
            onClick={() => setEditing(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-brand-500 text-white rounded-xl hover:bg-brand-600 active:scale-95 transition-all duration-200 font-semibold text-sm shadow-lg shadow-brand-500/25"
          >
            <Edit3 className="w-4 h-4" />
            <span className="hidden sm:inline">Bearbeiten</span>
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={handleCancel}
              className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 active:scale-95 transition-all duration-200 font-semibold text-sm"
            >
              <X className="w-4 h-4" />
              <span className="hidden sm:inline">Abbrechen</span>
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !name.trim()}
              className="flex items-center gap-2 px-4 py-2.5 bg-brand-500 text-white rounded-xl hover:bg-brand-600 active:scale-95 transition-all duration-200 font-semibold text-sm shadow-lg shadow-brand-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <Loader size="sm" />
                  <span className="hidden sm:inline">Speichern...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="hidden sm:inline">Speichern</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Logo Section */}
      <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100/50">
          <div className="flex items-center gap-2.5">
            <ImageIcon className="w-4 h-4 text-brand-500" />
            <span className="text-sm font-semibold text-gray-700">Geschäftslogo</span>
          </div>
          <p className="text-xs text-gray-500 mt-1.5 ml-6">
            Empfohlene Abmessungen: <span className="font-semibold text-brand-600">320x180px</span> (16:9)
          </p>
        </div>
        
        <div className="p-4">
          {editing ? (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="relative">
                  {(logoPreview || (!useDefaultLogo && logo)) ? (
                    <div className="relative">
                      <div className="w-40 h-24 sm:w-48 sm:h-28 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-center overflow-hidden">
                        <img
                          src={logoPreview || logo}
                          alt="Logo preview"
                          className="max-w-full max-h-full object-contain p-2"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none'
                          }}
                        />
                      </div>
                      <button
                        onClick={handleRemoveLogo}
                        className="absolute -top-2 -right-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 active:scale-95 transition-all shadow-lg"
                        aria-label="Logo entfernen"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-40 h-24 sm:w-48 sm:h-28 bg-gray-100 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center">
                      <Store className="w-10 h-10 text-gray-400" />
                    </div>
                  )}
                </div>
                
                <div className="flex-1 w-full sm:w-auto space-y-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-brand-500 text-white rounded-xl hover:bg-brand-600 active:scale-95 transition-all font-semibold text-sm shadow-md"
                  >
                    <Upload className="w-4 h-4" />
                    Bild hochladen
                  </button>
                  <button
                    type="button"
                    onClick={handleUseDefaultLogo}
                    className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl transition-all font-semibold text-sm ${
                      useDefaultLogo
                        ? 'bg-brand-100 text-brand-700 border-2 border-brand-500'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 active:scale-95 border-2 border-transparent'
                    }`}
                  >
                    <Store className="w-4 h-4" />
                    Standard-Icon verwenden
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
              
              <div className="pt-3 border-t border-gray-100">
                <p className="text-xs text-gray-600 mb-2 font-medium">Oder Bild-URL eingeben:</p>
                <input
                  type="url"
                  value={useDefaultLogo ? '' : logo}
                  onChange={(e) => {
                    setLogo(e.target.value)
                    setLogoPreview(e.target.value)
                    setUseDefaultLogo(false)
                  }}
                  placeholder="https://example.com/logo.png"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent text-sm"
                  disabled={useDefaultLogo}
                />
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              {store.logo ? (
                <div className="w-28 h-18 sm:w-36 sm:h-22 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                  <img
                    src={store.logo}
                    alt="Store logo"
                    className="max-w-full max-h-full object-contain p-2"
                  />
                </div>
              ) : (
                <div className="w-28 h-18 sm:w-36 sm:h-22 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Store className="w-10 h-10 text-gray-400" />
                </div>
              )}
              <div>
                <p className="text-base font-semibold text-gray-900">
                  {store.logo ? 'Benutzerdefiniertes Logo' : 'Standard-Icon'}
                </p>
                <p className="text-sm text-gray-500 mt-0.5">
                  {store.logo ? 'Ihr Logo ist konfiguriert' : 'Kein benutzerdefiniertes Logo'}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Form Fields */}
      <div className="space-y-3">
        <FormField
          icon={Store}
          label="Geschäftsname"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="z.B. Heinigers Hofladen"
          required
        />

        <FormField
          icon={MapPin}
          label="Adresse"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="z.B. Grundhof 3, 8305 Dietlikon"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <FormField
            icon={Phone}
            label="Telefon"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="z.B. +41 44 123 45 67"
            type="tel"
          />

          <FormField
            icon={Mail}
            label="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="z.B. info@mein-geschäft.ch"
            type="email"
          />
        </div>

        {/* Descripción */}
        <div className="bg-white rounded-2xl overflow-hidden border border-gray-200/60 shadow-sm">
          <div className="px-4 py-3 border-b border-gray-100/50">
            <label className="flex items-center gap-2.5 text-sm font-semibold text-gray-700">
              <FileText className="w-4 h-4 text-brand-500" />
              <span>Beschreibung</span>
            </label>
          </div>
          {editing ? (
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Beschreiben Sie Ihr Geschäft..."
              rows={4}
              className="w-full px-4 py-3.5 text-base text-gray-900 placeholder:text-gray-400 bg-transparent focus:outline-none resize-none"
            />
          ) : (
            <div className="px-4 py-3.5 min-h-[5rem] flex items-start">
              <p className={`text-base whitespace-pre-wrap ${description.trim() ? 'text-gray-900 font-medium' : 'text-gray-400 italic'}`}>
                {description || 'Nicht angegeben'}
              </p>
            </div>
          )}
        </div>

        {/* Slug */}
        <div className="bg-gray-50 rounded-2xl border border-gray-200/60 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200/50">
            <label className="flex items-center gap-2.5 text-sm font-semibold text-gray-600">
              <Store className="w-4 h-4 text-gray-500" />
              <span>URL-Slug</span>
              <span className="text-xs text-gray-400 font-normal ml-auto">(Nur-Lesen)</span>
            </label>
          </div>
          <div className="px-4 py-3.5">
            <p className="text-sm text-gray-800 font-mono break-all bg-white px-3 py-2 rounded-lg border border-gray-200">
              {store.slug}
            </p>
            <p className="text-xs text-gray-500 mt-2 flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
              Dieser Wert kann nicht geändert werden
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
