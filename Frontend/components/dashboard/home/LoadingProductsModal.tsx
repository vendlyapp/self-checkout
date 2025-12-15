'use client';

import { Loader2 } from 'lucide-react';
import { createPortal } from 'react-dom';
import { useEffect, useState } from 'react';

interface LoadingProductsModalProps {
  isOpen: boolean;
}

const LoadingProductsModal = ({ isOpen }: LoadingProductsModalProps) => {
  const [modalContainer, setModalContainer] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const container = document.getElementById('global-modals-container');
      if (container) {
        setModalContainer(container);
      }
    }
  }, []);

  if (!isOpen || !modalContainer) return null;

  const modalContent = (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in-scale" style={{ pointerEvents: 'auto' }}>
      <div className="bg-white rounded-2xl p-8 shadow-xl max-w-sm w-full mx-4 flex flex-col items-center gap-4 animate-scale-in gpu-accelerated">
        <Loader2 className="w-12 h-12 text-[#25D076] animate-spin transition-interactive" />
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 transition-interactive">
            Produkte werden geladen
          </h3>
          <p className="text-sm text-gray-600 transition-interactive">
            Bitte warten Sie, während wir Ihre Produkte abrufen...
          </p>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, modalContainer);
};

export default LoadingProductsModal;

