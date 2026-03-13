"use client";

import React, { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthContext";
import { Download, X } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const STORAGE_KEY = "pwa-install-dismissed";

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

export function PWAInstallBanner() {
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();
  const [showBanner, setShowBanner] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [mode, setMode] = useState<"none" | "prompt" | "ios">("none");
  const deferredPrompt = useRef<BeforeInstallPromptEvent | null>(null);

  const isStoreRoute = typeof pathname === "string" && pathname.startsWith("/store/");
  const shouldOfferPWA = isAuthenticated || isStoreRoute;

  useEffect(() => {
    if (!shouldOfferPWA || isStandalone()) return;
    if (typeof window === "undefined") return;
    if (localStorage.getItem(STORAGE_KEY)) return;

    const ua = window.navigator.userAgent || "";
    const isIos = /iPhone|iPad|iPod/i.test(ua);
    const isSafari = /Safari/i.test(ua) && !/Chrome/i.test(ua) && !/CriOS/i.test(ua) && !/FxiOS/i.test(ua);

    // iOS Safari no soporta beforeinstallprompt: mostramos instrucciones manuales
    if (isIos && isSafari) {
      setMode("ios");
      setShowBanner(true);
      requestAnimationFrame(() => setIsVisible(true));
      return;
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      deferredPrompt.current = e as BeforeInstallPromptEvent;
      setMode("prompt");
      setShowBanner(true);
      requestAnimationFrame(() => setIsVisible(true));
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
  }, [shouldOfferPWA]);

  const handleInstall = async () => {
    const prompt = deferredPrompt.current;
    if (!prompt) return;
    try {
      await prompt.prompt();
      const { outcome } = await prompt.userChoice;
      if (outcome === "accepted") setShowBanner(false);
    } finally {
      deferredPrompt.current = null;
      setShowBanner(false);
    }
  };

  const handleDismiss = () => {
    if (typeof window !== "undefined") localStorage.setItem(STORAGE_KEY, "true");
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="pwa-install-title"
      aria-describedby="pwa-install-desc"
    >
      {/* Backdrop */}
      <button
        type="button"
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={handleDismiss}
        aria-label="Schliessen"
      />
      {/* Modal */}
      <div
        className={`relative w-full max-w-[340px] bg-white rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 ${
          isVisible ? "scale-100 opacity-100" : "scale-95 opacity-0"
        }`}
      >
        <div className="p-6 pt-8">
          <button
            type="button"
            onClick={handleDismiss}
            className="absolute top-3 right-3 p-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors touch-target"
            aria-label="Schliessen"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex flex-col items-center text-center">
            <div className="w-14 h-14 rounded-2xl bg-brand-500/10 flex items-center justify-center mb-4">
              <Download className="w-7 h-7 text-brand-600" aria-hidden />
            </div>
            <h2 id="pwa-install-title" className="text-lg font-semibold text-foreground mb-1">
              App installieren
            </h2>
            <p id="pwa-install-desc" className="text-sm text-muted-foreground mb-6">
              {mode === "ios"
                ? "Auf iPhone: Tippen Sie auf das Teilen-Symbol und wählen Sie „Zum Home-Bildschirm“, um die App zu installieren."
                : isStoreRoute
                  ? "Installieren Sie die App, um schnell zu scannen und zu bestellen."
                  : "Für die beste Erfahrung installieren Sie die App auf Ihrem Gerät."}
            </p>
            <div className="flex flex-col gap-3 w-full">
              <button
                type="button"
                onClick={mode === "ios" ? handleDismiss : handleInstall}
                className="w-full py-3.5 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-xl transition-colors active:scale-[0.98] touch-target"
              >
                {mode === "ios" ? "Verstanden" : "Installieren"}
              </button>
              <button
                type="button"
                onClick={handleDismiss}
                className="w-full py-3 text-gray-600 hover:bg-gray-100 font-medium rounded-xl transition-colors touch-target"
              >
                Später
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
