// Product Form Types
export interface ProductVariant {
  name: string;
  price: string;
  promotionPrice: string;
}

export interface FormErrors {
  productName?: string;
  productPrice?: string;
  productCategory?: string;
  promotionPrice?: string;
}

export interface Category {
  value: string;
  color: string;
}

export interface VatRate {
  value: string;
  label: string;
  color: string;
}

// Importar el tipo Product del mock para asegurar compatibilidad
import { Product } from '@/components/dashboard/products_list/data/mockProducts';

// Usar el tipo Product directamente para CreatedProduct
export type CreatedProduct = Product;

// Shared Props for Form Components
export interface SharedFormProps {
  // Form state - Campos básicos
  productName: string;
  setProductName: (value: string) => void;
  productDescription: string;
  setProductDescription: (value: string) => void;
  productPrice: string;
  setProductPrice: (value: string) => void;
  productCategory: string;
  setProductCategory: (value: string) => void;
  productImages: string[];
  setProductImages: (images: string[]) => void;
  isActive: boolean;
  setIsActive: (value: boolean) => void;
  stock: number; // Stock fijo de 999 (solo lectura)

  // Campos opcionales
  notes: string;
  setNotes: (value: string) => void;

  // Promociones
  hasPromotion: boolean;
  setHasPromotion: (value: boolean) => void;
  promotionPrice: string;
  setPromotionPrice: (value: string) => void;
  promotionDuration: string;
  setPromotionDuration: (value: string) => void;
  customEndDate: string;
  setCustomEndDate: (value: string) => void;

  // Variantes
  hasVariants: boolean;
  setHasVariants: (value: boolean) => void;
  variants: ProductVariant[];
  setVariants: (variants: ProductVariant[]) => void;

  // Impuestos
  vatRate: string;
  setVatRate: (value: string) => void;

  // Estado del formulario
  errors: FormErrors;
  saveProgress: number;
  showSuccessModal: boolean;
  createdProduct: CreatedProduct | null;
  handleModalClose: () => void;
  validateField: (field: keyof FormErrors, value: string) => void;

  // Funciones de variantes
  addVariant: () => void;
  removeVariant: (index: number) => void;
  updateVariant: (index: number, field: keyof ProductVariant, value: string) => void;
  handleToggleVariants: (newValue: boolean) => void;

  // Datos estáticos
  categories: Category[];
  vatRates: VatRate[];
}

// Form Props
export interface FormProps {
  isDesktop?: boolean;
}
