import { create } from 'zustand';

interface CategoryFormState {
  isFormValid: boolean;
  hasChanges: boolean;
  isSubmitting: boolean;
  setCategoryFormState: (payload: { isFormValid?: boolean; hasChanges?: boolean; isSubmitting?: boolean }) => void;
  reset: () => void;
}

export const useCategoryFormStore = create<CategoryFormState>((set) => ({
  isFormValid: false,
  hasChanges: false,
  isSubmitting: false,
  setCategoryFormState: (payload) =>
    set((s) => ({
      isFormValid: payload.isFormValid ?? s.isFormValid,
      hasChanges: payload.hasChanges ?? s.hasChanges,
      isSubmitting: payload.isSubmitting ?? s.isSubmitting,
    })),
  reset: () => set({ isFormValid: false, hasChanges: false, isSubmitting: false }),
}));
