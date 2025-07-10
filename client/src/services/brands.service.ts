// src/services/brands.service.ts

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

interface BrandData {
  nombre: string;
  url_imagen?: string;
}

/**
 * Obtiene todas las marcas. (Público)
 */
export const getAllBrands = async () => {
  const response = await fetch(`${API_URL}/brands`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Error al obtener las marcas.');
  }
  return response.json();
};

/**
 * Crea una nueva marca. (ADMIN protegido)
 */
export const createBrand = async (token: string, brandData: BrandData) => {
  const response = await fetch(`${API_URL}/brands`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(brandData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Error al crear la marca.');
  }
  return response.json();
};

/**
 * Actualiza una marca existente. (ADMIN protegido)
 */
export const updateBrand = async (token: string, id: number, brandData: Partial<BrandData>) => {
  const response = await fetch(`${API_URL}/brands/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(brandData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Error al actualizar la marca.');
  }
  return response.json();
};

/**
 * Elimina una marca. (ADMIN protegido)
 */
export const deleteBrand = async (token: string, id: number) => {
  const response = await fetch(`${API_URL}/brands/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Error al eliminar la marca.');
  }
  return response.json();
};