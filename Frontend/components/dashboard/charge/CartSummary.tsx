"use client";

import { ShoppingBag, ChevronRight } from "lucide-react";

interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  originalPrice?: number;
  category: string;
  categoryId: string;
  image?: string;
  stock: number;
  barcode?: string;
  sku: string;
  tags: string[];
  isNew?: boolean;
  isPopular?: boolean;
  isOnSale?: boolean;
  rating?: number;
  reviews?: number;
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  createdAt: string;
  updatedAt: string;
  unit?: string;
  availableWeights?: string[];
}

interface CartItem {
  product: Product;
  quantity: number;
}

interface CartSummaryProps {
  items: CartItem[];
  onContinue: () => void;
  isVisible?: boolean;
}

export default function CartSummary({
  items,
  onContinue,
  isVisible = true,
}: CartSummaryProps) {
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const formatPrice = (price: number) => {
    return `CHF ${price.toFixed(2)}`;
  };

  if (totalItems === 0 || !isVisible) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white text-white p-2 shadow-lg z-50">
      <div className="flex items-center justify-between bg-brand-500 rounded-lg p-4">
        {/* Cart Info */}
        <div className="flex items-center gap-3">
          <ShoppingBag className="w-5 h-5" />
          <span className="font-medium">
            {totalItems} {totalItems === 1 ? "Artikel" : "Artikel"}
          </span>
        </div>

        {/* Total Price */}
        <div className="flex items-center gap-4">
          <span className="font-bold text-lg">{formatPrice(totalPrice)}</span>

          {/* Continue Button */}
          <button
            onClick={onContinue}
            className="bg-white text-brand-500 px-4 py-2 rounded-lg font-medium flex items-center gap-2 hover:bg-gray-50 transition-colors"
          >
            <span>Weiter</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
