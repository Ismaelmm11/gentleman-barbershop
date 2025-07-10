// src/pages/ProductCatalogPage.tsx
import React, { useState, useEffect } from 'react';
import {
  getAllProducts,
} from '../services/product.services';
import { getAllBrands } from '../services/brands.service';
import { getAllCategories } from '../services/categories.service';
import { ProductDetailModal } from '../components/ProductDetailModal';

export const ProductCatalogPage: React.FC = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estados de filtro y paginación
  const [searchTerm, setSearchTerm] = useState('');
  const [minPrice, setMinPrice] = useState<number | ''>('');
  const [maxPrice, setMaxPrice] = useState<number | ''>('');
  const [selectedBrandId, setSelectedBrandId] = useState<number | ''>('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | ''>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(9); // 3 filas x 3 columnas
  const [totalProducts, setTotalProducts] = useState(0); // Total de productos del backend
  const totalPages = Math.ceil(totalProducts / productsPerPage); // Calculamos el total de páginas


  // Estado del modal de detalle
  const [selectedProductForDetail, setSelectedProductForDetail] = useState<any | null>(null);

  useEffect(() => {
    fetchCatalogData(currentPage, productsPerPage); // Pasar parámetros de paginación
  }, [searchTerm, minPrice, maxPrice, selectedBrandId, selectedCategoryId, currentPage, productsPerPage]); // Dependencias para refetch

  const fetchCatalogData = async (page: number, limit: number) => { // Recibir parámetros
    setLoading(true);
    setError(null);
    try {
      // Fetch productos con filtros y paginación
      const productsResponse = await getAllProducts({
        limit: limit, // Usar el límite de productos por página
        page: page,   // Usar la página actual
        nombre: searchTerm,
        // Aquí podrías añadir filtros por precio si tu backend los soporta
        id_marca: selectedBrandId === '' ? undefined : Number(selectedBrandId),
        id_categoria: selectedCategoryId === '' ? undefined : Number(selectedCategoryId),
      });

      setProducts(productsResponse.data);
      setTotalProducts(productsResponse.total); // Asumiendo que el backend envía 'total' de elementos
      // totalPages ya se calcula con el estado totalProducts

      // Fetch marcas y categorías (solo si no están ya cargadas)
      if (brands.length === 0) {
        const brandsData = await getAllBrands();
        setBrands(brandsData);
      }
      if (categories.length === 0) {
        const categoriesData = await getAllCategories();
        setCategories(categoriesData);
      }

    } catch (err: any) {
      setError(err.message || 'Error al cargar el catálogo.');
    } finally {
      setLoading(false);
    }
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setMinPrice('');
    setMaxPrice('');
    setSelectedBrandId('');
    setSelectedCategoryId('');
    setCurrentPage(1); // Resetear a la primera página al limpiar filtros
  };

  const handleShowDetail = (product: any) => {
    setSelectedProductForDetail(product);
  };

  const handleCloseDetailModal = () => {
    setSelectedProductForDetail(null);
  };

  // --- Manejadores de Paginación ---
  const handlePrevPage = () => {
    setCurrentPage(prev => Math.max(1, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(totalPages, prev + 1));
  };


  if (loading) {
    return <div className="loading-spinner">Cargando catálogo...</div>;
  }

  if (error) {
    return <div className="error-message">Error: {error}</div>;
  }

  return (
    <div className="product-catalog-page main-content">
      <h1 className="catalog-title">Nuestro Catálogo</h1>

      {/* Sección de filtros */}
      <div className="filters-container">
        <input
          type="text"
          placeholder="Buscar por nombre..."
          className="text-input"
          value={searchTerm}
          onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
        />
        <select
          className="select-input"
          value={selectedBrandId}
          onChange={(e) => { setSelectedBrandId(Number(e.target.value)); setCurrentPage(1); }}
        >
          <option value="">Todas las Marcas</option>
          {brands.map(brand => (
            <option key={brand.id} value={brand.id}>{brand.nombre}</option>
          ))}
        </select>
        <select
          className="select-input"
          value={selectedCategoryId}
          onChange={(e) => { setSelectedCategoryId(Number(e.target.value)); setCurrentPage(1); }}
        >
          <option value="">Todas las Categorías</option>
          {categories.map(category => (
            <option key={category.id} value={category.id}>{category.nombre}</option>
          ))}
        </select>
        {/* Aquí puedes añadir inputs para el rango de precios si tu backend los soporta */}
        {/* <input type="number" placeholder="Precio Min." className="text-input" value={minPrice} onChange={(e) => { setMinPrice(Number(e.target.value)); setCurrentPage(1); }} /> */}
        {/* <input type="number" placeholder="Precio Max." className="text-input" value={maxPrice} onChange={(e) => { setMaxPrice(Number(e.target.value)); setCurrentPage(1); }} /> */}
        <button className="button-secondary" onClick={handleClearFilters}>Limpiar Filtros</button>
      </div>

      {/* Cuadrícula de productos */}
      {products.length === 0 && !loading ? ( // Mostrar mensaje solo si no hay productos Y no está cargando
        <p className="no-products-message">No se encontraron productos con los filtros aplicados.</p>
      ) : (
        <>
          <div className="product-grid">
            {products.map(product => (
              <div key={product.id} className="product-card">
                <div className="product-image-container">
                  {/* Muestra la imagen principal (es_principal: true) */}
                  {product.media && product.media.length > 0 ? (
                    product.media.find((m: any) => m.es_principal)?.tipo === 'IMAGEN' ? (
                      <img
                        src={product.media.find((m: any) => m.es_principal).url}
                        alt={product.nombre}
                        className="product-main-image"
                      />
                    ) : (
                      // Si el principal es un video, mostrar un thumbnail o un icono de video
                      <div className="video-placeholder">
                         <video src={product.media.find((m: any) => m.es_principal).url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                         <span className="video-icon">▶️</span>
                      </div>
                    )
                  ) : (
                    <div className="product-no-image">Sin imagen</div>
                  )}
                </div>
                <div className="product-info">
                  <h3 className="product-name">{product.nombre}</h3>
                  <p className="product-price">{product.precio}€</p>
                  <button className="btn product-info-btn" onClick={() => handleShowDetail(product)}>
                    <span>Más Info</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* --- CONTROLES DE PAGINACIÓN --- */}
          {totalPages > 1 && (
            <div className="pagination-controls">
              <button
                className="pagination-button"
                onClick={handlePrevPage}
                disabled={currentPage === 1}
              >
                Anterior
              </button>
              <span>Página {currentPage} de {totalPages}</span>
              <button
                className="pagination-button"
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
              >
                Siguiente
              </button>
            </div>
          )}
        </>
      )}

      {/* Modal de detalle del producto */}
      {selectedProductForDetail && (
        <ProductDetailModal
          product={selectedProductForDetail}
          brands={brands}
          categories={categories}
          onClose={handleCloseDetailModal}
        />
      )}
    </div>
  );
};