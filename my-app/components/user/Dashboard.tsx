import React, { useState, useEffect, useCallback } from "react";
import ProductsList from "../dashboard/charge/ProductsList";
import {
  fetchProducts,
  updateCategoryCounts,
  Product,
} from "../dashboard/products_list/data/mockProducts";
import { getIcon } from "../dashboard/products_list/data/iconMap";
import { useCartStore } from "@/lib/stores/cartStore";
import { SearchInput } from "@/components/ui/search-input";
import { ScanBarcode } from "lucide-react";
import { FilterSlider } from "@/components/Sliders/SliderFIlter";

const DashboardUser = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCartStore();

  // Obtener filtros de categorías con contadores reales
  const productsListFilters = updateCategoryCounts().map((category) => {
    return {
      id: category.id,
      label: category.name,
      icon: getIcon(category.icon),
      count: category.count,
    };
  });

  // Cargar productos iniciales
  const loadInitialProducts = useCallback(async () => {
    setLoading(true);
    try {
      const initialProducts = await fetchProducts();
      setProducts(initialProducts);
    } catch (error) {
      console.error("Error al cargar productos:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Manejar cambio de filtros
  const handleFilterChange = async (filters: string[]) => {
    setSelectedFilters(filters);
    setLoading(true);

    try {
      const categoryId = filters.length > 0 ? filters[0] : "all";
      const filteredProducts = await fetchProducts({
        categoryId,
        searchTerm: searchQuery,
      });
      setProducts(filteredProducts);
    } catch (error) {
      console.error("Error al filtrar productos:", error);
    } finally {
      setLoading(false);
    }
  };

  // Manejar búsqueda
  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    setLoading(true);

    try {
      const categoryId =
        selectedFilters.length > 0 ? selectedFilters[0] : "all";
      const filteredProducts = await fetchProducts({
        categoryId,
        searchTerm: query,
      });
      setProducts(filteredProducts);
    } catch (error) {
      console.error("Error al filtrar productos:", error);
    } finally {
      setLoading(false);
    }
  };

  // Manejar agregar al carrito
  const handleAddToCart = (product: Product, quantity: number) => {
    addToCart(product, quantity);
  };

  // Manejar escaneo QR
  const handleScanQR = () => {
    // TODO: Implementar funcionalidad de escaneo
    console.log("Scan button clicked");
  };

  // Cargar productos al montar el componente
  useEffect(() => {
    loadInitialProducts();
  }, [loadInitialProducts]);

  return (
    <div className="flex flex-col h-full bg-background-cream">
      {/* Header con información de la tienda */}
      <div className="bg-background-cream border-b border-white">
        <div className="flex items-center justify-between w-full px-4 py-3">
          <div className="flex flex-col items-start justify-start">
            <p className="text-sm text-black font-bold text-[21px]">
              Heinigers Hofladen
            </p>
            <p className="text-sm text-gray-500 text-[14px]">
              Grundhof 3, 8305 Dietlikon • ⭐ 4.8
            </p>
          </div>
          <div className="flex items-center justify-end">
            <button className="bg-white text-gray-500 px-4 py-2 rounded-md hover:bg-gray-50 transition-colors">
              Kontakt
            </button>
          </div>
        </div>
      </div>

      {/* Contenedor de búsqueda y filtros */}
      <div className="bg-background-cream">
        {/* Barra de búsqueda y botón QR */}
        <div className="p-4 flex gap-4 items-center justify-center bg-background-cream">
          <SearchInput
            placeholder="Produkte suchen..."
            className="flex-1 max-w-[260px] h-[54px]"
            value={searchQuery}
            onChange={handleSearch}
          />
          <button
            onClick={handleScanQR}
            className="bg-brand-500 cursor-pointer justify-center text-center text-white px-4 py-3 flex items-center text-[18px] font-semibold gap-2 rounded-[30px] w-[124px] h-[54px] hover:bg-brand-600 transition-colors"
          >
            <ScanBarcode className="w-6 h-6" />
            <span className="text-[16px] text-center">Scan</span>
          </button>
        </div>

        {/* Filtros de categorías */}
        <div className="bg-background-cream">
          <FilterSlider
            filters={productsListFilters}
            selectedFilters={selectedFilters}
            onFilterChange={handleFilterChange}
            showCount={true}
            multiSelect={true}
          />
        </div>
      </div>

      {/* Lista de productos con scroll propio */}
      <div className="flex-1 overflow-y-auto">
        <ProductsList
          products={products}
          onAddToCart={handleAddToCart}
          loading={loading}
          searchQuery={searchQuery}
        />
      </div>
    </div>
  );
};

export default DashboardUser;
