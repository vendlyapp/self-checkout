import React, { useState, useEffect, useCallback } from 'react'
import ProductsList from '../dashboard/charge/ProductsList';
import { fetchProducts, updateCategoryCounts, Product } from '../dashboard/products_list/data/mockProducts';
import { getIcon } from '../dashboard/products_list/data/iconMap';
import { useCartStore } from '@/lib/stores/cartStore';
import FixedHeaderContainerUser from '../dashboard/charge/FixedHeaderContainerUser';

const DashboardUser = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCartStore();

  // Obtener filtros de categorías con contadores reales
  const productsListFilters = updateCategoryCounts().map(category => {
    return {
      id: category.id,
      label: category.name,
      icon: getIcon(category.icon),
      count: category.count
    };
  });

  // Cargar productos iniciales
  const loadInitialProducts = useCallback(async () => {
    setLoading(true);
    try {
      const initialProducts = await fetchProducts();
      setProducts(initialProducts);
    } catch (error) {
      console.error('Error al cargar productos:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Manejar cambio de filtros
  const handleFilterChange = async (filters: string[]) => {
    setSelectedFilters(filters);
    setLoading(true);
    
    try {
      const categoryId = filters.length > 0 ? filters[0] : 'all';
      const filteredProducts = await fetchProducts({
        categoryId,
        searchTerm: searchQuery
      });
      setProducts(filteredProducts);
    } catch (error) {
      console.error('Error al filtrar productos:', error);
    } finally {
      setLoading(false);
    }
  };

  // Manejar búsqueda
  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    setLoading(true);
    
    try {
      const categoryId = selectedFilters.length > 0 ? selectedFilters[0] : 'all';
      const filteredProducts = await fetchProducts({
        categoryId,
        searchTerm: query
      });
      setProducts(filteredProducts);
    } catch (error) {
      console.error('Error al buscar productos:', error);
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
    console.log('Scan button clicked');
  };

  // Cargar productos al montar el componente
  useEffect(() => {
    loadInitialProducts();
  }, [loadInitialProducts]);

  return (
    <FixedHeaderContainerUser
      searchQuery={searchQuery}
      onSearch={handleSearch}
      selectedFilters={selectedFilters}
      onFilterChange={handleFilterChange}
      userFilters={productsListFilters}
      onScanQR={handleScanQR}
    >
      {/* Lista de productos */}
      <ProductsList
        products={products}
        onAddToCart={handleAddToCart}
        loading={loading}
        searchQuery={searchQuery}
      />
    </FixedHeaderContainerUser>
  )
}

export default DashboardUser