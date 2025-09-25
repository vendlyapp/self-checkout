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
  return {
    // El backend generará el ID, QR, SKU y barcode automáticamente
    name: productName,
    description: productDescription,
    price: parseFloat(productPrice),
    originalPrice: hasPromotion ? parseFloat(promotionPrice) : undefined,
    category: productCategory,
    categoryId: productCategory === "Alle" ? "all" : productCategory.toLowerCase(),
    stock: stock,
    initialStock: stock,
    // Si se proporcionan, el backend los validará; si no, los generará automáticamente
    barcode: barcode || undefined,
    sku: sku || undefined,
    tags: productDescription
      ? productDescription.toLowerCase().split(" ")
      : [],
    isNew: true,
    isActive: true,
    rating: 0,
    reviews: 0,
    weight: hasVariants ? 0 : 1000,
    hasWeight: !hasVariants,
    dimensions: { length: 15, width: 12, height: 8 },
    currency: "CHF",
    // Campos adicionales de gestión
    supplier: supplier || undefined,
    costPrice: costPrice ? parseFloat(costPrice) : undefined,
    margin: costPrice ? Math.round(((parseFloat(productPrice) - parseFloat(costPrice)) / parseFloat(productPrice)) * 100) : undefined,
    taxRate: 7.7, // IVA suizo por defecto
    expiryDate: expiryDate || undefined,
    location: location || undefined,
    notes: notes || undefined,
    // Campos de promoción
    promotionTitle: hasPromotion ? "Aktion" : undefined,
    promotionType: hasPromotion ? ("percentage" as const) : undefined,
    promotionBadge: hasPromotion ? `-${Math.round(
      ((parseFloat(productPrice) - parseFloat(promotionPrice)) /
        parseFloat(productPrice)) *
        100
    )}%` : undefined,
    promotionActionLabel: hasPromotion ? "Jetzt hinzufügen" : undefined,
    promotionPriority: hasPromotion ? 10 : undefined,
  };
};
