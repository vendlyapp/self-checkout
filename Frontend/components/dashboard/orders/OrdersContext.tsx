"use client";

import { createContext, useContext, useState, ReactNode } from 'react';

interface OrdersContextType {
  searchQuery: string;
  onSearch: (query: string) => void;
}

const OrdersContext = createContext<OrdersContextType | undefined>(undefined);

export function OrdersProvider({ children }: { children: ReactNode }) {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  return (
    <OrdersContext.Provider value={{ searchQuery, onSearch: handleSearch }}>
      {children}
    </OrdersContext.Provider>
  );
}

export function useOrdersContext() {
  const context = useContext(OrdersContext);
  if (context === undefined) {
    throw new Error('useOrdersContext must be used within an OrdersProvider');
  }
  return context;
}
