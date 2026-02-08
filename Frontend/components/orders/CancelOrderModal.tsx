"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AlertTriangle, X, XCircle } from "lucide-react";

interface CancelOrderModalProps {
  isOpen: boolean;
  orderNumber?: string;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

export default function CancelOrderModal({
  isOpen,
  orderNumber,
  onClose,
  onConfirm,
  isLoading = false,
}: CancelOrderModalProps) {
  const [modalContainer, setModalContainer] = useState<HTMLElement | null>(null);

  // Obtener contenedor de modales global
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Buscar contenedor global de modales
      let container = document.getElementById('global-modals-container');
      
      // Si no existe, crearlo
      if (!container) {
        container = document.createElement('div');
        container.id = 'global-modals-container';
        container.style.position = 'fixed';
        container.style.top = '0';
        container.style.left = '0';
        container.style.width = '100%';
        container.style.height = '100%';
        container.style.pointerEvents = 'none';
        container.style.zIndex = '99999';
        document.body.appendChild(container);
      }
      
      setModalContainer(container);
    }
  }, []);

  // Prevenir scroll del body cuando el modal está abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen || !modalContainer) return null;

  const modalContent = (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in-scale" 
      style={{ pointerEvents: 'auto' }}
      onClick={(e) => {
        // Cerrar solo si se hace clic en el backdrop, no en el contenido del modal
        if (e.target === e.currentTarget && !isLoading) {
          onClose();
        }
      }}
    >
      <div 
        className="bg-white rounded-2xl shadow-xl w-full max-w-md animate-scale-in gpu-accelerated" 
        style={{ pointerEvents: 'auto' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-full">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">
              Bestellung stornieren
            </h2>
          </div>
          {!isLoading && (
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors touch-target"
              aria-label="Modal schliessen"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-gray-700 mb-4">
            Sind Sie sicher, dass Sie diese Bestellung stornieren möchten?
            {orderNumber && (
              <>
                {" "}
                <span className="font-semibold text-gray-900">#{orderNumber}</span>
              </>
            )}
          </p>
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl mb-6">
            <p className="text-sm text-amber-800">
              <strong className="font-semibold">Wichtige Information:</strong> Diese Aktion wird auch alle zugehörigen Rechnungen stornieren. Die Stornierung kann nicht rückgängig gemacht werden.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border-2 border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 active:bg-gray-100 transition-all touch-manipulation active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              Abbrechen
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 active:bg-red-800 transition-all touch-manipulation active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Wird storniert...
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4" />
                  Stornieren
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, modalContainer);
}

