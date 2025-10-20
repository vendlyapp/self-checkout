'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthContext';
import { LogIn, Mail, Lock, ArrowLeft, AlertCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { GoogleLoginButton } from '@/components/auth/GoogleLoginButton';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get('returnUrl') || '/dashboard';
  const { signIn, isAuthenticated, loading: authLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Redirigir si ya está logueado
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.push(returnUrl);
    }
  }, [isAuthenticated, authLoading, router, returnUrl]);

  // Mostrar loading mientras verifica autenticación
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-brand-50 via-background-cream to-brand-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-brand-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Wird geladen...</p>
        </div>
      </div>
    );
  }

  // No mostrar nada si ya está autenticado (evitar flash)
  if (isAuthenticated) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data, error: signInError } = await signIn(email, password);

      if (signInError) {
        setError(signInError.message || 'Error al iniciar sesión');
        toast.error('Error al iniciar sesión');
        return;
      }

      if (data.user) {
        toast.success('¡Bienvenido de nuevo!');
        router.push(returnUrl);
      }
    } catch (err) {
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
