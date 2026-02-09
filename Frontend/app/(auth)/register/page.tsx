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
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-background-cream to-brand-100 flex items-center justify-center p-4 relative">
      {/* Botón de regreso - fijo, igual que login */}
      <button
        type="button"
        onClick={() => router.push('/')}
        className="fixed top-4 left-4 z-50 w-12 h-12 flex items-center justify-center
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

      <div className="w-full max-w-md px-4 pt-12 sm:pt-0">
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl p-4 sm:p-5 relative overflow-hidden max-h-[90vh] overflow-y-auto">
          {/* Decoración sutil */}
          <div className="absolute top-0 right-0 w-20 h-20 bg-brand-100/50 rounded-full -translate-y-8 translate-x-8 pointer-events-none" aria-hidden />

          {/* Header compacto */}
          <div className="text-center mb-4 relative">
            <div className="inline-flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 bg-brand-500 rounded-xl mb-2 shadow-lg shadow-brand-500/20">
              <UserPlus className="w-5 h-5 sm:w-6 sm:h-6 text-white" strokeWidth={2.5} />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-0.5">
              Konto erstellen
            </h1>
            <p className="text-xs sm:text-sm text-gray-500">
              {getRegisterSubtitle()}
            </p>
          </div>

          {error && (
            <div className="mb-3 bg-red-50 border border-red-200 rounded-lg p-2.5 flex items-start gap-2 relative">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-red-700 font-medium flex-1">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="relative">
            {/* Fila 1: Name + E-Mail (2 cols en sm+) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-3">
              <div>
                <label htmlFor="name" className="block text-xs font-semibold text-gray-700 mb-1">
                  Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Max Mustermann"
                    required
                    disabled={loading}
                    className="w-full pl-9 pr-3 py-2 border-2 border-gray-200 rounded-lg text-sm
                             focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent
                             disabled:bg-gray-50 disabled:cursor-not-allowed"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="email" className="block text-xs font-semibold text-gray-700 mb-1">
                  E-Mail
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="max@muster.ch"
                    required
                    disabled={loading}
                    className="w-full pl-9 pr-3 py-2 border-2 border-gray-200 rounded-lg text-sm
                             focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent
                             disabled:bg-gray-50 disabled:cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            {/* Fila 2: Passwort + Bestätigen (2 cols en sm+) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4">
              <div>
                <label htmlFor="password" className="block text-xs font-semibold text-gray-700 mb-1">
                  Passwort
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
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
                    className="w-full pl-9 pr-3 py-2 border-2 border-gray-200 rounded-lg text-sm
                             focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent
                             disabled:bg-gray-50 disabled:cursor-not-allowed"
                  />
                </div>
                <p className="mt-0.5 text-[10px] text-gray-500">Min. 6 Zeichen</p>
              </div>
              <div>
                <label htmlFor="confirmPassword" className="block text-xs font-semibold text-gray-700 mb-1">
                  Passwort bestätigen
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
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
                    className="w-full pl-9 pr-3 py-2 border-2 border-gray-200 rounded-lg text-sm
                             focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent
                             disabled:bg-gray-50 disabled:cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !formData.email || !formData.password || !formData.name}
              className="w-full bg-brand-500 hover:bg-brand-600 text-white rounded-xl px-4 py-3
                       font-semibold text-sm flex items-center justify-center gap-2
                       transition-ios shadow-lg shadow-brand-500/25 hover:shadow-xl
                       disabled:opacity-50 disabled:cursor-not-allowed
                       focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2
                       touch-target"
              style={{ minHeight: '44px' }}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Wird erstellt...
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" strokeWidth={2.5} />
                  Konto erstellen
                </>
              )}
            </button>
          </form>

          {/* Beneficios: una sola línea compacta */}
          <div className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[11px] sm:text-xs text-gray-500">
            <span className="inline-flex items-center gap-1">
              <Package className="w-3.5 h-3.5 text-brand-500" />
              Produkte
            </span>
            <span className="inline-flex items-center gap-1">
              <Link2 className="w-3.5 h-3.5 text-brand-500" />
              Shop-Link
            </span>
            <span className="inline-flex items-center gap-1">
              <BarChart3 className="w-3.5 h-3.5 text-brand-500" />
              Analysen
            </span>
          </div>

          {/* Login link inline con footer */}
          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500">
              Bereits registriert?{' '}
              <Link
                href="/login"
                className="text-brand-500 hover:text-brand-600 font-semibold"
              >
                Anmelden
              </Link>
            </p>
          </div>
        </div>

        <p className="mt-3 text-center text-[11px] sm:text-xs text-gray-500">
          Für Geschäfte und Einzelhändler
        </p>
      </div>
    </div>
  );
}
