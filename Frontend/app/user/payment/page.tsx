"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useScannedStoreStore } from "@/lib/stores/scannedStoreStore";

export default function UserPaymentPage() {
  const router = useRouter();
  const { store } = useScannedStoreStore();

  useEffect(() => {
    // Si tenemos una tienda, redirigir inmediatamente
    if (store?.slug) {
      router.replace(`/store/${store.slug}/payment`);
    }
  }, [store?.slug, router]);

  // Mostrar loading mientras se redirige
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] bg-[#F9F6F4]">
      <div className="text-center">
        <p className="text-xl font-semibold text-[#373F49] mb-4">
          Wird geladen...
        </p>
      </div>
    </div>
  );
}

