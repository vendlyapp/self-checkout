import StoreProductsPageClient from './StoreProductsPageClient';
import { buildApiUrl } from '@/lib/config/api';

export const revalidate = 60;

export async function generateStaticParams() {
  try {
    const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    const res = await fetch(`${base}/api/storefront/active-slugs`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return [];
    const json = await res.json();
    const slugs: string[] = json?.data ?? [];
    return slugs.map((slug) => ({ slug }));
  } catch {
    return [];
  }
}

export default async function StoreProductsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  try {
    await fetch(buildApiUrl(`/api/storefront/stores/${slug}`), {
      next: { revalidate: 60 },
    });
  } catch {
    // client will refetch
  }

  return <StoreProductsPageClient />;
}
