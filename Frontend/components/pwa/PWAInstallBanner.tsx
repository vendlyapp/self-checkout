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
  const deferredPrompt = useRef<BeforeInstallPromptEvent | null>(null);

  const isStoreRoute = typeof pathname === "string" && pathname.startsWith("/store/");
  const shouldOfferPWA = isAuthenticated || isStoreRoute;

  useEffect(() => {
    if (!shouldOfferPWA || isStandalone()) return;
    if (typeof window !== "undefined" && localStorage.getItem(STORAGE_KEY)) return;

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      deferredPrompt.current = e as BeforeInstallPromptEvent;
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
      className={`fixed bottom-0 left-0 right-0 z-[100] safe-area-bottom transition-transform duration-300 ${
        isVisible ? "translate-y-0" : "translate-y-full"
      }`}
      role="dialog"
      aria-label="App installieren"
    >
      <div className="bg-white border-t border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] p-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
        <div className="max-w-[430px] mx-auto flex items-start gap-3">
          <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center">
            <Download className="w-5 h-5 text-brand-600" aria-hidden />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-foreground text-[15px]">App installieren</p>
            <p className="text-muted-foreground text-sm mt-0.5">
              {isStoreRoute
                ? "Installieren Sie die App, um schnell zu scannen und zu bestellen."
                : "Für die beste Erfahrung installieren Sie die App auf Ihrem Gerät."}
            </p>
            <div className="flex items-center gap-2 mt-3">
              <button
                type="button"
                onClick={handleInstall}
                className="px-4 py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-medium rounded-xl text-sm transition-colors active:scale-[0.98]"
              >
                Installieren
              </button>
              <button
                type="button"
                onClick={handleDismiss}
                className="px-4 py-2.5 text-gray-600 hover:bg-gray-100 font-medium rounded-xl text-sm transition-colors"
              >
                Später
              </button>
            </div>
          </div>
          <button
            type="button"
            onClick={handleDismiss}
            className="flex-shrink-0 p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
            aria-label="Schliessen"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
