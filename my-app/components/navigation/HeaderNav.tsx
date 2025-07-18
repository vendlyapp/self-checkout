import { ArrowLeftIcon } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { useCartStore } from '@/lib/stores/cartStore';

interface HeaderNavProps {
  title?: string;
}

export default function HeaderNav({ title = 'Warenkorb' }: HeaderNavProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { cartItems, clearCart } = useCartStore();
  const isCartPage = pathname === '/charge/cart';
  const hasItems = cartItems.length > 0;

  return (
    <div className="flex justify-between items-center p-4 bg-white border-b border-gray-200">
      <div className="flex items-center gap-2 justify-between w-full px-4">
        <button className="flex items-center gap-2 cursor-pointer" onClick={() => router.back()} aria-label="Zurück" tabIndex={0}>
          <ArrowLeftIcon className="w-6 h-6" />
          <span className="text-[18px] font-semibold ">{title}</span>
        </button>
        <div className="flex items-center gap-2">
          {isCartPage && hasItems && (
            <button
              className="text-red-600 font-semibold text-[16px] px-2 py-1 rounded hover:bg-red-50 transition-colors"
              onClick={clearCart}
              aria-label="Leeren"
              tabIndex={0}
            >
              Leeren
            </button>
          )}
        </div>
      </div>
    </div>
  );
}