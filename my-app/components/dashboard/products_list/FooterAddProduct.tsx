import React from 'react';
import { Plus } from 'lucide-react';

type FooterAddProductProps = {
  onAddProduct: () => void;
  totalProducts?: number;
  isLoading?: boolean;
  filteredProducts?: number;
  hasActiveFilters?: boolean;
};

const FooterAddProduct: React.FC<FooterAddProductProps> = ({
  onAddProduct,
  // totalProducts = 0,
  isLoading = false,
  // filteredProducts,
  // hasActiveFilters = false
}) => {
  // const isFiltered = hasActiveFilters && filteredProducts !== totalProducts;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-10">
      <button
        className="w-full bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-lg py-3 text-[18px] flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
        aria-label="Neues Produkt hinzufügen"
        onClick={onAddProduct}
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            <span>Wird geladen...</span>
          </>
        ) : (
          <>
            <Plus className="w-6 h-6" />
            <span>Neues Produkt</span>
          </>
        )}
      </button>
    </div>
  );
};

export default FooterAddProduct; 