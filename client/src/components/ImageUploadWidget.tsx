// src/components/ImageUploadWidget.tsx
import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { uploadFileToCloudinary } from '../services/media.service';


interface ImageUploadWidgetProps {
  label: string;
  currentImageUrl?: string; // URL de la imagen actual (para previsualización)
  onImageUploadSuccess: (url: string, file: File) => void; // <-- Sigue esperando 'file: File'
  onError?: (message: string) => void; // Callback para errores
  disabled?: boolean; // Para deshabilitar la subida (ej. durante un guardado general)
}

export const ImageUploadWidget: React.FC<ImageUploadWidgetProps> = ({
  label,
  currentImageUrl,
  onImageUploadSuccess,
  onError,
  disabled,
}) => {
  const { token } = useAuth(); // Necesitamos el token del administrador
  const fileInputRef = useRef<HTMLInputElement>(null); // Referencia al input de tipo file
  const [loading, setLoading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(currentImageUrl);

  // Actualizar la previsualización si cambia la URL inicial
  React.useEffect(() => {
    setPreviewUrl(currentImageUrl);
  }, [currentImageUrl]);


  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]; // Obtener el primer archivo seleccionado

    if (!file) {
      setUploadError('No se seleccionó ningún archivo.');
      if (onError) onError('No se seleccionó ningún archivo.');
      return;
    }

    // Validar tipo de archivo: ¡AHORA ACEPTA IMAGEN Y VIDEO!
    if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
        setUploadError('Formato de archivo no soportado. Por favor, sube una imagen o un video.');
        if (onError) onError('Formato de archivo no soportado. Por favor, sube una imagen o un video.');
        // Limpiar el input para permitir seleccionar de nuevo si el archivo era inválido
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
    }

    setLoading(true);
    setUploadError(null);

    try {
      if (!token) {
        throw new Error('No estás autenticado para subir imágenes.');
      }
      const result = await uploadFileToCloudinary(token, file);
      // Cloudinary devuelve la URL en la propiedad 'secure_url'
      onImageUploadSuccess(result.secure_url, file); // <-- Pasamos 'file' para que el padre determine el tipo
      setPreviewUrl(result.secure_url); // Actualizar la previsualización
    } catch (err: any) {
      setUploadError(err.message || 'Fallo al subir el archivo.');
      if (onError) onError(err.message || 'Fallo al subir el archivo.');
    } finally {
      setLoading(false);
      // Limpiar el input file después de la subida (éxito o fallo) para permitir nueva selección
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemoveImage = () => {
    setPreviewUrl(undefined);
    onImageUploadSuccess('', new File([], '')); // Notificar con URL vacía y un File vacío
    if (fileInputRef.current) fileInputRef.current.value = ''; // Limpiar input file
  };

  return (
    <div className="image-upload-widget">
      <label>{label}</label>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        disabled={loading || disabled}
        accept="image/*,video/*" // <-- ¡CAMBIO AQUÍ! Acepta imágenes y videos
      />

      {loading && (
        <div className="upload-spinner">
          <div className="loader"></div> {/* Un simple spinner CSS */}
          <span>Subiendo...</span>
        </div>
      )}

      {uploadError && <p className="error-message">{uploadError}</p>}

      {previewUrl && !loading && (
        <div className="image-preview-container">
          {/* Determinar si es imagen o video para la previsualización */}
          {previewUrl.match(/\.(jpeg|jpg|gif|png|webp)$/i) ? ( // Simple comprobación de extensión
            <img src={previewUrl} alt="Previsualización" className="image-preview" />
          ) : (
            <video src={previewUrl} controls className="image-preview" />
          )}
          <button type="button" className="remove-image-button" onClick={handleRemoveImage} disabled={disabled}>
            ✕
          </button>
        </div>
      )}

      {/* Si no hay preview y no está cargando ni hay error, muestra un mensaje amigable */}
      {!previewUrl && !loading && !uploadError && <p className="no-image-selected">Ningún archivo seleccionado.</p>}
    </div>
  );
};