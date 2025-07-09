'use client';

import React from 'react';
import Squircle from './squircle';

const SquircleTest: React.FC = () => {
  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-8 text-center">Prueba de Squircle - ¿Se ven las esquinas redondeadas?</h1>
      
      {/* Test básico con diferentes variantes */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {/* Sin Squircle - Border-radius normal */}
        <div className="text-center">
          <div className="w-32 h-32 bg-red-500 mx-auto mb-4 rounded-2xl flex items-center justify-center text-white font-bold">
            Normal<br/>CSS
          </div>
          <p className="text-sm">Border-radius normal</p>
        </div>

        {/* Squircle Sutil */}
        <div className="text-center">
          <Squircle
            variant="subtle"
            className="w-32 h-32 bg-blue-500 mx-auto mb-4 flex items-center justify-center text-white font-bold"
          >
            Squircle<br/>Subtle
          </Squircle>
          <p className="text-sm">Squircle Sutil</p>
        </div>

        {/* Squircle Medium */}
        <div className="text-center">
          <Squircle
            variant="medium"
            className="w-32 h-32 bg-green-500 mx-auto mb-4 flex items-center justify-center text-white font-bold"
          >
            Squircle<br/>Medium
          </Squircle>
          <p className="text-sm">Squircle Medium (iOS)</p>
        </div>

        {/* Squircle Strong */}
        <div className="text-center">
          <Squircle
            variant="strong"
            className="w-32 h-32 bg-purple-500 mx-auto mb-4 flex items-center justify-center text-white font-bold"
          >
            Squircle<br/>Strong
          </Squircle>
          <p className="text-sm">Squircle Fuerte</p>
        </div>
      </div>

      {/* Test de ActionCards con estilos específicos */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-900">ActionCards con Estilos de Figma</h2>
        <div className="flex flex-wrap gap-6">
          {/* ActionCard Primaria */}
          <Squircle 
            as="button"
            variant="medium"
            className="group p-5 text-left active:scale-95 duration-150 transition-all w-[188px] h-[188px] flex-shrink-0 aspect-square flex flex-col justify-between card-shadow bg-brand-500 text-white"
          >
            <div className="flex items-center justify-between mb-4">
              <Squircle variant="sm" className="flex items-center justify-center w-12 h-12 bg-white/10">
                🧾
              </Squircle>
              <div className="w-4 h-4 text-white/70">→</div>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-1">Kassieren</h3>
              <p className="text-sm opacity-90">Verkauf starten</p>
            </div>
          </Squircle>

          {/* ActionCard Secundaria */}
          <Squircle 
            as="button"
            variant="medium"
            className="group p-5 text-left active:scale-95 duration-150 transition-all w-[188px] h-[188px] flex-shrink-0 aspect-square flex flex-col justify-between card-shadow bg-white text-gray-900"
          >
            <div className="flex items-center justify-between mb-4">
              <Squircle variant="sm" className="flex items-center justify-center w-12 h-12 bg-gray-100">
                📦
              </Squircle>
              <div className="w-4 h-4 text-gray-400">→</div>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-1">Produkte</h3>
              <p className="text-sm text-gray-600">245 Artikel</p>
            </div>
          </Squircle>

          {/* ActionCard con variante Strong */}
          <Squircle 
            as="button"
            variant="strong"
            className="group p-5 text-left active:scale-95 duration-150 transition-all w-[188px] h-[188px] flex-shrink-0 aspect-square flex flex-col justify-between card-shadow bg-purple-500 text-white"
          >
            <div className="flex items-center justify-between mb-4">
              <Squircle variant="sm" className="flex items-center justify-center w-12 h-12 bg-white/10">
                ⚡
              </Squircle>
              <div className="w-4 h-4 text-white/70">→</div>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-1">Super Squircle</h3>
              <p className="text-sm opacity-90">Efecto máximo</p>
            </div>
          </Squircle>
        </div>
      </div>

      {/* Test de cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Card normal */}
        <div className="bg-white p-6 rounded-2xl shadow-lg">
          <h3 className="font-semibold text-lg mb-2">Card Normal</h3>
          <p className="text-gray-600">Esta card usa border-radius CSS normal (rounded-2xl).</p>
          <div className="mt-4 w-12 h-12 bg-purple-500 rounded-xl"></div>
        </div>

        {/* Card con Squircle */}
        <Squircle className="bg-white p-6 shadow-lg" smoothing={0.6}>
          <h3 className="font-semibold text-lg mb-2">Card con Squircle</h3>
          <p className="text-gray-600">Esta card usa el componente Squircle con smoothing 0.6.</p>
          <Squircle className="mt-4 w-12 h-12 bg-purple-500" smoothing={0.4}>
            <div className="w-full h-full flex items-center justify-center text-white text-xs">✨</div>
          </Squircle>
        </Squircle>
      </div>

      {/* Test de diferentes valores */}
      <div className="bg-white p-6 rounded-2xl shadow-lg">
        <h3 className="font-semibold text-lg mb-4">Test de Diferentes Valores de Smoothing</h3>
        <div className="grid grid-cols-6 gap-4">
          {[0, 0.2, 0.4, 0.6, 0.8, 1.0].map((smoothing) => (
            <div key={smoothing} className="text-center">
              <Squircle
                smoothing={smoothing}
                className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 mx-auto mb-2 flex items-center justify-center text-white text-xs font-bold"
              >
                {smoothing}
              </Squircle>
              <p className="text-xs text-gray-600">{(smoothing * 100).toFixed(0)}%</p>
            </div>
          ))}
        </div>
      </div>

      {/* Información de debugging */}
      <div className="mt-8 p-4 bg-yellow-100 rounded-lg">
        <h4 className="font-semibold mb-2">🔍 ¿Cómo saber si funciona el efecto Squircle?</h4>
        <ul className="text-sm space-y-2">
          <li>
            <strong>✅ Funciona correctamente:</strong> Las esquinas de las variantes Squircle se ven más orgánicas y suaves que el CSS normal
          </li>
          <li>
            <strong>⚠️ Solo fallback:</strong> Si todas las esquinas se ven exactamente igual, solo funciona border-radius (que está bien)
          </li>
          <li>
            <strong>🔍 Cómo notar la diferencia:</strong> Compara las esquinas del &apos;Normal CSS&apos; vs &apos;Squircle Medium&apos; - deberían ser sutilmente diferentes
          </li>
          <li>
            <strong>📱 Mejor en mobile:</strong> El efecto se nota más en dispositivos táctiles y pantallas de alta resolución
          </li>
        </ul>
      </div>

      {/* Información técnica */}
      <div className="mt-4 p-4 bg-blue-50 rounded-lg">
        <h4 className="font-semibold mb-2">🛠️ Implementación Técnica:</h4>
        <ul className="text-sm space-y-1">
          <li>• <strong>SVG Masks:</strong> Cada variante usa un path SVG específico con curvas quadráticas</li>
          <li>• <strong>Fallback automático:</strong> Si no funciona mask-image, se ve border-radius normal</li>
          <li>• <strong>CSS puro:</strong> No requiere JavaScript, optimizado para performance</li>
          <li>• <strong>Compatibilidad:</strong> Chrome, Firefox, Safari, Edge moderno</li>
        </ul>
      </div>
    </div>
  );
};

export default SquircleTest; 