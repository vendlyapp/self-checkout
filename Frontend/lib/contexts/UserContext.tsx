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
      const { buildApiUrl, getAuthHeaders } = await import('@/lib/config/api');
      const url = buildApiUrl('/api/auth/profile');
      const headers = getAuthHeaders(session.data.session?.access_token);
      const response = await fetch(url, {
        headers
      });

      if (response.ok) {
        const data = await response.json();
        const userProfile = data.data?.user || data.data;
        
        setProfile({
          id: userProfile.id,
          email: userProfile.email,
          name: userProfile.name,
          role: userProfile.role,
          storeId: userProfile.storeId,
          storeName: userProfile.storeName
        });
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
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
      
      // Limpiar localStorage y sessionStorage
      if (typeof window !== 'undefined') {
        // Limpiar datos específicos
        localStorage.removeItem('userRole');
        localStorage.removeItem('userName');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('vendly-auth-token');
        sessionStorage.clear();
        
        // Limpiar cookies de Supabase
        const cookies = document.cookie.split(';');
        cookies.forEach(cookie => {
          const [name] = cookie.split('=');
          const trimmedName = name.trim();
          if (trimmedName.startsWith('sb-') || trimmedName.startsWith('supabase.')) {
            document.cookie = `${trimmedName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
            document.cookie = `${trimmedName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname};`;
          }
        });
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

  const isAuthenticated = !!user && !!profile;
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

