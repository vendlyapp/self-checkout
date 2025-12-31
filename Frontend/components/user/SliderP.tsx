"use client"

import PromotionSlider from "@/components/user/PromotionSlider";
import { Product } from "@/components/dashboard/products_list/data/mockProducts";
import { useMemo } from "react";
import { useCartStore } from "@/lib/stores/cartStore";
import type React from "react";
import { Package } from "lucide-react";

interface SliderPProps {
  products?: Product[];
}

const computeDiscountPercent = (product: Product): number | undefined => {
  if (typeof product.discountPercentage === "number") return product.discountPercentage;
  if (typeof product.originalPrice === "number" && product.originalPrice > product.price) {
    const diff = product.originalPrice - product.price;
    if (product.originalPrice <= 0) return undefined;
    return Math.round((diff / product.originalPrice) * 100);
  }
  return undefined;
};

const getProgressFraction = (product: Product): number => {
  const base = product.initialStock && product.initialStock > 0
    ? 1 - product.stock / product.initialStock
    : 1 - product.stock / 50;
  if (base < 0) return 0;
  if (base > 1) return 1;
  return base;
};

const getProgressLabel = (product: Product): string | undefined => {
  if (product.promotionEndAt) {
    const end = new Date(product.promotionEndAt).getTime();
    const now = Date.now();
    const ms = end - now;
    if (ms > 0) {
      const totalMinutes = Math.floor(ms / 60000);
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;
      if (hours > 0) return `Aktion gültig: noch ${hours} Std${minutes > 0 ? ` ${minutes} Min` : ""}`;
      return `Aktion gültig: noch ${minutes} Min`;
    }
  }
  return `Noch ${product.stock} auf Lager`;
};

const SliderP: React.FC<SliderPProps> = ({ products = [] }) => {
  const addToCart = useCartStore((s) => s.addToCart);

  const items = useMemo(() => {
    if (products.length === 0) return [];

    const withDiscount = products
      .map((p) => ({ product: p, discount: computeDiscountPercent(p) }))
      .filter(({ product, discount }) => product.isOnSale || typeof discount === "number" || product.isPopular);

    withDiscount.sort((a, b) => {
      const da = typeof a.discount === "number" ? a.discount : 0;
      const db = typeof b.discount === "number" ? b.discount : 0;
      if (db !== da) return db - da;
      const ra = typeof a.product.rating === "number" ? a.product.rating : 0;
      const rb = typeof b.product.rating === "number" ? b.product.rating : 0;
      return rb - ra;
    });

    return withDiscount.slice(0, 10).map(({ product, discount }) => {
      const handleAdd = () => {
        addToCart(product, 1);
      };

      // Asegurar que imageUrl sea una string, no un componente React
      const imageUrl = product.image || (product.images && product.images.length > 0 ? product.images[0] : '');

      return {
        title: product.promotionTitle ?? (product.isOnSale ? "Aktion" : "Empfehlung"),
        discountPercent: discount,
        imageUrl,
        name: product.name,
        currency: product.currency ?? "CHF",
        price: product.price,
        originalPrice: product.originalPrice,
        progressFraction: getProgressFraction(product),
        progressLabel: getProgressLabel(product),
        actionLabel: product.promotionActionLabel ?? "Jetzt hinzufügen",
        onAdd: handleAdd,
      } as const;
    });
  }, [products, addToCart]);

  if (items.length === 0) return null;

  return (
    <PromotionSlider items={items} />
  );
}

export default SliderP;
