'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Store, Info } from 'lucide-react';
import Image from 'next/image';
import { useScannedStoreStore } from '@/lib/stores/scannedStoreStore';

interface HeaderUserProps {
  isDarkMode?: boolean;
  scrollContainer?: HTMLElement | null;
}

export default function HeaderUser({ isDarkMode = false, scrollContainer: _scrollContainer }: HeaderUserProps) {
  const { store } = useScannedStoreStore();
  const [storeLogo, setStoreLogo] = useState<string | null>(null);
  const [hidden, setHidden] = useState(false);
  const ref = useRef<HTMLElement>(null);
  const storeHomeHref = store?.slug ? `/store/${store.slug}` : '/';

  useEffect(() => {
    if (store?.logo) setStoreLogo(store.logo);
    else setStoreLogo(null);
  }, [store?.logo]);

  // Hide-on-scroll — igual que BrandStrip de Lovable, escucha el scroll container (main element)
  useEffect(() => {
    const target = _scrollContainer ?? (typeof window !== 'undefined' ? window as unknown as HTMLElement : null);
    if (!target) return;
    let lastY = 'scrollTop' in target ? (target as HTMLElement).scrollTop : window.scrollY;
    let ticking = false;

    const getY = () => 'scrollTop' in target ? (target as HTMLElement).scrollTop : window.scrollY;

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = getY();
        const delta = y - lastY;
        if (y < 24) setHidden(false);
        else if (delta > 6) setHidden(true);
        else if (delta < -6) setHidden(false);
        lastY = y;
        ticking = false;
      });
    };

    target.addEventListener('scroll', onScroll, { passive: true });
    return () => target.removeEventListener('scroll', onScroll);
  }, [_scrollContainer]);

  // Publicar altura como CSS var para que CategoryChips y search bar se posicionen bien
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => {
      const h = hidden ? 0 : el.getBoundingClientRect().height;
      document.documentElement.style.setProperty('--brand-strip-h', `${Math.round(h)}px`);
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [hidden]);

  return (
    <header
      ref={ref}
      className={`sticky top-0 z-[100] border-b border-white/60 bg-background-cream/95 backdrop-blur-sm transition-transform duration-200 pt-[env(safe-area-inset-top)] ${
        hidden ? '-translate-y-full' : 'translate-y-0'
      }`}
    >
      <div className="flex items-center gap-3 px-4 py-3">
        {/* Logo + nombre tienda */}
        <Link href={storeHomeHref} className="flex flex-1 items-center gap-3 min-w-0" aria-label="Startseite">
          <div className="flex-shrink-0">
            {storeLogo ? (
              <div className="h-10 w-10 rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center">
                <img
                  src={storeLogo}
                  alt={store?.name || 'Store Logo'}
                  className="max-w-full max-h-full w-auto h-auto object-contain"
                  onError={() => setStoreLogo(null)}
                />
              </div>
            ) : (
              <div className="h-10 w-10 rounded-xl bg-gray-100 flex items-center justify-center border border-gray-200">
                <Store className="w-5 h-5 text-gray-400" />
              </div>
            )}
          </div>
          <div className="min-w-0">
            <p className="text-base font-extrabold leading-tight tracking-tight text-gray-900 truncate">
              {store?.name || '—'}
            </p>
            {store?.address && (
              <p className="text-xs text-gray-500 truncate">{store.address}</p>
            )}
          </div>
        </Link>

        {/* Info button */}
        <button
          className="flex-shrink-0 flex h-9 items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 text-gray-700 shadow-soft active:scale-95 transition-transform"
          aria-label="Info"
        >
          <Info className="h-4 w-4" strokeWidth={2.5} />
          <span className="text-xs font-bold">Info</span>
        </button>

        {/* Logo Vendly */}
        <div className="flex-shrink-0">
          <Image
            src="/self-checkout-logo.svg"
            alt="Self-Checkout"
            width={92}
            height={20}
            priority
            className="h-5 w-auto"
          />
        </div>
      </div>
    </header>
  );
}
