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

export interface CreatedProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: string;
  categoryId: string;
  stock: number;
  barcode: string;
  sku: string;
  tags: string[];
  isNew: boolean;
  rating: number;
  reviews: number;
  weight: number;
  dimensions: { length: number; width: number; height: number };
  createdAt: string;
  updatedAt: string;
  hasWeight: boolean;
  discountPercentage?: number;
}

// Shared Props for Form Components
export interface SharedFormProps {
  // Form state
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
  stock: number;
  isActive: boolean;
  setIsActive: (value: boolean) => void;
  hasPromotion: boolean;
  setHasPromotion: (value: boolean) => void;
  promotionPrice: string;
  setPromotionPrice: (value: string) => void;
  promotionDuration: string;
  setPromotionDuration: (value: string) => void;
  customEndDate: string;
  setCustomEndDate: (value: string) => void;
  hasVariants: boolean;
  setHasVariants: (value: boolean) => void;
  variants: ProductVariant[];
  setVariants: (variants: ProductVariant[]) => void;
  vatRate: string;
  setVatRate: (value: string) => void;
  errors: FormErrors;
  saveProgress: number;
  showSuccessModal: boolean;
  createdProduct: CreatedProduct | null;
  handleModalClose: () => void;
  validateField: (field: keyof FormErrors, value: string) => void;
  addVariant: () => void;
  removeVariant: (index: number) => void;
  updateVariant: (index: number, field: keyof ProductVariant, value: string) => void;
  handleToggleVariants: (newValue: boolean) => void;
  categories: Category[];
  vatRates: VatRate[];
}

// Form Props
export interface FormProps {
  isDesktop?: boolean;
}
