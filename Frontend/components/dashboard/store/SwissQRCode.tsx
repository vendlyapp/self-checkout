'use client'

import React from 'react'
import Image from 'next/image'

interface SwissQRCodeProps {
  qrCodeUrl?: string
  size?: number
  className?: string
}

/**
 * Componente que muestra un QR code con la cruz suiza en el centro
 * Usa la imagen predefinida /qrsuiza.png o la URL proporcionada
 */
export default function SwissQRCode({ 
  qrCodeUrl, 
  size = 200,
  className = '' 
}: SwissQRCodeProps) {
  // Usar la URL proporcionada o la imagen predefinida
  const imageSrc = qrCodeUrl || '/qrsuiza.png'

  return (
    <div 
      className={`relative inline-block bg-white border-2 border-white p-1 ${className}`}
      style={{ width: size, height: size, backgroundColor: '#FFFFFF', borderColor: '#FFFFFF' }}
    >
      <Image
        src={imageSrc}
        alt="QR Code Suiza"
        width={size}
        height={size}
        className="w-full h-full object-contain bg-white"
        style={{ backgroundColor: '#FFFFFF' }}
        unoptimized
      />
    </div>
  )
}
