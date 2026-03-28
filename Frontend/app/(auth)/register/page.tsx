'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthContext';
import { UserPlus, Mail, Lock, User, ArrowLeft, AlertCircle, Loader2, Package, Link2, BarChart3 } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Loader } from '@/components/ui/Loader';
import { getRegisterSubtitle } from '@/lib/config/brand';

export default function RegisterPage() {
  const router = useRouter();
  const { signUp, isAuthenticated, loading: authLoading } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, authLoading, router]);

  if (authLoading) {
    return <Loader variant="fullscreen" message="Wird geladen..." />;
  }

  if (isAuthenticated) {
    return null;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Die Passwörter stimmen nicht überein');
      toast.error('Die Passwörter stimmen nicht überein');
      return;
    }

    if (formData.password.length < 6) {
      setError('Das Passwort muss mindestens 6 Zeichen lang sein');
      toast.error('Passwort zu kurz');
      return;
    }

    setLoading(true);

    try {
      const { data, error: signUpError } = await signUp(
        formData.email,
        formData.password,
        formData.name,
        'ADMIN'
      );

      if (signUpError) {
        setError(signUpError.message || 'Fehler beim Registrieren des Benutzers');
        toast.error('Fehler beim Registrieren');
        return;
      }

      if (data?.user) {
        toast.success('Konto erfolgreich erstellt!');
        if (!data.session) {
          toast.info('Bitte bestätigen Sie Ihre E-Mail, um fortzufahren');
          router.push(`/check-email?email=${encodeURIComponent(formData.email)}`);
        } else {
          router.push('/dashboard');
        }
      }
    } catch {
      setError('Unerwarteter Fehler beim Registrieren');
      toast.error('Unerwarteter Fehler');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-dvh bg-gradient-to-br from-brand-50 via-background-cream to-brand-100 flex items-center justify-center p-4 relative">
      {/* Botón de regreso - fijo, igual que login */}
      <button
        type="button"
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
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl p-5 sm:p-6 md:p-8 relative overflow-hidden">
          {/* Decoración sutil */}
          <div className="absolute top-0 right-0 w-20 h-20 bg-brand-100/50 rounded-full -translate-y-8 translate-x-8 pointer-events-none" aria-hidden />

          {/* Header - mismo tamaño que login */}
          <div className="text-center mb-5 sm:mb-6 md:mb-8 relative">
            <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-brand-500 rounded-xl sm:rounded-2xl mb-3 sm:mb-4">
              <UserPlus className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-white" strokeWidth={2.5} />
            </div>
            <h1 className="text-2xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-1.5 sm:mb-2">
              Konto erstellen
            </h1>
            <p className="text-sm sm:text-base text-gray-500">
              {getRegisterSubtitle()}
            </p>
          </div>

          {error && (
            <div className="mb-4 sm:mb-5 md:mb-6 bg-red-50 border border-red-200 rounded-lg sm:rounded-xl p-3 sm:p-4 flex items-start gap-2 sm:gap-3">
              <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs sm:text-sm text-red-700 font-medium flex-1">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="relative space-y-4 sm:space-y-5">
            {/* Fila 1: Name + E-Mail (2 cols en sm+) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label htmlFor="name" className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
                  Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Max Mustermann"
                    required
                    disabled={loading}
                    className="w-full pl-10 sm:pl-12 pr-4 py-2.5 sm:py-3 md:py-3.5 border-2 border-gray-200 rounded-lg sm:rounded-xl text-sm sm:text-base
                             focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-ios
                             disabled:bg-gray-50 disabled:cursor-not-allowed"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="email" className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
                  E-Mail
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="max@muster.ch"
                    required
                    disabled={loading}
                    className="w-full pl-10 sm:pl-12 pr-4 py-2.5 sm:py-3 md:py-3.5 border-2 border-gray-200 rounded-lg sm:rounded-xl text-sm sm:text-base
                             focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-ios
                             disabled:bg-gray-50 disabled:cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            {/* Fila 2: Passwort + Bestätigen (2 cols en sm+) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label htmlFor="password" className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
                  Passwort
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                  <input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    required
                    minLength={6}
                    disabled={loading}
                    className="w-full pl-10 sm:pl-12 pr-4 py-2.5 sm:py-3 md:py-3.5 border-2 border-gray-200 rounded-lg sm:rounded-xl text-sm sm:text-base
                             focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-ios
                             disabled:bg-gray-50 disabled:cursor-not-allowed"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">Min. 6 Zeichen</p>
              </div>
              <div>
                <label htmlFor="confirmPassword" className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
                  Passwort bestätigen
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    required
                    minLength={6}
                    disabled={loading}
                    className="w-full pl-10 sm:pl-12 pr-4 py-2.5 sm:py-3 md:py-3.5 border-2 border-gray-200 rounded-lg sm:rounded-xl text-sm sm:text-base
                             focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-ios
                             disabled:bg-gray-50 disabled:cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !formData.email || !formData.password || !formData.name}
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
                  <span className="text-sm sm:text-base">Wird erstellt...</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={2.5} />
                  <span>Konto erstellen</span>
                </>
              )}
            </button>
          </form>

          {/* Beneficios - misma línea de tamaño que login footer */}
          <div className="mt-5 sm:mt-6 md:mt-8 pt-4 sm:pt-6 border-t border-gray-100 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs sm:text-sm text-gray-500">
            <span className="inline-flex items-center gap-1">
              <Package className="w-4 h-4 text-brand-500" />
              Produkte
            </span>
            <span className="inline-flex items-center gap-1">
              <Link2 className="w-4 h-4 text-brand-500" />
              Shop-Link
            </span>
            <span className="inline-flex items-center gap-1">
              <BarChart3 className="w-4 h-4 text-brand-500" />
              Analysen
            </span>
          </div>

          {/* Login link - mismo estilo que login */}
          <div className="mt-5 sm:mt-6 md:mt-8 text-center">
            <p className="text-xs sm:text-sm text-gray-600">
              Bereits registriert?{' '}
              <Link
                href="/login"
                className="cursor-pointer text-brand-500 hover:text-brand-600 font-semibold transition-colors"
              >
                Anmelden
              </Link>
            </p>
          </div>
        </div>

        <p className="mt-4 text-center text-xs sm:text-sm text-gray-500">
          Für Geschäfte und Einzelhändler
        </p>
      </div>
    </div>
  );
}
