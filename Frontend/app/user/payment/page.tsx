"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useScannedStoreStore } from "@/lib/stores/scannedStoreStore";
import HeaderNav from "@/components/navigation/HeaderNav";
import PaymentP from "@/components/user/PaymentP";

export default function UserPaymentPage() {
  const router = useRouter();
  const { store } = useScannedStoreStore();

  // Redirigir a /store/[slug]/payment si hay tienda
  useEffect(() => {
    if (store?.slug && typeof window !== 'undefined') {
      const currentPath = window.location.pathname;
      if (currentPath === '/user/payment') {
        router.replace(`/store/${store.slug}/payment`);
      }
    }
  }, [store?.slug, router]);

  return (
    <>
      <HeaderNav title="Bezahlung" />
      <PaymentP />
    </>
  );
}
