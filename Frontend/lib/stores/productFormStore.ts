import { create } from 'zustand';

type SaveHandler = () => void | Promise<void>;

interface ProductFormState {
  hasChanges: boolean;
  saveHandler: SaveHandler | null;
  setHasChanges: (value: boolean) => void;
  registerSave: (fn: SaveHandler) => () => void;
  triggerSave: () => void;
}

export const useProductFormStore = create<ProductFormState>((set, get) => ({
  hasChanges: false,
  saveHandler: null,
  setHasChanges: (value) => set({ hasChanges: value }),
  registerSave: (fn) => {
    set({ saveHandler: fn });
    return () => {
      const state = get();
      if (state.saveHandler === fn) set({ saveHandler: null });
    };
  },
  triggerSave: () => {
    const { saveHandler } = get();
    if (saveHandler) saveHandler();
  },
}));
