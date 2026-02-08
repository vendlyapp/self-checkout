'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthContext';
import { UserPlus, Mail, Lock, User, ArrowLeft, AlertCircle, Loader2, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Loader } from '@/components/ui/Loader';

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

  // Redirigir si ya está logueado
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, authLoading, router]);

  // Mostrar loading mientras verifica autenticación
  if (authLoading) {
    return <Loader variant="fullscreen" message="Wird geladen..." />;
  }

  // No mostrar nada si ya está autenticado (evitar flash)
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

    // Validaciones
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
        
        // Si necesita confirmar email, mostrar mensaje
        if (!data.session) {
          toast.info('Bitte bestätigen Sie Ihre E-Mail, um fortzufahren');
          router.push(`/check-email?email=${encodeURIComponent(formData.email)}`);
        } else {
          // Si la sesión está activa, ir directo al dashboard
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

        {/* Card de Register */}
        <div className="bg-white rounded-3xl shadow-2xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-brand-500 rounded-2xl mb-4">
              <UserPlus className="w-8 h-8 text-white" strokeWidth={2.5} />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Konto erstellen
            </h1>
            <p className="text-gray-500">
              Starte deine Reise mit Vendly
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
            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                Name
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Max Mustermann"
                  required
                  disabled={loading}
                  className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl 
                           focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent
                           transition-ios text-base disabled:bg-gray-50 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                E-Mail
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="max.muster@muster.ch"
                  required
                  disabled={loading}
                  className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl 
                           focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent
                           transition-ios text-base disabled:bg-gray-50 disabled:cursor-not-allowed"
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
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  disabled={loading}
                  className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl 
                           focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent
                           transition-ios text-base disabled:bg-gray-50 disabled:cursor-not-allowed"
                />
              </div>
              <p className="mt-1.5 text-xs text-gray-500">
                Mindestens 6 Zeichen
              </p>
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-2">
                Passwort bestätigen
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
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
                  className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl 
                           focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent
                           transition-ios text-base disabled:bg-gray-50 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !formData.email || !formData.password || !formData.name}
              className="w-full bg-brand-500 hover:bg-brand-600 text-white rounded-2xl px-6 py-4 
                       font-semibold text-lg flex items-center justify-center gap-3 
                       transition-ios shadow-lg shadow-brand-500/30 hover:shadow-xl
                       disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-brand-500
                       focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Wird erstellt...
                </>
              ) : (
                <>
                  <UserPlus className="w-5 h-5" strokeWidth={2.5} />
                  Konto erstellen
                </>
              )}
            </button>
          </form>

          {/* Features */}
          <div className="mt-8 pt-6 border-t border-gray-100 space-y-3">
            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-4">
              Was du bekommst:
            </p>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-brand-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-gray-600">
                Vollständige Produktverwaltung
              </p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-brand-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-gray-600">
                Eigener Shop-Link zum Teilen
              </p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-brand-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-gray-600">
                Verkaufsanalysen und Statistiken
              </p>
            </div>
          </div>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
          </div>

          {/* Login Link */}
          <div className="text-center">
            <p className="text-gray-600">
              Hast du bereits ein Konto?{' '}
              <Link
                href="/login"
                className="text-brand-500 hover:text-brand-600 font-semibold transition-colors"
              >
                Anmelden
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
