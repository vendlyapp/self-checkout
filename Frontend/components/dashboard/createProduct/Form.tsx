"use client";

import React, { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import MobileForm from "./MobileForm";
import DesktopForm from "./DesktopForm";
import { FormProps, CreatedProduct, ProductVariant, FormErrors } from "./types";
import { validateField, createProductObject } from "./validations";
import { CATEGORIES, VAT_RATES, SAVE_PROGRESS_STEPS } from "./constants";
import { ProductService } from "@/lib/services/productService";

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
      const createdProduct = await ProductService.createProduct(productData);

      setCreatedProduct(createdProduct);
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Error creating product:', error);
      // TODO: Mostrar error al usuario
      alert('Error al crear el producto: ' + (error as Error).message);
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
