import { FormErrors, ProductVariant } from './types';

// Validation function for form fields
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

// Validation for variants
export const validateVariants = (variants: ProductVariant[]): boolean => {
  return variants.every(variant =>
    variant.name.trim() !== '' &&
    variant.price !== '' &&
    parseFloat(variant.price) > 0
  );
};

// Create product object
export const createProductObject = (
  productName: string,
  productDescription: string,
  productPrice: string,
  productCategory: string,
  promotionPrice: string,
  stock: number,
  hasVariants: boolean,
  hasPromotion: boolean
) => {
  return {
    id: `prod-${Date.now()}`,
    name: productName,
    description: productDescription,
    price: parseFloat(productPrice),
    originalPrice: hasPromotion ? parseFloat(promotionPrice) : undefined,
    category: productCategory,
    categoryId: productCategory === "Alle" ? "all" : productCategory.toLowerCase(),
    stock: stock,
    barcode: `1234567890${Date.now()}`,
    sku: productName.toUpperCase().replace(/\s+/g, "-"),
    tags: productDescription
      ? productDescription.toLowerCase().split(" ")
      : [],
    isNew: true,
    rating: 0,
    reviews: 0,
    weight: hasVariants ? 0 : 1000,
    dimensions: { length: 15, width: 12, height: 8 },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    hasWeight: !hasVariants,
    discountPercentage: hasPromotion
      ? Math.round(
          ((parseFloat(productPrice) - parseFloat(promotionPrice)) /
            parseFloat(productPrice)) *
            100
        )
      : undefined,
  };
};
