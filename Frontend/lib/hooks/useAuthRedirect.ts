'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/lib/contexts/UserContext';

export const useAuthRedirect = () => {
  const { isAuthenticated, profile } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated || !profile) return;

    // Redirigir según el rol
    const currentPath = window.location.pathname;

    if (profile.role === 'SUPER_ADMIN') {
      // Super Admin solo puede estar en rutas /super-admin/*
      if (!currentPath.startsWith('/super-admin')) {
        router.replace('/super-admin/dashboard');
      }
    } else if (profile.role === 'ADMIN') {
      // Admin NO puede estar en rutas /super-admin/*
      if (currentPath.startsWith('/super-admin')) {
        router.replace('/dashboard');
      }
    }
  }, [isAuthenticated, profile, router]);
};

