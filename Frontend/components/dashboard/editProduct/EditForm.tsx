"use client";

import React, { useState, useCallback, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import MobileForm from "../createProduct/MobileForm";
import DesktopForm from "../createProduct/DesktopForm";
import { CreatedProduct, ProductVariant, FormErrors, Category } from "../createProduct/types";
import { validateField, createProductObject } from "../createProduct/validations";
import { VAT_RATES, SAVE_PROGRESS_STEPS } from "../createProduct/constants";
import { useUpdateProduct } from "@/hooks/mutations";
import { useProductById } from "@/hooks/queries";
import { useCategories } from "@/hooks/queries/useCategories";
import { normalizeProductData } from "@/components/dashboard/products_list/data/mockProducts";
import type { UpdateProductRequest, Product } from "@/lib/services/productService";

interface EditFormProps {
  productId: string;
  isDesktop?: boolean;
}

export default function EditForm({ productId, isDesktop = false }: EditFormProps) {
  const router = useRouter();
  const updateProductMutation = useUpdateProduct();
  
  // Obtener producto existente
  const { data: existingProduct, isLoading: loadingProduct } = useProductById(productId);
  
  // Obtener categorías reales del backend
  const { data: backendCategories = [], isLoading: categoriesLoading } = useCategories();
  
  // Form state - Campos básicos
  const [productName, setProductName] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [productPrice, setProductPrice] = useState("");
  const [productCategory, setProductCategory] = useState("");
  const [productCategoryId, setProductCategoryId] = useState<string>(""); // ID de la categoría seleccionada
  const [productImages, setProductImages] = useState<string[]>([]);
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
  
  // Estado para almacenar los datos originales del producto
  const [originalProductData, setOriginalProductData] = useState<Product | null>(null);
  
  // Función para comparar datos actuales con originales
  const hasChanges = useMemo(() => {
    if (!originalProductData) return false;
    
    const product = normalizeProductData(existingProduct as Product);
    const currentImages = productImages.length > 0 
      ? productImages 
      : (product.images || product.image ? [product.image || product.images?.[0] || ""].filter(Boolean) : []);
    const originalImages = originalProductData.images || (originalProductData.image ? [originalProductData.image] : []);
    
    // Comparar imágenes (comparar URLs/base64)
    const imagesChanged = JSON.stringify(currentImages) !== JSON.stringify(originalImages);
    
    return (
      productName !== (originalProductData.name || "") ||
      productDescription !== (originalProductData.description || "") ||
      productPrice !== (originalProductData.price?.toString() || "") ||
      productCategory !== (originalProductData.category || "") ||
      isActive !== (originalProductData.isActive ?? true) ||
      hasPromotion !== !!(originalProductData.isPromotional || originalProductData.isOnSale) ||
      promotionPrice !== (originalProductData.promotionalPrice?.toString() || "") ||
      imagesChanged
    );
  }, [
    productName,
    productDescription,
    productPrice,
    productCategory,
    isActive,
    hasPromotion,
    promotionPrice,
    productImages,
    originalProductData,
    existingProduct,
  ]);
  
  // Exponer hasChanges al window para que AdminLayout pueda acceder
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const windowWithFormState = window as { __productFormHasChanges?: boolean; __productFormIsEditMode?: boolean };
      windowWithFormState.__productFormHasChanges = hasChanges;
      windowWithFormState.__productFormIsEditMode = true;
    }
    return () => {
      if (typeof window !== 'undefined') {
        const windowWithFormState = window as { __productFormHasChanges?: boolean; __productFormIsEditMode?: boolean };
        windowWithFormState.__productFormHasChanges = false;
        windowWithFormState.__productFormIsEditMode = false;
      }
    };
  }, [hasChanges]);

  // Cargar datos del producto cuando esté disponible
  useEffect(() => {
    if (existingProduct && backendCategories.length > 0) {
      const product = normalizeProductData(existingProduct as Product);
      
      // Guardar datos originales para comparación
      if (!originalProductData) {
        setOriginalProductData(product);
      }
      
      setProductName(product.name || "");
      setProductDescription(product.description || "");
      setProductPrice(product.price?.toString() || "");
      setProductCategory(product.category || "");
      
      // Buscar el ID de la categoría
      const categoryMatch = backendCategories.find(cat => cat.name === product.category);
      if (categoryMatch) {
        setProductCategoryId(categoryMatch.id);
      } else if (product.categoryId) {
        setProductCategoryId(product.categoryId);
      }
      
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
        const promoPrice = (product as Product & { promotionalPrice?: number }).promotionalPrice;
        if (promoPrice) {
          setPromotionPrice(promoPrice.toString());
        }
      }
      
      // Configurar fechas de promoción si existen
      const productWithPromoDates = product as Product & { promotionalStartDate?: string; promotionalEndDate?: string };
      if (productWithPromoDates.promotionalStartDate) {
        setPromotionDuration("custom");
        setCustomEndDate(productWithPromoDates.promotionalEndDate || "");
      }
      
      // Configurar variantes si existen (esto requeriría una estructura de variantes en el backend)
      // Por ahora, no hay variantes en el backend, así que esto queda vacío
      
      setVatRate("2.6"); // Valor por defecto
    }
  }, [existingProduct, backendCategories, originalProductData]);

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
  }, []);

  // Transformar categorías del backend al formato esperado por el formulario
  const categories: Category[] = useMemo(() => {
    if (categoriesLoading) {
      return [];
    }
    
    return backendCategories.map(cat => ({
      value: cat.name,
      color: cat.color ? `bg-[${cat.color}] text-white` : "bg-gray-50 text-gray-700",
    }));
  }, [backendCategories, categoriesLoading]);

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
      // Validar campos y obtener nuevos errores
      const newErrors: FormErrors = {};
      
      // Validar nombre
      if (!productName.trim()) {
        newErrors.productName = "Produktname ist erforderlich";
      }
      
      // Validar categoría
      if (!productCategory) {
        newErrors.productCategory = "Kategorie wählen";
      }
      
      // Validar precio si no hay variantes
      if (!hasVariants) {
        if (!productPrice || parseFloat(productPrice) <= 0) {
          newErrors.productPrice = "Gültiger Preis erforderlich";
        }
      }
      
      // Validar precio promocional si hay promoción
      if (hasPromotion) {
        if (!promotionPrice || parseFloat(promotionPrice) <= 0) {
          newErrors.promotionPrice = "Aktionspreis erforderlich";
        } else if (!hasVariants && parseFloat(promotionPrice) >= parseFloat(productPrice)) {
          newErrors.promotionPrice = "Aktionspreis muss kleiner sein";
        }
      }
      
      // Si hay errores, actualizar el estado y retornar
      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        console.warn('[EditForm] Errores de validación:', newErrors);
        return;
      }
      
      // Limpiar errores si la validación pasa
      setErrors({});

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
        productCategoryId, // Pasar el ID de la categoría
      );

      // Agregar campos adicionales para actualización
      const updateData: UpdateProductRequest = {
        ...productData,
        isActive,
        images: productImages.length > 0 ? productImages : undefined,
        image: productImages.length > 0 ? productImages[0] : undefined,
        categoryId: productCategoryId || productData.categoryId, // Asegurar que categoryId se incluya
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
        // Log para debugging
        console.log('[EditForm] Guardando producto:', {
          id: productId,
          updateData,
          productCategoryId,
        });

        // Usar mutation de React Query
        const updatedProduct = await updateProductMutation.mutateAsync({
          id: productId,
          data: updateData as UpdateProductRequest,
        });

        console.log('[EditForm] Producto actualizado exitosamente:', updatedProduct);

        // Actualizar los datos originales con los nuevos datos guardados
        // para que hasChanges se resetee correctamente
        const normalizedUpdated = normalizeProductData(updatedProduct as Product);
        setOriginalProductData(normalizedUpdated);

        setUpdatedProduct(updatedProduct);
        setShowSuccessModal(true);
      } catch (apiError: unknown) {
        console.error('[EditForm] Error updating product:', apiError);
        const errorObj = apiError as { message?: string; error?: string };
        const errorMessage = errorObj?.message || errorObj?.error || 'Error al actualizar el producto';
        alert(`Error: ${errorMessage}. Por favor, intenta nuevamente.`);
        throw apiError;
      }
    } catch (error: unknown) {
      console.error('[EditForm] Error en handleSave:', error);
      const errorObj = error as { message?: string };
      const errorMessage = errorObj?.message || 'Error al actualizar el producto';
      alert(`Error: ${errorMessage}. Por favor, intenta nuevamente.`);
    }
  }, [
    productName,
    productDescription,
    productCategory,
    productPrice,
    promotionPrice,
    hasVariants,
    hasPromotion,
    productId,
    updateProductMutation,
    isActive,
    productImages,
    promotionDuration,
    customEndDate,
    productCategoryId,
  ]);

  const handleModalClose = useCallback(() => {
    setShowSuccessModal(false);
    setUpdatedProduct(null);
    // Redirigir a la lista de productos
    router.push('/products_list');
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
    isEditMode: true,
    existingProduct: existingProduct ? normalizeProductData(existingProduct as Product) : undefined,
    hasChanges: hasChanges,
  };

  return isDesktop ? (
    <DesktopForm {...sharedProps} />
  ) : (
    <MobileForm {...sharedProps} />
  );
}

