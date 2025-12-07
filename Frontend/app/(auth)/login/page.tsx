'use client';

import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { LogIn, Mail, Lock, ArrowLeft, AlertCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { GoogleLoginButton } from '@/components/auth/GoogleLoginButton';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get('returnUrl') || '/dashboard';
  // Estado de autenticación local
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  // Verificar si ya está autenticado
  // Solo limpiar sesión si el usuario viene explícitamente a la página de login
  // No limpiar si solo está refrescando la página mientras está autenticado
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        // Si hay una sesión válida, redirigir al dashboard en lugar de limpiar
        if (session && session.expires_at && session.expires_at * 1000 > Date.now()) {
          // Sesión válida, redirigir según el rol
          const userRole = localStorage.getItem('userRole') || 'ADMIN';
          if (userRole === 'SUPER_ADMIN') {
            router.push('/super-admin/dashboard');
          } else {
            router.push(returnUrl);
          }
          return;
        }
        
        // Solo limpiar sesión si está expirada o no es válida
        if (session && session.expires_at && session.expires_at * 1000 <= Date.now()) {
          // Sesión expirada, limpiar
          await supabase.auth.signOut();
          if (typeof window !== 'undefined') {
            localStorage.clear();
            sessionStorage.clear();
          }
        }
        
        setIsAuthenticated(false);
        setAuthLoading(false);
      } catch (error) {
        console.error('Error checking session:', error);
        setIsAuthenticated(false);
        setAuthLoading(false);
      }
    };
    
    checkSession();
  }, [router, returnUrl]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [checkingRole, setCheckingRole] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);

  // Redirigir si ya está logueado
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      const userRole = localStorage.getItem('userRole') || 'ADMIN';
      if (userRole === 'SUPER_ADMIN') {
        router.push('/super-admin/dashboard');
      } else {
        router.push(returnUrl);
      }
    }
  }, [isAuthenticated, authLoading, router, returnUrl]);

  // Mostrar loading mientras verifica autenticación
  if (authLoading) {
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
            <p className="text-gray-600 font-light text-sm tracking-wide">Wird geladen...</p>
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

  // No mostrar nada si ya está autenticado (evitar flash)
  if (isAuthenticated && !checkingRole) {
    return null;
  }

  // Mostrar loader mientras se verifica el rol
  if (checkingRole) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-brand-50 via-background-cream to-brand-100">
        <div className="flex flex-col items-center justify-center space-y-8">
          {/* Icono minimalista */}
          <div className="w-12 h-12 bg-gradient-to-br from-[#25d076] to-[#22c57f] rounded-xl flex items-center justify-center shadow-md shadow-[#25d076]/20">
            <LogIn className="w-6 h-6 text-white" strokeWidth={2} />
          </div>
          
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
            <p className="text-gray-700 font-light text-base tracking-wide">Verificando tu rol...</p>
            <p className="text-gray-500 font-light text-xs tracking-wide">
              {userRole === 'SUPER_ADMIN' ? 'Accediendo como Super Admin' : 'Iniciando sesión'}
            </p>
            <div className="flex items-center justify-center gap-1.5 pt-1">
              <div className="w-1.5 h-1.5 bg-[#25d076] rounded-full animate-bounce" style={{ animationDelay: '0s', animationDuration: '1.4s' }}></div>
              <div className="w-1.5 h-1.5 bg-[#25d076] rounded-full animate-bounce" style={{ animationDelay: '0.2s', animationDuration: '1.4s' }}></div>
              <div className="w-1.5 h-1.5 bg-[#25d076] rounded-full animate-bounce" style={{ animationDelay: '0.4s', animationDuration: '1.4s' }}></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (signInError) {
        setError(signInError.message || 'Error al iniciar sesión');
        toast.error('Error al iniciar sesión');
        return;
      }

      if (data?.user) {
        setLoading(false);
        setCheckingRole(true);
        
        // Obtener el rol del usuario
        let detectedRole = 'ADMIN';
        const token = data.session?.access_token;
        
        try {
          const { buildApiUrl, getAuthHeaders } = await import('@/lib/config/api');
          const url = buildApiUrl('/api/auth/profile');
          const headers = getAuthHeaders(token);
          const response = await fetch(url, {
            headers
          });
          
          if (response.ok) {
            const profileData = await response.json();
            detectedRole = profileData.data?.user?.role || profileData.data?.role || 'ADMIN';
            console.log('✅ Rol obtenido desde API:', detectedRole);
          } else {
            console.warn('⚠️ No se pudo obtener el perfil, usando metadata');
            detectedRole = data.user.user_metadata?.role || 'ADMIN';
          }
        } catch (err) {
          console.error('Error obteniendo perfilnelles:', err);
          detectedRole = data.user.user_metadata?.role || 'ADMIN';
        }
        
        setUserRole(detectedRole);
        
        // Esperar al menos 1 segundo para mostrar el loader
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Guardar en localStorage
        localStorage.setItem('userRole', detectedRole);
        console.log('💾 Rol guardado en localStorage:', detectedRole);
        
        // Redireccionar según el rol
        if (detectedRole === 'SUPER_ADMIN') {
          console.log('🚀 Redirigiendo a SUPER_ADMIN dashboard');
          toast.success('¡Bienvenido Super Admin!');
          router.push('/super-admin/dashboard');
        } else {
          console.log('🚀 Redirigiendo a dashboard regular');
          toast.success('¡Bienvenido de nuevo!');
            router.push(returnUrl);
        }
      } else {
        setError('Error al iniciar sesión');
        toast.error('Error al iniciar sesión');
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Error inesperado al iniciar sesión');
      toast.error('Error inesperado');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-background-cream to-brand-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Botón de regreso */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Zurück</span>
        </Link>

        {/* Card de Login */}
        <div className="bg-white rounded-3xl shadow-2xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-brand-500 rounded-2xl mb-4">
              <LogIn className="w-8 h-8 text-white" strokeWidth={2.5} />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Anmelden
            </h1>
            <p className="text-gray-500">
              Melde dich bei deinem Vendly-Konto an
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-red-700 font-medium">
                  {error}
                </p>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                E-Mail
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@vendly.ch"
                  required
                  disabled={loading}
                  className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl 
                           focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent
                           transition-all duration-200 text-base disabled:bg-gray-50 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                Passwort
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  disabled={loading}
                  className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl 
                           focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent
                           transition-all duration-200 text-base disabled:bg-gray-50 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            {/* Forgot Password Link */}
            <div className="text-right">
              <Link
                href="/forgot-password"
                className="text-sm text-brand-500 hover:text-brand-600 font-medium transition-colors"
              >
                Passwort vergessen?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !email || !password}
              className="w-full bg-brand-500 hover:bg-brand-600 text-white rounded-2xl px-6 py-4 
                       font-semibold text-lg flex items-center justify-center gap-3 
                       transition-all duration-200 shadow-lg shadow-brand-500/30 hover:shadow-xl
                       disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-brand-500
                       focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Wird angemeldet...
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5" strokeWidth={2.5} />
                  Anmelden
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white px-4 text-sm text-gray-500">oder</span>
            </div>
          </div>

          {/* Google Login Button */}
          <GoogleLoginButton />

          {/* Register Link */}
          <div className="text-center mt-8">
            <p className="text-gray-600">
              Noch kein Konto?{' '}
              <Link
                href="/register"
                className="text-brand-500 hover:text-brand-600 font-semibold transition-colors"
              >
                Jetzt registrieren
              </Link>
            </p>
          </div>
        </div>

        {/* Info adicional */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Für Geschäfte und Einzelhändler
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
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
          
          {/* Indicadores minimalistas */}
          <div className="flex items-center justify-center gap-1.5">
            <div className="w-1.5 h-1.5 bg-[#25d076] rounded-full animate-bounce" style={{ animationDelay: '0s', animationDuration: '1.4s' }}></div>
            <div className="w-1.5 h-1.5 bg-[#25d076] rounded-full animate-bounce" style={{ animationDelay: '0.2s', animationDuration: '1.4s' }}></div>
            <div className="w-1.5 h-1.5 bg-[#25d076] rounded-full animate-bounce" style={{ animationDelay: '0.4s', animationDuration: '1.4s' }}></div>
          </div>
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
