'use client';

import { Suspense } from 'react';
import { Mail, ArrowLeft, CheckCircle, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { getCheckEmailFrom } from '@/lib/config/brand';

function CheckEmailContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email');

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-background-cream to-brand-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Botón de regreso */}
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8 transition-colors group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium">Zurück zum Login</span>
        </Link>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 text-center relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-brand-100 rounded-full -translate-y-16 translate-x-16 opacity-50"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-brand-50 rounded-full translate-y-12 -translate-x-12 opacity-50"></div>

          {/* Icon animado */}
          <div className="relative inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-brand-400 to-brand-600 rounded-2xl mb-6 shadow-lg animate-bounce">
            <Mail className="w-10 h-10 text-white" strokeWidth={2.5} />
            <div className="absolute -top-1 -right-1">
              <Sparkles className="w-5 h-5 text-yellow-400 animate-pulse" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-gray-900 mb-3 relative z-10">
            Überprüfe deine E-Mail
          </h1>

          {/* Email enviado */}
          {email && (
            <div className="mb-4 px-4 py-2 bg-brand-50 border border-brand-200 rounded-xl inline-block">
              <p className="text-sm text-brand-700 font-medium">
                📧 {email}
              </p>
            </div>
          )}

          {/* Description */}
          <p className="text-gray-600 mb-8 leading-relaxed relative z-10">
            Wir haben dir einen Bestätigungslink geschickt. 
            Bitte überprüfe deinen Posteingang und klicke auf den Link, 
            um dein Konto zu aktivieren.
          </p>

          {/* Steps */}
          <div className="bg-gray-50 rounded-2xl p-6 mb-8 text-left space-y-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 bg-brand-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">1</span>
              </div>
              <p className="text-sm text-gray-700">
                Öffne deine E-Mail-App
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 bg-brand-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">2</span>
              </div>
              <p className="text-sm text-gray-700">
                {getCheckEmailFrom()}
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 bg-brand-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">3</span>
              </div>
              <p className="text-sm text-gray-700">
                Klicke auf den Bestätigungslink
              </p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="flex-shrink-0 w-6 h-6 text-brand-500" />
              <p className="text-sm text-gray-700 font-semibold">
                Fertig! Du wirst automatisch angemeldet
              </p>
            </div>
          </div>

          {/* Info adicional */}
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <p className="text-sm text-blue-700">
                💡 <strong>Tipp:</strong> Überprüfe auch deinen Spam-Ordner
              </p>
            </div>

            <p className="text-xs text-gray-500">
              Keine E-Mail erhalten?{' '}
              <Link href="/register" className="text-brand-500 hover:text-brand-600 font-semibold">
                Erneut versuchen
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
      </div>
    }>
      <CheckEmailContent />
    </Suspense>
  );
}

