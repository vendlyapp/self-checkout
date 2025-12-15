"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Grid3X3, Edit, Trash2 } from "lucide-react";
import { useDeleteCategory } from "@/hooks/mutations";
import { useCategories } from "@/hooks/queries/useCategories";
import type { Category } from "@/lib/services/categoryService";
import CategoryForm from "./CategoryForm";
import DeleteCategoryModal from "./DeleteCategoryModal";

export default function CategoriesPage() {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);
  const deleteCategoryMutation = useDeleteCategory();

  // Obtener todas las categorías
  const { data: categories = [], isLoading, error } = useCategories();

  const handleCreate = () => {
    setEditingCategory(null);
    setShowForm(true);
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setShowForm(true);
  };

  const handleDeleteClick = (category: Category) => {
    setDeletingCategory(category);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingCategory) return;

    try {
      await deleteCategoryMutation.mutateAsync(deletingCategory.id);
      setDeletingCategory(null);
    } catch (error) {
      console.error('Error al eliminar categoría:', error);
      alert(error instanceof Error ? error.message : 'Error al eliminar categoría');
    }
  };

  const handleDeleteCancel = () => {
    setDeletingCategory(null);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingCategory(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando categorías...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600">Error al cargar categorías</p>
          <button
            onClick={() => router.refresh()}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen p-4 lg:p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kategorien</h1>
          <p className="text-gray-600 mt-1">Verwalten Sie Ihre Produktkategorien</p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors shadow-sm hover:shadow-md"
        >
          <Plus className="w-5 h-5" />
          Neue Kategorie
        </button>
      </div>

      {/* Categories Grid */}
      {categories.length === 0 ? (
        <div className="text-center py-12">
          <Grid3X3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">No hay categorías creadas</p>
          <button
            onClick={handleCreate}
            className="px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors shadow-sm hover:shadow-md"
          >
            Erste Kategorie erstellen
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((category) => (
            <div
              key={category.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {category.name}
                  </h3>
                  {category.color && (
                    <div
                      className="w-6 h-6 rounded-full border border-gray-300"
                      style={{ backgroundColor: category.color }}
                    />
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(category)}
                    className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                    title="Bearbeiten"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteClick(category)}
                    className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                    title="Löschen"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="text-sm text-gray-500">
                {category.count || 0} Produkte
              </div>
            </div>
          ))}
        </div>
      )}

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

