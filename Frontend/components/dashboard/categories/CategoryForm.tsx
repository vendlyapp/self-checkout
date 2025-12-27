"use client";

import React, { useState, useEffect } from "react";
import { X, Save } from "lucide-react";
import { useCreateCategory, useUpdateCategory } from "@/hooks/mutations";
import type { Category, CreateCategoryRequest, UpdateCategoryRequest } from "@/lib/services/categoryService";
import { getIcon, iconMap } from "../products_list/data/iconMap";

interface CategoryFormProps {
  category?: Category | null;
  onClose: () => void;
  onSuccess: () => void;
}

const availableIcons = Object.keys(iconMap);

export default function CategoryForm({ category, onClose, onSuccess }: CategoryFormProps) {
  const [name, setName] = useState("");
  const [color, setColor] = useState("#25d076"); // brand-500 color
  const [icon, setIcon] = useState("Tag"); // Icono por defecto
  const [errors, setErrors] = useState<{ name?: string }>({});

  const createCategoryMutation = useCreateCategory();
  const updateCategoryMutation = useUpdateCategory();

  useEffect(() => {
    if (category) {
      setName(category.name || "");
      setColor(category.color || "#25d076"); // brand-500 color
      setIcon(category.icon || "Tag"); // Icono por defecto
    }
  }, [category]);

  const validate = (): boolean => {
    const newErrors: { name?: string } = {};
    
    if (!name.trim()) {
      newErrors.name = "El nombre es requerido";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    try {
      if (category) {
        // Actualizar categoría
        const updateData: UpdateCategoryRequest = {
          name: name.trim(),
          color: color.trim() || undefined,
          icon: icon || undefined,
        };
        await updateCategoryMutation.mutateAsync({
          id: category.id,
          data: updateData,
        });
      } else {
        // Crear categoría
        const createData: CreateCategoryRequest = {
          name: name.trim(),
          color: color.trim() || undefined,
          icon: icon || undefined,
        };
        await createCategoryMutation.mutateAsync(createData);
      }
      onSuccess();
    } catch (error) {
      console.error("Fehler beim Speichern der Kategorie:", error);
      alert(error instanceof Error ? error.message : "Fehler beim Speichern der Kategorie");
    }
  };

  const isLoading = createCategoryMutation.isPending || updateCategoryMutation.isPending;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {category ? "Kategorie bearbeiten" : "Neue Kategorie"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Name Field */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) {
                  setErrors({ ...errors, name: undefined });
                }
              }}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.name ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="z.B. Panadería"
              disabled={isLoading}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name}</p>
            )}
          </div>

          {/* Icon Field */}
          <div>
            <label htmlFor="icon" className="block text-sm font-medium text-gray-700 mb-2">
              Icon (optional)
            </label>
            <div className="grid grid-cols-4 gap-2 p-3 border border-gray-300 rounded-lg max-h-48 overflow-y-auto">
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
                  <div className="flex items-center justify-center">
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

          {/* Color Field */}
          <div>
            <label htmlFor="color" className="block text-sm font-medium text-gray-700 mb-2">
              Farbe (optional)
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                id="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-16 h-10 border border-gray-300 rounded cursor-pointer"
                disabled={isLoading}
              />
              <input
                type="text"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="#10b981"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={isLoading}
            >
              Abbrechen
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Speichern...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Speichern
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

