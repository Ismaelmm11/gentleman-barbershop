// src/management/products/ProductManagementPanel.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  getAllProducts, // Usaremos esta para la paginación
  createProduct,
  updateProduct,
  deleteProduct,
} from '../services/product.services';
import { getAllBrands } from '../services/brands.service';
import { getAllCategories } from '../services/categories.service';
import { ImageUploadWidget } from '../components/ImageUploadWidget';

// Interfaz para ProductMedia
interface ProductMedia {
  id?: number;
  url: string;
  es_principal: boolean;
  tipo: 'IMAGEN' | 'VIDEO';
}

export const ProductManagementPanel: React.FC = () => {
  const { token } = useAuth();
  const [products, setProducts] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<any | null>(null);

  // Estados del formulario
  const [productName, setProductName] = useState('');
  const [productDescription, setProductDescription] = useState('');
  const [productPrice, setProductPrice] = useState<number | ''>('');
  const [productBrandId, setProductBrandId] = useState<number | ''>('');
  const [productCategoryId, setProductCategoryId] = useState<number | ''>('');
  const [productMedia, setProductMedia] = useState<ProductMedia[]>([]);
  const [formError, setFormError] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  // --- ESTADOS PARA LA PAGINACIÓN ---
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(10); // Productos por página, puedes ajustar este valor
  const [totalProducts, setTotalProducts] = useState(0); // Total de productos devueltos por la API
  const totalPages = Math.ceil(totalProducts / productsPerPage); // Calculamos el total de páginas

  useEffect(() => {
    if (token) {
      // Pasamos currentPage y productsPerPage a fetchData
      fetchData(currentPage, productsPerPage);
    }
  }, [token, currentPage, productsPerPage]); // Añadimos currentPage y productsPerPage como dependencias

  const fetchData = async (page: number, limit: number) => { // Recibe page y limit como argumentos
    setLoading(true);
    setError(null);
    try {
      const [productsResponse, brandsData, categoriesData] = await Promise.all([
        // Pasamos los parámetros de paginación a getAllProducts
        getAllProducts({ page: page, limit: limit }),
        getAllBrands(),
        getAllCategories(),
      ]);
      setProducts(productsResponse.data);
      setTotalProducts(productsResponse.total); // Asumiendo que tu API devuelve 'total'
      setBrands(brandsData);
      setCategories(categoriesData);
    } catch (err: any) {
      setError(err.message || 'Error al cargar los datos.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setIsEditing(false);
    setCurrentProduct(null);
    setProductName('');
    setProductDescription('');
    setProductPrice('');
    setProductBrandId('');
    setProductCategoryId('');
    setProductMedia([]);
    setFormError(null);
    setFormLoading(false);
  };

  const handleEditClick = (product: any) => {
    setIsEditing(true);
    setCurrentProduct(product);
    setProductName(product.nombre);
    setProductDescription(product.descripcion);
    setProductPrice(product.precio);
    setProductBrandId(product.id_marca);
    setProductCategoryId(product.id_categoria);
    setProductMedia(product.media || []);
    setFormError(null);
  };

  const handleDeleteProduct = async (id: number) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este producto? Esta acción es irreversible.')) {
      setLoading(true);
      setError(null);
      try {
        await deleteProduct(token!, id);
        // Al eliminar, volvemos a la primera página o a la actual si no está vacía
        fetchData(currentPage, productsPerPage); 
      } catch (err: any) {
        setError(err.message || 'Error al eliminar el producto.');
        setLoading(false);
      }
    }
  };

  const handleCreateOrUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormLoading(true);

    if (!productName.trim() || !productDescription.trim() || productPrice === '' || productBrandId === '' || productCategoryId === '') {
      setFormError('Por favor, completa todos los campos del producto.');
      setFormLoading(false);
      return;
    }
    if (productMedia.length === 0) {
      setFormError('Debes subir al menos un medio (imagen o video) para el producto.');
      setFormLoading(false);
      return;
    }
    const principalMediaCount = productMedia.filter(m => m.es_principal).length;
    if (principalMediaCount === 0) {
      setFormError('Debes marcar al menos un medio como principal.');
      setFormLoading(false);
      return;
    }
    if (principalMediaCount > 1) {
      setFormError('Solo puede haber un medio principal.');
      setFormLoading(false);
      return;
    }

    // Preparar los datos del producto
    const productData = {
      nombre: productName,
      descripcion: productDescription,
      precio: Number(productPrice),
      id_marca: Number(productBrandId),
      id_categoria: Number(productCategoryId),
    };

    try {
      if (isEditing && currentProduct) {
        const mediaToAdd: ProductMedia[] = [];
        const mediaIdsToDelete: number[] = [];

        const currentMediaIds = new Set(currentProduct.media.map((m: any) => m.id));
        const updatedMediaIds = new Set(productMedia.map(m => m.id).filter(id => id !== undefined));

        currentProduct.media.forEach((m: any) => {
          if (!updatedMediaIds.has(m.id)) {
            mediaIdsToDelete.push(m.id);
          }
        });

        productMedia.forEach(m => {
          if (m.id === undefined) {
            mediaToAdd.push(m);
          }
        });

        await updateProduct(token!, currentProduct.id, {
          ...productData,
          media_a_anadir: mediaToAdd.length > 0 ? mediaToAdd : undefined,
          media_ids_a_eliminar: mediaIdsToDelete.length > 0 ? mediaIdsToDelete : undefined,
        });

      } else {
        await createProduct(token!, {
          ...productData,
          media: productMedia,
        });
      }
      resetForm();
      // Tras crear/actualizar, volvemos a la primera página para ver el nuevo producto
      setCurrentPage(1); 
      fetchData(1, productsPerPage); 
    } catch (err: any) {
      setFormError(err.message || 'Error al guardar el producto.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleMediaUploadSuccess = (url: string, file: File) => {
    const tipo = file.type.startsWith('image/') ? 'IMAGEN' : file.type.startsWith('video/') ? 'VIDEO' : 'IMAGEN';
    const newMedia: ProductMedia = {
      url,
      es_principal: productMedia.length === 0,
      tipo,
    };
    setProductMedia(prev => [...prev, newMedia]);
    setFormError(null);
  };

  const handleMediaUploadError = (message: string) => {
    setFormError(message);
  };

  const handleRemoveMedia = (index: number) => {
    const updatedMedia = productMedia.filter((_, i) => i !== index);
    if (productMedia[index].es_principal && updatedMedia.length > 0) {
      updatedMedia[0].es_principal = true;
    }
    setProductMedia(updatedMedia);
    setFormError(null);
  };

  const handleSetPrincipalMedia = (index: number) => {
    const updatedMedia = productMedia.map((media, i) => ({
      ...media,
      es_principal: i === index,
    }));
    setProductMedia(updatedMedia);
  };

  // --- Manejadores de Paginación ---
  const handlePrevPage = () => {
    setCurrentPage(prev => Math.max(1, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(totalPages, prev + 1));
  };


  if (!token) {
    return <div className="error-message">Debes iniciar sesión como administrador para gestionar productos.</div>;
  }

  if (loading) {
    return <div className="loading-spinner">Cargando productos, marcas y categorías...</div>;
  }

  if (error) {
    return <div className="error-message">Error: {error}</div>;
  }

  return (
    <div className="management-panel">
      <h3>Gestión de Productos</h3>

      <div className="control-buttons-container">
        <button className="button-primary btn" onClick={resetForm}>
          <span>{isEditing ? 'Cancelar Edición' : 'Nuevo Producto'}</span>
        </button>
      </div>

      <table className="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Marca</th>
            <th>Categoría</th>
            <th>Precio</th>
            <th>Principal</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {products.length === 0 && !loading ? (
            <tr>
              <td colSpan={7} style={{ textAlign: 'center' }}>No hay productos registrados.</td>
            </tr>
          ) : (
            products.map((product) => (
              <tr key={product.id}>
                <td>{product.id}</td>
                <td>{product.nombre}</td>
                <td>{brands.find(b => b.id === product.id_marca)?.nombre || 'N/A'}</td>
                <td>{categories.find(c => c.id === product.id_categoria)?.nombre || 'N/A'}</td>
                <td>{product.precio}€</td>
                <td>
                  {product.media && product.media.some((m: any) => m.es_principal) ? (
                    product.media.find((m: any) => m.es_principal).tipo === 'IMAGEN' ? (
                      <img
                        src={product.media.find((m: any) => m.es_principal).url}
                        alt="Principal"
                        style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }}
                      />
                    ) : (
                      <video
                        src={product.media.find((m: any) => m.es_principal).url}
                        controls
                        style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }}
                      />
                    )
                  ) : (
                    <span>-</span>
                  )}
                </td>
                <td className="table-actions">
                  <button className="action-button" onClick={() => handleEditClick(product)}>
                    ✏️
                  </button>
                  <button className="action-button delete" onClick={() => handleDeleteProduct(product.id)}>
                    🗑️
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* --- CONTROLES DE PAGINACIÓN --- */}
      {totalPages > 1 && (
        <div className="pagination-controls">
          <button
            className="pagination-button"
            onClick={handlePrevPage}
            disabled={currentPage === 1 || formLoading}
          >
            Anterior
          </button>
          <span>Página {currentPage} de {totalPages}</span>
          <button
            className="pagination-button"
            onClick={handleNextPage}
            disabled={currentPage === totalPages || formLoading}
          >
            Siguiente
          </button>
        </div>
      )}

      {/* Formulario de creación/edición */}
      <form onSubmit={handleCreateOrUpdateProduct} className="creation-form">
        <h4>{isEditing ? `Editar Producto: ${currentProduct?.nombre}` : 'Crear Nuevo Producto'}</h4>
        <div className="form-group">
          <label htmlFor="product-name">Nombre:</label>
          <input
            type="text"
            id="product-name"
            className="text-input"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            disabled={formLoading}
          />
        </div>
        <div className="form-group">
          <label htmlFor="product-description">Descripción:</label>
          <textarea
            id="product-description"
            className="text-input"
            rows={3}
            value={productDescription}
            onChange={(e) => setProductDescription(e.target.value)}
            disabled={formLoading}
          ></textarea>
        </div>
        <div className="form-group">
          <label htmlFor="product-price">Precio (€):</label>
          <input
            type="number"
            id="product-price"
            className="text-input"
            value={productPrice}
            onChange={(e) => setProductPrice(Number(e.target.value))}
            step="0.01"
            disabled={formLoading}
          />
        </div>
        <div className="form-group">
          <label htmlFor="product-brand">Marca:</label>
          <select
            id="product-brand"
            className="select-input"
            value={productBrandId}
            onChange={(e) => setProductBrandId(Number(e.target.value))}
            disabled={formLoading}
          >
            <option value="">Selecciona una marca</option>
            {brands.map(brand => (
              <option key={brand.id} value={brand.id}>{brand.nombre}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="product-category">Categoría:</label>
          <select
            id="product-category"
            className="select-input"
            value={productCategoryId}
            onChange={(e) => setProductCategoryId(Number(e.target.value))}
            disabled={formLoading}
          >
            <option value="">Selecciona una categoría</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>{category.nombre}</option>
            ))}
          </select>
        </div>

        <div className="form-group product-media-group">
          <label>Medios del Producto (Imágenes/Videos):</label>
          <ImageUploadWidget
            label="Añadir nuevo medio:"
            onImageUploadSuccess={handleMediaUploadSuccess}
            onError={handleMediaUploadError}
            disabled={formLoading}
          />
          <div className="media-preview-grid">
            {productMedia.length === 0 ? (
              <p className="no-media-message">No se han añadido medios aún.</p>
            ) : (
              productMedia.map((media, index) => (
                <div key={media.id || index} className={`media-item ${media.es_principal ? 'principal' : ''}`}>
                  {media.tipo === 'IMAGEN' ? (
                    <img src={media.url} alt={`Medio ${index + 1}`} />
                  ) : (
                    <video src={media.url} controls />
                  )}
                  <button
                    type="button"
                    className="remove-media-button"
                    onClick={() => handleRemoveMedia(index)}
                    title="Eliminar medio"
                    disabled={formLoading}
                  >
                    ✕
                  </button>
                  {!media.es_principal && (
                    <button
                      type="button"
                      className="set-principal-button"
                      onClick={() => handleSetPrincipalMedia(index)}
                      title="Marcar como principal"
                      disabled={formLoading}
                    >
                      ⭐
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {formError && <p className="error-message">{formError}</p>}
        <div className="form-buttons-container">
          <button type="submit" className="button-primary btn" disabled={formLoading}>
            <span>{formLoading ? 'Guardando...' : (isEditing ? 'Guardar Cambios' : 'Crear Producto')}</span>
          </button>
        </div>
      </form>
    </div>
  );
};