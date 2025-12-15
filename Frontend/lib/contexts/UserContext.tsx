'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase/client';

interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'CUSTOMER' | 'SUPER_ADMIN';
  storeId?: string;
  storeName?: string;
}

interface UserContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  isAuthenticated: boolean;
  isSuperAdmin: boolean;
  isAdmin: boolean;
  isCustomer: boolean;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within UserProvider');
  }
  return context;
};

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider = ({ children }: UserProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserProfile = async (): Promise<void> => {
    try {
      const session = await supabase.auth.getSession();
      
      // Si no hay sesión, no intentar obtener el perfil
      if (!session.data.session?.user) {
        setProfile(null);
        return;
      }

      const { buildApiUrl, getAuthHeaders } = await import('@/lib/config/api');
      const url = buildApiUrl('/api/auth/profile');
      const headers = getAuthHeaders(session.data.session?.access_token, true); // true = no-cache
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 segundos timeout
      
      const response = await fetch(url, {
        headers,
        signal: controller.signal,
        cache: 'no-store' as RequestCache,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        const userProfile = data.data?.user || data.data;
        
        if (userProfile) {
          setProfile({
            id: userProfile.id,
            email: userProfile.email,
            name: userProfile.name,
            role: userProfile.role,
            storeId: userProfile.storeId,
            storeName: userProfile.storeName
          });
        }
      } else if (response.status === 401) {
        // Usuario no autenticado, limpiar perfil
        setProfile(null);
      }
    } catch (error) {
      // Solo loggear errores que no sean de aborto o red
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          console.warn('Request timeout al obtener perfil de usuario');
        } else if (error.message.includes('Failed to fetch')) {
          console.warn('No se pudo conectar con el servidor para obtener el perfil');
          // No establecer perfil como null en caso de error de red
          // Mantener el perfil anterior si existe, o dejar null si es la primera carga
        } else {
          console.error('Error fetching user profile:', error);
        }
      }
      // No establecer perfil como null en caso de error de red
      // Solo establecer como null si es un error de autenticación (401)
      // Para errores de red, mantener el estado anterior
    }
  };

  const refreshProfile = async (): Promise<void> => {
    if (user?.id) {
      await fetchUserProfile();
    }
  };

  useEffect(() => {
    // Timeout de seguridad para evitar que se quede en loading indefinidamente
    const timeoutId = setTimeout(() => {
      if (loading) {
        console.warn('[UserProvider] Timeout al inicializar, estableciendo loading a false');
        setLoading(false);
      }
    }, 8000); // 8 segundos máximo (más tiempo porque también hace fetch del perfil)

    const initializeUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          setUser(session.user);
          // No esperar indefinidamente el perfil, usar timeout
          await Promise.race([
            fetchUserProfile(),
            new Promise((resolve) => setTimeout(resolve, 6000)) // 6 segundos máximo para perfil
          ]);
        }
      } catch (error) {
        console.error('Error initializing user:', error);
      } finally {
        clearTimeout(timeoutId);
        setLoading(false);
      }
    };

    initializeUser();

    return () => {
      clearTimeout(timeoutId);
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser(session.user);
          await fetchUserProfile();
        } else {
          setUser(null);
          setProfile(null);
        }
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    try {
      // Limpiar estados primero
      setUser(null);
      setProfile(null);
      
      // Usar la función de limpieza completa
      // Nota: No podemos pasar queryClient aquí porque es un hook, pero clearAllSessionData
      // intentará limpiar React Query de forma global
      const { clearAllSessionData } = await import('@/lib/utils/sessionUtils');
      await clearAllSessionData();
    } catch (error) {
      console.error('Error signing out:', error);
      // Limpiar de todas formas
      setUser(null);
      setProfile(null);
      try {
        await supabase.auth.signOut();
        if (typeof window !== 'undefined') {
          localStorage.clear();
          sessionStorage.clear();
        }
      } catch (e) {
        console.error('Error en limpieza de emergencia:', e);
      }
    }
  };

  // isAuthenticated solo requiere user de Supabase
  // El perfil puede no estar disponible si el backend no está disponible
  // pero el usuario sigue autenticado en Supabase
  const isAuthenticated = !!user;
  const isSuperAdmin = profile?.role === 'SUPER_ADMIN';
  const isAdmin = profile?.role === 'ADMIN';
  const isCustomer = profile?.role === 'CUSTOMER';

  return (
    <UserContext.Provider
      value={{
        user,
        profile,
        loading,
        isAuthenticated,
        isSuperAdmin,
        isAdmin,
        isCustomer,
        refreshProfile,
        signOut
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

