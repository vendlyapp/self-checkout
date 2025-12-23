"use client";

import React, { useState, useCallback, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import { Loader2 } from "lucide-react";
import MobileForm from "../createProduct/MobileForm";
import DesktopForm from "../createProduct/DesktopForm";
import { CreatedProduct, ProductVariant, FormErrors, Category } from "../createProduct/types";
import { validateField, createProductObject } from "../createProduct/validations";
import { VAT_RATES, SAVE_PROGRESS_STEPS } from "../createProduct/constants";
import { useUpdateProduct, useCreateProduct, useDeleteProduct } from "@/hooks/mutations";
import { useProductById } from "@/hooks/queries";
import { useCategories } from "@/hooks/queries/useCategories";
import { useProducts } from "@/hooks/queries/useProducts";
import { normalizeProductData } from "@/components/dashboard/products_list/data/mockProducts";
import type { UpdateProductRequest, Product, CreateProductRequest } from "@/lib/services/productService";

interface EditFormProps {
  productId: string;
  isDesktop?: boolean;
}

export default function EditForm({ productId, isDesktop = false }: EditFormProps) {
  const router = useRouter();
  const updateProductMutation = useUpdateProduct();
  const createProductMutation = useCreateProduct();
  const deleteProductMutation = useDeleteProduct();
  
  // Obtener producto existente
  const { data: existingProduct, isLoading: loadingProduct } = useProductById(productId);
  
  // Obtener categorías reales del backend
  const { data: backendCategories = [], isLoading: categoriesLoading } = useCategories();
  
  // Obtener todos los productos para buscar variantes
  const { data: allProducts = [] } = useProducts({ isActive: true });
  
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
  const [isSaving, setIsSaving] = useState(false); // Estado para el modal de carga
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
      
      // Guardar datos originales para comparación (solo una vez)
      if (!originalProductData) {
        setOriginalProductData(product);
      }
      
      setProductName(product.name || "");
      setProductDescription(product.description || "");
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
      
      // Configurar promoción si existe - ESTO DEBE IR ANTES DE CONFIGURAR LOS PRECIOS
      // Verificar si hay promoción activa de múltiples formas:
      // 1. isPromotional o isOnSale están en true
      // 2. originalPrice existe (indica que hay un precio promocional)
      // 3. promotionalPrice existe
      const promoPrice = (product as Product & { promotionalPrice?: number }).promotionalPrice;
      const hasActivePromotion = !!(
        product.isPromotional || 
        product.isOnSale || 
        (product.originalPrice !== undefined && product.originalPrice !== null) ||
        (promoPrice !== undefined && promoPrice !== null)
      );
      
      // Debug: verificar detección de promoción
      console.log('[EditForm] Detección de promoción:', {
        isPromotional: product.isPromotional,
        isOnSale: product.isOnSale,
        originalPrice: product.originalPrice,
        promotionalPrice: promoPrice,
        hasActivePromotion,
        price: product.price,
        productId: product.id
      });
      
      // IMPORTANTE: Establecer hasPromotion ANTES de configurar los precios
      setHasPromotion(hasActivePromotion);
      
      // Si hay promoción, configurar el precio promocional correctamente
      if (hasActivePromotion) {
        if (product.originalPrice !== undefined && product.originalPrice !== null) {
          // Si hay originalPrice, significa que:
          // - originalPrice = precio base
          // - price = precio promocional (el que se muestra actualmente)
          // Necesitamos actualizar productPrice al precio base y promotionPrice al precio promocional
          setProductPrice(product.originalPrice.toString());
          setPromotionPrice(product.price?.toString() || "");
        } else if (promoPrice !== undefined && promoPrice !== null) {
          // Si hay promotionalPrice, significa que:
          // - price = precio base
          // - promotionalPrice = precio promocional
          setProductPrice(product.price?.toString() || "");
          setPromotionPrice(promoPrice.toString());
        } else if (product.isPromotional || product.isOnSale) {
          // Si está marcado como promocional pero no tenemos los precios específicos,
          // intentar usar el precio actual como promocional
          // (esto puede pasar si el producto fue marcado como promocional pero no se configuraron los precios)
          setProductPrice(product.price?.toString() || "");
          setPromotionPrice(product.price?.toString() || "");
        } else {
          // Si no hay información de promoción pero hasActivePromotion es true,
          // establecer los precios por defecto
          setProductPrice(product.price?.toString() || "");
        }
      } else {
        // Si no hay promoción, establecer solo el precio base
        setProductPrice(product.price?.toString() || "");
      }
      
      // Configurar fechas de promoción si existen
      const productWithPromoDates = product as Product & { promotionalStartDate?: string; promotionalEndDate?: string };
      if (productWithPromoDates.promotionalStartDate) {
        setPromotionDuration("custom");
        setCustomEndDate(productWithPromoDates.promotionalEndDate || "");
      }
      
      // Buscar variantes del producto (productos con parentId igual al id del producto actual)
      if (allProducts && allProducts.length > 0) {
        const productVariants = allProducts
          .filter((p: Product) => {
            const normalizedP = normalizeProductData(p);
            return (normalizedP as Product & { parentId?: string }).parentId === product.id;
          })
          .map((variant: Product) => {
            const normalizedVariant = normalizeProductData(variant);
            // Extraer el nombre de la variante (remover el nombre del producto padre si está incluido)
            let variantName = normalizedVariant.name;
            if (variantName && product.name && variantName.startsWith(product.name)) {
              variantName = variantName.substring(product.name.length).trim();
            }
            
            // Obtener precio base y precio promocional
            // Lógica:
            // - Si hay promoción (isPromotional = true):
            //   - Si hay originalPrice: originalPrice = precio base, price = precio promocional
            //   - Si hay promotionalPrice: promotionalPrice = precio promocional, price = precio base
            //   - Si solo hay isPromotional pero no originalPrice ni promotionalPrice: usar price como base
            // - Si no hay promoción: price = precio base
            const hasPromo = normalizedVariant.isPromotional || normalizedVariant.isOnSale;
            
            let basePrice: number;
            let promoPrice: number | undefined;
            
            if (hasPromo) {
              // Si hay originalPrice, significa que price es el precio promocional
              if (normalizedVariant.originalPrice !== undefined && normalizedVariant.originalPrice !== null) {
                basePrice = normalizedVariant.originalPrice;
                promoPrice = normalizedVariant.price;
              } 
              // Si hay promotionalPrice, significa que price es el precio base
              else if (normalizedVariant.promotionalPrice !== undefined && normalizedVariant.promotionalPrice !== null) {
                basePrice = normalizedVariant.price;
                promoPrice = normalizedVariant.promotionalPrice;
              }
              // Si solo está marcado como promocional pero no tiene campos específicos
              // asumir que price es el precio promocional y necesitamos calcular el base
              else {
                // En este caso, no tenemos el precio base original, usar price como base
                basePrice = normalizedVariant.price;
                promoPrice = undefined;
              }
            } else {
              // No hay promoción, price es el precio base
              basePrice = normalizedVariant.price;
              promoPrice = undefined;
            }
            
            return {
              id: variant.id, // Incluir el ID de la variante para poder eliminarla después
              name: variantName || "",
              price: basePrice?.toString() || "0",
              promotionPrice: promoPrice ? promoPrice.toString() : "",
            };
          });
        
        // Si hay variantes, activar el toggle y cargar los datos
        if (productVariants.length > 0) {
          setHasVariants(true);
          setVariants(productVariants);
        } else {
          setHasVariants(false);
          setVariants([]);
        }
      } else {
        // Si aún no hay productos cargados, verificar si el producto actual tiene parentId
        // Si tiene parentId, significa que es una variante, no un producto padre
        const normalizedProduct = normalizeProductData(existingProduct as Product);
        const isVariant = !!(normalizedProduct as Product & { parentId?: string }).parentId;
        
        if (!isVariant) {
          // Es un producto padre, pero aún no sabemos si tiene variantes
          // Dejar hasVariants en false por ahora
          setHasVariants(false);
          setVariants([]);
        }
      }
      
      setVatRate("2.6"); // Valor por defecto
    }
  }, [existingProduct, backendCategories, originalProductData, allProducts]);

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
    async (index: number) => {
      const variantToRemove = variants[index];
      
      // Si la variante tiene un ID (existe en la base de datos), eliminarla
      if (variantToRemove.id) {
        try {
          await deleteProductMutation.mutateAsync(variantToRemove.id);
          console.log(`[EditForm] Variante "${variantToRemove.name}" eliminada de la base de datos`);
        } catch (error) {
          console.error(`[EditForm] Error al eliminar variante "${variantToRemove.name}":`, error);
          alert(`Error al eliminar variante: ${error instanceof Error ? error.message : 'Error desconocido'}`);
          return; // No eliminar del estado si falla la eliminación en BD
        }
      }
      
      // Eliminar del estado local
      setVariants(variants.filter((_, i) => i !== index));
    },
    [variants, deleteProductMutation]
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
      
      // Debug: verificar estado de promoción antes de validar
      console.log('[EditForm] Validando antes de guardar:', {
        hasPromotion,
        promotionPrice,
        productPrice,
        hasVariants,
        variantsCount: variants.length
      });
      
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
      } else {
        // Si hay variantes, validar que haya al menos una variante válida
        const validVariants = variants.filter(v => 
          v.name.trim() !== '' && v.price.trim() !== '' && !isNaN(parseFloat(v.price)) && parseFloat(v.price) > 0
        );
        if (validVariants.length === 0) {
          newErrors.productPrice = "Al menos una variante debe tener nombre y precio válidos";
        }
      }
      
      // Validar precio promocional SOLO si el toggle de promoción está activado
      // IMPORTANTE: Si hay variantes, NO validar el precio promocional del producto padre
      // porque las variantes tienen sus propios precios promocionales
      if (hasPromotion === true && !hasVariants) {
        // Solo validar si el toggle está activado Y NO hay variantes
        const promoPriceValue = promotionPrice?.trim() || '';
        if (!promoPriceValue || isNaN(parseFloat(promoPriceValue)) || parseFloat(promoPriceValue) <= 0) {
          newErrors.promotionPrice = "Aktionspreis erforderlich";
        } else if (productPrice && parseFloat(promoPriceValue) >= parseFloat(productPrice)) {
          newErrors.promotionPrice = "Aktionspreis muss kleiner sein";
        }
      }
      // Si hasPromotion es false o hay variantes, no validar promotionPrice - está bien que esté vacío
      
      // Debug: mostrar estado de validación
      if (Object.keys(newErrors).length > 0) {
        console.log('[EditForm] Errores de validación detectados:', {
          errors: newErrors,
          hasPromotion,
          promotionPrice,
          productPrice,
          hasVariants
        });
      }
      
      // Si hay errores, actualizar el estado y retornar
      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        console.warn('[EditForm] Errores de validación:', newErrors);
        return;
      }
      
      // Limpiar errores si la validación pasa
      setErrors({});

      // Mostrar modal de carga
      setIsSaving(true);
      setSaveProgress(0);

      try {
        for (let i = 0; i < SAVE_PROGRESS_STEPS.length; i++) {
          setSaveProgress(((i + 1) / SAVE_PROGRESS_STEPS.length) * 100);
          await new Promise((resolve) => setTimeout(resolve, SAVE_PROGRESS_STEPS[i].duration));
        }

        setSaveProgress(0);

        // Si hay variantes y no hay precio válido, usar un precio por defecto para el producto padre
        const priceToUse = hasVariants && (!productPrice || parseFloat(productPrice) <= 0)
          ? "0" // Precio por defecto para productos con variantes
          : productPrice;

        const productData = createProductObject(
          productName,
          productDescription,
          priceToUse,
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
        // Log para debugging
        console.log('[EditForm] Guardando producto:', {
          id: productId,
          updateData,
          productCategoryId,
          hasVariants,
          variants,
        });

        // PRIMERO: Actualizar producto principal
        console.log('[EditForm] Actualizando producto principal:', {
          id: productId,
          updateData: {
            ...updateData,
            // No mostrar imágenes completas en el log
            images: updateData.images ? `[${updateData.images.length} imágenes]` : undefined,
            image: updateData.image ? '[imagen]' : undefined
          }
        });

        const updatedProduct = await updateProductMutation.mutateAsync({
          id: productId,
          data: updateData as UpdateProductRequest,
        });

        console.log('[EditForm] Producto principal actualizado exitosamente:', updatedProduct);

        // SEGUNDO: Si hay variantes, actualizar/crear variantes (igual que en la creación)
        const variantErrors: string[] = [];
        const variantSuccesses: string[] = [];

        if (hasVariants && variants.length > 0) {
          // Filtrar solo las variantes válidas
          const validVariants = variants.filter(v => 
            v.name.trim() !== '' && v.price.trim() !== '' && !isNaN(parseFloat(v.price)) && parseFloat(v.price) > 0
          );

          // Validar que haya al menos una variante válida
          if (validVariants.length === 0) {
            throw new Error('Debe completar al menos una variante con nombre y precio válidos');
          }

          // Función auxiliar para crear/actualizar variante con promoción (igual que en Form.tsx)
          const createVariantData = (
            variantName: string,
            basePrice: number,
            promoPrice?: string
          ): CreateProductRequest => {
            const variantData: CreateProductRequest = {
              name: variantName.trim() 
                ? `${productName} ${variantName.trim()}` 
                : productName,
              description: productDescription,
              price: promoPrice ? parseFloat(promoPrice) : basePrice,
              originalPrice: promoPrice ? basePrice : undefined,
              category: productCategory,
              categoryId: productCategoryId,
              stock: 999,
              isActive: isActive,
              parentId: productId, // Vincular con el producto padre
            };

            // Agregar imágenes si existen
            if (productImages.length > 0) {
              variantData.images = productImages;
              variantData.image = productImages[0];
            }

            // Si hay precio promocional
            if (promoPrice) {
              const discountPercentage = Math.round(
                ((basePrice - parseFloat(promoPrice)) / basePrice) * 100
              );
              variantData.isPromotional = true;
              variantData.promotionalPrice = parseFloat(promoPrice);
              variantData.promotionTitle = "Aktion";
              variantData.promotionType = "percentage";
              variantData.promotionBadge = `-${discountPercentage}%`;
              variantData.promotionActionLabel = "Jetzt hinzufügen";
              variantData.promotionPriority = 10;
            }

            return variantData;
          };

          // Buscar variantes existentes del producto
          const existingVariants = allProducts.filter((p: Product) => {
            const normalizedP = normalizeProductData(p);
            return (normalizedP as Product & { parentId?: string }).parentId === productId;
          });

          console.log('[EditForm] Guardando variantes:', {
            validVariantsCount: validVariants.length,
            existingVariantsCount: existingVariants.length
          });

          // Actualizar o crear variantes (igual que en Form.tsx)
          for (const variant of validVariants) {
            try {
              const variantPrice = parseFloat(variant.price);
              if (isNaN(variantPrice) || variantPrice <= 0) {
                console.warn(`Variante "${variant.name}" tiene precio inválido, se omite`);
                variantErrors.push(`Variante "${variant.name}": Precio inválido`);
                continue;
              }

              const variantName = variant.name.trim();
              const variantData = createVariantData(
                variantName,
                variantPrice,
                variant.promotionPrice?.trim() || undefined
              );

              // Buscar si ya existe una variante con el mismo nombre
              // Mejorar la búsqueda para evitar duplicados: buscar por nombre exacto después de normalizar
              const existingVariant = existingVariants.find((v: Product) => {
                const normalizedV = normalizeProductData(v);
                const vName = normalizedV.name;
                // Extraer el nombre de la variante (sin el nombre del producto padre)
                let extractedName = vName || '';
                if (vName && productName && vName.startsWith(productName)) {
                  extractedName = vName.substring(productName.length).trim();
                }
                // Normalizar ambos nombres para comparación (sin espacios extra, en minúsculas, sin caracteres especiales)
                const normalizedExtracted = extractedName.toLowerCase().trim().replace(/\s+/g, ' ');
                const normalizedVariantName = variantName.toLowerCase().trim().replace(/\s+/g, ' ');
                return normalizedExtracted === normalizedVariantName;
              });

              if (existingVariant) {
                // Actualizar variante existente
                await updateProductMutation.mutateAsync({
                  id: existingVariant.id,
                  data: variantData as UpdateProductRequest,
                });
                variantSuccesses.push(`Variante "${variantName}" actualizada`);
              } else {
                // Crear nueva variante (igual que en Form.tsx)
                await createProductMutation.mutateAsync(variantData);
                variantSuccesses.push(`Variante "${variantName}" creada`);
              }
            } catch (variantError: unknown) {
              const errorObj = variantError as { message?: string; error?: string; response?: { data?: { error?: string } } };
              const errorMsg = errorObj?.message || errorObj?.error || errorObj?.response?.data?.error || 'Error desconocido al guardar variante';
              variantErrors.push(`Variante "${variant.name}": ${errorMsg}`);
              console.error(`[EditForm] Error al guardar variante "${variant.name}":`, variantError);
            }
          }

          // Si hay errores en las variantes, mostrar al usuario
          if (variantErrors.length > 0) {
            const errorMessage = `Error al guardar algunas variantes:\n${variantErrors.join('\n')}`;
            console.error('[EditForm] Errores al guardar variantes:', variantErrors);
            alert(errorMessage);
          }

          // Mostrar éxito si todas las variantes se guardaron correctamente
          if (variantSuccesses.length > 0 && variantErrors.length === 0) {
            console.log('[EditForm] Todas las variantes guardadas exitosamente');
          }

          // TERCERO: Eliminar variantes que ya no están en la lista (para evitar duplicados)
          const variantsToDelete: Product[] = [];
          for (const existingVariant of existingVariants) {
            const normalizedV = normalizeProductData(existingVariant);
            const vName = normalizedV.name;
            // Extraer el nombre de la variante (sin el nombre del producto padre)
            let extractedName = vName;
            if (vName && productName && vName.startsWith(productName)) {
              extractedName = vName.substring(productName.length).trim();
            }
            
            // Verificar si la variante todavía existe en la lista de variantes válidas
            const stillExists = validVariants.some(v => {
              const variantName = v.name.trim();
              // Normalizar ambos nombres para comparación (sin espacios extra, en minúsculas, sin caracteres especiales)
              const normalizedExtracted = extractedName.toLowerCase().trim().replace(/\s+/g, ' ');
              const normalizedVariantName = variantName.toLowerCase().trim().replace(/\s+/g, ' ');
              return normalizedExtracted === normalizedVariantName;
            });

            if (!stillExists) {
              // Marcar para eliminar
              variantsToDelete.push(existingVariant);
            }
          }

          // Eliminar variantes que ya no están en la lista
          if (variantsToDelete.length > 0) {
            console.log('[EditForm] Eliminando variantes que ya no están en la lista:', variantsToDelete.map(v => {
              const normalized = normalizeProductData(v);
              return normalized.name;
            }));
            for (const variantToDelete of variantsToDelete) {
              try {
                await deleteProductMutation.mutateAsync(variantToDelete.id);
                console.log(`[EditForm] Variante "${variantToDelete.name}" eliminada exitosamente`);
              } catch (deleteError: unknown) {
                const errorObj = deleteError as { message?: string; error?: string };
                const errorMsg = errorObj?.message || errorObj?.error || 'Error al eliminar variante';
                console.error(`[EditForm] Error al eliminar variante "${variantToDelete.name}":`, deleteError);
                variantErrors.push(`Error al eliminar variante: ${errorMsg}`);
              }
            }
          }
        }

        // Actualizar los datos originales con los nuevos datos guardados
        // para que hasChanges se resetee correctamente
        const normalizedUpdated = normalizeProductData(updatedProduct as Product);
        setOriginalProductData(normalizedUpdated);

        setUpdatedProduct(updatedProduct);
        
        // Ocultar modal de carga
        setIsSaving(false);

        // Mostrar mensaje de éxito
        if (hasVariants && variantErrors.length > 0) {
          // Si hay errores en variantes, mostrar mensaje mixto
          alert(`Producto principal guardado exitosamente, pero hubo errores al guardar algunas variantes. Revisa la consola para más detalles.`);
        } else {
          // Todo guardado correctamente
          setShowSuccessModal(true);
        }
      } catch (apiError: unknown) {
        // Ocultar modal de carga en caso de error
        setIsSaving(false);
        console.error('[EditForm] Error updating product:', apiError);
        const errorObj = apiError as { message?: string; error?: string };
        const errorMessage = errorObj?.message || errorObj?.error || 'Error al actualizar el producto';
        alert(`Error: ${errorMessage}. Por favor, intenta nuevamente.`);
        throw apiError;
      }
    } catch (error: unknown) {
      // Ocultar modal de carga en caso de error
      setIsSaving(false);
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
    createProductMutation,
    deleteProductMutation,
    isActive,
    productImages,
    promotionDuration,
    customEndDate,
    productCategoryId,
    variants,
    allProducts,
  ]);

  const handleModalClose = useCallback(() => {
    setShowSuccessModal(false);
    setUpdatedProduct(null);
    // Redirigir a la lista de productos
    router.push('/products_list');
  }, [router]);

  // Función para renderizar el modal de carga
  const renderLoadingModal = () => {
    if (typeof window === 'undefined' || !isSaving) return null;
    
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
              Guardando cambios
            </h3>
          </div>

          {/* Contenido del modal */}
          <div className="p-6">
            <p className="text-gray-700 mb-4 text-center text-base">
              Espere un momento mientras se guardan sus cambios...
            </p>
            {/* Barra de progreso opcional */}
            {saveProgress > 0 && (
              <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div
                  className="bg-[#25D076] h-2 rounded-full transition-all duration-300"
                  style={{ width: `${saveProgress}%` }}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    );

    return createPortal(modalContent, document.body);
  };

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
      <>
        {/* Modal de carga */}
        {renderLoadingModal()}
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
      </>
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

  return (
    <>
      {/* Modal de carga */}
      {renderLoadingModal()}
      
      {isDesktop ? (
        <DesktopForm {...sharedProps} />
      ) : (
        <MobileForm {...sharedProps} />
      )}
    </>
  );
}

