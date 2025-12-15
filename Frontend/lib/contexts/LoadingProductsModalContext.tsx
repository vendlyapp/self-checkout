'use client';

import { createContext, useContext, useState, ReactNode, useCallback } from 'react';

interface LoadingProductsModalContextType {
  isOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
}

const LoadingProductsModalContext = createContext<LoadingProductsModalContextType | undefined>(undefined);

export function LoadingProductsModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const openModal = useCallback(() => setIsOpen(true), []);
  const closeModal = useCallback(() => setIsOpen(false), []);

  return (
    <LoadingProductsModalContext.Provider value={{ isOpen, openModal, closeModal }}>
      {children}
    </LoadingProductsModalContext.Provider>
  );
}

export function useLoadingProductsModal() {
  const context = useContext(LoadingProductsModalContext);
  if (context === undefined) {
    throw new Error('useLoadingProductsModal must be used within a LoadingProductsModalProvider');
  }
  return context;
}

