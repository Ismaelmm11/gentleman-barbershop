// src/services/categories.service.ts

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

interface CategoryData {
  nombre: string;
  url_imagen?: string;
}

/**
 * Obtiene todas las categorías. (Público)
 */
export const getAllCategories = async () => {
  const response = await fetch(`${API_URL}/categories`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Error al obtener las categorías.');
  }
  return response.json();
};

/**
 * Crea una nueva categoría. (ADMIN protegido)
 */
export const createCategory = async (token: string, categoryData: CategoryData) => {
  const response = await fetch(`${API_URL}/categories`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(categoryData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Error al crear la categoría.');
  }
  return response.json();
};

/**
 * Actualiza una categoría existente. (ADMIN protegido)
 */
export const updateCategory = async (token: string, id: number, categoryData: Partial<CategoryData>) => {
  const response = await fetch(`${API_URL}/categories/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(categoryData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Error al actualizar la categoría.');
  }
  return response.json();
};

/**
 * Elimina una categoría. (ADMIN protegido)
 */
export const deleteCategory = async (token: string, id: number) => {
  const response = await fetch(`${API_URL}/categories/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Error al eliminar la categoría.');
  }
  return response.json();
};