'use client';

import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { LogIn, Mail, Lock, ArrowLeft, AlertCircle, Loader2, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { GoogleLoginButton } from '@/components/auth/GoogleLoginButton';
import { Loader } from '@/components/ui/Loader';
import { getLoginSubtitle } from '@/lib/config/brand';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get('returnUrl') || '/dashboard';
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const searchParams = new URLSearchParams(window.location.search);
        if (searchParams.get('sessionExpired') === 'true') {
          router.refresh();
        }

        const { data: { session } } = await supabase.auth.getSession();

        if (session && session.expires_at && session.expires_at * 1000 > Date.now()) {
          const userRole = localStorage.getItem('userRole') || 'ADMIN';
          if (userRole === 'SUPER_ADMIN') {
            router.push('/super-admin/dashboard');
          } else {
            router.push(returnUrl);
          }
          return;
        }

        if (session && session.expires_at && session.expires_at * 1000 <= Date.now()) {
          const { clearAllSessionData } = await import('@/lib/utils/sessionUtils');
          await clearAllSessionData();
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
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [checkingRole, setCheckingRole] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);

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

  if (authLoading) {
    return <Loader variant="fullscreen" message="Wird geladen..." />;
  }

  if (isAuthenticated && !checkingRole) {
    return null;
  }

  if (checkingRole) {
    return (
      <Loader 
        variant="fullscreen" 
        message={userRole === 'SUPER_ADMIN' ? 'Als Super Admin anmelden' : 'Rolle wird überprüft...'}
        icon={LogIn}
      />
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
        setError(signInError.message || 'Fehler beim Anmelden');
        toast.error('Fehler beim Anmelden');
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
            console.warn('Could not get profile, using metadata');
            detectedRole = data.user.user_metadata?.role || 'ADMIN';
          }
        } catch (err) {
          console.error('Error obteniendo perfilnelles:', err);
          detectedRole = data.user.user_metadata?.role || 'ADMIN';
        }
        
        setUserRole(detectedRole);
        
        // Esperar al menos 1 segundo para mostrar el loader
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        localStorage.setItem('userRole', detectedRole);
        console.log('💾 Rol guardado en localStorage:', detectedRole);
        
        // Redireccionar según el rol
        if (detectedRole === 'SUPER_ADMIN') {
          console.log('🚀 Redirigiendo a SUPER_ADMIN dashboard');
          toast.success('Willkommen Super Admin!');
          router.push('/super-admin/dashboard');
        } else {
          console.log('🚀 Redirigiendo a dashboard regular');
          toast.success('Willkommen zurück!');
            router.push(returnUrl);
        }
      } else {
        setError('Fehler beim Anmelden');
        toast.error('Fehler beim Anmelden');
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Unerwarteter Fehler beim Anmelden');
      toast.error('Unerwarteter Fehler');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-background-cream to-brand-100 flex items-center justify-center p-4 relative">
      {/* Botón de volver atrás - Fijo en la parte superior */}
      <button
        onClick={() => router.push('/')}
        className="fixed top-4 left-4 z-50 w-12 h-12 flex items-center justify-center cursor-pointer
                 bg-white rounded-full shadow-lg hover:bg-gray-50 active:scale-95 
                 transition-ios touch-target tap-highlight-transparent"
        style={{
          top: 'calc(16px + env(safe-area-inset-top))',
          left: 'calc(16px + env(safe-area-inset-left))',
        }}
        aria-label="Zurück"
        tabIndex={0}
      >
        <ArrowLeft className="w-6 h-6 text-gray-700" strokeWidth={2.5} />
      </button>

      <div className="w-full max-w-md px-4">

        {/* Card de Login */}
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl p-5 sm:p-6 md:p-8">
          {/* Header */}
          <div className="text-center mb-5 sm:mb-6 md:mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-brand-500 rounded-xl sm:rounded-2xl mb-3 sm:mb-4">
              <LogIn className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-white" strokeWidth={2.5} />
            </div>
            <h1 className="text-2xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-1.5 sm:mb-2">
              Anmelden
            </h1>
            <p className="text-sm sm:text-base text-gray-500">
              {getLoginSubtitle()}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 sm:mb-5 md:mb-6 bg-red-50 border border-red-200 rounded-lg sm:rounded-xl p-3 sm:p-4 flex items-start gap-2 sm:gap-3">
              <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-xs sm:text-sm text-red-700 font-medium">
                  {error}
                </p>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
                E-Mail
              </label>
              <div className="relative">
                <Mail className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="max.muster@muster.ch"
                  required
                  disabled={loading}
                  className="w-full pl-10 sm:pl-12 pr-4 py-2.5 sm:py-3 md:py-3.5 border-2 border-gray-200 rounded-lg sm:rounded-xl 
                           focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent
                           transition-ios text-sm sm:text-base disabled:bg-gray-50 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
                Passwort
              </label>
              <div className="relative">
                <Lock className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  disabled={loading}
                  className="w-full pl-10 sm:pl-12 pr-12 sm:pr-14 py-2.5 sm:py-3 md:py-3.5 border-2 border-gray-200 rounded-lg sm:rounded-xl 
                           focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent
                           transition-ios text-sm sm:text-base disabled:bg-gray-50 disabled:cursor-not-allowed"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 cursor-pointer text-gray-400 hover:text-gray-600 
                           transition-colors touch-target tap-highlight-transparent"
                  aria-label={showPassword ? "Passwort verbergen" : "Passwort anzeigen"}
                  tabIndex={0}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" />
                  ) : (
                    <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Forgot Password Link */}
            <div className="text-right">
              <Link
                href="/forgot-password"
                className="text-xs sm:text-sm cursor-pointer text-brand-500 hover:text-brand-600 font-medium transition-colors"
              >
                Passwort vergessen?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !email || !password}
              className="w-full cursor-pointer bg-brand-500 hover:bg-brand-600 text-white rounded-xl sm:rounded-2xl px-5 sm:px-6 py-3 sm:py-3.5 md:py-4 
                       font-semibold text-sm sm:text-base md:text-lg flex items-center justify-center gap-2 sm:gap-3 
                       transition-ios shadow-lg shadow-brand-500/30 hover:shadow-xl
                       disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-brand-500
                       focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2
                       touch-target tap-highlight-transparent"
              style={{ minHeight: '44px' }}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                  <span className="text-sm sm:text-base">Wird angemeldet...</span>
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={2.5} />
                  <span>Anmelden</span>
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-5 sm:my-6 md:my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white px-3 sm:px-4 text-xs sm:text-sm text-gray-500">oder</span>
            </div>
          </div>

          {/* Google Login Button */}
          <GoogleLoginButton />

          {/* Register Link */}
          <div className="text-center mt-5 sm:mt-6 md:mt-8">
            <p className="text-xs sm:text-sm text-gray-600">
              Noch kein Konto?{' '}
              <Link
                href="/register"
                className="cursor-pointer text-brand-500 hover:text-brand-600 font-semibold transition-colors"
              >
                Jetzt registrieren
              </Link>
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<Loader variant="fullscreen" message="Wird geladen..." />}>
      <LoginForm />
    </Suspense>
  );
}
