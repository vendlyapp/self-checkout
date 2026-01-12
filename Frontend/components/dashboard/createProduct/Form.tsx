"use client";

import React, { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import { CheckCircle, Loader2 } from "lucide-react";
import MobileForm from "./MobileForm";
import DesktopForm from "./DesktopForm";
import { FormProps, CreatedProduct, ProductVariant, FormErrors, Category } from "./types";
import { validateField, createProductObject, validateVariants } from "./validations";
import { VAT_RATES } from "./constants";
import { useCreateProduct } from "@/hooks/mutations";
import { useCategories } from "@/hooks/queries/useCategories";
import { useQueryClient } from "@tanstack/react-query";
import type { CreateProductRequest } from "@/lib/services/productService";

export default function Form({ isDesktop = false }: FormProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const createProductMutation = useCreateProduct();
  
  // Obtener categorías reales del backend
  const { data: backendCategories = [], isLoading: categoriesLoading } = useCategories();

  // Form state - Campos básicos
  const [productName, setProductName] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [productPrice, setProductPrice] = useState("");
  const [productCategory, setProductCategory] = useState("");
  const [productCategoryId, setProductCategoryId] = useState<string>(""); // ID de la categoría seleccionada
  const [productImages, setProductImages] = useState<string[]>([]); // Array de URLs base64 o URLs
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
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [createdProduct, setCreatedProduct] = useState<CreatedProduct | null>(null);
  const [createdProductsCount, setCreatedProductsCount] = useState(1);
  const [isCreating, setIsCreating] = useState(false);

  // Validation wrapper
  const handleValidateField = useCallback(
    (field: keyof FormErrors, value: string) => {
      const newErrors = validateField(field, value, errors, hasVariants, hasPromotion, productPrice);
      setErrors(newErrors);
    },
    [errors, hasVariants, hasPromotion, productPrice]
  );

  // Transformar categorías del backend al formato esperado por el formulario
  const categories: Category[] = React.useMemo(() => {
    if (categoriesLoading) {
      // Si está cargando, retornar array vacío
      return [];
    }
    
    if (backendCategories.length === 0) {
      // Si no hay categorías, retornar array vacío (el usuario debería crear categorías primero)
      return [];
    }
    
    return backendCategories.map((cat) => {
      // Usar el color de la marca como fallback (bg-brand-50 text-brand-700)
      // El color personalizado se puede usar más adelante si es necesario
      const colorClass = cat.color 
        ? `bg-brand-50 text-brand-700` // Por ahora usar el verde de la marca para todas
        : "bg-brand-50 text-brand-700"; // Fallback al verde de la marca
      
      return {
        value: cat.name,
        color: colorClass,
      };
    });
  }, [backendCategories, categoriesLoading]);

  // Función para manejar el cambio de categoría y guardar el ID
  const handleCategoryChange = useCallback((categoryName: string) => {
    setProductCategory(categoryName);
    
    // Buscar el ID de la categoría seleccionada
    const selectedCategory = backendCategories.find(cat => cat.name === categoryName);
    if (selectedCategory) {
      setProductCategoryId(selectedCategory.id);
    } else {
      setProductCategoryId("");
    }
    
    // Validar el campo
    handleValidateField("productCategory", categoryName);
  }, [backendCategories, handleValidateField]);

  const vatRates = VAT_RATES;

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
        alert(`${file.name} ist kein gültiges Bild`);
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        alert(`${file.name} ist zu groß. Maximum 5MB`);
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setProductImages((prev) => [...prev, base64String]);
      };
      reader.onerror = () => {
        alert(`Fehler beim Lesen von ${file.name}`);
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

  const handleSave = useCallback(async () => {
    try {
      handleValidateField("productName", productName);
      handleValidateField("productCategory", productCategory);

      if (!hasVariants) handleValidateField("productPrice", productPrice);
      if (hasPromotion) handleValidateField("promotionPrice", promotionPrice);
      
      // Validar variantes antes de continuar
      if (hasVariants) {
        if (variants.length === 0) {
          alert('Sie müssen mindestens eine Variante hinzufügen');
          return;
        }
        
        // Filtrar variantes vacías (que no tienen nombre ni precio)
        const validVariants = variants.filter(v => 
          v.name.trim() !== '' && v.price.trim() !== ''
        );
        
        if (validVariants.length === 0) {
          alert('Sie müssen mindestens eine Variante mit Name und Preis ausfüllen');
          return;
        }
        
        // Validar que todas las variantes completadas sean válidas
        if (!validateVariants(validVariants)) {
          const invalidVariants = validVariants
            .map((variant, index) => {
              const nameValid = variant.name && variant.name.trim() !== '';
              const priceValid = variant.price && 
                               variant.price.trim() !== '' && 
                               !isNaN(parseFloat(variant.price)) &&
                               parseFloat(variant.price) > 0;
              
              if (!nameValid || !priceValid) {
                return {
                  index: index + 1,
                  name: nameValid ? '✓' : '✗ Name erforderlich',
                  price: priceValid ? '✓' : '✗ Preis erforderlich und größer als 0'
                };
              }
              return null;
            })
            .filter((v): v is { index: number; name: string; price: string } => v !== null);
          
          const errorMessage = invalidVariants.length > 0
            ? `Ungültige Varianten:\n${invalidVariants.map(v => `Variante ${v.index}: ${v.name}, ${v.price}`).join('\n')}`
            : 'Alle Varianten müssen einen gültigen Namen und Preis haben';
          
          alert(errorMessage);
          return;
        }
      }
      
      if (Object.keys(errors).length > 0) return;

      // Mostrar modal de carga
      setIsCreating(true);

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

      // Agregar imágenes al objeto del producto
      if (productImages.length > 0) {
        productData.images = productImages;
        productData.image = productImages[0]; // Primera imagen como imagen principal
      }

      try {
        let createdProduct;
        const createdProducts: CreatedProduct[] = [];
        
        if (hasVariants && variants.length > 0) {
          // Filtrar solo las variantes que tienen datos (ignorar las vacías)
          const validVariants = variants.filter(v => 
            v.name.trim() !== '' && v.price.trim() !== ''
          );
          
          if (validVariants.length === 0) {
            throw new Error('Sie müssen mindestens eine Variante mit Name und Preis ausfüllen');
          }
          
          // Validar que todas las variantes completadas sean válidas
          if (!validateVariants(validVariants)) {
            throw new Error('Alle Varianten müssen einen gültigen Namen und Preis haben (Preis > 0)');
          }
          
          // Función auxiliar para crear objeto de producto con promoción
          const createProductWithPromotion = (
            name: string,
            basePrice: number,
            promoPrice?: string
          ): CreateProductRequest => {
            const product: CreateProductRequest = {
              name,
              description: productDescription,
              price: promoPrice ? parseFloat(promoPrice) : basePrice,
              originalPrice: promoPrice ? basePrice : undefined,
              category: productCategory,
              categoryId: productCategoryId,
              stock: 999,
              isActive: true,
            };

            // Agregar imágenes si existen
            if (productImages.length > 0) {
              product.images = productImages;
              product.image = productImages[0];
            }

            // Si hay precio promocional (ya sea global o de variante)
            if (promoPrice) {
              const discountPercentage = Math.round(
                ((basePrice - parseFloat(promoPrice)) / basePrice) * 100
              );
              product.promotionTitle = "Aktion";
              product.promotionType = "percentage";
              product.promotionBadge = `-${discountPercentage}%`;
              product.promotionActionLabel = "Jetzt hinzufügen";
              product.promotionPriority = 10;
            }

            return product;
          };

          // IMPORTANTE: Cuando hay variantes, el producto principal se crea con los datos de la PRIMERA variante
          // La primera variante se convierte en el producto principal
          const firstVariant = validVariants[0];
          const firstVariantPrice = parseFloat(firstVariant.price);
          if (isNaN(firstVariantPrice) || firstVariantPrice <= 0) {
            throw new Error('La primera variante debe tener un precio válido y mayor a 0');
          }

          // Crear producto principal con los datos de la primera variante
          const mainProductName = firstVariant.name.trim() 
            ? `${productName} ${firstVariant.name.trim()}` 
            : productName;

          const mainProductData = createProductWithPromotion(
            mainProductName,
            firstVariantPrice,
            firstVariant.promotionPrice?.trim() || undefined
          );

          // Crear producto principal (que es la primera variante)
          const mainProduct = await createProductMutation.mutateAsync(mainProductData);
          createdProducts.push(mainProduct);
          createdProduct = mainProduct; // Guardar el primero para el modal

          // Crear las demás variantes como productos secundarios (a partir de la segunda)
          for (let i = 1; i < validVariants.length; i++) {
            const variant = validVariants[i];
            const variantPrice = parseFloat(variant.price);
            if (isNaN(variantPrice) || variantPrice <= 0) {
              console.warn(`Variante "${variant.name}" tiene precio inválido, se omite`);
              continue;
            }

            const variantName = variant.name.trim() 
              ? `${productName} ${variant.name.trim()}` 
              : productName;

            const variantProductData = createProductWithPromotion(
              variantName,
              variantPrice,
              variant.promotionPrice?.trim() || undefined
            );

            // Agregar parentId para identificar que es una variante
            variantProductData.parentId = mainProduct.id;

            // Crear variante como producto hijo del producto principal
            const variantProduct = await createProductMutation.mutateAsync(variantProductData);
            createdProducts.push(variantProduct);
          }
          
          // Guardar el número de productos creados
          setCreatedProductsCount(createdProducts.length);
          
          // Invalidar cache de productos para refrescar la lista
          queryClient.invalidateQueries({ queryKey: ['products'] });
          queryClient.invalidateQueries({ queryKey: ['productStats'] });
        } else {
          // Si no tiene variantes, crear producto normal
          createdProduct = await createProductMutation.mutateAsync(productData);
          setCreatedProductsCount(1);
        }

        // Ocultar modal de carga antes de mostrar el modal de éxito
        setIsCreating(false);

        // El producto ya viene del tipo correcto de la API
        setCreatedProduct(createdProduct);
        setShowSuccessModal(true);
      } catch (apiError) {
        // Ocultar modal de carga en caso de error
        setIsCreating(false);
        // Error al crear producto - re-lanzar para manejo en el catch externo
        throw apiError;
      }
    } catch (error) {
      // Asegurar que el modal de carga se oculte en caso de error
      setIsCreating(false);
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
    createProductMutation,
    productCategoryId,
    productImages,
    queryClient,
    variants,
  ]);

  const handleModalClose = useCallback(() => {
    setShowSuccessModal(false);
    setCreatedProduct(null);
    setCreatedProductsCount(1);
    // Agregar timestamp para forzar refresh de la lista
    router.push(`/products_list?refresh=${Date.now()}`);
  }, [router]);

  // Función para renderizar el modal de carga
  const renderLoadingModal = () => {
    if (typeof window === 'undefined' || !isCreating) return null;
    
    const modalContent = (
      <div className="fixed inset-0 z-[99998] flex items-center justify-center overflow-hidden">
        {/* Backdrop con blur moderno */}
        <div className="absolute inset-0 w-screen h-screen bg-black/40 backdrop-blur-md"></div>
        
        {/* Modal de carga */}
        <div className="relative bg-white rounded-3xl shadow-2xl max-w-sm w-full mx-4 animate-in fade-in-0 zoom-in-95 duration-300">
          {/* Gradiente superior */}
          <div className="bg-gradient-to-br from-[#25D076] to-[#20BA68] rounded-t-3xl p-8 text-center">
            <div className="w-20 h-20 bg-white/20 backdrop-blur-lg rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Loader2 className="w-10 h-10 text-white animate-spin" strokeWidth={3} />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">
              Creando productos
            </h3>
          </div>

          {/* Contenido del modal */}
          <div className="p-6">
            <p className="text-gray-700 mb-4 text-center text-base">
              Espere un momento mientras se crean sus productos...
            </p>
          </div>
        </div>
      </div>
    );

    return createPortal(modalContent, document.body);
  };

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
              {createdProductsCount > 1 ? (
                <>
                  Se han creado <span className="font-semibold text-gray-900">{createdProductsCount} productos</span> exitosamente
                  <br />
                  <span className="text-sm text-gray-600 mt-2 block">
                    Producto principal: &quot;{createdProduct?.name}&quot;
                  </span>
                </>
              ) : (
                <>
                  Su producto <span className="font-semibold text-gray-900">&quot;{createdProduct?.name}&quot;</span> ha sido creado exitosamente
                </>
              )}
            </p>

            {/* Tarjeta de información */}
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-4 mb-6 border border-gray-200 space-y-2">
              {createdProductsCount > 1 && (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">Productos creados:</span>
                  <span className="text-sm text-gray-900 font-semibold bg-white/70 px-3 py-1 rounded-lg">
                    {createdProductsCount}
                  </span>
                </div>
              )}
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
              className="w-full bg-gradient-to-r from-[#25D076] to-[#20BA68] text-white py-4 px-6 rounded-2xl font-semibold hover:shadow-lg transform hover:scale-[1.02] active:scale-[0.98] transition-ios text-base flex items-center justify-center gap-2"
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

  // Prevenir scroll del body cuando algún modal está abierto
  useEffect(() => {
    if (showSuccessModal || isCreating) {
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
  }, [showSuccessModal, isCreating]);
  const sharedProps = {
    productName,
    setProductName,
    productDescription,
    setProductDescription,
    productPrice,
    setProductPrice,
    productCategory,
    setProductCategory: handleCategoryChange,
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
      
      {/* Modal de carga renderizado fuera del árbol DOM usando Portal */}
      {renderLoadingModal()}
      
      {/* Modal de éxito renderizado fuera del árbol DOM usando Portal */}
      {showSuccessModal && renderSuccessModal()}
    </>
  );
}
