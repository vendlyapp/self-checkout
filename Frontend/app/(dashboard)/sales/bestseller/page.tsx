'use client';

import { Trophy, Package } from 'lucide-react';
import { useTopProducts } from '@/hooks/queries/useTopProducts';
import { Loader } from '@/components/ui/Loader';
import type { TopProduct } from '@/lib/services/orderService';

function Top5List({ products }: { products: TopProduct[] }) {
  const top5 = products.slice(0, 5);

  return (
    <div className="px-4 pt-1 pb-8 space-y-3">
      {top5.map((product, i) => {
        const rank = i + 1;
        const isFirst = rank === 1;
        return (
          <div
            key={product.productId}
            className={`flex items-center gap-4 rounded-2xl bg-card border p-4 min-w-0 transition-colors ${
              isFirst ? 'border-primary/30 shadow-sm' : 'border-border'
            }`}
          >
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-sm font-bold tabular-nums ${
                isFirst ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              }`}
            >
              {rank}
            </div>
            <div className="flex-1 min-w-0">
              <p className={`truncate ${isFirst ? 'font-semibold text-foreground' : 'font-medium text-foreground'}`}>
                {product.productName}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5 tabular-nums">
                {product.unitsSold.toLocaleString('de-CH')} verkauft
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function BestsellerPage() {
  const { data: products = [], isLoading, error } = useTopProducts({ limit: 5, metric: 'units' });
  const isEmpty = !isLoading && !error && products.length === 0;

  return (
    <div className="w-full min-w-0">
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader size="md" />
          <p className="text-sm text-muted-foreground">Wird geladen…</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-center px-4">
          <div className="w-14 h-14 rounded-2xl bg-destructive/10 flex items-center justify-center">
            <Package className="w-7 h-7 text-destructive" />
          </div>
          <p className="text-sm font-medium text-foreground">Fehler beim Laden</p>
        </div>
      ) : isEmpty ? (
        <div className="flex flex-col items-center justify-center py-20 text-center gap-4 px-4">
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center">
            <Trophy className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="text-base font-semibold text-foreground">Noch keine Verkäufe</p>
          <p className="text-sm text-muted-foreground max-w-[240px]">
            Sobald Produkte verkauft werden, erscheinen sie hier.
          </p>
        </div>
      ) : (
        <>
          <div className="px-4 pt-5 pb-3">
            <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Meistverkaufte Produkte
            </h2>
          </div>
          <Top5List products={products} />
        </>
      )}
    </div>
  );
}
