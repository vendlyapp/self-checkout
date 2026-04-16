'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

export interface SwissAddressValue {
  strasse: string
  nr: string
  plz: string
  ort: string
}

/** Parse combined address string "Strasse Nr., PLZ Ort" into parts */
export const parseSwissAddress = (value: string): SwissAddressValue => {
  if (!value?.trim()) return { strasse: '', nr: '', plz: '', ort: '' }
  const trimmed = value.trim()
  const commaIdx = trimmed.indexOf(',')
  let streetPart = ''
  let plzOrtPart = ''
  if (commaIdx > 0) {
    streetPart = trimmed.slice(0, commaIdx).trim()
    plzOrtPart = trimmed.slice(commaIdx + 1).trim()
  } else {
    const nrMatch = trimmed.match(/\s+(\d+[a-z]?)$/i)
    if (nrMatch) {
      streetPart = trimmed
      plzOrtPart = ''
    } else if (/^\d{4,5}\s/.test(trimmed)) {
      streetPart = ''
      plzOrtPart = trimmed
    } else {
      return { strasse: trimmed, nr: '', plz: '', ort: '' }
    }
  }

  const nrMatch = streetPart.match(/\s+(\d+[a-z]?)$/i)
  const strasse = nrMatch ? streetPart.slice(0, nrMatch.index).trim() : streetPart
  const nr = nrMatch ? nrMatch[1] : ''

  // Formato "PLZ Ort" (ej. "6632 Bogotacali")
  let plz = ''
  let ort = ''
  const plzOrtMatch = plzOrtPart.match(/^(\d{4,5})\s+(.+)$/)
  if (plzOrtMatch) {
    plz = plzOrtMatch[1]
    ort = plzOrtMatch[2].trim()
  } else {
    // Format "Ort PLZ" from cache (e.g. "Bogotacali 6632")
    const ortPlzMatch = plzOrtPart.match(/^(.+?)\s+(\d{4,5})$/)
    if (ortPlzMatch) {
      ort = ortPlzMatch[1].trim()
      plz = ortPlzMatch[2]
    } else if (plzOrtPart && /^\d+$/.test(plzOrtPart)) {
      plz = plzOrtPart
    } else if (plzOrtPart) {
      ort = plzOrtPart.trim()
    }
  }

  return { strasse, nr, plz, ort }
}

/** Combine parts into "Strasse Nr., PLZ Ort" */
export const formatSwissAddress = ({ strasse, nr, plz, ort }: SwissAddressValue): string => {
  const streetPart = nr ? `${strasse} ${nr}`.trim() : strasse.trim()
  const locPart = [plz, ort].filter(Boolean).join(' ').trim()
  if (!streetPart && !locPart) return ''
  if (!streetPart) return locPart
  if (!locPart) return streetPart
  return `${streetPart}, ${locPart}`
}

interface SwissAddressInputProps {
  value: string
  onChange: (value: string) => void
  placeholderStrasse?: string
  placeholderNr?: string
  placeholderPlz?: string
  placeholderOrt?: string
  disabled?: boolean
  className?: string
  inputClassName?: string
}

export const SwissAddressInput = ({
  value,
  onChange,
  placeholderStrasse = 'Strasse',
  placeholderNr = 'Nr.',
  placeholderPlz = 'PLZ',
  placeholderOrt = 'Ort',
  disabled = false,
  className = '',
  inputClassName = ''
}: SwissAddressInputProps) => {
  const [parts, setParts] = useState<SwissAddressValue>(() => parseSwissAddress(value))
  const lastEmittedRef = useRef<string>(value)

  useEffect(() => {
    if (value === lastEmittedRef.current) return
    if (value === '' && lastEmittedRef.current !== '') return
    lastEmittedRef.current = value
    setParts(parseSwissAddress(value))
  }, [value])

  const handleChange = useCallback(
    (field: keyof SwissAddressValue, val: string) => {
      const next = { ...parts, [field]: val }
      const formatted = formatSwissAddress(next)
      lastEmittedRef.current = formatted
      setParts(next)
      onChange(formatted)
    },
    [parts, onChange]
  )

  // text-base (16px) + ios-input-fix: verhindert iOS-Safari-Autozoom beim Fokus
  const inputBase = `min-h-[2.75rem] border border-gray-200 rounded-xl text-base ios-input-fix focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent ${inputClassName}`

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Fila 1: Strasse (ancho) | Nr (estrecho) */}
      <div className="grid grid-cols-[1fr_5rem] gap-2">
        <input
          type="text"
          value={parts.strasse}
          onChange={(e) => handleChange('strasse', e.target.value)}
          placeholder={placeholderStrasse}
          disabled={disabled}
          className={`w-full px-3 py-2.5 ${inputBase}`}
          aria-label="Strasse"
        />
        <input
          type="text"
          value={parts.nr}
          onChange={(e) => handleChange('nr', e.target.value)}
          placeholder={placeholderNr}
          disabled={disabled}
          className={`w-full px-2 py-2.5 text-center ${inputBase}`}
          aria-label="Hausnummer"
        />
      </div>
      {/* Fila 2: PLZ (estrecho, primero) | Ort (ancho, segundo) */}
      <div className="grid grid-cols-[5rem_1fr] gap-2">
        <input
          type="text"
          value={parts.plz}
          onChange={(e) => handleChange('plz', e.target.value)}
          placeholder={placeholderPlz}
          disabled={disabled}
          className={`w-full px-2 py-2.5 text-center ${inputBase}`}
          aria-label="PLZ"
        />
        <input
          type="text"
          value={parts.ort}
          onChange={(e) => handleChange('ort', e.target.value)}
          placeholder={placeholderOrt}
          disabled={disabled}
          className={`w-full px-3 py-2.5 ${inputBase}`}
          aria-label="Ort"
        />
      </div>
    </div>
  )
}
