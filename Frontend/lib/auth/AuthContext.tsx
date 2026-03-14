'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase/client';
import { devError, devWarn } from '@/lib/utils/logger';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  /** Role from JWT user_metadata only — do not use localStorage for access control */
  userRole: string | null;
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
    // Safety timeout — if Supabase is unreachable, unblock the UI after 5s
    const timeoutId = setTimeout(() => {
      setLoading(false);
      devWarn('[AuthProvider] Session check timed out');
    }, 5000);

    // Fetch initial session once
    const initializeAuth = async () => {
      try {
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();
        if (error) devError('[AuthProvider] Error fetching session:', error);
        setSession(initialSession);
        setUser(initialSession?.user ?? null);
      } catch (error) {
        devError('[AuthProvider] initializeAuth threw:', error);
      } finally {
        clearTimeout(timeoutId);
        setLoading(false);
      }
    };

    initializeAuth();

    // Subscribe to auth state changes (sign-in, sign-out, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        // El redirect al login lo maneja useSessionTimeout, que tiene contexto
        // de si fue inactividad o logout manual. AuthContext solo actualiza estado.
      }
    );

    return () => {
      clearTimeout(timeoutId);
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
      // Role is read from session.user.user_metadata.role (JWT) — never from localStorage for access control
      return { data, error };
    } catch (error) {
      return { data: null, error: error as AuthError };
    }
  };

  const signOut = async () => {
    try {
      setUser(null);
      setSession(null);
      const { clearAllSessionData } = await import('@/lib/utils/sessionUtils');
      await clearAllSessionData();
      return { error: null };
    } catch (error) {
      devError('SignOut failed:', error);
      try {
        await supabase.auth.signOut();
        setUser(null);
        setSession(null);
        if (typeof window !== 'undefined') {
          localStorage.clear();
          sessionStorage.clear();
        }
      } catch (e) {
        devError('Fallback cleanup failed:', e);
      }
      return { error: error as AuthError };
    }
  };

  const userRole = session?.user?.user_metadata?.role ?? null;

  const value: AuthContextType = {
    user,
    session,
    loading,
    userRole: typeof userRole === 'string' ? userRole : null,
    signUp,
    signIn,
    signOut,
    isAuthenticated: !!user
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

