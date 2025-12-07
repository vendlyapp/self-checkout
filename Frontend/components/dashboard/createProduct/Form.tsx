"use client";

import React, { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import { CheckCircle } from "lucide-react";
import MobileForm from "./MobileForm";
import DesktopForm from "./DesktopForm";
import { FormProps, CreatedProduct, ProductVariant, FormErrors } from "./types";
import { validateField, createProductObject } from "./validations";
import { CATEGORIES, VAT_RATES, SAVE_PROGRESS_STEPS } from "./constants";
import { useCreateProduct } from "@/hooks/mutations";
import { Product } from "@/components/dashboard/products_list/data/mockProducts";

export default function Form({ isDesktop = false }: FormProps) {
  const router = useRouter();
  const createProductMutation = useCreateProduct();

  // Form state - Campos básicos
  const [productName, setProductName] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [productPrice, setProductPrice] = useState("");
  const [productCategory, setProductCategory] = useState("");
  const [productImages, setProductImages] = useState<string[]>([]); // Array de URLs base64 o URLs
  const [imageFiles, setImageFiles] = useState<File[]>([]); // Archivos originales para referencia
  const [isActive, setIsActive] = useState(true);
  
  // Stock siempre es 999 (no se muestra en el formulario)
  const stock = 999;

  // Promociones
  const [hasPromotion, setHasPromotion] = useState(false);
  const [promotionPrice, setPromotionPrice] = useState("");
  const [promotionDuration, setPromotionDuration] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");

  // Variantes
  const [hasVariants, setHasVariants] = useState(false);
  const [variants, setVariants] = useState<ProductVariant[]>([]);

  // Impuestos
  const [vatRate, setVatRate] = useState("2.6");

  // Estado del formulario
  const [errors, setErrors] = useState<FormErrors>({});
  const [saveProgress, setSaveProgress] = useState(0);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [createdProduct, setCreatedProduct] = useState<CreatedProduct | null>(null);

  // Data from constants
  const categories = CATEGORIES;
  const vatRates = VAT_RATES;

  // Validation wrapper
  const handleValidateField = useCallback(
    (field: keyof FormErrors, value: string) => {
      const newErrors = validateField(field, value, errors, hasVariants, hasPromotion, productPrice);
      setErrors(newErrors);
    },
    [errors, hasVariants, hasPromotion, productPrice]
  );

  const addVariant = useCallback(() => {
    setVariants([...variants, { name: "", price: "", promotionPrice: "" }]);
  }, [variants]);

  const removeVariant = useCallback(
    (index: number) => {
      setVariants(variants.filter((_, i) => i !== index));
    },
    [variants]
  );

  const updateVariant = useCallback(
    (index: number, field: keyof ProductVariant, value: string) => {
      const updatedVariants = variants.map((variant, i) =>
        i === index ? { ...variant, [field]: value } : variant
      );
      setVariants(updatedVariants);
    },
    [variants]
  );

  const handleToggleVariants = useCallback(
    (newValue: boolean) => {
      setHasVariants(newValue);
      if (newValue && variants.length === 0) {
        setVariants([{ name: "", price: "", promotionPrice: "" }]);
      }
    },
    [variants.length]
  );

  // Función para manejar subida de imágenes
  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const maxImages = 3;
    const remainingSlots = maxImages - productImages.length;
    const filesToProcess = Array.from(files).slice(0, remainingSlots);

    filesToProcess.forEach((file) => {
      if (!file.type.startsWith('image/')) {
        alert(`${file.name} no es una imagen válida`);
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        alert(`${file.name} es demasiado grande. Máximo 5MB`);
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setProductImages((prev) => [...prev, base64String]);
        setImageFiles((prev) => [...prev, file]);
      };
      reader.onerror = () => {
        alert(`Error al leer ${file.name}`);
      };
      reader.readAsDataURL(file);
    });

    // Limpiar el input para permitir seleccionar el mismo archivo nuevamente
    e.target.value = '';
  }, [productImages.length]);

  // Función para eliminar imagen
  const handleRemoveImage = useCallback((index: number) => {
    setProductImages((prev) => prev.filter((_, i) => i !== index));
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleSave = useCallback(async () => {
    try {
      handleValidateField("productName", productName);
      handleValidateField("productCategory", productCategory);

      if (!hasVariants) handleValidateField("productPrice", productPrice);
      if (hasPromotion) handleValidateField("promotionPrice", promotionPrice);
      if (Object.keys(errors).length > 0) return;

      for (let i = 0; i < SAVE_PROGRESS_STEPS.length; i++) {
        setSaveProgress(((i + 1) / SAVE_PROGRESS_STEPS.length) * 100);
        await new Promise((resolve) => setTimeout(resolve, SAVE_PROGRESS_STEPS[i].duration));
      }

      setSaveProgress(0);

      const productData = createProductObject(
        productName,
        productDescription,
        productPrice,
        productCategory,
        promotionPrice,
        hasVariants,
        hasPromotion,
      );

      // Agregar imágenes al objeto del producto
      if (productImages.length > 0) {
        productData.images = productImages;
        productData.image = productImages[0]; // Primera imagen como imagen principal
      }

      try {
        // Usar mutation de React Query
        const createdProduct = await createProductMutation.mutateAsync(productData as any);

        // Convertir el producto de la API al tipo usado en el frontend
        const frontendProduct: Product = {
          ...createdProduct,
          tags: createdProduct.tags || [],
          categoryId: createdProduct.categoryId || 'uncategorized',
        };
        setCreatedProduct(frontendProduct);
        setShowSuccessModal(true);
      } catch (apiError) {
        // Fallback: crear producto localmente con datos mock
        const mockCreatedProduct: Product = {
          id: `mock-${Date.now()}`,
          name: productData.name,
          description: productData.description,
          price: productData.price,
          category: productData.category,
          categoryId: productData.categoryId || 'uncategorized',
          stock: productData.stock,
          sku: productData.sku || `MOCK-${Date.now()}`,
          barcode: productData.barcode || `${Date.now()}`,
          qrCode: `QR-MOCK-${Date.now()}`,
          tags: [],
          isActive: productData.isActive,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          // Agregar campos adicionales si existen
          ...(productData.originalPrice && { originalPrice: productData.originalPrice }),
          ...(productData.supplier && { supplier: productData.supplier }),
          ...(productData.costPrice && { costPrice: productData.costPrice }),
          ...(productData.location && { location: productData.location }),
          ...(productData.expiryDate && { expiryDate: productData.expiryDate }),
          ...(productData.promotionTitle && { promotionTitle: productData.promotionTitle }),
          ...(productData.promotionType && { promotionType: productData.promotionType }),
          ...(productData.promotionBadge && { promotionBadge: productData.promotionBadge }),
          ...(productData.promotionActionLabel && { promotionActionLabel: productData.promotionActionLabel }),
          ...(productData.promotionPriority && { promotionPriority: productData.promotionPriority }),
        };
        
        // Solo usar fallback si es un error de red/timeout, no si es un error de validación
        if (apiError instanceof Error && (
          apiError.message.includes('timeout') || 
          apiError.message.includes('Failed to fetch') ||
          apiError.message.includes('Network')
        )) {
          setCreatedProduct(mockCreatedProduct);
          setShowSuccessModal(true);
          alert('Producto creado localmente. El backend no está disponible, pero el producto se guardó en el frontend.');
        } else {
          // Re-lanzar el error para que se maneje en el catch externo
          throw apiError;
        }
      }
    } catch (error) {
      console.error('Error creating product:', error);
      
      // Mostrar error más específico al usuario
      let errorMessage = 'Error al crear el producto';
      
      if (error instanceof Error) {
        if (error.message.includes('500')) {
          errorMessage = 'Error del servidor. Intenta nuevamente o contacta al administrador.';
        } else if (error.message.includes('timeout')) {
          errorMessage = 'Tiempo de espera agotado. Verifica tu conexión e intenta nuevamente.';
        } else if (error.message.includes('400')) {
          errorMessage = 'Datos inválidos. Verifica que todos los campos estén correctos.';
        } else {
          errorMessage = error.message;
        }
      }
      
      alert(errorMessage);
    }
  }, [
    productName,
    productDescription,
    productCategory,
    productPrice,
    promotionPrice,
    hasVariants,
    hasPromotion,
    errors,
    handleValidateField,
  ]);

  const handleModalClose = useCallback(() => {
    setShowSuccessModal(false);
    setCreatedProduct(null);
    // Agregar timestamp para forzar refresh de la lista
    router.push(`/products_list?refresh=${Date.now()}`);
  }, [router]);

  // Función para renderizar el modal fuera del árbol DOM normal
  const renderSuccessModal = () => {
    if (typeof window === 'undefined') return null;
    
    const modalContent = (
      <div className="fixed inset-0 z-[99999] flex items-center justify-center overflow-hidden">
        {/* Backdrop con blur moderno - cubre toda la pantalla */}
        <div className="absolute inset-0 w-screen h-screen bg-black/30 backdrop-blur-md"></div>
        
        {/* Modal moderno con animación */}
        <div className="relative bg-white rounded-3xl shadow-2xl max-w-sm w-full mx-4 animate-in fade-in-0 zoom-in-95 duration-300">
          {/* Gradiente superior */}
          <div className="bg-gradient-to-br from-[#25D076] to-[#20BA68] rounded-t-3xl p-8 text-center">
            <div className="w-20 h-20 bg-white/20 backdrop-blur-lg rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <CheckCircle className="w-10 h-10 text-white" strokeWidth={3} />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">
              ¡Éxito!
            </h3>
          </div>

          {/* Contenido del modal */}
          <div className="p-6">
            <p className="text-gray-700 mb-6 text-center text-base">
              Su producto <span className="font-semibold text-gray-900">&quot;{createdProduct?.name}&quot;</span> ha sido creado exitosamente
            </p>

            {/* Tarjeta de información */}
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-4 mb-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">ID del Producto:</span>
                <span className="text-sm text-gray-900 font-mono font-semibold bg-white/70 px-3 py-1 rounded-lg">
                  {createdProduct?.id}
                </span>
              </div>
            </div>

            {/* Botón principal */}
            <button
              onClick={handleModalClose}
              className="w-full bg-gradient-to-r from-[#25D076] to-[#20BA68] text-white py-4 px-6 rounded-2xl font-semibold hover:shadow-lg transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 text-base flex items-center justify-center gap-2"
            >
              <CheckCircle className="w-5 h-5" />
              Ir al Catálogo
            </button>
          </div>
        </div>
      </div>
    );

    return createPortal(modalContent, document.body);
  };

  useEffect(() => {
    interface WindowWithSaveProduct extends Window {
      saveProduct?: () => Promise<void>;
    }
    (window as WindowWithSaveProduct).saveProduct = handleSave;
  }, [handleSave]);

  // Prevenir scroll del body cuando el modal está abierto
  useEffect(() => {
    if (showSuccessModal) {
      // Prevenir scroll
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
    } else {
      // Restaurar scroll
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    }

    // Cleanup
    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    };
  }, [showSuccessModal]);
  const sharedProps = {
    productName,
    setProductName,
    productDescription,
    setProductDescription,
    productPrice,
    setProductPrice,
    productCategory,
    setProductCategory,
    productImages,
    setProductImages,
    handleImageUpload,
    handleRemoveImage,
    isActive,
    setIsActive,
    stock,
    hasPromotion,
    setHasPromotion,
    promotionPrice,
    setPromotionPrice,
    promotionDuration,
    setPromotionDuration,
    customEndDate,
    setCustomEndDate,
    hasVariants,
    setHasVariants,
    variants,
    setVariants,
    vatRate,
    setVatRate,
    errors,
    saveProgress,
    showSuccessModal: false, // No mostrar modal en los componentes hijos
    createdProduct: null,
    handleModalClose,
    handleSave,
    validateField: handleValidateField,
    addVariant,
    removeVariant,
    updateVariant,
    handleToggleVariants,
    categories,
    vatRates,
  };

  return (
    <>
      <div className="w-full">
        {isDesktop ? (
          <DesktopForm {...sharedProps} />
        ) : (
          <MobileForm {...sharedProps} />
        )}
      </div>
      
      {/* Modal renderizado fuera del árbol DOM usando Portal */}
      {showSuccessModal && renderSuccessModal()}
    </>
  );
}
