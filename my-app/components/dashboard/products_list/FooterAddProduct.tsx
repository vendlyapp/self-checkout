import React, { useState, useEffect } from "react";
import { Plus } from "lucide-react";

type FooterAddProductProps = {
  onAddProduct: () => void;
  totalProducts?: number;
  isLoading?: boolean;
  filteredProducts?: number;
  hasActiveFilters?: boolean;
  isFormValid?: boolean;
  buttonText?: string;
  isAddProductPage?: boolean;
};

const FooterAddProduct: React.FC<FooterAddProductProps> = ({
  onAddProduct,
  isLoading = false,
  buttonText = "Neues Produkt",
  isAddProductPage = false,
}) => {
  // Estado para el efecto de presión
  const [pressed, setPressed] = useState(false);
  const [formValid, setFormValid] = useState(true);

  // Verificar la validación del formulario cuando estamos en la página de agregar producto
  useEffect(() => {
    if (isAddProductPage) {
      const checkFormValidity = () => {
        // Buscar elementos del formulario para determinar si es válido
        const nameInput = document.querySelector(
          'input[placeholder*="Äpfel"]'
        ) as HTMLInputElement;
        const categorySelect = document.querySelector(
          "select"
        ) as HTMLSelectElement;
        const priceInput = document.querySelector(
          'input[type="number"]'
        ) as HTMLInputElement;

        if (nameInput && categorySelect && priceInput) {
          const isValid =
            nameInput.value.trim() !== "" &&
            categorySelect.value !== "" &&
            parseFloat(priceInput.value) > 0;
          setFormValid(isValid);
        }
      };

      // Verificar inicialmente
      checkFormValidity();

      // Verificar cuando cambien los inputs
      const inputs = document.querySelectorAll("input, select");
      inputs.forEach((input) => {
        input.addEventListener("input", checkFormValidity);
        input.addEventListener("change", checkFormValidity);
      });

      return () => {
        inputs.forEach((input) => {
          input.removeEventListener("input", checkFormValidity);
          input.removeEventListener("change", checkFormValidity);
        });
      };
    }
  }, [isAddProductPage]);

  // Determinar si el botón debe estar deshabilitado
  const isDisabled = isLoading || (isAddProductPage && !formValid);

  // Determinar el icono según el contexto
  const getIcon = () => {
    if (isAddProductPage) {
      return formValid ? (
        <Plus className="w-6 h-6" />
      ) : (
        <div className="w-6 h-6" />
      );
    }
    return <Plus className="w-6 h-6" />;
  };

  return (
    <div className="bottom-0 left-0 right-0 border-t w-full border-gray-200 p-4 z-10 bg-white">
      <button
        className={`w-full font-semibold rounded-lg py-3 text-[18px] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-all duration-150 ${
          pressed ? "scale-95" : ""
        } ${
          isAddProductPage && !formValid
            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
            : "bg-brand-500 hover:bg-brand-600 text-white"
        }`}
        aria-label={buttonText}
        onClick={onAddProduct}
        disabled={isDisabled}
        onTouchStart={() => !isDisabled && setPressed(true)}
        onTouchEnd={() => setPressed(false)}
        onMouseDown={() => !isDisabled && setPressed(true)}
        onMouseUp={() => setPressed(false)}
        onMouseLeave={() => setPressed(false)}
      >
        {isLoading ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            <span>Wird geladen...</span>
          </>
        ) : (
          <>
            {getIcon()}
            <span>{buttonText}</span>
          </>
        )}
      </button>
    </div>
  );
};

export default FooterAddProduct;
