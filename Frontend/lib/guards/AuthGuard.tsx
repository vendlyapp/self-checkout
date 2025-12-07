'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useUser } from '@/lib/contexts/UserContext';

interface AuthGuardProps {
  children: React.ReactNode;
  allowedRoles?: ('ADMIN' | 'CUSTOMER' | 'SUPER_ADMIN')[];
}

export const AuthGuard = ({ children, allowedRoles }: AuthGuardProps) => {
  const { isAuthenticated, profile, loading } = useUser();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;

    // Si no está autenticado, redirigir a login
    if (!isAuthenticated) {
      router.push('/login?redirect=' + encodeURIComponent(pathname));
      return;
    }

    // Si hay roles permitidos, verificar que el usuario tenga uno
    // Solo verificar roles si el perfil está disponible
    // Si el perfil no está disponible pero el usuario está autenticado,
    // permitir acceso (el perfil se cargará en segundo plano)
    if (allowedRoles && profile) {
      if (!allowedRoles.includes(profile.role)) {
        // Redirigir según el rol del usuario
        if (profile.role === 'SUPER_ADMIN') {
          router.push('/super-admin/dashboard');
        } else if (profile.role === 'ADMIN') {
          router.push('/dashboard');
        } else {
          router.push('/');
        }
      }
    }
    // Si no hay perfil pero el usuario está autenticado, permitir acceso
    // El perfil se cargará en segundo plano
  }, [isAuthenticated, profile, loading, allowedRoles, router, pathname]);

  // Mostrar loading mientras verifica
  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-brand-50 via-background-cream to-brand-100">
        <div className="flex flex-col items-center justify-center space-y-6">
          {/* Spinner minimalista y elegante */}
          <div className="relative w-14 h-14">
            {/* Glow suave */}
            <div className="absolute inset-0 rounded-full bg-[#25d076] opacity-10 blur-2xl animate-pulse"></div>
            
            {/* Círculo exterior sutil */}
            <div className="absolute inset-0 rounded-full border-[3px] border-gray-100"></div>
            
            {/* Círculo animado con gradiente verde elegante */}
            <div 
              className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-[#25d076] border-r-[#25d076] border-b-transparent animate-spin"
              style={{ 
                animation: 'spin 1s cubic-bezier(0.4, 0, 0.2, 1) infinite',
                filter: 'drop-shadow(0 0 8px rgba(37, 208, 118, 0.3))'
              }}
            ></div>
            
            {/* Punto central minimalista */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-[#25d076] rounded-full"></div>
          </div>
          
          {/* Texto elegante */}
          <div className="flex flex-col items-center space-y-3">
            <p className="text-gray-600 font-light text-sm tracking-wide">Cargando...</p>
            <div className="flex items-center justify-center gap-1.5">
              <div className="w-1.5 h-1.5 bg-[#25d076] rounded-full animate-bounce" style={{ animationDelay: '0s', animationDuration: '1.4s' }}></div>
              <div className="w-1.5 h-1.5 bg-[#25d076] rounded-full animate-bounce" style={{ animationDelay: '0.2s', animationDuration: '1.4s' }}></div>
              <div className="w-1.5 h-1.5 bg-[#25d076] rounded-full animate-bounce" style={{ animationDelay: '0.4s', animationDuration: '1.4s' }}></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Si no está autenticado, no mostrar contenido
  if (!isAuthenticated) {
    return null;
  }

  // Si hay restricciones de rol y el perfil está disponible, verificar permisos
  // Si el perfil no está disponible, permitir acceso (se cargará en segundo plano)
  if (allowedRoles && profile && !allowedRoles.includes(profile.role)) {
    return null;
  }

  return <>{children}</>;
};

