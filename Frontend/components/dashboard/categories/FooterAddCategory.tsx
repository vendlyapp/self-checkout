import React, { useState } from "react";
import { Plus } from "lucide-react";
import { Loader } from "@/components/ui/Loader";

type FooterAddCategoryProps = {
  onAddCategory: () => void;
  isLoading?: boolean;
  buttonText?: string;
  isFormValid?: boolean;
  isAddCategoryPage?: boolean;
  hasChanges?: boolean;
};

const FooterAddCategory: React.FC<FooterAddCategoryProps> = ({
  onAddCategory,
  isLoading = false,
  buttonText = "Neue Kategorie erstellen",
  isFormValid = true,
  isAddCategoryPage = false,
  hasChanges = false,
}) => {
  // Estado para el efecto de presión
  const [pressed, setPressed] = useState(false);

  // Determinar si el botón debe estar deshabilitado
  // Si está editando, solo habilitar si hay cambios y el formulario es válido
  // Si está creando, habilitar si el formulario es válido
  const isEditing = buttonText.includes("Änderungen");
  const isDisabled = isLoading || 
    (isAddCategoryPage && !isFormValid) || 
    (isAddCategoryPage && isEditing && !hasChanges);
  
  // Determinar el color del botón
  const buttonColorClass = isDisabled
    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
    : "bg-brand-500 hover:bg-brand-600 text-white";

  return (
    <div className="nav-container">
      <div className="p-4">
        <button
          type="button"
          className={`w-full font-semibold rounded-lg py-3 text-[18px] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-ios-fast ${
            pressed ? "scale-95" : ""
          } ${buttonColorClass}`}
          aria-label={buttonText}
          onClick={onAddCategory}
          disabled={isDisabled}
          onTouchStart={() => !isDisabled && setPressed(true)}
          onTouchEnd={() => setPressed(false)}
          onMouseDown={() => !isDisabled && setPressed(true)}
          onMouseUp={() => setPressed(false)}
          onMouseLeave={() => setPressed(false)}
        >
          {isLoading ? (
            <>
              <Loader size="xs" color="white" />
              <span>Wird geladen...</span>
            </>
          ) : (
            <>
              <Plus className="w-6 h-6" />
              <span>{buttonText}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default FooterAddCategory;

