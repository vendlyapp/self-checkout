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
import { Plus, ArrowLeftIcon } from "lucide-react";
import { Loader } from "@/components/ui/Loader";
import { devError } from "@/lib/utils/logger";

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

  // Separar la categoría default del resto
  const defaultCategory = useMemo(
    () => categories.find((c) => c.name === 'Allgemein') ?? null,
    [categories]
  );
  const nonDefaultCategories = useMemo(
    () => categories.filter((c) => c.name !== 'Allgemein'),
    [categories]
  );

  // Filtrar categorías según búsqueda y estado (sin incluir la default)
  const filteredCategories = useMemo(() => {
    let filtered = [...nonDefaultCategories];

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
  }, [nonDefaultCategories, searchQuery, filterStatus]);

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
      devError("Fehler beim Löschen der Kategorie:", error);
      alert(error instanceof Error ? error.message : "Fehler beim Löschen der Kategorie");
    }
  };

  const handleDeleteCancel = () => {
    setDeletingCategory(null);
  };

  const otherCategoriesForDelete = useMemo(() => {
    if (!deletingCategory) return [];
    return categories
      .filter((c) => c.id !== deletingCategory.id && c.name !== 'Allgemein')
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
      devError('Fehler beim Aktivieren der Kategorie:', error);
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
      devError('Fehler beim Deaktivieren der Kategorie:', error);
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
            type="button"
            className="mt-4 cursor-pointer px-4 py-3 min-h-[44px] bg-brand-500 text-white rounded-lg font-medium hover:bg-brand-600 transition-colors"
          >
            Erneut versuchen
          </button>
        </div>
      </div>
    );
  }

  // Si es standalone, usar sticky headers (no fixed para evitar problemas con gpu-accelerated)
  if (isStandalone) {
    return (
      <>
        {/* HeaderNav sticky */}
        <div className="sticky top-0 z-40 flex justify-between items-center p-4 bg-white border-b border-gray-200
                        safe-area-top pt-[calc(1rem+env(safe-area-inset-top))]">
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

        {/* Barra de búsqueda sticky */}
        <div className="sticky top-[60px] z-40 p-4 flex gap-4 items-center justify-center bg-background-cream border-b border-gray-100">
          <div className="w-full max-w-md">
            <SearchInput
              placeholder="Kategorie suchen…"
              className="w-full h-[54px] transition-interactive gpu-accelerated"
              value={searchQuery}
              onChange={setSearchQuery}
            />
          </div>
        </div>

        {/* Filtros sticky */}
        <CategoryFilters
          categories={nonDefaultCategories}
          selectedStatus={filterStatus}
          onStatusChange={setFilterStatus}
        />

        {/* Lista — los sticky headers ya ocupan espacio, no necesita padding especial */}
        <div className="pb-32">
          <div className={`px-4 pt-4 md:px-6 ${className}`}>
            {isLoading ? (
              <div className="text-center py-12">
                <Loader size="md" className="mx-auto" />
                <p className="mt-4 text-base text-gray-500 font-medium">
                  Kategorien werden geladen...
                </p>
              </div>
            ) : (
              <div className="space-y-3 animate-fade-in-scale">
                {/* Categoría default — siempre visible, solo lectura */}
                {defaultCategory && (
                  <div className="animate-slide-up-fade gpu-accelerated">
                    <CategoryCard
                      category={defaultCategory}
                      isDefault={true}
                      onEdit={() => {}}
                    />
                  </div>
                )}

                {/* Resto de categorías filtradas */}
                {filteredCategories.map((category, index) => (
                  <div
                    key={category.id}
                    className="animate-slide-up-fade gpu-accelerated"
                    style={{
                      animationDelay: `${(index + 1) * 0.05}s`,
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

                {/* Estado vacío: sin categorías personalizadas */}
                {!defaultCategory && nonDefaultCategories.length === 0 && !searchQuery && (
                  <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-100 mb-4">
                      <Plus className="h-8 w-8 text-brand-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Erstellen Sie Ihre erste Kategorie
                    </h3>
                    <p className="mt-2 text-sm text-gray-500 max-w-sm">
                      Kategorien helfen Ihnen, Ihre Produkte zu ordnen.
                    </p>
                    <button
                      type="button"
                      onClick={handleCreate}
                      className="mt-6 cursor-pointer inline-flex items-center gap-2 rounded-xl bg-brand-500 px-5 py-3 min-h-[44px] text-sm font-semibold text-white hover:bg-brand-600 shadow-lg shadow-brand-500/25 transition-colors"
                    >
                      <Plus className="h-5 w-5" />
                      Kategorie erstellen
                    </button>
                  </div>
                )}

                {filteredCategories.length === 0 && nonDefaultCategories.length > 0 && (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">
                      {searchQuery
                        ? `Keine Kategorien für "${searchQuery}" gefunden`
                        : "Keine Kategorien verfügbar"}
                    </p>
                  </div>
                )}
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
              <Loader size="sm" className="mx-auto" />
              <p className="mt-2 text-sm text-muted-foreground">
                Kategorien werden geladen...
              </p>
            </div>
          ) : (
            <div className="space-y-3 animate-fade-in-scale">
              {/* Categoría default — siempre visible, solo lectura */}
              {defaultCategory && (
                <div className="animate-slide-up-fade gpu-accelerated">
                  <CategoryCard
                    category={defaultCategory}
                    isDefault={true}
                    onEdit={() => {}}
                  />
                </div>
              )}

              {filteredCategories.map((category, index) => (
                <div
                  key={category.id}
                  className="animate-slide-up-fade gpu-accelerated"
                  style={{
                    animationDelay: `${(index + 1) * 0.05}s`,
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

              {filteredCategories.length === 0 && !defaultCategory && (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-base font-medium">
                    {searchQuery
                      ? `Keine Kategorien für "${searchQuery}" gefunden`
                      : "Keine Kategorien verfügbar"}
                  </p>
                </div>
              )}
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
