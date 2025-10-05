"use client";

import React, { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import MobileForm from "./MobileForm";
import DesktopForm from "./DesktopForm";
import { FormProps, CreatedProduct, ProductVariant, FormErrors } from "./types";
import { validateField, createProductObject } from "./validations";
import { CATEGORIES, VAT_RATES, SAVE_PROGRESS_STEPS } from "./constants";
import { ProductService } from "@/lib/services/productService";
import { Product } from "@/components/dashboard/products_list/data/mockProducts";

export default function Form({ isDesktop = false }: FormProps) {
  const router = useRouter();

  // Form state - Campos básicos
  const [productName, setProductName] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [productPrice, setProductPrice] = useState("");
  const [productCategory, setProductCategory] = useState("");
  const [productImages, setProductImages] = useState<string[]>([]);
  const [stock, setStock] = useState(0);
  const [isActive, setIsActive] = useState(true);

  // Campos de identificación
  const [sku, setSku] = useState("");
  const [barcode, setBarcode] = useState("");

  // Campos de gestión
  const [supplier, setSupplier] = useState("");
  const [costPrice, setCostPrice] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");

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

  // Función para guardar el producto
  const handleSave = useCallback(async () => {
    try {
      // Validation
      handleValidateField("productName", productName);
      handleValidateField("productCategory", productCategory);
      handleValidateField("stock", stock.toString());

      if (!hasVariants) {
        handleValidateField("productPrice", productPrice);
      }
      if (hasPromotion) {
        handleValidateField("promotionPrice", promotionPrice);
      }

      if (Object.keys(errors).length > 0) return;

      // Simulate progress steps
      for (let i = 0; i < SAVE_PROGRESS_STEPS.length; i++) {
        setSaveProgress(((i + 1) / SAVE_PROGRESS_STEPS.length) * 100);
        await new Promise((resolve) => setTimeout(resolve, SAVE_PROGRESS_STEPS[i].duration));
      }

      setSaveProgress(0);

      // Create product object using centralized function
      const productData = createProductObject(
        productName,
        productDescription,
        productPrice,
        productCategory,
        promotionPrice,
        stock,
        hasVariants,
        hasPromotion,
        sku,
        barcode,
        supplier,
        costPrice,
        expiryDate,
        location,
        notes
      );

      // Enviar al backend - el backend generará el ID y QR automáticamente
      try {
        const response = await ProductService.createProduct(productData);
        
        if (!response.success) {
          throw new Error(response.error || 'Error al crear el producto');
        }

        // Convertir el producto de la API al tipo usado en el frontend
        const frontendProduct: Product = {
          ...response.data!,
          tags: response.data!.tags || [],
          categoryId: response.data!.categoryId || 'uncategorized',
        };
        setCreatedProduct(frontendProduct);
        setShowSuccessModal(true);
      } catch (backendError) {
        console.warn('Backend no disponible, creando producto localmente:', backendError);
        
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
          ...(productData.notes && { notes: productData.notes }),
          ...(productData.expiryDate && { expiryDate: productData.expiryDate }),
          ...(productData.promotionTitle && { promotionTitle: productData.promotionTitle }),
          ...(productData.promotionType && { promotionType: productData.promotionType }),
          ...(productData.promotionBadge && { promotionBadge: productData.promotionBadge }),
          ...(productData.promotionActionLabel && { promotionActionLabel: productData.promotionActionLabel }),
          ...(productData.promotionPriority && { promotionPriority: productData.promotionPriority }),
        };
        
        setCreatedProduct(mockCreatedProduct);
        setShowSuccessModal(true);
        
        // Mostrar mensaje informativo
        alert('Producto creado localmente. El backend no está disponible, pero el producto se guardó en el frontend.');
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
    stock,
    hasVariants,
    hasPromotion,
    sku,
    barcode,
    supplier,
    costPrice,
    expiryDate,
    location,
    notes,
    errors,
    handleValidateField,
  ]);

  // Handle navigation after modal close
  const handleModalClose = useCallback(() => {
    setShowSuccessModal(false);
    setCreatedProduct(null);
    router.push("/products_list");
  }, [router]);

  // Exponer la función de guardado globalmente
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).saveProduct = handleSave;
  }, [handleSave]);

  // Props compartidas entre MobileForm y DesktopForm
  const sharedProps = {
    // Campos básicos
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
    stock,
    setStock,
    isActive,
    setIsActive,

    // Campos de identificación
    sku,
    setSku,
    barcode,
    setBarcode,

    // Campos de gestión
    supplier,
    setSupplier,
    costPrice,
    setCostPrice,
    expiryDate,
    setExpiryDate,
    location,
    setLocation,
    notes,
    setNotes,

    // Promociones
    hasPromotion,
    setHasPromotion,
    promotionPrice,
    setPromotionPrice,
    promotionDuration,
    setPromotionDuration,
    customEndDate,
    setCustomEndDate,

    // Variantes
    hasVariants,
    setHasVariants,
    variants,
    setVariants,

    // Impuestos
    vatRate,
    setVatRate,

    // Estado del formulario
    errors,
    saveProgress,
    showSuccessModal,
    createdProduct,
    handleModalClose,
    validateField: handleValidateField,

    // Funciones de variantes
    addVariant,
    removeVariant,
    updateVariant,
    handleToggleVariants,

    // Datos estáticos
    categories,
    vatRates,
  };

  return (
    <div className="w-full">
      {isDesktop ? (
        <DesktopForm {...sharedProps} />
      ) : (
        <MobileForm {...sharedProps} />
      )}
    </div>
  );
}
