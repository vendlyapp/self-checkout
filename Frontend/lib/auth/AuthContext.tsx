'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, name: string, role?: string) => Promise<{ data: { user: User | null; session: Session | null } | null; error: AuthError | null }>;
  signIn: (email: string, password: string) => Promise<{ data: { user: User | null; session: Session | null } | null; error: AuthError | null }>;
  signOut: () => Promise<{ error: AuthError | null }>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Timeout de seguridad para evitar que se quede en loading indefinidamente
    const timeoutId = setTimeout(() => {
      if (loading) {
        console.warn('[AuthProvider] Timeout al inicializar, estableciendo loading a false');
        setLoading(false);
      }
    }, 5000); // 5 segundos máximo

    // Obtener sesión inicial
    const initializeAuth = async () => {
      try {
        // Crear AbortController con timeout
        const controller = new AbortController();
        const abortTimeout = setTimeout(() => controller.abort(), 4000); // 4 segundos

        const { data: { session: initialSession }, error } = await supabase.auth.getSession();
        
        clearTimeout(abortTimeout);

        if (error) {
          console.error('Error al obtener sesión:', error);
        }
        
        setSession(initialSession);
        setUser(initialSession?.user ?? null);
      } catch (error) {
        console.error('Error al inicializar auth:', error);
      } finally {
        clearTimeout(timeoutId);
        setLoading(false);
      }
    };

    initializeAuth();

    return () => {
      clearTimeout(timeoutId);
    };

    // Escuchar cambios en la autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, name: string, role: string = 'ADMIN') => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            role
          }
        }
      });

      return { data, error };
    } catch (error) {
      return { data: null, error: error as AuthError };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (data?.user && typeof window !== 'undefined') {
        // Guardar role en localStorage si existe en metadata
        const role = data.user.user_metadata?.role || 'ADMIN';
        localStorage.setItem('userRole', role);
      }

      return { data, error };
    } catch (error) {
      return { data: null, error: error as AuthError };
    }
  };

  const signOut = async () => {
    try {
      // Limpiar estados locales primero
      setUser(null);
      setSession(null);
      
      // Usar la función de limpieza completa
      // Nota: No podemos pasar queryClient aquí porque es un hook, pero clearAllSessionData
      // intentará limpiar React Query de forma global
      const { clearAllSessionData } = await import('@/lib/utils/sessionUtils');
      await clearAllSessionData();
      
      return { error: null };
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      // Forzar limpieza básica en caso de error
      try {
        await supabase.auth.signOut();
        setUser(null);
        setSession(null);
        if (typeof window !== 'undefined') {
          localStorage.clear();
          sessionStorage.clear();
        }
      } catch (e) {
        console.error('Error en limpieza de emergencia:', e);
      }
      return { error: error as AuthError };
    }
  };

  const value: AuthContextType = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    isAuthenticated: !!user
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

