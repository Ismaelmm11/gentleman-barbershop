// src/management/brands/BrandManagementPanel.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext'; // Necesitamos el token del administrador
import {
  getAllBrands,
  createBrand,
  updateBrand,
  deleteBrand,
} from '../services/brands.service'; // Se creará a continuación
import { ImageUploadWidget } from '../components/ImageUploadWidget';

export const BrandManagementPanel: React.FC = () => {
    const { token } = useAuth();
    const [brands, setBrands] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [currentBrand, setCurrentBrand] = useState<any | null>(null);
    const [newBrandName, setNewBrandName] = useState('');
    const [newBrandImageUrl, setNewBrandImageUrl] = useState(''); // Estado para la URL de la imagen subida
    const [formError, setFormError] = useState<string | null>(null);
    const [formLoading, setFormLoading] = useState(false);
  
    useEffect(() => {
      if (token) {
        fetchBrands();
      }
    }, [token]);
  
    const fetchBrands = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getAllBrands();
        setBrands(data);
      } catch (err: any) {
        setError(err.message || 'Error al cargar las marcas.');
      } finally {
        setLoading(false);
      }
    };
  
    const handleCreateOrUpdateBrand = async (e: React.FormEvent) => {
      e.preventDefault();
      setFormError(null);
      setFormLoading(true);
  
      if (!newBrandName.trim()) {
        setFormError('El nombre de la marca no puede estar vacío.');
        setFormLoading(false);
        return;
      }
  
      try {
        if (isEditing && currentBrand) {
          await updateBrand(token!, currentBrand.id, {
            nombre: newBrandName,
            url_imagen: newBrandImageUrl || undefined, // Envía undefined si está vacío para no sobrescribir con string vacío si no se cambió
          });
        } else {
          await createBrand(token!, {
            nombre: newBrandName,
            url_imagen: newBrandImageUrl || undefined,
          });
        }
        resetForm();
        fetchBrands(); // Refrescar la lista
      } catch (err: any) {
        setFormError(err.message || 'Error al guardar la marca.');
      } finally {
        setFormLoading(false);
      }
    };
  
    const handleDeleteBrand = async (id: number) => {
      if (window.confirm('¿Estás seguro de que quieres eliminar esta marca?')) {
        setError(null);
        setLoading(true);
        try {
          await deleteBrand(token!, id);
          fetchBrands();
        } catch (err: any) {
          setError(err.message || 'Error al eliminar la marca.');
          setLoading(false);
        }
      }
    };
  
    const handleEditClick = (brand: any) => {
      setIsEditing(true);
      setCurrentBrand(brand);
      setNewBrandName(brand.nombre);
      setNewBrandImageUrl(brand.url_imagen || ''); // Cargar URL actual en el estado
      setFormError(null);
    };
  
    const resetForm = () => {
      setIsEditing(false);
      setCurrentBrand(null);
      setNewBrandName('');
      setNewBrandImageUrl(''); // Limpiar URL también
      setFormError(null);
      setFormLoading(false);
    };
  
    const handleImageUploadSuccess = (url: string) => {
      setNewBrandImageUrl(url); // La URL subida se guarda en el estado
      setFormError(null); // Limpiar errores de formulario si la subida fue exitosa
    };
  
    const handleImageUploadError = (message: string) => {
      setFormError(message); // Mostrar errores del widget de subida en el formulario principal
    }
  
    if (!token) {
      return <div className="error-message">Debes iniciar sesión como administrador para gestionar marcas.</div>;
    }
  
    if (loading) {
      return <div className="loading-spinner">Cargando marcas...</div>;
    }
  
    if (error) {
      return <div className="error-message">Error: {error}</div>;
    }
  
    return (
      <div className="management-panel">
        <h3>Gestión de Marcas</h3>
  
        <div className="control-buttons-container">
          <button className="button-primary btn" onClick={resetForm}>
            <span>{isEditing ? 'Cancelar Edición' : 'Nueva Marca'}</span>
          </button>
        </div>
  
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Imagen</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {brands.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ textAlign: 'center' }}>No hay marcas registradas.</td>
              </tr>
            ) : (
              brands.map((brand) => (
                <tr key={brand.id}>
                  <td>{brand.id}</td>
                  <td>{brand.nombre}</td>
                  <td>
                    {brand.url_imagen ? (
                      <img src={brand.url_imagen} alt={brand.nombre} />
                    ) : (
                      <span>Sin imagen</span>
                    )}
                  </td>
                  <td className="table-actions">
                    <button className="action-button" onClick={() => handleEditClick(brand)}>
                      ✏️
                    </button>
                    <button className="action-button delete" onClick={() => handleDeleteBrand(brand.id)}>
                      🗑️
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
  
        <form onSubmit={handleCreateOrUpdateBrand} className="creation-form">
          <h4>{isEditing ? `Editar Marca: ${currentBrand?.nombre}` : 'Crear Nueva Marca'}</h4>
          <div className="form-group">
            <label htmlFor="brand-name">Nombre:</label>
            <input
              type="text"
              id="brand-name"
              className="text-input"
              value={newBrandName}
              onChange={(e) => setNewBrandName(e.target.value)}
              disabled={formLoading}
            />
          </div>
          
          {/* ¡NUEVO WIDGET DE SUBIDA DE IMAGEN! */}
          <ImageUploadWidget
            label="Subir Imagen de Marca:"
            currentImageUrl={newBrandImageUrl}
            onImageUploadSuccess={handleImageUploadSuccess}
            onError={handleImageUploadError}
            disabled={formLoading}
          />
          {/* Eliminamos el input de texto de URL de imagen, el widget lo gestiona */}
          
          {formError && <p className="error-message">{formError}</p>}
          <div className="form-buttons-container">
            <button type="submit" className="button-primary btn" disabled={formLoading}>
              <span>{formLoading ? 'Guardando...' : (isEditing ? 'Guardar Cambios' : 'Crear Marca')}</span>
            </button>
          </div>
        </form>
      </div>
    );
  };