'use client'

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ProductsListContextType {
  totalProducts: number;
  filteredProducts: number;
  hasActiveFilters: boolean;
  isLoading: boolean;
  setTotalProducts: (count: number) => void;
  setFilteredProducts: (count: number) => void;
  setHasActiveFilters: (hasFilters: boolean) => void;
  setIsLoading: (loading: boolean) => void;
}

const ProductsListContext = createContext<ProductsListContextType | undefined>(undefined);

export const useProductsList = () => {
  const context = useContext(ProductsListContext);
  if (context === undefined) {
    // Retornar valores por defecto si el contexto no está disponible
    return {
      totalProducts: 0,
      filteredProducts: 0,
      hasActiveFilters: false,
      isLoading: false,
      setTotalProducts: () => {},
      setFilteredProducts: () => {},
      setHasActiveFilters: () => {},
      setIsLoading: () => {},
    };
  }
  return context;
};

interface ProductsListProviderProps {
  children: ReactNode;
}

export const ProductsListProvider: React.FC<ProductsListProviderProps> = ({ children }) => {
  const [totalProducts, setTotalProducts] = useState(0);
  const [filteredProducts, setFilteredProducts] = useState(0);
  const [hasActiveFilters, setHasActiveFilters] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const value = {
    totalProducts,
    filteredProducts,
    hasActiveFilters,
    isLoading,
    setTotalProducts,
    setFilteredProducts,
    setHasActiveFilters,
    setIsLoading,
  };

  return (
    <ProductsListContext.Provider value={value}>
      {children}
    </ProductsListContext.Provider>
  );
}; 