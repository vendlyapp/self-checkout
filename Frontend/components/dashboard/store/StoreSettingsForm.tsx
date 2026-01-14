'use client'

import { useState, useEffect, useRef } from 'react'
import { Save, X, Store, Image as ImageIcon, MapPin, Phone, Mail, FileText, Upload, CheckCircle2, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { buildApiUrl, getAuthHeaders } from '@/lib/config/api'
import { Loader } from '@/components/ui/Loader'

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
      
      // Validar dimensiones de la imagen
      const img = new Image()
      img.onload = () => {
        const recommendedWidth = 320
        const recommendedHeight = 180
        const aspectRatio = recommendedWidth / recommendedHeight // ~1.78 (16:9)
        const currentAspectRatio = img.width / img.height
        
        // Verificar si las dimensiones están dentro de un rango aceptable
        const widthDiff = Math.abs(img.width - recommendedWidth) / recommendedWidth
        const heightDiff = Math.abs(img.height - recommendedHeight) / recommendedHeight
        const aspectDiff = Math.abs(currentAspectRatio - aspectRatio)
        
        if (widthDiff > 0.5 || heightDiff > 0.5 || aspectDiff > 0.3) {
          toast.warning(
            `Dimensiones recomendadas: ${recommendedWidth}x${recommendedHeight}px (16:9). ` +
            `Tu imagen: ${img.width}x${img.height}px. ` +
            `Puede no verse óptima.`
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
        toast.error('Error al cargar la imagen')
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
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-4">
          <Loader size="lg" />
          <p className="text-gray-600 font-medium">Cargando configuración...</p>
        </div>
      </div>
    )
  }

  if (!store) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6">
        <div className="flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
          <p className="text-yellow-800 font-medium">Ihr Geschäft wurde nicht gefunden</p>
        </div>
      </div>
    )
  }

  // Componente de campo de formulario iOS-like - Optimizado para móvil
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
    return (
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden transition-ios active:scale-[0.998] shadow-sm">
        <div className="px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-50/50 border-b border-gray-100">
          <label className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-gray-700">
            <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-brand-500 flex-shrink-0" />
            <span>{label} {required && <span className="text-red-500">*</span>}</span>
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
            className="w-full px-3 sm:px-4 py-3 sm:py-3.5 text-sm sm:text-base text-gray-900 placeholder:text-gray-400 bg-transparent focus:outline-none transition-ios"
          />
        ) : (
          <div className="px-3 sm:px-4 py-3 sm:py-3.5">
            <p className="text-sm sm:text-base text-gray-900 font-medium">
              {value || <span className="text-gray-400 italic">No especificado</span>}
            </p>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="w-full max-w-4xl mx-auto animate-fade-in">
      {/* Header con diseño iOS - Optimizado para móvil */}
      <div className="mb-5 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <div className="flex-1 min-w-0">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">Configuración de Tienda</h2>
            <p className="text-gray-500 mt-1 text-xs sm:text-sm md:text-base hidden sm:block">Personaliza la información de tu tienda</p>
          </div>
          {!editing ? (
            <button
              onClick={() => setEditing(true)}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 bg-brand-500 text-white rounded-xl hover:bg-brand-600 active:scale-95 transition-ios font-semibold text-sm sm:text-base shadow-lg shadow-brand-500/20 touch-target"
            >
              <Save className="w-4 h-4" />
              <span>Editar</span>
            </button>
          ) : (
            <div className="flex gap-2 w-full sm:w-auto">
              <button
                onClick={handleCancel}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 active:scale-95 transition-ios font-semibold text-sm sm:text-base touch-target"
              >
                <X className="w-4 h-4" />
                <span>Cancelar</span>
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !name.trim()}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 bg-brand-500 text-white rounded-xl hover:bg-brand-600 active:scale-95 transition-ios font-semibold disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base shadow-lg shadow-brand-500/20 touch-target"
              >
                {saving ? (
                  <Loader size="sm" />
                ) : (
                  <CheckCircle2 className="w-4 h-4" />
                )}
                <span>Guardar</span>
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-3 sm:space-y-4">
        {/* Sección de Logo - Diseño mejorado y optimizado para móvil */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-50/50 border-b border-gray-100">
            <label className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-gray-700">
              <ImageIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-brand-500 flex-shrink-0" />
              <span>Logo de la Tienda</span>
            </label>
            <p className="text-xs text-gray-500 mt-1.5 ml-5 sm:ml-6 leading-relaxed">
              Dimensiones recomendadas: <span className="font-semibold text-brand-600">320x180px</span> (16:9)
            </p>
          </div>
          <div className="p-3 sm:p-4 md:p-6">
            {editing ? (
              <div className="space-y-3 sm:space-y-4">
                {/* Preview del logo - Optimizado para móvil */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                  <div className="relative flex-shrink-0 w-full sm:w-auto">
                    {(logoPreview || (!useDefaultLogo && logo)) ? (
                      <div className="relative inline-block">
                        <div className="w-full max-w-[160px] sm:w-40 sm:h-24 aspect-[16/9] bg-gray-50 rounded-xl border-2 border-gray-200 flex items-center justify-center overflow-hidden">
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
                          className="absolute -top-2 -right-2 w-6 h-6 sm:w-7 sm:h-7 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 active:scale-95 transition-ios shadow-lg touch-target"
                          aria-label="Eliminar logo"
                        >
                          <X className="w-3 h-3 sm:w-4 sm:h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="w-full max-w-[160px] sm:w-40 sm:h-24 aspect-[16/9] bg-gray-100 rounded-xl flex items-center justify-center border-2 border-dashed border-gray-300">
                        <Store className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 w-full sm:w-auto space-y-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 sm:py-3 bg-brand-500 text-white rounded-xl hover:bg-brand-600 active:scale-95 transition-ios font-semibold text-sm shadow-lg shadow-brand-500/20 touch-target"
                    >
                      <Upload className="w-4 h-4" />
                      Subir Imagen
                    </button>
                    <button
                      type="button"
                      onClick={handleUseDefaultLogo}
                      className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 sm:py-3 rounded-xl transition-ios font-semibold text-sm touch-target ${
                        useDefaultLogo
                          ? 'bg-brand-100 text-brand-700 border-2 border-brand-500'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200 active:scale-95'
                      }`}
                    >
                      <Store className="w-4 h-4" />
                      Usar Icono por Defecto
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
                {/* Opción de URL */}
                <div className="pt-2 sm:pt-3 border-t border-gray-100">
                  <p className="text-xs text-gray-500 mb-2 font-medium">O ingresar URL de imagen:</p>
                  <input
                    type="url"
                    value={useDefaultLogo ? '' : logo}
                    onChange={(e) => {
                      setLogo(e.target.value)
                      setLogoPreview(e.target.value)
                      setUseDefaultLogo(false)
                    }}
                    placeholder="https://example.com/logo.png"
                    className="w-full px-3 sm:px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent text-sm transition-ios"
                    disabled={useDefaultLogo}
                  />
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 sm:gap-4">
                {store.logo ? (
                  <div className="w-24 h-16 sm:w-32 sm:h-20 md:w-40 md:h-24 bg-gray-50 rounded-xl border-2 border-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                    <img
                      src={store.logo}
                      alt="Store logo"
                      className="max-w-full max-h-full object-contain p-2"
                    />
                  </div>
                ) : (
                  <div className="w-24 h-16 sm:w-32 sm:h-20 md:w-40 md:h-24 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Store className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-sm sm:text-base font-semibold text-gray-900">
                    {store.logo ? 'Logo personalizado' : 'Icono por defecto'}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                    {store.logo ? 'Tu logo está configurado' : 'No hay logo personalizado'}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Campos de formulario con diseño iOS */}
        <FormField
          icon={Store}
          label="Nombre de la Tienda"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ej: Heinigers Hofladen"
          required
        />

        <FormField
          icon={MapPin}
          label="Dirección"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Ej: Grundhof 3, 8305 Dietlikon"
        />

        <FormField
          icon={Phone}
          label="Teléfono"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Ej: +41 44 123 45 67"
          type="tel"
        />

        <FormField
          icon={Mail}
          label="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Ej: info@mein-geschäft.ch"
          type="email"
        />

        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden transition-ios active:scale-[0.998] shadow-sm">
          <div className="px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-50/50 border-b border-gray-100">
            <label className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-gray-700">
              <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-brand-500 flex-shrink-0" />
              <span>Descripción</span>
            </label>
          </div>
          {editing ? (
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe tu tienda..."
              rows={4}
              className="w-full px-3 sm:px-4 py-3 sm:py-3.5 text-sm sm:text-base text-gray-900 placeholder:text-gray-400 bg-transparent focus:outline-none transition-ios resize-none"
            />
          ) : (
            <div className="px-3 sm:px-4 py-3 sm:py-3.5">
              <p className="text-sm sm:text-base text-gray-900 font-medium whitespace-pre-wrap">
                {description || <span className="text-gray-400 italic">No especificado</span>}
              </p>
            </div>
          )}
        </div>

        {/* Slug (solo lectura) - Optimizado para móvil */}
        <div className="bg-gray-50 rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-100/50 border-b border-gray-200">
            <label className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-gray-600">
              <Store className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-500 flex-shrink-0" />
              <span>URL-Slug</span>
            </label>
          </div>
          <div className="px-3 sm:px-4 py-3 sm:py-3.5">
            <p className="text-xs sm:text-sm text-gray-700 font-mono break-all">
              {store.slug}
            </p>
            <p className="text-xs text-gray-500 mt-2 leading-relaxed">
              Este valor no puede ser modificado
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
