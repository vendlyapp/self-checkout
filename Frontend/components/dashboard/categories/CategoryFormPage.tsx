"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Plus, X, CheckCircle, Loader2 } from "lucide-react";
import { useCreateCategory, useUpdateCategory } from "@/hooks/mutations";
import { useQueryClient } from "@tanstack/react-query";
import { createPortal } from "react-dom";
import type { Category, CreateCategoryRequest, UpdateCategoryRequest } from "@/lib/services/categoryService";
import { getIcon, iconMap } from "../products_list/data/iconMap";

interface CategoryFormPageProps {
  isDesktop?: boolean;
  category?: Category | null; // Para modo edición
}

// Extender Window interface para propiedades personalizadas
declare global {
  interface Window {
    __categoryFormIsValid?: boolean;
    __categoryFormIsSubmitting?: boolean;
    __categoryFormHasChanges?: boolean;
  }
}

const availableIcons = Object.keys(iconMap);
const MAX_NAME_LENGTH = 20;

export default function CategoryFormPage({ 
  isDesktop = false,
  category = null 
}: CategoryFormPageProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const createCategoryMutation = useCreateCategory();
  const updateCategoryMutation = useUpdateCategory();

  const [name, setName] = useState("");
  const [color, setColor] = useState("#25d076"); // brand-500 color
  const [icon, setIcon] = useState("Tag"); // Icono por defecto
  const [isActive, setIsActive] = useState(true);
  const [errors, setErrors] = useState<{ name?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showIconSelector, setShowIconSelector] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [createdCategory, setCreatedCategory] = useState<Category | null>(null);
  const [modalContainer, setModalContainer] = useState<HTMLDivElement | null>(null);
  const autoCloseTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Crear contenedor de modales
  useEffect(() => {
    if (typeof window !== 'undefined' && !document.getElementById('category-modals-container')) {
      const container = document.createElement('div');
      container.id = 'category-modals-container';
      container.style.position = 'fixed';
      container.style.top = '0';
      container.style.left = '0';
      container.style.width = '100%';
      container.style.height = '100%';
      container.style.pointerEvents = 'none';
      container.style.zIndex = '99999';
      container.style.overflow = 'hidden';
      document.body.appendChild(container);
      setModalContainer(container);
    } else if (typeof window !== 'undefined') {
      const existingContainer = document.getElementById('category-modals-container');
      if (existingContainer) {
        setModalContainer(existingContainer as HTMLDivElement);
      }
    }
  }, []);

  // Auto-cerrar modal después de 3 segundos y redirigir
  useEffect(() => {
    if (showSuccessModal) {
      if (autoCloseTimeoutRef.current) {
        clearTimeout(autoCloseTimeoutRef.current);
      }
      
      autoCloseTimeoutRef.current = setTimeout(() => {
        setShowSuccessModal(false);
        router.push("/categories");
      }, 3000);

      return () => {
        if (autoCloseTimeoutRef.current) {
          clearTimeout(autoCloseTimeoutRef.current);
        }
      };
    }
  }, [showSuccessModal, router]);

  // Estado inicial de la categoría para detectar cambios
  const [initialCategory, setInitialCategory] = useState<{
    name: string;
    color: string;
    icon: string;
  } | null>(null);

  // Cargar datos si estamos editando
  useEffect(() => {
      if (category) {
        const categoryName = category.name || "";
        const categoryColor = category.color || "#25d076";
        const categoryIcon = category.icon || "Tag";
        const categoryIsActive = category.isActive !== undefined ? category.isActive : true;
        
        setName(categoryName);
        setColor(categoryColor);
        setIcon(categoryIcon);
        setIsActive(categoryIsActive);
      
      // Guardar estado inicial para comparar cambios
      setInitialCategory({
        name: categoryName,
        color: categoryColor,
        icon: categoryIcon,
      });
    } else {
      setInitialCategory(null);
    }
  }, [category]);

  // Detectar si hay cambios en el formulario
  const hasChanges = useMemo(() => {
    if (!category || !initialCategory) return false;
    
    return (
      name.trim() !== initialCategory.name ||
      color !== initialCategory.color ||
      icon !== initialCategory.icon
    );
  }, [category, initialCategory, name, color, icon]);

  const validate = (): boolean => {
    const newErrors: { name?: string } = {};
    
    if (!name.trim()) {
      newErrors.name = "Der Kategoriename ist erforderlich";
    } else if (name.trim().length < 2) {
      newErrors.name = "Mindestens 2 Zeichen";
    } else if (name.trim().length > MAX_NAME_LENGTH) {
      newErrors.name = `Maximal ${MAX_NAME_LENGTH} Zeichen`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);

    try {
          let result;
          if (category) {
            // Actualizar categoría
            const updateData: UpdateCategoryRequest = {
              name: name.trim(),
              color: color.trim() || undefined,
              icon: icon || undefined,
              isActive: isActive,
            };
        result = await updateCategoryMutation.mutateAsync({
          id: category.id,
          data: updateData,
        });
      } else {
        // Crear categoría
        const createData: CreateCategoryRequest = {
          name: name.trim(),
          color: color.trim() || undefined,
          icon: icon || undefined,
          isActive: isActive,
        };
        result = await createCategoryMutation.mutateAsync(createData);
      }

      // Invalidar cache de categorías
      await queryClient.invalidateQueries({ queryKey: ['categories'] });
      
      // Guardar categoría creada y mostrar modal de éxito
      // La mutación devuelve directamente la categoría
      if (result) {
        setCreatedCategory(result as Category);
        setShowSuccessModal(true);
      } else {
        // Si no hay resultado, crear un objeto básico
        setCreatedCategory({
          id: '',
          name: name.trim(),
          color: color.trim() || undefined,
          icon: icon || undefined,
        });
        setShowSuccessModal(true);
      }
    } catch (error) {
      console.error("Fehler beim Speichern der Kategorie:", error);
      alert(error instanceof Error ? error.message : "Fehler beim Speichern der Kategorie");
      setIsSubmitting(false);
    }
  };

  const isLoading = createCategoryMutation.isPending || updateCategoryMutation.isPending || isSubmitting;
  const nameLength = name.length;
  const isFormValid = name.trim().length >= 2 && name.trim().length <= MAX_NAME_LENGTH;

  // Exponer función de submit y estado de validación para que AdminLayout pueda acceder
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.__categoryFormIsValid = category ? hasChanges && isFormValid : isFormValid;
      window.__categoryFormIsSubmitting = isSubmitting;
      window.__categoryFormHasChanges = category ? hasChanges : false;
    }
    return () => {
      if (typeof window !== 'undefined') {
        delete window.__categoryFormIsValid;
        delete window.__categoryFormIsSubmitting;
        delete window.__categoryFormHasChanges;
      }
    };
  }, [isFormValid, isSubmitting, hasChanges, category]);

  // Mobile Form
  if (!isDesktop) {
    return (
      <>
      <form onSubmit={handleSubmit} id="category-form" className="min-h-screen bg-background-cream flex flex-col">
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Kategorie-Name */}
          <div>
            <label className="block text-[16px] font-semibold text-gray-900 mb-2">
              Kategorie-Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  const newValue = e.target.value.slice(0, MAX_NAME_LENGTH);
                  setName(newValue);
                  if (errors.name) {
                    setErrors({ ...errors, name: undefined });
                  }
                }}
                placeholder="Früchte"
                maxLength={MAX_NAME_LENGTH}
                className={`w-full h-[46px] px-4 py-3 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent text-[16px] font-medium transition-colors bg-white ${
                  errors.name ? "border-red-500" : "border-gray-200"
                }`}
                disabled={isLoading}
              />
              {/* Contador de caracteres */}
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500 font-medium">
                {nameLength}/{MAX_NAME_LENGTH}
              </div>
            </div>
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name}</p>
            )}
          </div>

          {/* Kategorie-Icon */}
          <div className="relative">
            <label className="block text-[16px] font-semibold text-gray-900 mb-2">
              Kategorie-Icon
            </label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowIconSelector(!showIconSelector)}
                className={`flex-shrink-0 rounded-lg bg-white transition-colors ${
                  icon && icon !== 'Tag'
                    ? 'border-2 border-solid border-white'
                    : 'border-2 border-dashed border-gray-300'
                }`}
              >
                {icon && icon !== 'Tag' ? (
                  <div className="w-16 h-16 rounded-lg flex items-center justify-center"
                       style={color ? { backgroundColor: color + '20' } : { backgroundColor: '#f3f4f6' }}
                  >
                    <div className="text-gray-600 [&>svg]:w-8 [&>svg]:h-8"
                         style={color ? { color: color } : {}}
                    >
                      {getIcon(icon)}
                    </div>
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded-lg bg-white flex items-center justify-center">
                    {/* Espacio vacío cuando no hay icono */}
                  </div>
                )}
              </button>
              <span className="text-gray-500 text-sm">
                Icon auswählen
              </span>
            </div>
            {/* Botón X para limpiar icono - en la esquina superior derecha de la sección */}
            {icon && icon !== 'Tag' && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIcon('Tag');
                }}
                className="absolute top-0 right-0 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors z-10"
                aria-label="Icon entfernen"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            )}
            {/* Grid de iconos (se muestra al hacer click) */}
            {showIconSelector && (
              <div className="mt-3 grid grid-cols-4 gap-2 p-3 border border-gray-300 rounded-lg bg-white max-h-48 overflow-y-auto">
                {availableIcons.map((iconName) => (
                  <button
                    key={iconName}
                    type="button"
                    onClick={() => {
                      setIcon(iconName);
                      setShowIconSelector(false);
                    }}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      icon === iconName
                        ? "border-brand-500 bg-brand-50"
                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                    disabled={isLoading}
                    aria-label={`Icon ${iconName} auswählen`}
                  >
                    <div className="flex items-center justify-center [&>svg]:w-6 [&>svg]:h-6">
                      {getIcon(iconName)}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Kategorie-Farbe */}
          <div className="relative">
            <label className="block text-[16px] font-semibold text-gray-900 mb-2">
              Kategorie-Farbe
            </label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  const colorInput = document.getElementById('category-color-input') as HTMLInputElement;
                  colorInput?.click();
                }}
                className={`flex-shrink-0 rounded-lg transition-colors ${
                  color && color !== '#25d076'
                    ? 'border-2 border-solid border-white'
                    : 'border-2 border-dashed border-gray-300'
                }`}
              >
                <div 
                  className="w-16 h-16 rounded-lg"
                  style={{ backgroundColor: color }}
                />
                <input
                  type="color"
                  id="category-color-input"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="hidden"
                />
              </button>
              <span className="text-gray-500 text-sm">
                Farbe auswählen
              </span>
            </div>
            {/* Botón X para limpiar color - en la esquina superior derecha de la sección */}
            {color && color !== '#25d076' && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setColor('#25d076');
                }}
                className="absolute top-0 right-0 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors z-10"
                aria-label="Farbe entfernen"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            )}
          </div>

          {/* Aktiv im Shop */}
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <div>
                  <label className="block text-[16px] font-semibold text-gray-900">
                    Aktiv im Shop
                  </label>
                  <p className="text-sm text-gray-500 mt-0.5">
                    Für Kunden sichtbar
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsActive(!isActive)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  isActive ? 'bg-brand-500' : 'bg-gray-300'
                }`}
                disabled={isLoading}
                aria-label="Aktiv im Shop umschalten"
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    isActive ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Botón fijo inferior - Solo visible si no hay AdminLayout manejándolo */}
        {/* El AdminLayout manejará el botón en el footer para móvil */}
      </form>
      {/* Modales */}
      {modalContainer && isSubmitting && !showSuccessModal && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden" style={{ pointerEvents: 'auto' }}>
          <div className="absolute inset-0 w-full h-full bg-black/30 backdrop-blur-md"></div>
          <div className="relative bg-white rounded-3xl shadow-2xl max-w-sm w-full mx-4 animate-in fade-in-0 zoom-in-95 duration-300" style={{ pointerEvents: 'auto' }}>
            <div className="bg-gradient-to-br from-[#25D076] to-[#20BA68] rounded-t-3xl p-8 text-center">
              <div className="w-20 h-20 bg-white/20 backdrop-blur-lg rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Loader2 className="w-10 h-10 text-white animate-spin" strokeWidth={3} />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">
                Kategorie wird erstellt...
              </h3>
            </div>
          </div>
        </div>,
        modalContainer as Element
      )}
      {modalContainer && showSuccessModal && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden" style={{ pointerEvents: 'auto' }}>
          <div className="absolute inset-0 w-full h-full bg-black/30 backdrop-blur-md"></div>
          <div className="relative bg-white rounded-3xl shadow-2xl max-w-sm w-full mx-4 animate-in fade-in-0 zoom-in-95 duration-300" style={{ pointerEvents: 'auto' }}>
            <div className="bg-gradient-to-br from-[#25D076] to-[#20BA68] rounded-t-3xl p-8 text-center">
              <div className="w-20 h-20 bg-white/20 backdrop-blur-lg rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <CheckCircle className="w-10 h-10 text-white" strokeWidth={3} />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">
                {category ? "Kategorie aktualisiert" : "Kategorie erstellt"}
              </h3>
              <p className="text-white/90 text-sm">
                {category 
                  ? <>Die Kategorie <span className="font-semibold">&quot;{createdCategory?.name}&quot;</span> wurde erfolgreich aktualisiert</>
                  : <>Ihre Kategorie <span className="font-semibold">&quot;{createdCategory?.name}&quot;</span> wurde erfolgreich erstellt</>
                }
              </p>
            </div>
            <div className="p-6 bg-gray-50 rounded-b-3xl">
              <div className="text-center space-y-2">
                <p className="text-xs text-gray-500 font-mono">
                  ID: {createdCategory?.id}
                </p>
              </div>
            </div>
          </div>
        </div>,
        modalContainer as Element
      )}
      </>
    );
  }

  // Desktop Form
  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 border border-gray-200 space-y-6">
      {/* Kategorie-Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Kategorie-Name <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <input
            type="text"
            value={name}
            onChange={(e) => {
              const newValue = e.target.value.slice(0, MAX_NAME_LENGTH);
              setName(newValue);
              if (errors.name) {
                setErrors({ ...errors, name: undefined });
              }
            }}
            placeholder="Früchte"
            maxLength={MAX_NAME_LENGTH}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent ${
              errors.name ? "border-red-500" : "border-gray-300"
            }`}
            disabled={isLoading}
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500">
            {nameLength}/{MAX_NAME_LENGTH}
          </div>
        </div>
        {errors.name && (
          <p className="mt-1 text-sm text-red-600">{errors.name}</p>
        )}
      </div>

      {/* Kategorie-Icon */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Kategorie-Icon
        </label>
        <div className="grid grid-cols-6 gap-2 p-3 border border-gray-300 rounded-lg max-h-64 overflow-y-auto">
          {availableIcons.map((iconName) => (
            <button
              key={iconName}
              type="button"
              onClick={() => setIcon(iconName)}
              className={`p-3 rounded-lg border-2 transition-all ${
                icon === iconName
                  ? "border-brand-500 bg-brand-50"
                  : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
              }`}
              disabled={isLoading}
              aria-label={`Icon ${iconName} auswählen`}
            >
              <div className="flex items-center justify-center [&>svg]:w-6 [&>svg]:h-6">
                {getIcon(iconName)}
              </div>
            </button>
          ))}
        </div>
        {icon && (
          <div className="mt-2 flex items-center gap-2">
            <span className="text-sm text-gray-600">Ausgewählt:</span>
            <div className="p-2 bg-gray-100 rounded-lg">
              {getIcon(icon)}
            </div>
            <span className="text-sm font-medium text-gray-900">{icon}</span>
          </div>
        )}
      </div>

      {/* Kategorie-Farbe */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Kategorie-Farbe
        </label>
        <div className="flex items-center gap-3">
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="w-16 h-10 border border-gray-300 rounded cursor-pointer"
            disabled={isLoading}
          />
          <input
            type="text"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            placeholder="#25d076"
            disabled={isLoading}
          />
        </div>
      </div>

      {/* Aktiv im Shop */}
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
        <div>
          <label className="block text-sm font-medium text-gray-900">
            Aktiv im Shop
          </label>
          <p className="text-sm text-gray-500 mt-0.5">
            Für Kunden sichtbar
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsActive(!isActive)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            isActive ? 'bg-brand-500' : 'bg-gray-300'
          }`}
          disabled={isLoading}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              isActive ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          disabled={isLoading}
        >
          Abbrechen
        </button>
        <button
          type="submit"
          className="flex-1 px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
          disabled={!isFormValid || isLoading}
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Speichern...
            </>
          ) : (
            <>
              <Plus className="w-4 h-4" />
              Kategorie speichern
            </>
          )}
        </button>
      </div>
    </form>
  );
}

