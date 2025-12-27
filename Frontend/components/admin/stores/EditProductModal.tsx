'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { X, Loader2 } from 'lucide-react';
import { ProductService } from '@/lib/services/productService';
import type { Product as ProductType } from '@/lib/services/productService';
import DesktopForm from '@/components/dashboard/createProduct/DesktopForm';
import { FormErrors, ProductVariant, Category } from '@/components/dashboard/createProduct/types';
import { validateField, createProductObject } from '@/components/dashboard/createProduct/validations';
import { VAT_RATES } from '@/components/dashboard/createProduct/constants';
import { useUpdateProduct, useCreateProduct, useDeleteProduct } from '@/hooks/mutations';
import { useProductById } from '@/hooks/queries';
import { useCategories } from '@/hooks/queries/useCategories';
import { useProducts } from '@/hooks/queries/useProducts';
import { normalizeProductData } from '@/components/dashboard/products_list/data/mockProducts';
import type { UpdateProductRequest, Product, CreateProductRequest } from '@/lib/services/productService';

interface EditProductModalProps {
  product: ProductType | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function EditProductModal({ product, isOpen, onClose, onSuccess }: EditProductModalProps) {
  const updateProductMutation = useUpdateProduct();
  const createProductMutation = useCreateProduct();
  const deleteProductMutation = useDeleteProduct();
  
  // Obtener producto existente
  const { data: existingProduct, isLoading: loadingProduct } = useProductById(
    product?.id || null,
    !!product?.id
  );
  
  // Obtener categorías reales del backend
  const { data: backendCategories = [], isLoading: categoriesLoading } = useCategories();
  
  // Obtener todos los productos para buscar variantes
  const { data: allProducts = [] } = useProducts({ isActive: true });
  
  // Form state - Campos básicos
  const [productName, setProductName] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [productPrice, setProductPrice] = useState("");
  const [productCategory, setProductCategory] = useState("");
  const [productCategoryId, setProductCategoryId] = useState<string>("");
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
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [updatedProduct, setUpdatedProduct] = useState<Product | null>(null);
  
  // Estado para almacenar los datos originales del producto
  const [originalProductData, setOriginalProductData] = useState<Product | null>(null);

  // Transformar categorías del backend al formato esperado por el formulario
  const categories: Category[] = useMemo(() => {
    if (categoriesLoading) {
      return [];
    }
    
    if (backendCategories.length === 0) {
      return [];
    }
    
    return backendCategories.map((cat) => {
      const colorClass = cat.color 
        ? `bg-brand-50 text-brand-700`
        : "bg-brand-50 text-brand-700";
      
      return {
        value: cat.name,
        color: colorClass,
      };
    });
  }, [backendCategories, categoriesLoading]);

  // Función para manejar el cambio de categoría y guardar el ID
  const handleCategoryChange = useCallback((categoryName: string) => {
    setProductCategory(categoryName);
    
    const selectedCategory = backendCategories.find(cat => cat.name === categoryName);
    if (selectedCategory) {
      setProductCategoryId(selectedCategory.id);
    } else if (existingProduct?.categoryId) {
      setProductCategoryId(existingProduct.categoryId);
    }
    
    const newErrors = validateField("productCategory", categoryName, errors, hasVariants, hasPromotion, productPrice);
    setErrors(newErrors);
  }, [backendCategories, existingProduct, errors, hasVariants, hasPromotion, productPrice]);

  // Validation wrapper
  const handleValidateField = useCallback(
    (field: keyof FormErrors, value: string) => {
      const newErrors = validateField(field, value, errors, hasVariants, hasPromotion, productPrice);
      setErrors(newErrors);
    },
    [errors, hasVariants, hasPromotion, productPrice]
  );

  // Cargar datos del producto cuando esté disponible
  useEffect(() => {
    if (isOpen && existingProduct && backendCategories.length > 0) {
      const product = normalizeProductData(existingProduct as Product);
      
      if (!originalProductData) {
        setOriginalProductData(product);
      }
      
      setProductName(product.name || "");
      setProductDescription(product.description || "");
      setProductCategory(product.category || "");
      
      const categoryMatch = backendCategories.find(cat => cat.name === product.category);
      if (categoryMatch) {
        setProductCategoryId(categoryMatch.id);
      } else if (product.categoryId) {
        setProductCategoryId(product.categoryId);
      }
      
      setProductImages(product.images || product.image ? [product.image || product.images?.[0] || ""].filter(Boolean) : []);
      setIsActive(product.isActive ?? true);
      
      // Cargar precio
      if (product.promotionalPrice && product.isPromotional) {
        setProductPrice(product.promotionalPrice.toString());
        setHasPromotion(true);
        setPromotionPrice(product.promotionalPrice.toString());
      } else {
        setProductPrice(product.price?.toString() || "");
        setHasPromotion(false);
        setPromotionPrice("");
      }

      // Cargar variantes si existen
      if (product.variants && product.variants.length > 0) {
        setHasVariants(true);
        const loadedVariants: ProductVariant[] = product.variants.map(v => ({
          id: v.id,
          name: v.name || "",
          price: v.price?.toString() || "",
          promotionPrice: v.promotionalPrice?.toString() || "",
        }));
        setVariants(loadedVariants);
      } else {
        setHasVariants(false);
        setVariants([]);
      }
    }
  }, [isOpen, existingProduct, backendCategories, originalProductData]);

  // Funciones de variantes
  const addVariant = useCallback(() => {
    setVariants([...variants, { name: "", price: "", promotionPrice: "" }]);
  }, [variants]);

  const removeVariant = useCallback(async (index: number) => {
    const variantToRemove = variants[index];
    const newVariants = variants.filter((_, i) => i !== index);
    setVariants(newVariants);

    // Si la variante tiene ID, eliminarla de la base de datos
    if (variantToRemove.id && product?.id) {
      try {
        await deleteProductMutation.mutateAsync(variantToRemove.id);
      } catch (error) {
        console.error('Error deleting variant:', error);
      }
    }
  }, [variants, product, deleteProductMutation]);

  const updateVariant = useCallback((index: number, field: keyof ProductVariant, value: string) => {
    const newVariants = [...variants];
    newVariants[index] = { ...newVariants[index], [field]: value };
    setVariants(newVariants);
  }, [variants]);

  const handleToggleVariants = useCallback((newValue: boolean) => {
    setHasVariants(newValue);
    if (!newValue) {
      setVariants([]);
    } else if (variants.length === 0) {
      setVariants([{ name: "", price: "", promotionPrice: "" }]);
    }
  }, [variants]);

  // Handle image upload
  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newImages: string[] = [];
    const maxImages = 3;
    const remainingSlots = maxImages - productImages.length;

    Array.from(files).slice(0, remainingSlots).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (result) {
          newImages.push(result);
          if (newImages.length === Math.min(files.length, remainingSlots)) {
            setProductImages([...productImages, ...newImages]);
          }
        }
      };
      reader.readAsDataURL(file);
    });
  }, [productImages]);

  const handleRemoveImage = useCallback((index: number) => {
    setProductImages(productImages.filter((_, i) => i !== index));
  }, [productImages]);

  // Handle save
  const handleSave = useCallback(async () => {
    if (!product?.id || !existingProduct) return;

    setIsSaving(true);
    setErrors({});

    try {
      // Validación básica
      if (!productName.trim()) {
        setErrors({ productName: 'El nombre del producto es requerido' });
        setIsSaving(false);
        return;
      }

      if (!hasVariants && !productPrice) {
        setErrors({ productPrice: 'El precio es requerido' });
        setIsSaving(false);
        return;
      }

      if (hasPromotion && !hasVariants && !promotionPrice) {
        setErrors({ promotionPrice: 'El precio promocional es requerido' });
        setIsSaving(false);
        return;
      }

      const updateData: UpdateProductRequest = {
        name: productName.trim(),
        description: productDescription.trim(),
        price: hasPromotion && !hasVariants ? parseFloat(promotionPrice) : parseFloat(productPrice),
        originalPrice: hasPromotion && !hasVariants ? parseFloat(productPrice) : undefined,
        category: productCategory.trim(),
        categoryId: productCategoryId || undefined,
        isActive,
        image: productImages[0] || undefined,
        images: productImages.length > 0 ? productImages : undefined,
      };

      // Actualizar producto principal
      const updatedProduct = await updateProductMutation.mutateAsync({
        id: product.id,
        data: updateData as UpdateProductRequest,
      });

      // Manejar variantes si existen
      if (hasVariants && variants.length > 0) {
        // Obtener variantes existentes del producto
        const existingVariants = allProducts.filter(p => p.parentId === product.id);
        
        // Actualizar o crear variantes
        for (let i = 0; i < variants.length; i++) {
          const variant = variants[i];
          if (!variant.name.trim() || !variant.price) continue;

          const variantData: CreateProductRequest = {
            name: `${productName.trim()} ${variant.name.trim()}`,
            description: productDescription.trim(),
            price: parseFloat(variant.price),
            originalPrice: variant.promotionPrice ? parseFloat(variant.promotionPrice) : undefined,
            category: productCategory.trim(),
            categoryId: productCategoryId || undefined,
            stock: 999,
            isActive,
            parentId: product.id,
            image: productImages[0] || undefined,
          };

          if (variant.id) {
            // Actualizar variante existente
            await updateProductMutation.mutateAsync({
              id: variant.id,
              data: variantData as UpdateProductRequest,
            });
          } else {
            // Crear nueva variante
            await createProductMutation.mutateAsync(variantData);
          }
        }

        // Eliminar variantes que ya no están en el formulario
        const currentVariantIds = variants.filter(v => v.id).map(v => v.id!);
        const variantsToDelete = existingVariants.filter(v => !currentVariantIds.includes(v.id));
        
        for (const variantToDelete of variantsToDelete) {
          await deleteProductMutation.mutateAsync(variantToDelete.id);
        }
      }

      setUpdatedProduct(updatedProduct);
      setShowSuccessModal(true);
      onSuccess?.();
      
      // Cerrar modal después de 2 segundos
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error) {
      console.error('Error updating product:', error);
      setErrors({ productName: 'Error al actualizar el producto' });
    } finally {
      setIsSaving(false);
    }
  }, [
    product,
    existingProduct,
    productName,
    productDescription,
    productPrice,
    productCategory,
    productCategoryId,
    isActive,
    hasPromotion,
    promotionPrice,
    hasVariants,
    variants,
    productImages,
    allProducts,
    updateProductMutation,
    createProductMutation,
    deleteProductMutation,
    onSuccess,
    onClose,
  ]);

  const handleModalClose = useCallback(() => {
    setShowSuccessModal(false);
    setUpdatedProduct(null);
    onClose();
  }, [onClose]);

  // Don't render if modal is not open
  if (!isOpen) return null;
  
  // If product is null but modal is open, show loading
  if (!product) {
    return createPortal(
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <Loader2 className="w-8 h-8 animate-spin text-brand-600 mx-auto" />
          <p className="mt-4 text-gray-600 text-center">Cargando producto...</p>
        </div>
      </div>,
      document.body
    );
  }

  if (loadingProduct) {
    return createPortal(
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <Loader2 className="w-8 h-8 animate-spin text-brand-600 mx-auto" />
          <p className="mt-4 text-gray-600 text-center">Cargando producto...</p>
        </div>
      </div>,
      document.body
    );
  }

  if (!existingProduct) {
    return createPortal(
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md">
          <p className="text-gray-600 text-center mb-4">Produkt nicht gefunden</p>
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700"
          >
            Cerrar
          </button>
        </div>
      </div>,
      document.body
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
    setHasVariants: handleToggleVariants,
    variants,
    setVariants,
    vatRate,
    setVatRate,
    errors,
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
    vatRates: VAT_RATES,
    isEditMode: true,
    existingProduct: normalizeProductData(existingProduct as Product),
    hasChanges: true,
  };

  return createPortal(
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal Container */}
      <div className="relative min-h-screen flex items-start justify-center p-4 py-8">
        <div className="relative bg-gray-50 rounded-2xl shadow-2xl w-full max-w-7xl max-h-[95vh] overflow-hidden flex flex-col my-8">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-white sticky top-0 z-10">
            <h2 className="text-2xl font-bold text-gray-900">
              Editar Producto
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Cerrar"
            >
              <X className="w-6 h-6 text-gray-600" />
            </button>
          </div>

          {/* Content - Scrollable */}
          <div className="flex-1 overflow-y-auto bg-gray-50">
            <DesktopForm {...sharedProps} />
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

