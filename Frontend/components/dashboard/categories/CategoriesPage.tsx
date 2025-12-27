"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useDeleteCategory } from "@/hooks/mutations";
import { useCategories } from "@/hooks/queries/useCategories";
import type { Category } from "@/lib/services/categoryService";
import CategoryForm from "./CategoryForm";
import DeleteCategoryModal from "./DeleteCategoryModal";
import CategoryCard from "./CategoryCard";
import CategoryFilters, { CategoryFilterStatus } from "./CategoryFilters";
import FooterAddCategory from "./FooterAddCategory";
import { SearchInput } from "@/components/ui/search-input";
import FixedHeaderContainer from "@/components/dashboard/products_list/FixedHeaderContainer";
import { Plus } from "lucide-react";

export default function CategoriesPage() {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<CategoryFilterStatus>("all");
  const deleteCategoryMutation = useDeleteCategory();

  // Obtener todas las categorías
  const { data: categories = [], isLoading, error } = useCategories();

  // Filtrar categorías según búsqueda y estado
  const filteredCategories = useMemo(() => {
    let filtered = [...categories];

    // Filtrar por búsqueda
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((category) =>
        category.name.toLowerCase().includes(query)
      );
    }

    // Filtrar por estado
    if (filterStatus === "active") {
      filtered = filtered.filter((category) => (category.count || 0) > 0);
    } else if (filterStatus === "inactive") {
      filtered = filtered.filter((category) => (category.count || 0) === 0);
    }

    return filtered;
  }, [categories, searchQuery, filterStatus]);

  const handleCreate = () => {
    setEditingCategory(null);
    setShowForm(true);
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setShowForm(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingCategory) return;

    try {
      await deleteCategoryMutation.mutateAsync(deletingCategory.id);
      setDeletingCategory(null);
    } catch (error) {
      console.error('Fehler beim Löschen der Kategorie:', error);
      alert(error instanceof Error ? error.message : 'Fehler beim Löschen der Kategorie');
    }
  };

  const handleDeleteCancel = () => {
    setDeletingCategory(null);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingCategory(null);
  };

  const handleToggleVisibility = (category: Category) => {
    // Por ahora, solo editamos la categoría
    // En el futuro, podríamos agregar un campo isActive
    handleEdit(category);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Kategorien werden geladen...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600">Fehler beim Laden der Kategorien</p>
          <button
            onClick={() => router.refresh()}
            className="mt-4 px-4 py-2 bg-brand-500 text-white rounded-lg"
          >
            Erneut versuchen
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-background-cream">
      {/* HeaderNav fijo */}
      <div className="fixed top-[80px] left-0 right-0 flex justify-between items-center p-4 bg-white border-b border-gray-200 z-40 safe-area-top pt-[calc(1rem+env(safe-area-inset-top))] 
                      animate-slide-down gpu-accelerated">
        <div className="flex items-center gap-2 justify-between w-full pt-[10px] px-4 touch-target">
          <button
            className="flex items-center gap-2 cursor-pointer transition-interactive gpu-accelerated active:scale-95"
            onClick={() => router.back()}
            aria-label="Zurück"
            tabIndex={0}
          >
            <span className="text-[18px] font-semibold transition-interactive">Alle Kategorien</span>
          </button>
          <div className="flex items-center gap-2">
            <button
              className="flex items-center gap-2 cursor-pointer bg-brand-600 rounded-full p-2 
                       transition-interactive gpu-accelerated hover:scale-105 active:scale-95"
              onClick={handleCreate}
              aria-label="Neue Kategorie hinzufügen"
              tabIndex={0}
            >
              <Plus className="w-6 h-6 text-white transition-interactive" />
            </button>
          </div>
        </div>
      </div>

      {/* Barra de búsqueda fija */}
      <div className="fixed top-[140px] left-0 right-0 p-4 flex gap-4 items-center justify-center bg-background-cream border-b border-gray-100 z-40 
                      animate-slide-down gpu-accelerated">
        <div className="animate-stagger-1 w-full max-w-md">
          <SearchInput
            placeholder="Kategorie suchen…"
            className="w-full h-[54px] transition-interactive gpu-accelerated"
            value={searchQuery}
            onChange={setSearchQuery}
          />
        </div>
      </div>

      {/* Filtros fijos */}
      <CategoryFilters
        categories={categories}
        selectedStatus={filterStatus}
        onStatusChange={setFilterStatus}
      />

      {/* Contenedor con scroll */}
      <FixedHeaderContainer>
        <div className="p-4 pb-32 lg:p-0 lg:pb-8">
          {filteredCategories.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-base font-medium">
                {searchQuery
                  ? `Keine Kategorien für "${searchQuery}" gefunden`
                  : "Keine Kategorien verfügbar"}
              </p>
            </div>
          ) : (
            <div className="space-y-3 animate-fade-in-scale">
              {filteredCategories.map((category, index) => (
                <div
                  key={category.id}
                  className="animate-slide-up-fade gpu-accelerated"
                  style={{
                    animationDelay: `${index * 0.05}s`,
                    animationFillMode: 'both'
                  }}
                >
                  <CategoryCard
                    category={category}
                    onEdit={handleEdit}
                    onToggleVisibility={handleToggleVisibility}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </FixedHeaderContainer>

      {/* Botón fijo para crear categoría */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-background-cream border-t border-gray-200 safe-area-bottom">
        <FooterAddCategory
          onAddCategory={handleCreate}
          isLoading={false}
          buttonText="Neue Kategorie erstellen"
        />
      </div>

      {/* Form Modal */}
      {showForm && (
        <CategoryForm
          category={editingCategory}
          onClose={handleFormClose}
          onSuccess={handleFormClose}
        />
      )}

      {/* Delete Confirmation Modal */}
      <DeleteCategoryModal
        isOpen={!!deletingCategory}
        categoryName={deletingCategory?.name || ""}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        isLoading={deleteCategoryMutation.isPending}
      />
    </div>
  );
}

