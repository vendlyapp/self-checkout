"use client";

import { useState, useEffect, useMemo } from "react";
import { X } from "lucide-react";
import { createPortal } from "react-dom";
import { useCategories } from "@/hooks/queries/useCategories";
import { useProducts } from "@/hooks/queries";
import { normalizeProductData } from "./data/mockProducts";

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyFilters: (filters: FilterState) => void;
  onClearFilters: () => void;
  currentFilters: FilterState;
}

export interface FilterState {
  sortBy: "name" | "price-desc" | "price-asc" | "newest" | "rating";
  categories: string[];
  status: "all" | "active" | "inactive" | "onSale";
  priceRange: {
    min: number;
    max: number;
  };
}

const sortOptions = [
  { id: "name", label: "Name" },
  { id: "price-asc", label: "Preis ↑" },
  { id: "price-desc", label: "Preis ↓" },
];

const statusOptions = [
  { id: "all", label: "Alle", count: 0 },
  { id: "active", label: "Aktiv", count: 0 },
  { id: "inactive", label: "Inaktiv", count: 0 },
];

export default function FilterModal({
  isOpen,
  onClose,
  onApplyFilters,
  onClearFilters,
  currentFilters,
}: FilterModalProps) {
  const [filters, setFilters] = useState<FilterState>(currentFilters);
  
  // Obtener categorías reales de la API
  const { data: categoriesData = [] } = useCategories();
  
  // Obtener productos para calcular contadores
  const { data: productsData = [] } = useProducts({ isActive: true });

  // Calcular categorías con contadores dinámicos
  const categories = useMemo(() => {
    if (!categoriesData || !productsData) {
      return [];
    }

    const normalizedProducts = productsData.map(normalizeProductData);
    
    // Agregar la opción "all" al inicio
    const allProductsCount = normalizedProducts.length;
    return [
      {
        id: 'all',
        name: 'Alle',
        icon: 'ShoppingCart',
        count: allProductsCount,
      },
      ...categoriesData
        .filter(cat => cat.isActive !== false)
        .map(cat => {
          const count = normalizedProducts.filter(p => p.categoryId === cat.id).length;
          return {
            id: cat.id,
            name: cat.name,
            icon: cat.icon || 'Package',
            count: count,
          };
        })
    ];
  }, [categoriesData, productsData]);

  // Actualizar contadores de estado
  useEffect(() => {
    if (!productsData) return;
    
    const normalizedProducts = productsData.map(normalizeProductData);
    const allProductsCount = normalizedProducts.length;
    
    const statusCounts = statusOptions.map((status) => {
      if (status.id === "all")
        return { ...status, count: allProductsCount };
      if (status.id === "active") {
        const activeCount = normalizedProducts.filter(p => p.isActive !== false).length;
        return { ...status, count: activeCount };
      }
      if (status.id === "inactive") {
        const inactiveCount = normalizedProducts.filter(p => p.isActive === false).length;
        return { ...status, count: inactiveCount };
      }
      return status;
    });

    // Actualizar statusOptions con contadores reales
    statusOptions.splice(0, statusOptions.length, ...statusCounts);
  }, [productsData]);

  const handleSortChange = (sortBy: FilterState["sortBy"]) => {
    setFilters((prev) => ({ ...prev, sortBy }));
  };

  const handleCategoryToggle = (categoryId: string) => {
    setFilters((prev) => {
      if (categoryId === "all") {
        return { ...prev, categories: ["all"] };
      }

      const newCategories = prev.categories.includes(categoryId)
        ? prev.categories.filter((id) => id !== categoryId)
        : [...prev.categories.filter((id) => id !== "all"), categoryId];

      return {
        ...prev,
        categories: newCategories.length === 0 ? ["all"] : newCategories,
      };
    });
  };

  const handleStatusChange = (status: FilterState["status"]) => {
    setFilters((prev) => ({ ...prev, status }));
  };

  const handleApply = () => {
    const finalFilters = {
      ...filters,
      priceRange: currentFilters.priceRange, // Mantener el rango de precio existente
    };
    onApplyFilters(finalFilters);
    onClose();
  };

  const handleClear = () => {
    const defaultFilters = {
      sortBy: "name" as const,
      categories: ["all"],
      status: "all" as const,
      priceRange: currentFilters.priceRange, // Mantener el rango de precio existente
    };
    setFilters(defaultFilters);
    onClearFilters();
  };

  const [modalContainer, setModalContainer] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      let container = document.getElementById('global-modals-container');
      if (!container) {
        container = document.createElement('div');
        container.id = 'global-modals-container';
        document.body.appendChild(container);
      }
      setModalContainer(container);
    }
  }, []);

  if (!isOpen || !modalContainer) return null;

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-end justify-center sm:items-center animate-fade-in-scale" style={{ pointerEvents: 'auto' }}>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-interactive animate-fade-in-scale"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-white rounded-t-2xl sm:rounded-2xl shadow-xl max-h-[90vh] overflow-hidden
                      animate-slide-up-fade gpu-accelerated
                      sm:animate-scale-in">
        {/* Handle bar */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-12 h-1 bg-gray-300 rounded-full" />
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
          aria-label="Schließen"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Content */}
        <div className="px-6 pb-6 overflow-y-auto max-h-[80vh]">
          {/* Header */}
          <h2 className="text-xl font-bold text-gray-900 mb-6 pr-12">
            Filtern und sortieren
          </h2>

          {/* Sort Section */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-500 mb-3">
              Sortieren nach
            </label>
            <div className="flex flex-wrap gap-2">
              {sortOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() =>
                    handleSortChange(option.id as FilterState["sortBy"])
                  }
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filters.sortBy === option.id
                      ? "bg-[#766B6A] text-white shadow-sm"
                      : "bg-[#EEE9E5] text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Categories Section */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-500 mb-3">
              Kategorien
            </label>
            <div className="grid grid-cols-2 gap-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => handleCategoryToggle(category.id)}
                  className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors text-left flex items-center justify-between ${
                    filters.categories.includes(category.id)
                      ? "bg-[#766B6A] text-white shadow-sm"
                      : "bg-[#EEE9E5] text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <span>{category.name}</span>
                  {category.count > 0 && (
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        filters.categories.includes(category.id)
                          ? "bg-[#EEE9E5] text-[#766B6A]"
                          : "bg-[#FFFFFF] text-[#766B6A]"
                      }`}
                    >
                      {category.count}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Status Section */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-500 mb-3">
              Status
            </label>
            <div className="flex flex-wrap gap-2">
              {statusOptions.map((status) => (
                <button
                  key={status.id}
                  onClick={() =>
                    handleStatusChange(status.id as FilterState["status"])
                  }
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                    filters.status === status.id
                      ? "bg-[#766B6A] text-white shadow-sm"
                      : "bg-[#EEE9E5] text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <span>{status.label}</span>
                  {status.count > 0 && (
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        filters.status === status.id
                          ? "bg-white/20 text-white"
                          : "bg-[#766B6A] text-white"
                      }`}
                    >
                      {status.count}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleClear}
              className="flex-1 px-4 h-[50px] py-3 shadow-sm rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
            >
              Filter löschen
            </button>
            <button
              onClick={handleApply}
              className="flex-1 px-4 h-[50px] py-3 bg-[#25D076] text-white rounded-lg font-medium hover:bg-green-700 transition-colors shadow-sm"
            >
              Filter anwenden
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, modalContainer);
}
