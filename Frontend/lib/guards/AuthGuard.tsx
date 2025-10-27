'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useUser } from '@/lib/contexts/UserContext';

interface AuthGuardProps {
  children: React.ReactNode;
  allowedRoles?: ('ADMIN' | 'CUSTOMER' | 'SUPER_ADMIN')[];
  redirectTo?: string;
}

export const AuthGuard = ({ children, allowedRoles, redirectTo }: AuthGuardProps) => {
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
    if (allowedRoles && profile && !allowedRoles.includes(profile.role)) {
      // Redirigir según el rol del usuario
      if (profile.role === 'SUPER_ADMIN') {
        router.push('/super-admin/dashboard');
      } else if (profile.role === 'ADMIN') {
        router.push('/dashboard');
      } else {
        router.push('/');
      }
    }
  }, [isAuthenticated, profile, loading, allowedRoles, router, pathname]);

  // Mostrar loading mientras verifica
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-purple-600 mx-auto" />
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  // Si no está autenticado, no mostrar contenido
  if (!isAuthenticated) {
    return null;
  }

  // Si hay restricciones de rol y el usuario no tiene permiso, no mostrar contenido
  if (allowedRoles && profile && !allowedRoles.includes(profile.role)) {
    return null;
  }

  return <>{children}</>;
};

