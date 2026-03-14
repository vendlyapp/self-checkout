'use client'

import { useState, useEffect, useRef } from 'react'
import { Save, X, Store, Image as ImageIcon, MapPin, Phone, Mail, FileText, Upload, CheckCircle2, AlertCircle, Edit3 } from 'lucide-react'
import { toast } from 'sonner'
import { buildApiUrl, getAuthHeaders } from '@/lib/config/api'
import { Loader } from '@/components/ui/Loader'
import { SwissAddressInput } from '@/components/ui/SwissAddressInput'
import { useResponsive } from '@/hooks'
import type { StoreData } from '@/hooks/queries/useMyStore'
import { devError } from '@/lib/utils/logger'
import { useStoreSettingsHeader } from '@/lib/contexts/StoreSettingsHeaderContext'

interface StoreSettingsFormProps {
  onUpdate?: (store: StoreData) => void
}

/** Campo de formulario: definido fuera del componente para evitar remount y pérdida de foco al escribir */
interface FormFieldProps {
  icon: React.ElementType
  label: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
  placeholder?: string
  type?: string
  required?: boolean
  multiline?: boolean
  rows?: number
  editing: boolean
}

/** Sección agrupada estilo iOS */
const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <h2 className="px-1 text-[13px] font-semibold uppercase tracking-wide text-gray-500 mb-2">
    {children}
  </h2>
)

const FormField = ({
  icon: Icon,
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  required = false,
  multiline = false,
  rows = 4,
  editing,
}: FormFieldProps) => {
  const InputComponent = multiline ? 'textarea' : 'input'
  const hasValue = value.trim().length > 0
  return (
    <div className="flex items-center gap-3 py-3.5 px-4 min-h-[52px] border-b border-gray-100 last:border-0">
      <Icon className="w-5 h-5 text-gray-400 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <label className="block text-[13px] font-medium text-gray-500 mb-0.5">{label}</label>
        {editing ? (
          <InputComponent
            type={type}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            required={required}
            rows={multiline ? rows : undefined}
            className="w-full text-[17px] text-gray-900 placeholder:text-gray-400 bg-transparent focus:outline-none py-0.5 -ml-1 min-h-[2.25rem]"
          />
        ) : (
          <div className="min-h-[2.25rem] flex items-center py-0.5 -ml-1">
            <p className={`text-[17px] ${hasValue ? 'text-gray-900 font-medium' : 'text-gray-400'}`}>
              {value || '—'}
            </p>
          </div>
        )}
      </div>
      {required && <span className="text-red-500 text-xs flex-shrink-0">*</span>}
    </div>
  )
}

