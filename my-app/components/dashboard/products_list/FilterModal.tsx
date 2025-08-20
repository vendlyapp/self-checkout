"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { ProductCategory, updateCategoryCounts } from "./data/mockProducts";

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
  { id: "name", label: "Name A-Z" },
  { id: "price-asc", label: "Preis ↑ (Niedrig zu Hoch)" },
  { id: "price-desc", label: "Preis ↓ (Hoch zu Niedrig)" },
  { id: "newest", label: "Neueste zuerst" },
  { id: "rating", label: "Beste Bewertung" },
];

const statusOptions = [
  { id: "all", label: "Alle Produkte", count: 0 },
  { id: "active", label: "Aktiv", count: 0 },
  { id: "inactive", label: "Inaktiv", count: 0 },
  { id: "onSale", label: "Im Angebot", count: 0 },
];

export default function FilterModal({
  isOpen,
  onClose,
  onApplyFilters,
  onClearFilters,
  currentFilters,
}: FilterModalProps) {
  const [filters, setFilters] = useState<FilterState>(currentFilters);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 50 });

  // Cargar categorías reales
  useEffect(() => {
    const loadCategories = () => {
      const realCategories = updateCategoryCounts();
      setCategories(realCategories);

      // Actualizar contadores de estado
      const statusCounts = statusOptions.map((status) => {
        if (status.id === "all")
          return { ...status, count: realCategories[0]?.count || 0 };
        if (status.id === "onSale") {
          const onSaleCount =
            realCategories.reduce((acc, cat) => acc + cat.count, 0) * 0.3; // Estimación
          return { ...status, count: Math.round(onSaleCount) };
        }
        return status;
      });

      // Actualizar statusOptions con contadores reales
      statusOptions.splice(0, statusOptions.length, ...statusCounts);
    };

    loadCategories();
  }, []);

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

  const handlePriceRangeChange = (type: "min" | "max", value: number) => {
    setPriceRange((prev) => ({ ...prev, [type]: value }));
  };

  const handleApply = () => {
    const finalFilters = {
      ...filters,
      priceRange,
    };
    onApplyFilters(finalFilters);
    onClose();
  };

  const handleClear = () => {
    const defaultFilters = {
      sortBy: "name" as const,
      categories: ["all"],
      status: "all" as const,
      priceRange: { min: 0, max: 50 },
    };
    setFilters(defaultFilters);
    setPriceRange({ min: 0, max: 50 });
    onClearFilters();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-white rounded-t-2xl sm:rounded-2xl shadow-xl max-h-[90vh] overflow-hidden">
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
                      ? "bg-brand-500 text-white shadow-sm"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
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
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => handleCategoryToggle(category.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filters.categories.includes(category.id)
                      ? "bg-brand-500 text-white shadow-sm"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <span>{category.name}</span>
                  {category.count > 0 && (
                    <span
                      className={`ml-1 text-xs ${
                        filters.categories.includes(category.id)
                          ? "text-white/80"
                          : "text-gray-500"
                      }`}
                    >
                      {category.count}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range Section */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-500 mb-3">
              Preisbereich (CHF)
            </label>
            <div className="flex gap-3 items-center">
              <div className="flex-1">
                <label className="block text-xs text-gray-500 mb-1">Min</label>
                <input
                  type="number"
                  value={priceRange.min}
                  onChange={(e) =>
                    handlePriceRangeChange("min", Number(e.target.value))
                  }
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                  placeholder="0"
                  min="0"
                />
              </div>
              <div className="text-gray-400">-</div>
              <div className="flex-1">
                <label className="block text-xs text-gray-500 mb-1">Max</label>
                <input
                  type="number"
                  value={priceRange.max}
                  onChange={(e) =>
                    handlePriceRangeChange("max", Number(e.target.value))
                  }
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                  placeholder="50"
                  min="0"
                />
              </div>
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
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filters.status === status.id
                      ? "bg-brand-500 text-white shadow-sm"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <span>{status.label}</span>
                  {status.count > 0 && (
                    <span
                      className={`ml-1 text-xs ${
                        filters.status === status.id
                          ? "text-white/80"
                          : "text-gray-500"
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
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
            >
              Filter löschen
            </button>
            <button
              onClick={handleApply}
              className="flex-1 px-4 py-3 bg-brand-500 text-white rounded-lg font-medium hover:bg-brand-600 transition-colors shadow-sm"
            >
              Filter anwenden
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
