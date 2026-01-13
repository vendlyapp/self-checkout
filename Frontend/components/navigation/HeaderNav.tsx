import { ArrowLeftIcon, Plus, X, Zap } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { useCartStore } from "@/lib/stores/cartStore";
import {
  getPromotionalProducts,
  Product,
} from "../dashboard/products_list/data/mockProducts";
import { useEffect, useState } from "react";

interface HeaderNavProps {
  title?: string;
  showAddButton?: boolean;
  closeDestination?: string;
  isFixed?: boolean;
  promotionCount?: number; // Número real de promociones
  variant?: 'default' | 'subtle'; // Variante para diseño más sutil
}

export default function HeaderNav({
  title = "Warenkorb",
  showAddButton = false,
  closeDestination = "/dashboard",
  isFixed = false,
  promotionCount, // Número real de promociones pasado como prop
  variant = 'default', // Variante por defecto
}: HeaderNavProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { cartItems, clearCart } = useCartStore();
  const isCartPage = pathname === "/charge/cart" || pathname === "/user/cart" || pathname?.includes('/cart');
  const isPromotionPage = pathname?.includes('/promotion');
  const [products, setProducts] = useState<Product[]>([]);
  useEffect(() => {
    // Solo usar mock si no se pasa promotionCount
    if (promotionCount === undefined) {
      const promotionalProducts = getPromotionalProducts();
      setProducts(promotionalProducts);
    }
  }, [promotionCount]);
  const hasItems = cartItems.length > 0;
  
  // Usar promotionCount si está disponible, sino usar products.length del mock
  const displayCount = promotionCount !== undefined ? promotionCount : products.length;

  const isSubtle = variant === 'subtle'
  
  return (
    <div className={`${isFixed ? 'fixed top-[80px]' : ''} flex justify-between items-center ${isSubtle ? 'p-3' : 'p-4'} ${isSubtle ? 'bg-transparent' : 'bg-white'} left-0 right-0 z-40 safe-area-top ${isSubtle ? 'pt-[calc(0.5rem+env(safe-area-inset-top))]' : 'pt-[calc(1rem+env(safe-area-inset-top))]'}`}>
      <div className={`flex items-center gap-2 justify-between w-full ${isSubtle ? 'pt-[5px]' : 'pt-[10px]'} ${isSubtle ? 'px-2' : 'px-4'} touch-target`}>
        <button
          className={`flex items-center gap-2 cursor-pointer ${isSubtle ? 'hover:bg-white/50 active:bg-white/70 rounded-full p-2 -ml-2 transition-ios' : ''}`}
          onClick={() => router.back()}
          aria-label="Zurück"
          tabIndex={0}
        >
          <ArrowLeftIcon className={`${isSubtle ? 'w-5 h-5' : 'w-6 h-6'} ${isSubtle ? 'text-gray-800' : ''}`} />
          {!isSubtle && <span className="text-[18px] font-semibold">{title}</span>}
        </button>
        <div className="flex items-center gap-2">
          {isCartPage && hasItems && (
            <button
              className="text-red-600 font-semibold text-[14px] px-2 py-1 rounded hover:bg-red-50"
              onClick={clearCart}
              aria-label="Leeren"
              tabIndex={0}
            >
              Leeren
            </button>
          )}
          {isPromotionPage && (
            <div className="flex items-center gap-0.5">
              <Zap className="w-4 h-4 text-black" />
              <span className="text-[14px] font-semibold">
                {displayCount}
              </span>
              <button
                className="text-black text-[14px] px-2 py-1 rounded hover:bg-red-50"
                onClick={() => {
                  // Redirigir a promotion de la tienda actual si estamos en una ruta de tienda
                  if (pathname?.includes('/store/')) {
                    const slug = pathname.split('/store/')[1]?.split('/')[0]
                    if (slug) {
                      router.push(`/store/${slug}/promotion`)
                    }
                  }
                }}
                aria-label="Aktionen"
                tabIndex={0}
              >
                Aktionen
              </button>
            </div>
          )}
          {!isCartPage && !showAddButton && !isPromotionPage && !isSubtle && (
            <button
              className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-100"
              onClick={() => router.push(closeDestination)}
              aria-label="Schließen"
              tabIndex={0}
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          )}
          {showAddButton && (
            <button
              className="flex items-center gap-2 cursor-pointer bg-brand-600 rounded-full p-2"
              onClick={() => router.push("/products_list/add_product")}
              aria-label="Hinzufügen"
              tabIndex={0}
            >
              <Plus className="w-6 h-6 text-white" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
