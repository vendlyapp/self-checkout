'use client';

import { Loader2 } from 'lucide-react';

interface LoadingProductsModalProps {
  isOpen: boolean;
}

const LoadingProductsModal = ({ isOpen }: LoadingProductsModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl p-8 shadow-xl max-w-sm w-full mx-4 flex flex-col items-center gap-4">
        <Loader2 className="w-12 h-12 text-[#25D076] animate-spin" />
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Produkte werden geladen
          </h3>
          <p className="text-sm text-gray-600">
            Bitte warten Sie, während wir Ihre Produkte abrufen...
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoadingProductsModal;

