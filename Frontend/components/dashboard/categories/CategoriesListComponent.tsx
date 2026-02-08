"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useDeleteCategory, useUpdateCategory } from "@/hooks/mutations";
import { useCategories } from "@/hooks/queries/useCategories";
import type { Category } from "@/lib/services/categoryService";
import DeleteCategoryModal from "./DeleteCategoryModal";
import ToggleCategoryModal from "./ToggleCategoryModal";
import CategoryCard from "./CategoryCard";
import CategoryFilters, { CategoryFilterStatus } from "./CategoryFilters";
import { SearchInput } from "@/components/ui/search-input";
import FixedHeaderContainer from "@/components/dashboard/products_list/FixedHeaderContainer";
import { Plus, ArrowLeftIcon } from "lucide-react";

interface CategoriesListComponentProps {
  isStandalone?: boolean; // Si es true, es la página dedicada. Si es false, es parte del dashboard
  className?: string;
  maxHeight?: string; // Altura máxima para el contenedor con scroll
}

export default function CategoriesListComponent({
  isStandalone = false,
  className = "",
  maxHeight = "100vh",
}: CategoriesListComponentProps) {
  const router = useRouter();
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);
  const [togglingCategory, setTogglingCategory] = useState<Category | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<CategoryFilterStatus>("all");
  const deleteCategoryMutation = useDeleteCategory();
  const updateCategoryMutation = useUpdateCategory();

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
      filtered = filtered.filter((category) => 
        category.isActive !== undefined ? category.isActive : (category.count || 0) > 0
      );
    } else if (filterStatus === "inactive") {
      filtered = filtered.filter((category) => 
        category.isActive !== undefined ? !category.isActive : (category.count || 0) === 0
      );
    }

    return filtered;
  }, [categories, searchQuery, filterStatus]);

  const handleCreate = () => {
    router.push('/categories/add');
  };

  // Escuchar evento para navegar a la página de crear categoría desde el footer
  useEffect(() => {
    const handleOpenForm = () => {
      router.push('/categories/add');
    };

    window.addEventListener('openCategoryForm', handleOpenForm);
    return () => {
      window.removeEventListener('openCategoryForm', handleOpenForm);
    };
  }, [router]);

  const handleEdit = (category: Category) => {
    // Navegar a la página de edición con el ID de la categoría
    router.push(`/categories/add?id=${category.id}`);
  };

  const handleDeleteRequest = (category: Category) => {
    setDeletingCategory(category);
  };

  const handleDeleteConfirm = async (moveProductsToCategoryId?: string) => {
    if (!deletingCategory) return;

    try {
      await deleteCategoryMutation.mutateAsync(
        moveProductsToCategoryId
          ? { id: deletingCategory.id, moveProductsToCategoryId }
          : deletingCategory.id
      );
      setDeletingCategory(null);
    } catch (error) {
      console.error("Fehler beim Löschen der Kategorie:", error);
      alert(error instanceof Error ? error.message : "Fehler beim Löschen der Kategorie");
    }
  };

  const handleDeleteCancel = () => {
    setDeletingCategory(null);
  };

  const otherCategoriesForDelete = useMemo(() => {
    if (!deletingCategory) return [];
    return categories
      .filter((c) => c.id !== deletingCategory.id)
      .map((c) => ({ id: c.id, name: c.name }));
  }, [categories, deletingCategory?.id]);

  const handleToggleVisibility = (category: Category) => {
    const currentActiveState = category.isActive !== undefined ? category.isActive : true;
    
    // Si está activa, mostrar modal de confirmación para desactivar
    // Si está inactiva, activar directamente sin confirmación
    if (currentActiveState) {
      setTogglingCategory(category);
    } else {
      // Activar directamente sin confirmación
      handleToggleConfirmDirect(category);
    }
  };

  const handleToggleConfirmDirect = async (category: Category) => {
    try {
      await updateCategoryMutation.mutateAsync({
        id: category.id,
        data: { isActive: true },
      });
    } catch (error) {
      console.error('Fehler beim Aktivieren der Kategorie:', error);
      alert(error instanceof Error ? error.message : 'Fehler beim Aktivieren der Kategorie');
    }
  };

  const handleToggleConfirm = async () => {
    if (!togglingCategory) return;

    try {
      await updateCategoryMutation.mutateAsync({
        id: togglingCategory.id,
        data: { isActive: false },
      });
      setTogglingCategory(null);
    } catch (error) {
      console.error('Fehler beim Deaktivieren der Kategorie:', error);
      alert(error instanceof Error ? error.message : 'Fehler beim Deaktivieren der Kategorie');
    }
  };

  const handleToggleCancel = () => {
    setTogglingCategory(null);
  };

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

  // Si es standalone, usar el contenedor fijo (igual que products_list)
  if (isStandalone) {
    return (
      <>
        {/* HeaderNav fijo */}
        <div className="fixed left-0 right-0 flex justify-between items-center p-4 bg-white border-b border-gray-200 z-40 safe-area-top pt-[calc(1rem+env(safe-area-inset-top))] 
                        animate-slide-down gpu-accelerated">
          <div className="flex items-center gap-2 justify-between w-full pt-[10px] px-4 touch-target">
            <button
              className="flex items-center gap-2 cursor-pointer transition-interactive gpu-accelerated active:scale-95"
              onClick={() => router.back()}
              aria-label="Zurück"
              tabIndex={0}
            >
              <ArrowLeftIcon className="w-6 h-6 transition-interactive" />
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
        <div className="fixed top-[60px] left-0 right-0 p-4 flex gap-4 items-center justify-center bg-background-cream border-b border-gray-100 z-40 
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
          <div className={`p-4 pb-32 lg:p-0 lg:pb-8 ${className}`}>
            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-500 mx-auto"></div>
                <p className="mt-4 text-base text-gray-500 font-medium">
                  Kategorien werden geladen...
                </p>
              </div>
            ) : filteredCategories.length > 0 ? (
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
                      onDelete={handleDeleteRequest}
                    />
                  </div>
                ))}
              </div>
            ) : !searchQuery && categories.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center animate-fade-in-scale">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-100 mb-4">
                  <Plus className="h-8 w-8 text-brand-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Erstellen Sie Ihre erste Kategorie
                </h3>
                <p className="mt-2 text-sm text-gray-500 max-w-sm">
                  Kategorien helfen Ihnen, Ihre Produkte zu ordnen. Erstellen Sie mindestens eine Kategorie, um Produkte anlegen zu können.
                </p>
                <button
                  type="button"
                  onClick={handleCreate}
                  className="mt-6 inline-flex items-center gap-2 rounded-xl bg-brand-500 px-5 py-3 text-sm font-semibold text-white hover:bg-brand-600 shadow-lg shadow-brand-500/25"
                >
                  <Plus className="h-5 w-5" />
                  Kategorie erstellen
                </button>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  {searchQuery
                    ? `Keine Kategorien für "${searchQuery}" gefunden`
                    : "Keine Kategorien verfügbar"}
                </p>
              </div>
            )}
          </div>
        </FixedHeaderContainer>

        {/* Delete Confirmation Modal */}
        <DeleteCategoryModal
          isOpen={!!deletingCategory}
          categoryName={deletingCategory?.name ?? ""}
          categoryId={deletingCategory?.id ?? ""}
          productCount={deletingCategory?.count ?? 0}
          otherCategories={otherCategoriesForDelete}
          onClose={handleDeleteCancel}
          onConfirm={handleDeleteConfirm}
          isLoading={deleteCategoryMutation.isPending}
        />

        {/* Toggle Category Modal */}
        <ToggleCategoryModal
          isOpen={!!togglingCategory}
          categoryName={togglingCategory?.name || ""}
          isCurrentlyActive={togglingCategory?.isActive !== undefined ? togglingCategory.isActive : (togglingCategory?.count || 0) > 0}
          onClose={handleToggleCancel}
          onConfirm={handleToggleConfirm}
          isLoading={updateCategoryMutation.isPending}
        />
      </>
    );
  }

  // Si no es standalone, solo retornar la lista de categorías
  return (
    <div className={`relative ${className}`}>
      {/* Lista de categorías con SCROLL PROPIO */}
      <div
        className={`${
          !isStandalone && maxHeight !== "none" ? "overflow-y-auto" : ""
        }`}
        style={!isStandalone && maxHeight !== "none" ? { maxHeight } : {}}
      >
        <div className="p-4">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500 mx-auto"></div>
              <p className="mt-2 text-sm text-muted-foreground">
                Kategorien werden geladen...
              </p>
            </div>
          ) : filteredCategories.length > 0 ? (
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
                    onDelete={handleDeleteRequest}
                  />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 text-base font-medium">
                  {searchQuery
                    ? `Keine Kategorien für "${searchQuery}" gefunden`
                    : "Keine Kategorien verfügbar"}
                </p>
              </div>
            )}
          </div>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteCategoryModal
        isOpen={!!deletingCategory}
        categoryName={deletingCategory?.name ?? ""}
        categoryId={deletingCategory?.id ?? ""}
        productCount={deletingCategory?.count ?? 0}
        otherCategories={otherCategoriesForDelete}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        isLoading={deleteCategoryMutation.isPending}
      />

        {/* Toggle Category Modal */}
        <ToggleCategoryModal
          isOpen={!!togglingCategory}
          categoryName={togglingCategory?.name || ""}
          isCurrentlyActive={togglingCategory?.isActive !== undefined ? togglingCategory.isActive : (togglingCategory?.count || 0) > 0}
          onClose={handleToggleCancel}
          onConfirm={handleToggleConfirm}
          isLoading={updateCategoryMutation.isPending}
      />
    </div>
  );
}
