import { FormErrors, ProductVariant } from './types';
import { CreateProductRequest } from '@/lib/services/productService';

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
    case "sku":
      if (!value.trim()) {
        newErrors.sku = "SKU ist erforderlich";
      } else if (!/^[A-Z0-9-]+$/.test(value) || value.length < 5 || value.length > 30) {
        newErrors.sku = "SKU Format ungültig (nur Großbuchstaben, Zahlen und Bindestriche)";
      } else {
        delete newErrors.sku;
      }
      break;
    case "barcode":
      if (value && !/^\d{12,15}$/.test(value)) {
        newErrors.barcode = "Barcode Format ungültig (12-15 Ziffern)";
      } else {
        delete newErrors.barcode;
      }
      break;
    case "costPrice":
      if (value && (isNaN(parseFloat(value)) || parseFloat(value) < 0)) {
        newErrors.costPrice = "Gültiger Kostenpreis erforderlich";
      } else {
        delete newErrors.costPrice;
      }
      break;
    case "supplier":
      if (value && value.length > 100) {
        newErrors.supplier = "Lieferant Name zu lang (max. 100 Zeichen)";
      } else {
        delete newErrors.supplier;
      }
      break;
    case "expiryDate":
      if (value) {
        const expiryDate = new Date(value);
        const today = new Date();
        if (expiryDate <= today) {
          newErrors.expiryDate = "Ablaufdatum muss in der Zukunft liegen";
        } else {
          delete newErrors.expiryDate;
        }
      } else {
        delete newErrors.expiryDate;
      }
      break;
    case "location":
      if (value && value.length > 50) {
        newErrors.location = "Standort zu lang (max. 50 Zeichen)";
      } else {
        delete newErrors.location;
      }
      break;
    case "stock":
      if (!value || parseInt(value) < 0) {
        newErrors.stock = "Lagerbestand ist erforderlich";
      } else if (parseInt(value) > 9999) {
        newErrors.stock = "Lagerbestand zu hoch";
      } else {
        delete newErrors.stock;
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

// Create product object - Frontend solo prepara datos, backend genera QR y códigos únicos
export const createProductObject = (
  productName: string,
  productDescription: string,
  productPrice: string,
  productCategory: string,
  promotionPrice: string,
  stock: number,
  hasVariants: boolean,
  hasPromotion: boolean,
  sku?: string,
  barcode?: string,
  supplier?: string,
  costPrice?: string,
  expiryDate?: string,
  location?: string,
  notes?: string
) => {
  // Crear objeto básico que el backend puede manejar
  const baseProduct: CreateProductRequest = {
    name: productName,
    description: productDescription,
    price: parseFloat(productPrice),
    category: productCategory,
    stock: stock,
    isActive: true,
    // El backend requiere SKU, así que generamos uno si no se proporciona
    sku: sku && sku.trim() ? sku.trim() : `AUTO-${Date.now()}`,
  };

  // Agregar campos opcionales solo si tienen valor
  if (hasPromotion && promotionPrice) {
    baseProduct.originalPrice = parseFloat(promotionPrice);
  }

  if (barcode && barcode.trim()) {
    baseProduct.barcode = barcode.trim();
  }

  if (supplier && supplier.trim()) {
    baseProduct.supplier = supplier.trim();
  }

  if (costPrice && costPrice.trim()) {
    baseProduct.costPrice = parseFloat(costPrice);
  }

  if (location && location.trim()) {
    baseProduct.location = location.trim();
  }

  if (notes && notes.trim()) {
    baseProduct.notes = notes.trim();
  }

  if (expiryDate && expiryDate.trim()) {
    baseProduct.expiryDate = expiryDate;
  }

  // Campos de promoción solo si hay promoción
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
