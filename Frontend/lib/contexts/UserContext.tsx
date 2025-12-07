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
      const headers = getAuthHeaders(session.data.session?.access_token);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 segundos timeout
      
      const response = await fetch(url, {
        headers,
        signal: controller.signal
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
    const initializeUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          setUser(session.user);
          await fetchUserProfile();
        }
      } catch (error) {
        console.error('Error initializing user:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeUser();

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
      // Cerrar sesión en Supabase
      await supabase.auth.signOut();
      
      // Limpiar estados
      setUser(null);
      setProfile(null);
      
      // Limpiar cache de React Query
      if (typeof window !== 'undefined') {
        const { useQueryClient } = await import('@tanstack/react-query');
        // Nota: No podemos usar useQueryClient aquí porque es un hook
        // El cache se limpiará desde el componente que use useSessionTimeout
      }
      
      // Limpiar localStorage y sessionStorage
      if (typeof window !== 'undefined') {
        // Limpiar datos específicos
        localStorage.removeItem('userRole');
        localStorage.removeItem('userName');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('vendly-auth-token');
        // Limpiar todo el localStorage para asegurar que no quede nada
        localStorage.clear();
        sessionStorage.clear();
        
        // Limpiar cookies de Supabase y Google OAuth
        const cookies = document.cookie.split(';');
        cookies.forEach(cookie => {
          const [name] = cookie.split('=');
          const trimmedName = name.trim();
          // Limpiar cookies de Supabase
          if (trimmedName.startsWith('sb-') || trimmedName.startsWith('supabase.')) {
            document.cookie = `${trimmedName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
            document.cookie = `${trimmedName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname};`;
          }
          // Limpiar cookies de Google OAuth
          if (trimmedName.includes('google') || trimmedName.includes('oauth') || trimmedName.includes('gid')) {
            document.cookie = `${trimmedName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
            document.cookie = `${trimmedName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname};`;
            document.cookie = `${trimmedName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${window.location.hostname};`;
            document.cookie = `${trimmedName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.google.com;`;
            document.cookie = `${trimmedName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.googleapis.com;`;
          }
        });
        
        // Limpiar IndexedDB (donde Google puede guardar información)
        try {
          if ('indexedDB' in window) {
            const databases = await indexedDB.databases();
            databases.forEach(db => {
              if (db.name && (db.name.includes('google') || db.name.includes('oauth'))) {
                indexedDB.deleteDatabase(db.name);
              }
            });
          }
        } catch (e) {
          console.warn('No se pudo limpiar IndexedDB:', e);
        }
      }
    } catch (error) {
      console.error('Error signing out:', error);
      // Limpiar de todas formas
      setUser(null);
      setProfile(null);
      if (typeof window !== 'undefined') {
        localStorage.clear();
        sessionStorage.clear();
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

