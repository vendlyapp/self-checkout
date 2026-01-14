'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useUser } from '@/lib/contexts/UserContext';
import { Loader } from '@/components/ui/Loader';

interface AuthGuardProps {
  children: React.ReactNode;
  allowedRoles?: ('ADMIN' | 'CUSTOMER' | 'SUPER_ADMIN')[];
}

export const AuthGuard = ({ children, allowedRoles }: AuthGuardProps) => {
  const { isAuthenticated, profile, loading } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const [forceRender, setForceRender] = useState(false);

  // Timeout de seguridad: después de 10 segundos, forzar render incluso si loading es true
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (loading) {
        console.warn('[AuthGuard] Timeout de seguridad: forzando render después de 10 segundos');
        setForceRender(true);
      }
    }, 10000); // 10 segundos máximo

    return () => clearTimeout(timeoutId);
  }, [loading]);

  useEffect(() => {
    // Si forceRender es true, permitir renderizar
    if (forceRender) {
      return;
    }

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
  }, [isAuthenticated, profile, loading, allowedRoles, router, pathname, forceRender]);

  // Mostrar loading mientras verifica, pero solo si no se ha forzado el render
  if (loading && !forceRender) {
    return <Loader variant="fullscreen" message="Cargando..." />;
  }

  // Si no está autenticado y no se ha forzado el render, no mostrar contenido
  if (!isAuthenticated && !forceRender) {
    return null;
  }

  // Si forceRender es true pero no hay autenticación, redirigir a login
  if (forceRender && !isAuthenticated) {
    router.push('/login?redirect=' + encodeURIComponent(pathname));
    return null;
  }

  // Si hay restricciones de rol y el perfil está disponible, verificar permisos
  // Si el perfil no está disponible, permitir acceso (se cargará en segundo plano)
  if (allowedRoles && profile && !allowedRoles.includes(profile.role)) {
    return null;
  }

  // Si forceRender es true, permitir acceso incluso sin perfil (se cargará en segundo plano)
  return <>{children}</>;
};

