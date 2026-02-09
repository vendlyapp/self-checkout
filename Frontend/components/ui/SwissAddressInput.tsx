'use client'

import { useState, useEffect, useCallback } from 'react'

export interface SwissAddressValue {
  strasse: string
  nr: string
  plzOrt: string
}

/** Parse combined address string "Strasse Nr., PLZ Ort" into parts */
export const parseSwissAddress = (value: string): SwissAddressValue => {
  if (!value?.trim()) return { strasse: '', nr: '', plzOrt: '' }
  const trimmed = value.trim()
  const commaIdx = trimmed.indexOf(',')
  if (commaIdx > 0) {
    const streetPart = trimmed.slice(0, commaIdx).trim()
    const plzOrt = trimmed.slice(commaIdx + 1).trim()
    const nrMatch = streetPart.match(/\s+(\d+[a-z]?)$/i)
    const strasse = nrMatch ? streetPart.slice(0, nrMatch.index).trim() : streetPart
    const nr = nrMatch ? nrMatch[1] : ''
    return { strasse, nr, plzOrt }
  }
  const nrMatch = trimmed.match(/\s+(\d+[a-z]?)$/i)
  if (nrMatch) {
    const strasse = trimmed.slice(0, nrMatch.index).trim()
    const nr = nrMatch[1]
    return { strasse, nr, plzOrt: '' }
  }
  if (/^\d{4}\s/.test(trimmed)) return { strasse: '', nr: '', plzOrt: trimmed }
  return { strasse: trimmed, nr: '', plzOrt: '' }
}

/** Combine parts into "Strasse Nr., PLZ Ort" */
export const formatSwissAddress = ({ strasse, nr, plzOrt }: SwissAddressValue): string => {
  const streetPart = nr ? `${strasse} ${nr}`.trim() : strasse.trim()
  if (!streetPart && !plzOrt) return ''
  if (!streetPart) return plzOrt
  if (!plzOrt) return streetPart
  return `${streetPart}, ${plzOrt}`
}

interface SwissAddressInputProps {
  value: string
  onChange: (value: string) => void
  placeholderStrasse?: string
  placeholderNr?: string
  placeholderPlzOrt?: string
  disabled?: boolean
  className?: string
  inputClassName?: string
}

export const SwissAddressInput = ({
  value,
  onChange,
  placeholderStrasse = 'Strasse',
  placeholderNr = 'Nr.',
  placeholderPlzOrt = 'PLZ Ort',
  disabled = false,
  className = '',
  inputClassName = ''
}: SwissAddressInputProps) => {
  const [parts, setParts] = useState<SwissAddressValue>(() => parseSwissAddress(value))

  useEffect(() => {
    setParts(parseSwissAddress(value))
  }, [value])

  const handleChange = useCallback(
    (field: keyof SwissAddressValue, val: string) => {
      const next = { ...parts, [field]: val }
      setParts(next)
      onChange(formatSwissAddress(next))
    },
    [parts, onChange]
  )

  return (
    <div className={`grid grid-cols-[1fr_auto_1fr] gap-2 ${className}`}>
      <input
        type="text"
        value={parts.strasse}
        onChange={(e) => handleChange('strasse', e.target.value)}
        placeholder={placeholderStrasse}
        disabled={disabled}
        className={`w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent ${inputClassName}`}
        aria-label="Strasse"
      />
      <input
        type="text"
        value={parts.nr}
        onChange={(e) => handleChange('nr', e.target.value)}
        placeholder={placeholderNr}
        disabled={disabled}
        className={`w-16 px-2 py-2.5 border border-gray-200 rounded-xl text-sm text-center focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent ${inputClassName}`}
        aria-label="Hausnummer"
      />
      <input
        type="text"
        value={parts.plzOrt}
        onChange={(e) => handleChange('plzOrt', e.target.value)}
        placeholder={placeholderPlzOrt}
        disabled={disabled}
        className={`w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent ${inputClassName}`}
        aria-label="PLZ Ort"
      />
    </div>
  )
}
