"use client"

import PromotionSlider from "@/components/user/PromotionSlider";
import { getPromotionalProducts, Product } from "@/components/dashboard/products_list/data/mockProducts";
import { useMemo } from "react";
import { useCartStore } from "@/lib/stores/cartStore";
import type React from "react";

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

const SliderP: React.FC = () => {
  const addToCart = useCartStore((s) => s.addToCart);

  const items = useMemo(() => {
    // Usar la nueva función para obtener productos promocionales
    const promotionalProducts = getPromotionalProducts();

    const withDiscount = promotionalProducts
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

    const top = withDiscount.slice(0, 10).map(({ product, discount }) => {
      const handleAdd = () => addToCart(product, 1);
      const imageUrl = product.image || "/logo.svg";

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

    if (top.length > 0) return top;

    // Fallback: show first few promotional products
    return promotionalProducts.slice(0, 10).map((product) => ({
      title: product.promotionTitle ?? (product.isOnSale ? "Aktion" : "Empfehlung"),
      discountPercent: computeDiscountPercent(product),
      imageUrl: product.image || "/logo.svg",
      name: product.name,
      currency: product.currency ?? "CHF",
      price: product.price,
      originalPrice: product.originalPrice,
      progressFraction: getProgressFraction(product),
      progressLabel: getProgressLabel(product),
      actionLabel: product.promotionActionLabel ?? "Jetzt hinzufügen",
      onAdd: () => addToCart(product, 1),
    }));
  }, [addToCart]);

  return (
    <PromotionSlider items={items} />
  );
}

export default SliderP;
