// src/services/media.service.ts

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

/**
 * Sube un archivo a Cloudinary a través de tu API de NestJS.
 * Solo ADMIN puede usar esta función.
 * @param token - El JWT del administrador.
 * @param file - El objeto File de JavaScript (obtenido de un input type="file").
 * @returns La respuesta de Cloudinary (URL, id público, etc.).
 */
export const uploadFileToCloudinary = async (token: string, file: File) => {
  if (!token) {
    throw new Error('No hay token de autenticación. Inicia sesión como administrador.');
  }

  if (!(file instanceof File)) {
    throw new Error('El archivo proporcionado no es un objeto File válido.');
  }

  // FormData es necesario para enviar archivos al backend a través de Multer
  const formData = new FormData();
  formData.append('file', file); // 'file' debe coincidir con el nombre del campo en FileInterceptor('file') en el backend

  const response = await fetch(`${API_URL}/media/upload`, {
    method: 'POST',
    headers: {
      // Multer/FormData gestiona automáticamente el Content-Type: multipart/form-data
      // No lo establezcas manualmente aquí, o Multer podría no procesar el archivo.
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Error al subir la imagen.');
  }

  return response.json(); // La respuesta contendrá la URL del archivo subido
};