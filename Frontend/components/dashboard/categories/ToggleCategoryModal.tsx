"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X, AlertTriangle } from "lucide-react";

interface ToggleCategoryModalProps {
  isOpen: boolean;
  categoryName: string;
  isCurrentlyActive: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

export default function ToggleCategoryModal({
  isOpen,
  categoryName,
  isCurrentlyActive,
  onClose,
  onConfirm,
  isLoading = false,
}: ToggleCategoryModalProps) {
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

  if (!isOpen || !modalContainer) return null;

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" style={{ pointerEvents: 'auto' }}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md animate-in fade-in-0 zoom-in-95 duration-300" style={{ pointerEvents: 'auto' }}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">
              Kategorie {isCurrentlyActive ? "deaktivieren" : "aktivieren"}?
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
            disabled={isLoading}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-gray-700 mb-6">
            {isCurrentlyActive ? (
              <>
                Möchten Sie die Kategorie <span className="font-semibold text-gray-900">&quot;{categoryName}&quot;</span> wirklich deaktivieren?
                <br />
                <br />
                Die Kategorie wird für Kunden nicht mehr sichtbar sein.
              </>
            ) : (
              <>
                Möchten Sie die Kategorie <span className="font-semibold text-gray-900">&quot;{categoryName}&quot;</span> aktivieren?
                <br />
                <br />
                Die Kategorie wird für Kunden sichtbar sein.
              </>
            )}
          </p>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={isLoading}
            >
              Abbrechen
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className={`flex-1 px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md ${
                isCurrentlyActive
                  ? "bg-orange-500 hover:bg-orange-600 text-white"
                  : "bg-brand-500 hover:bg-brand-600 text-white"
              }`}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  {isCurrentlyActive ? "Wird deaktiviert..." : "Wird aktiviert..."}
                </>
              ) : (
                <>
                  {isCurrentlyActive ? "Deaktivieren" : "Aktivieren"}
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

