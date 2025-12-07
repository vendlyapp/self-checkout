"use client";

import React, { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import { CheckCircle } from "lucide-react";
import MobileForm from "../createProduct/MobileForm";
import DesktopForm from "../createProduct/DesktopForm";
import { FormProps, CreatedProduct, ProductVariant, FormErrors } from "../createProduct/types";
import { validateField, createProductObject } from "../createProduct/validations";
import { CATEGORIES, VAT_RATES, SAVE_PROGRESS_STEPS } from "../createProduct/constants";
import { useUpdateProduct } from "@/hooks/mutations";
import { useProductById } from "@/hooks/queries";
import { Product } from "@/components/dashboard/products_list/data/mockProducts";
import { normalizeProductData } from "@/components/dashboard/products_list/data/mockProducts";
import type { UpdateProductRequest } from "@/lib/services/productService";

interface EditFormProps {
  productId: string;
  isDesktop?: boolean;
}

export default function EditForm({ productId, isDesktop = false }: EditFormProps) {
  const router = useRouter();
  const updateProductMutation = useUpdateProduct();
  
  // Obtener producto existente
  const { data: existingProduct, isLoading: loadingProduct } = useProductById(productId);
  
  // Form state - Campos básicos
  const [productName, setProductName] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [productPrice, setProductPrice] = useState("");
  const [productCategory, setProductCategory] = useState("");
  const [productImages, setProductImages] = useState<string[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
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
  const [updatedProduct, setUpdatedProduct] = useState<CreatedProduct | null>(null);

  // Cargar datos del producto cuando esté disponible
  useEffect(() => {
    if (existingProduct) {
      const product = normalizeProductData(existingProduct as any);
      
      setProductName(product.name || "");
      setProductDescription(product.description || "");
      setProductPrice(product.price?.toString() || "");
      setProductCategory(product.category || "");
      setProductImages(product.images || product.image ? [product.image || product.images?.[0] || ""].filter(Boolean) : []);
      setIsActive(product.isActive ?? true);
      
      // Configurar promoción si existe
      const hasActivePromotion = !!(product.isPromotional || product.isOnSale);
      setHasPromotion(hasActivePromotion);
      
      // Si hay promoción, el precio promocional es el precio actual y el originalPrice es el precio base
      if (hasActivePromotion && product.originalPrice) {
        // El precio actual es el promocional, el originalPrice es el precio base
        setPromotionPrice(product.price?.toString() || "");
        // El precio base debería ser originalPrice, pero como estamos editando, mantenemos price como base
        // y promotionPrice como el precio promocional
      } else if (hasActivePromotion) {
        // Si hay promoción pero no originalPrice, usar promotionalPrice si existe
        const promoPrice = (product as any).promotionalPrice;
        if (promoPrice) {
          setPromotionPrice(promoPrice.toString());
        }
      }
      
      // Configurar fechas de promoción si existen
      if ((product as any).promotionalStartDate) {
        setPromotionDuration("custom");
        setCustomEndDate((product as any).promotionalEndDate || "");
      }
      
      // Configurar variantes si existen (esto requeriría una estructura de variantes en el backend)
      // Por ahora, no hay variantes en el backend, así que esto queda vacío
      
      setVatRate("2.6"); // Valor por defecto
    }
  }, [existingProduct]);

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

      // Agregar campos adicionales para actualización
      const updateData = {
        ...productData,
        isActive,
        images: productImages,
        // Si hay promoción, configurar campos de promoción
        ...(hasPromotion && {
          isPromotional: true,
          promotionalPrice: parseFloat(promotionPrice),
          promotionalStartDate: new Date().toISOString(),
          promotionalEndDate: customEndDate || (() => {
            const endDate = new Date();
            if (promotionDuration === "1day") {
              endDate.setDate(endDate.getDate() + 1);
            } else if (promotionDuration === "3days") {
              endDate.setDate(endDate.getDate() + 3);
            } else if (promotionDuration === "1week") {
              endDate.setDate(endDate.getDate() + 7);
            } else if (promotionDuration === "custom" && customEndDate) {
              return customEndDate;
            } else {
              endDate.setDate(endDate.getDate() + 1); // Default 1 día
            }
            return endDate.toISOString();
          })(),
        }),
      };

      try {
        // Usar mutation de React Query
        const updatedProduct = await updateProductMutation.mutateAsync({
          id: productId,
          data: updateData as UpdateProductRequest,
        });

        setUpdatedProduct(updatedProduct);
        setShowSuccessModal(true);
      } catch (apiError) {
        console.error('Error updating product:', apiError);
        throw apiError;
      }
    } catch (error) {
      console.error('Error updating product:', error);
      alert('Error al actualizar el producto. Por favor, intenta nuevamente.');
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
    productId,
    updateProductMutation,
    isActive,
    productImages,
    promotionDuration,
    customEndDate,
  ]);

  const handleModalClose = useCallback(() => {
    setShowSuccessModal(false);
    setUpdatedProduct(null);
    // Agregar timestamp para forzar refresh de la lista
    router.push(`/products_list?refresh=${Date.now()}`);
  }, [router]);

  if (loadingProduct) {
    return (
      <div className="w-full h-auto min-h-[50vh] flex items-center justify-center">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-brand-500 mx-auto" />
          <p className="mt-4 text-base text-gray-600 font-medium">Produkt wird geladen...</p>
        </div>
      </div>
    );
  }

  if (!existingProduct) {
    return (
      <div className="w-full h-auto min-h-[50vh] flex items-center justify-center">
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📦</div>
          <p className="text-lg text-gray-600 font-medium">Produkt nicht gefunden</p>
          <button
            onClick={() => router.push('/products_list')}
            className="mt-4 px-6 py-2 bg-brand-500 text-white rounded-xl hover:bg-brand-600 transition-colors font-semibold"
          >
            ← Zurück
          </button>
        </div>
      </div>
    );
  }

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
    setHasVariants: handleToggleVariants,
    variants,
    setVariants,
    vatRate,
    setVatRate,
    errors,
    saveProgress,
    showSuccessModal,
    createdProduct: updatedProduct,
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

  return isDesktop ? (
    <DesktopForm {...sharedProps} />
  ) : (
    <MobileForm {...sharedProps} />
  );
}