export default function StoreSettingsForm({ onUpdate }: StoreSettingsFormProps) {
  const { isMobile } = useResponsive()
  const setHeaderRightContent = useStoreSettingsHeader()?.setRightContent
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
  const [vatNumber, setVatNumber] = useState('')
  const [description, setDescription] = useState('')
  const [slug, setSlug] = useState('')
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
        setVatNumber(result.data.vatNumber || '')
        setDescription(result.data.description || '')
        setSlug(result.data.slug || '')
      } else {
        toast.error(result.error || 'Fehler beim Laden des Geschäfts')
      }
    } catch (error) {
      devError('Error al cargar tienda:', error)
      toast.error('Fehler beim Laden des Geschäfts')
    } finally {
      setLoading(false)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Das Bild ist zu gross. Maximum 5MB')
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

      const isFirstTimeSetup = store != null && (store.settingsCompletedAt == null || store.settingsCompletedAt === '')
      const body: Record<string, unknown> = {
        name: name.trim(),
        logo: finalLogo || null,
        address: address.trim() || null,
        phone: phone.trim() || null,
        email: email.trim() || null,
        vatNumber: vatNumber.trim() || null,
        description: description.trim() || null
      }
      if (isFirstTimeSetup && slug.trim()) {
        body.slug = slug.trim()
      }

      const response = await fetch(url, {
        method: 'PUT',
        headers,
        body: JSON.stringify(body)
      })

      const result = await response.json()

      if (!response.ok) {
        toast.error(result?.error || 'Fehler beim Aktualisieren')
        return
      }

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
      devError('Error al actualizar tienda:', error)
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
      setVatNumber(store.vatNumber || '')
      setDescription(store.description || '')
      setSlug(store.slug || '')
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    setEditing(false)
  }

  // Inyectar botones en el HeaderNav (móvil) — mismo estilo que el header
  useEffect(() => {
    if (!setHeaderRightContent || !isMobile || !store) return
    if (!editing) {
      setHeaderRightContent(
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="min-h-[44px] px-3 py-2 rounded-xl bg-brand-500 text-white text-[15px] font-semibold active:scale-[0.98] touch-manipulation"
        >
          Bearbeiten
        </button>
      )
    } else {
      setHeaderRightContent(
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCancel}
            className="min-h-[44px] px-3 py-2 rounded-xl border border-gray-200 text-gray-700 text-[15px] font-semibold active:scale-[0.98] touch-manipulation bg-white"
          >
            Abbrechen
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || !name.trim()}
            className="min-h-[44px] px-3 py-2 rounded-xl bg-brand-500 text-white text-[15px] font-semibold disabled:opacity-50 active:scale-[0.98] touch-manipulation"
          >
            {saving ? <Loader size="sm" /> : 'Speichern'}
          </button>
        </div>
      )
    }
    return () => { setHeaderRightContent(null) }
  }, [isMobile, store, editing, saving, name, setHeaderRightContent])

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

  return (
    <div className="w-full space-y-8">
      {/* Título: en móvil el header nav ya dice "Einstellungen", aquí solo subtítulo */}
      <div className={isMobile ? 'mb-1' : 'mb-2'}>
        {!isMobile && (
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            Einstellungen
          </h1>
        )}
        <p className={`text-gray-500 ${isMobile ? 'text-[15px]' : 'mt-1 text-base'}`}>
          Geschäftsinformationen anpassen
        </p>
      </div>

      {/* Barra de acciones: en desktop arriba a la derecha, en mobile sticky abajo */}
      {!isMobile && (
        <div className="flex justify-end gap-2 -mt-4">
          {!editing ? (
            <button
              onClick={() => setEditing(true)}
              className="flex items-center gap-2 min-h-[44px] px-5 py-2.5 bg-brand-500 text-white rounded-xl hover:bg-brand-600 active:scale-[0.98] font-semibold text-[15px] shadow-lg shadow-brand-500/20"
            >
              <Edit3 className="w-4 h-4" />
              Bearbeiten
            </button>
          ) : (
            <>
              <button
                onClick={handleCancel}
                className="flex items-center gap-2 min-h-[44px] px-5 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 font-semibold text-[15px]"
              >
                <X className="w-4 h-4" />
                Abbrechen
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !name.trim()}
                className="flex items-center gap-2 min-h-[44px] px-5 py-2.5 bg-brand-500 text-white rounded-xl hover:bg-brand-600 disabled:opacity-50 font-semibold text-[15px] shadow-lg shadow-brand-500/20"
              >
                {saving ? <Loader size="sm" /> : <CheckCircle2 className="w-4 h-4" />}
                {saving ? 'Speichern…' : 'Speichern'}
              </button>
            </>
          )}
        </div>
      )}

      {/* Sección: Logo */}
      <div>
        <SectionTitle>Geschäft</SectionTitle>
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
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
              
              <p className="text-[12px] text-gray-500 mt-3">Empfohlen: 320×180 px (16:9).</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                {store.logo ? (
                  <div className="w-40 h-24 sm:w-48 sm:h-28 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                    <img
                      src={store.logo}
                      alt="Store logo"
                      className="max-w-full max-h-full object-contain p-2"
                    />
                  </div>
                ) : (
                  <div className="w-40 h-24 sm:w-48 sm:h-28 bg-gray-100 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center flex-shrink-0">
                    <Store className="w-10 h-10 text-gray-400" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium text-gray-500 mb-0.5">Geschäftslogo</p>
                  <p className="text-[17px] text-gray-900 font-medium">
                    {store.logo ? 'Benutzerdefiniertes Logo' : 'Standard-Icon'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
        </div>
      </div>

      {/* Sección: Angaben (Name + Adresse) */}
      <div>
        <SectionTitle>Angaben</SectionTitle>
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <FormField
            icon={Store}
            label="Geschäftsname"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="z.B. Heinigers Hofladen"
            required
            editing={editing}
          />
          <div className="flex items-start gap-3 py-3.5 px-4 border-b border-gray-100 last:border-0 min-h-[52px]">
            <MapPin className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <label className="block text-[13px] font-medium text-gray-500 mb-0.5">Adresse</label>
              {editing ? (
                <SwissAddressInput
                  value={address}
                  onChange={setAddress}
                  placeholderStrasse="Strasse"
                  placeholderNr="Nr."
                  placeholderPlz="PLZ"
                  placeholderOrt="Ort"
                />
              ) : (
                <div className="min-h-[2.25rem] flex items-center py-0.5">
                  <p className={`text-[17px] ${address.trim() ? 'text-gray-900 font-medium' : 'text-gray-400'}`}>
                    {address || '—'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Sección: Kontakt */}
      <div>
        <SectionTitle>Kontakt</SectionTitle>
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <FormField
            icon={Phone}
            label="Telefon"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+41 44 123 45 67"
            type="tel"
            editing={editing}
          />
          <FormField
            icon={Mail}
            label="E-Mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="info@beispiel.ch"
            type="email"
            editing={editing}
          />
        </div>
      </div>

      {/* Sección: Sonstiges */}
      <div>
        <SectionTitle>Sonstiges</SectionTitle>
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <FormField
            icon={FileText}
            label="MwSt-Nummer"
            value={vatNumber}
            onChange={(e) => setVatNumber(e.target.value)}
            placeholder="CHE-123.456.789 MWST"
            editing={editing}
          />
          <div className="flex items-start gap-3 py-3.5 px-4 border-b border-gray-100">
            <FileText className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <label className="block text-[13px] font-medium text-gray-500 mb-0.5">Beschreibung</label>
              {editing ? (
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Kurze Beschreibung Ihres Geschäfts…"
                  rows={3}
                  className="w-full text-[17px] text-gray-900 placeholder:text-gray-400 bg-transparent focus:outline-none resize-none py-0.5 -ml-1 min-h-[4.5rem]"
                />
              ) : (
                <div className="min-h-[4.5rem] py-0.5 -ml-1 flex items-start">
                  <p className={`text-[17px] whitespace-pre-wrap ${description.trim() ? 'text-gray-900 font-medium' : 'text-gray-400'}`}>
                    {description || '—'}
                  </p>
                </div>
              )}
            </div>
          </div>
          {(() => {
            const isFirstTimeSetup = store.settingsCompletedAt == null || store.settingsCompletedAt === ''
            const displaySlug = (editing && isFirstTimeSetup ? slug : store.slug) || ''
            return (
              <div className="flex items-center gap-3 py-3.5 px-4 min-h-[52px]">
                <Store className="w-5 h-5 text-gray-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <label className="block text-[13px] font-medium text-gray-500 mb-0.5">
                    Shop-URL {!isFirstTimeSetup && '(nur lesen)'}
                  </label>
                  {editing && isFirstTimeSetup ? (
                    <>
                      <input
                        type="text"
                        value={slug}
                        onChange={(e) => setSlug(e.target.value)}
                        placeholder={store.slug || 'mein-geschäft'}
                        className="w-full text-[17px] text-gray-900 placeholder:text-gray-400 bg-transparent focus:outline-none font-mono py-0.5 -ml-1 min-h-[2.25rem]"
                        aria-label="Shop-URL"
                      />
                      <p className="text-[12px] text-gray-500 mt-1.5 flex items-center gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                        Nur bei der ersten Einrichtung änderbar.
                      </p>
                    </>
                  ) : (
                    <div className="min-h-[2.25rem] flex items-center py-0.5 -ml-1">
                      <p className="text-[17px] font-mono text-gray-900 break-all">{displaySlug}</p>
                    </div>
                  )}
                </div>
              </div>
            )
          })()}
        </div>
      </div>

    </div>
  )
}
