import { FormErrors, ProductVariant } from './types';
import { CreateProductRequest } from '@/lib/services/productService';
export const validateField = (
  field: keyof FormErrors,
  value: string,
  errors: FormErrors,
  hasVariants: boolean,
  hasPromotion: boolean,
  productPrice: string
): FormErrors => {
  const newErrors = { ...errors };

  switch (field) {
    case "productName":
      if (!value.trim()) {
        newErrors.productName = "Produktname ist erforderlich";
      } else if (value.length < 2) {
        newErrors.productName = "Mindestens 2 Zeichen";
      } else if (value.length > 50) {
        newErrors.productName = "Maximal 50 Zeichen";
      } else {
        delete newErrors.productName;
      }
      break;
    case "productPrice":
      if (!hasVariants && (!value || parseFloat(value) <= 0)) {
        newErrors.productPrice = "Gültiger Preis erforderlich";
      } else if (!hasVariants && parseFloat(value) > 9999) {
        newErrors.productPrice = "Preis zu hoch";
      } else {
        delete newErrors.productPrice;
      }
      break;
    case "productCategory":
      if (!value) {
        newErrors.productCategory = "Kategorie wählen";
      } else {
        delete newErrors.productCategory;
      }
      break;
    case "promotionPrice":
      if (hasPromotion && !value) {
        newErrors.promotionPrice = "Aktionspreis erforderlich";
      } else if (
        hasPromotion &&
        !hasVariants &&
        parseFloat(value) >= parseFloat(productPrice)
      ) {
        newErrors.promotionPrice = "Aktionspreis muss kleiner sein";
      } else {
        delete newErrors.promotionPrice;
      }
      break;
  }
  return newErrors;
};
export const validateVariants = (variants: ProductVariant[]): boolean => {
  return variants.every(variant =>
    variant.name.trim() !== '' &&
    variant.price !== '' &&
    parseFloat(variant.price) > 0
  );
};
export const createProductObject = (
  productName: string,
  productDescription: string,
  productPrice: string,
  productCategory: string,
  promotionPrice: string,
  hasVariants: boolean,
  hasPromotion: boolean,
  notes?: string
) => {
  const baseProduct: CreateProductRequest = {
    name: productName,
    description: productDescription,
    price: parseFloat(productPrice),
    category: productCategory,
    stock: 999,
    isActive: true,
  };

  if (hasPromotion && promotionPrice) {
    baseProduct.originalPrice = parseFloat(promotionPrice);
  }

  if (notes && notes.trim()) {
    baseProduct.notes = notes.trim();
  }
  if (hasPromotion && promotionPrice) {
    const discountPercentage = Math.round(
      ((parseFloat(productPrice) - parseFloat(promotionPrice)) / parseFloat(productPrice)) * 100
    );
    
    baseProduct.promotionTitle = "Aktion";
    baseProduct.promotionType = "percentage";
    baseProduct.promotionBadge = `-${discountPercentage}%`;
    baseProduct.promotionActionLabel = "Jetzt hinzufügen";
    baseProduct.promotionPriority = 10;
  }

  return baseProduct;
};
