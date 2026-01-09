'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode, useState } from 'react';

interface QueryProviderProps {
  children: ReactNode;
}

export const QueryProvider = ({ children }: QueryProviderProps) => {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Cache por 10 minutos por defecto (las queries específicas pueden sobrescribir)
            staleTime: 10 * 60 * 1000,
            // Cache en memoria por 30 minutos
            gcTime: 30 * 60 * 1000,
            // Reintentar 2 veces en caso de error
            retry: (failureCount, error) => {
              // No reintentar si es un error de cancelación
              if (error instanceof Error && (
                error.name === 'AbortError' || 
                error.message === 'CANCELLED' ||
                error.message === 'Request cancelled'
              )) {
                return false;
              }
              return failureCount < 2;
            },
            // No refetch cuando la ventana recupera el foco (mejor rendimiento)
            refetchOnWindowFocus: false,
            // No refetch automático en reconexión (evitar recargas innecesarias)
            refetchOnReconnect: false,
            // No refetch en mount si hay datos frescos en cache
            refetchOnMount: false,
            // No loggear errores de cancelación
            throwOnError: (error) => {
              // No lanzar errores de cancelación
              if (error instanceof Error && (
                error.name === 'AbortError' || 
                error.message === 'CANCELLED' ||
                error.message === 'Request cancelled'
              )) {
                return false;
              }
              return true;
            },
          },
          mutations: {
            // No loggear errores de cancelación en mutations
            throwOnError: (error) => {
              if (error instanceof Error && (
                error.name === 'AbortError' || 
                error.message === 'CANCELLED' ||
                error.message === 'Request cancelled'
              )) {
                return false;
              }
              return true;
            },
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

