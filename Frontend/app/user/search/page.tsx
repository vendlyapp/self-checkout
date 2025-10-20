"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useScannedStoreStore } from "@/lib/stores/scannedStoreStore";
import SearchUser from "@/components/user/SearchUser";

export default function SearchPage() {
  const router = useRouter();
  const { store } = useScannedStoreStore();

  useEffect(() => {
    if (store?.slug) {
      router.replace(`/store/${store.slug}/search`);
    }
  }, [store?.slug, router]);

  return <SearchUser />;
}
