'use client'

import React, { useState } from 'react';
import { Camera, QrCode } from 'lucide-react';
import HeaderUser from '@/components/navigation/user/HeaderUser';

const SnanerDash = () => {
  const [isScanning, setIsScanning] = useState(false);

  const simulateScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      // Aquí puedes agregar la lógica para procesar el producto escaneado
      console.log('Producto escaneado');
      setIsScanning(false);
    }, 2000);
  };

  return (
    <div className="h-full w-full overflow-hidden bg-[#191F2D] text-white flex flex-col items-center justify-center">
      {/* Header específico para modo oscuro */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-[#191F2D]">
        <HeaderUser isDarkMode={true} />
      </div>
      
      {/* Header secundario específico para el escáner */}
      <div className="fixed top-[85px] left-0 right-0 z-50 bg-[#191F2D] border-b border-gray-700">
        <div className='flex items-center justify-between w-full px-4 py-3'>
          <div className='flex flex-col items-start justify-start'>
            <p className='text-sm text-white font-bold text-[21px]'>Heinigers Hofladen</p>
            <p className='text-sm text-gray-400 text-[14px]'>Grundhof 3, 8305 Dietlikon • ⭐ 4.8</p>
          </div>
          <div className='flex items-center justify-end'>
            <button className='bg-[#FFFFFF] text-[#6E7996] px-4 py-2 rounded-md hover:bg-gray-600 transition-colors'>
              Kontakt
            </button>
          </div>
        </div>
      </div>
      
      {/* Scanner Content con padding para los headers fijos */}
      <div className="flex-1 flex flex-col items-center justify-center p-8" style={{ paddingTop: '140px' }}>
        <div className="relative w-80 h-80 mb-12">
          {/* Main scanner container */}
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm border border-white/10 rounded-3xl shadow-2xl overflow-hidden">
            
            {/* Corner markers - improved design */}
            <div className="absolute top-6 left-6 w-12 h-12">
              <div className="absolute top-0 left-0 w-full h-3 bg-gradient-to-r from-[#25D076] to-transparent rounded-tl-2xl"></div>
              <div className="absolute top-0 left-0 w-3 h-full bg-gradient-to-b from-[#25D076] to-transparent rounded-tl-2xl"></div>
            </div>
            <div className="absolute top-6 right-6 w-12 h-12">
                <div className="absolute top-0 right-0 w-full h-3 bg-gradient-to-l from-[#25D076] to-transparent rounded-tr-2xl"></div>
              <div className="absolute top-0 right-0 w-3 h-full bg-gradient-to-b from-[#25D076] to-transparent rounded-tr-2xl"></div>
            </div>
            <div className="absolute bottom-6 left-6 w-12 h-12">
              <div className="absolute bottom-0 left-0 w-full h-3 bg-gradient-to-r from-[#25D076] to-transparent rounded-bl-2xl"></div>
              <div className="absolute bottom-0 left-0 w-3 h-full bg-gradient-to-t from-[#25D076] to-transparent rounded-bl-2xl"></div>
            </div>
            <div className="absolute bottom-6 right-6 w-12 h-12">
              <div className="absolute bottom-0 right-0 w-full h-3 bg-gradient-to-l from-[#25D076] to-transparent rounded-br-2xl"></div>
              <div className="absolute bottom-0 right-0 w-3 h-full bg-gradient-to-t from-[#25D076] to-transparent rounded-br-2xl"></div>
            </div>

            {/* Center content */}
            <div className="absolute inset-0 flex items-center justify-center">
              {isScanning ? (
                <div className="text-center relative w-full h-full">
                  {/* Enhanced animated scanner line */}
                  <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
                      <div className="absolute w-64 h-1 bg-gradient-to-r from-transparent via-[#25D076] via-white to-transparent opacity-90 shadow-lg" style={{
                       animation: 'scanLine 1.5s ease-in-out infinite',
                       filter: 'drop-shadow(0 0 8px #25D076)'
                     }}></div>
                  </div>
                  <style jsx>{`
                    @keyframes scanLine {   
                      0% { transform: translateY(-140px); opacity: 0; }
                      10% { opacity: 1; }
                      90% { opacity: 1; }
                      100% { transform: translateY(140px); opacity: 0; }
                    }
                  `}</style>
                  
                  {/* Status indicator */}
                  <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
                    <div className="flex items-center space-x-2 bg-black/50 px-4 py-2 rounded-full">
                      <div className="w-2 h-2 bg-[#25D076] rounded-full animate-pulse"></div>
                      <span className="text-[#25D076] text-sm font-semibold">Analysiert...</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  {/* Barcode icon with better styling */}
                  <div className="relative mb-6">
                    <QrCode className="w-20 h-20 text-gray-300 mx-auto animate-pulse" strokeWidth={1.5} />
                    <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 text-xs text-gray-500 font-medium">
                      BARCODE
                    </div>
                  </div>
                  
                  <p className="text-gray-200 font-bold text-lg mb-2">Produkt positionieren</p>
                  <p className="text-gray-400 text-sm font-medium">Automatische Erkennung</p>
                  
                  {/* Instruction dots */}
                  <div className="flex justify-center space-x-1 mt-4">
                    <div className="w-1 h-1 bg-gray-600 rounded-full"></div>
                    <div className="w-1 h-1 bg-gray-600 rounded-full"></div>
                    <div className="w-1 h-1 bg-gray-600 rounded-full"></div>
                  </div>
                </div>
              )}
            </div>

            {/* Grid overlay for professional look */}
            <div className="absolute inset-6 opacity-10">
              <div className="w-full h-full" style={{
                backgroundImage: `
                  linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px),
                  linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px)
                `,
                backgroundSize: '20px 20px'
              }}></div>
            </div>
          </div>
        </div>

        <button
          onClick={simulateScan}
          disabled={isScanning}
          className="bg-gradient-to-r from-[#25D076] to-[#25D076] text-white py-4 px-12 rounded-2xl font-bold text-lg hover:from-[#25D076]/80 hover:to-[#25D076]/80 transition-all duration-300 disabled:opacity-50 shadow-2xl active:scale-95 flex items-center space-x-3"
        >
          <Camera className="w-5 h-5" />
          <span>{isScanning ? 'Scannt...' : 'Scan starten'}</span>
        </button>

        <p className="text-gray-400 text-sm mt-6 text-center max-w-sm font-medium leading-relaxed">
          KI-gestützte Produkterkennung mit Schweizer Präzision
        </p>
      </div>
    </div>
  );
};

export default SnanerDash;