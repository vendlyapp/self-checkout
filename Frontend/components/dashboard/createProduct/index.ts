// Main components
export { default as Form } from './Form';
export { default as MobileForm } from './MobileForm';
export { default as DesktopForm } from './DesktopForm';

// Types
export type {
  ProductVariant,
  FormErrors,
  Category,
  VatRate,
  CreatedProduct,
  SharedFormProps,
  FormProps,
} from './types';

// Utilities
export { validateField, validateVariants, createProductObject } from './validations';

// Constants
export { CATEGORIES, VAT_RATES, SAVE_PROGRESS_STEPS } from './constants';
