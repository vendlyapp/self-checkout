"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useScannedStoreStore } from "@/lib/stores/scannedStoreStore";
import DashboardUser from "@/components/user/Dashboard";

export default function UserPage() {
  const router = useRouter();
  const { store } = useScannedStoreStore();

  useEffect(() => {
    // Si hay una tienda escaneada, redirigir a /store/[slug]
    if (store?.slug) {
      router.replace(`/store/${store.slug}`);
    }
  }, [store?.slug, router]);

  return (
    <div className="w-full h-full ios-scroll-fix">
      <DashboardUser />
    </div>
  );
}
