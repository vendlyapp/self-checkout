'use client';

import React from 'react';
import Squircle from './squircle';

const SquircleShowcase: React.FC = () => {
  const smoothingLevels = [
    { level: 0, name: 'Sin Smoothing', description: 'Border-radius normal' },
    { level: 0.3, name: 'Sutil', description: '30% smoothing' },
    { level: 0.5, name: 'Medio', description: '50% smoothing' },
    { level: 0.6, name: 'iOS Default', description: '60% smoothing' },
    { level: 0.8, name: 'Fuerte', description: '80% smoothing' },
    { level: 1, name: 'Completo', description: '100% smoothing' },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-900">
          Corner Smoothing (Squircle) Showcase
        </h1>
        
        {/* Grid de ejemplos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {smoothingLevels.map(({ level, name, description }) => (
            <div key={level} className="text-center">
              <Squircle
                smoothing={level}
                className="w-32 h-32 mx-auto mb-4 bg-brand-500 flex items-center justify-center text-white font-bold text-lg shadow-lg"
              >
                {(level * 100).toFixed(0)}%
              </Squircle>
              <h3 className="font-semibold text-gray-900 mb-1">{name}</h3>
              <p className="text-sm text-gray-600">{description}</p>
            </div>
          ))}
        </div>

        {/* Ejemplo de card completa */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-xl font-semibold mb-4 text-gray-900">Card Normal</h2>
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
              <div className="w-12 h-12 bg-brand-500 rounded-xl mb-4 flex items-center justify-center">
                <span className="text-white font-bold">🚀</span>
              </div>
              <h3 className="font-semibold text-lg mb-2">Card Tradicional</h3>
              <p className="text-gray-600 text-sm">
                Esta card usa border-radius normal de CSS. Notarás que las esquinas se ven más "mecánicas".
              </p>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4 text-gray-900">Card con Squircle</h2>
            <Squircle
              smoothing={0.6}
              className="bg-white p-6 border border-gray-200 shadow-sm"
            >
              <Squircle
                smoothing={0.5}
                className="w-12 h-12 bg-brand-500 mb-4 flex items-center justify-center"
              >
                <span className="text-white font-bold">✨</span>
              </Squircle>
              <h3 className="font-semibold text-lg mb-2">Card con Corner Smoothing</h3>
              <p className="text-gray-600 text-sm">
                Esta card usa el efecto squircle (super-elipse). Las esquinas se ven más orgánicas y suaves, 
                similar al estilo de iOS.
              </p>
            </Squircle>
          </div>
        </div>

        {/* Información técnica */}
        <div className="mt-12 p-6 bg-white rounded-2xl border border-gray-200">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">¿Cómo usar Squircle?</h2>
          <div className="space-y-4 text-sm text-gray-600">
            <p>
              <strong>Básico:</strong> <code className="bg-gray-100 px-2 py-1 rounded">{'<Squircle>contenido</Squircle>'}</code>
            </p>
            <p>
              <strong>Con smoothing personalizado:</strong> <code className="bg-gray-100 px-2 py-1 rounded">{'<Squircle smoothing={0.6}>contenido</Squircle>'}</code>
            </p>
            <p>
              <strong>Como otro elemento:</strong> <code className="bg-gray-100 px-2 py-1 rounded">{'<Squircle as="button" onClick={handler}>botón</Squircle>'}</code>
            </p>
            <p>
              <strong>Valores de smoothing:</strong> 0 (normal) → 1 (squircle completo). Recomendado: 0.6 (iOS default)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SquircleShowcase; 