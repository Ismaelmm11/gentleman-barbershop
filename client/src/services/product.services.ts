// src/services/products.service.ts

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// DTOs y Interfaces de frontend (sin cambios, ya estaban bien)
interface ProductMediaDto {
  id?: number;
  url: string;
  es_principal: boolean;
  tipo: 'IMAGEN' | 'VIDEO';
}

interface CreateProductDtoFrontend {
  nombre: string;
  descripcion: string;
  precio: number;
  id_marca: number;
  id_categoria: number;
  media: ProductMediaDto[];
}

interface UpdateProductDtoFrontend {
  nombre?: string;
  descripcion?: string;
  precio?: number;
  id_marca?: number;
  id_categoria?: number;
  media_a_anadir?: ProductMediaDto[];
  media_ids_a_eliminar?: number[];
}

interface FindAllProductsQueryDtoFrontend {
  limit?: number; // <-- Ya incluido
  page?: number;  // <-- Ya incluido
  nombre?: string;
  id_marca?: number;
  id_categoria?: number;
}

/**
 * Obtiene todos los productos con opciones de filtro y paginación. (Público)
 * La función ya está preparada para recibir los parámetros de paginación en el objeto 'query'.
 */
export const getAllProducts = async (query: FindAllProductsQueryDtoFrontend) => {
  const params = new URLSearchParams();
  if (query.limit) params.append('limit', String(query.limit)); // <-- Usa query.limit
  if (query.page) params.append('page', String(query.page));   // <-- Usa query.page
  if (query.nombre) params.append('nombre', query.nombre);
  if (query.id_marca) params.append('id_marca', String(query.id_marca));
  if (query.id_categoria) params.append('id_categoria', String(query.id_categoria));

  const response = await fetch(`${API_URL}/products?${params.toString()}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Error al obtener los productos.');
  }
  return response.json();
};

/**
 * Crea un nuevo producto. (ADMIN protegido)
 */
export const createProduct = async (token: string, productData: CreateProductDtoFrontend) => {
  const response = await fetch(`${API_URL}/products`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(productData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Error al crear el producto.');
  }
  return response.json();
};

/**
 * Actualiza un producto existente. (ADMIN protegido)
 */
export const updateProduct = async (token: string, id: number, productData: UpdateProductDtoFrontend) => {
  const response = await fetch(`${API_URL}/products/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(productData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Error al actualizar el producto.');
  }
  return response.json();
};

/**
 * Elimina un producto. (ADMIN protegido)
 */
export const deleteProduct = async (token: string, id: number) => {
  const response = await fetch(`${API_URL}/products/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Error al eliminar el producto.');
  }
  return response.json();
};