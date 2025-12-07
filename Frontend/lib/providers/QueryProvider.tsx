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
            // Cache por 5 minutos
            staleTime: 5 * 60 * 1000,
            // Cache en memoria por 10 minutos
            gcTime: 10 * 60 * 1000,
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
            // Refetch cuando la ventana recupera el foco
            refetchOnWindowFocus: false,
            // No refetch automático en reconexión
            refetchOnReconnect: true,
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
        // Logger personalizado para no loggear cancelaciones
        logger: {
          log: (...args) => {
            // Filtrar logs de cancelación
            const message = String(args.join(' '));
            if (!message.includes('AbortError') && 
                !message.includes('CANCELLED') && 
                !message.includes('aborted') &&
                !message.includes('cancelled')) {
              console.log(...args);
            }
          },
          warn: (...args) => {
            // Filtrar warnings de cancelación
            const message = String(args.join(' '));
            if (!message.includes('AbortError') && 
                !message.includes('CANCELLED') && 
                !message.includes('aborted') &&
                !message.includes('cancelled')) {
              console.warn(...args);
            }
          },
          error: (...args) => {
            // Filtrar errores de cancelación
            const message = String(args.join(' '));
            if (!message.includes('AbortError') && 
                !message.includes('CANCELLED') && 
                !message.includes('signal is aborted') &&
                !message.includes('aborted without reason') &&
                !message.includes('Request cancelled')) {
              console.error(...args);
            }
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

