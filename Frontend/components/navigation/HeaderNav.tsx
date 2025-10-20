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
}

export default function HeaderNav({
  title = "Warenkorb",
  showAddButton = false,
  closeDestination = "/dashboard",
  isFixed = false,
}: HeaderNavProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { cartItems, clearCart } = useCartStore();
  const isCartPage = pathname === "/charge/cart" || pathname === "/user/cart" || pathname?.includes('/cart');
  const isPromotionPage = pathname === "/user/promotion" || pathname?.includes('/promotion');
  const [products, setProducts] = useState<Product[]>([]);
  useEffect(() => {
    const promotionalProducts = getPromotionalProducts();
    setProducts(promotionalProducts);
  }, []);
  const hasItems = cartItems.length > 0;

  return (
    <div className={`${isFixed ? 'fixed top-[80px]' : ''} flex justify-between items-center p-4 bg-white border-b border-gray-200 left-0 right-0 z-40 safe-area-top pt-[calc(1rem+env(safe-area-inset-top))]`}>
      <div className="flex items-center gap-2 justify-between w-full pt-[10px] px-4 touch-target">
        <button
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => router.back()}
          aria-label="Zurück"
          tabIndex={0}
        >
          <ArrowLeftIcon className="w-6 h-6" />
          <span className="text-[18px] font-semibold ">{title}</span>
        </button>
        <div className="flex items-center gap-2">
          {isCartPage && hasItems && (
            <button
              className="text-red-600 font-semibold text-[14px] px-2 py-1 rounded hover:bg-red-50 transition-colors"
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
                {products.length === 0 ? "0" : products.length}
              </span>
              <button
                className="text-black  text-[14px] px-2 py-1 rounded hover:bg-red-50 transition-colors"
                onClick={() => router.push("/user/promotion")}
                aria-label="Aktionen"
                tabIndex={0}
              >
                Aktionen
              </button>
            </div>
          )}
          {!isCartPage && !showAddButton && !isPromotionPage && (
            <button
              className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-100 transition-colors"
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
