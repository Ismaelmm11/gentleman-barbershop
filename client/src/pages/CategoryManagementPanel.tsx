// src/management/categories/CategoryManagementPanel.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../services/categories.service'; // Se creará a continuación
import { ImageUploadWidget } from '../components/ImageUploadWidget';

export const CategoryManagementPanel: React.FC = () => {
  const { token } = useAuth();
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<any | null>(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryImageUrl, setNewCategoryImageUrl] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    if (token) {
      fetchCategories();
    }
  }, [token]);

  const fetchCategories = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllCategories();
      setCategories(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar las categorías.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrUpdateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormLoading(true);

    if (!newCategoryName.trim()) {
      setFormError('El nombre de la categoría no puede estar vacío.');
      setFormLoading(false);
      return;
    }

    try {
      if (isEditing && currentCategory) {
        await updateCategory(token!, currentCategory.id, {
          nombre: newCategoryName,
          url_imagen: newCategoryImageUrl || undefined,
        });
      } else {
        await createCategory(token!, {
          nombre: newCategoryName,
          url_imagen: newCategoryImageUrl || undefined,
        });
      }
      resetForm();
      fetchCategories();
    } catch (err: any) {
      setFormError(err.message || 'Error al guardar la categoría.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteCategory = async (id: number) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta categoría?')) {
      setError(null);
      setLoading(true);
      try {
        await deleteCategory(token!, id);
        fetchCategories();
      } catch (err: any) {
        setError(err.message || 'Error al eliminar la categoría.');
        setLoading(false);
      }
    }
  };

  const handleEditClick = (category: any) => {
    setIsEditing(true);
    setCurrentCategory(category);
    setNewCategoryName(category.nombre);
    setNewCategoryImageUrl(category.url_imagen || '');
    setFormError(null);
  };

  const resetForm = () => {
    setIsEditing(false);
    setCurrentCategory(null);
    setNewCategoryName('');
    setNewCategoryImageUrl('');
    setFormError(null);
    setFormLoading(false);
  };

  const handleImageUploadSuccess = (url: string) => {
    setNewCategoryImageUrl(url);
    setFormError(null);
  };

  const handleImageUploadError = (message: string) => {
    setFormError(message);
  }

  if (!token) {
    return <div className="error-message">Debes iniciar sesión como administrador para gestionar categorías.</div>;
  }

  if (loading) {
    return <div className="loading-spinner">Cargando categorías...</div>;
  }

  if (error) {
    return <div className="error-message">Error: {error}</div>;
  }

  return (
    <div className="management-panel">
      <h3>Gestión de Categorías</h3>

      <div className="control-buttons-container">
        <button className="button-primary btn" onClick={resetForm}>
          <span>{isEditing ? 'Cancelar Edición' : 'Nueva Categoría'}</span>
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
          {categories.length === 0 ? (
            <tr>
              <td colSpan={4} style={{ textAlign: 'center' }}>No hay categorías registradas.</td>
            </tr>
          ) : (
            categories.map((category) => (
              <tr key={category.id}>
                <td>{category.id}</td>
                <td>{category.nombre}</td>
                <td>
                  {category.url_imagen ? (
                    <img src={category.url_imagen} alt={category.nombre} />
                  ) : (
                    <span>Sin imagen</span>
                  )}
                </td>
                <td className="table-actions">
                  <button className="action-button" onClick={() => handleEditClick(category)}>
                    ✏️
                  </button>
                  <button className="action-button delete" onClick={() => handleDeleteCategory(category.id)}>
                    🗑️
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <form onSubmit={handleCreateOrUpdateCategory} className="creation-form">
        <h4>{isEditing ? `Editar Categoría: ${currentCategory?.nombre}` : 'Crear Nueva Categoría'}</h4>
        <div className="form-group">
          <label htmlFor="category-name">Nombre:</label>
          <input
            type="text"
            id="category-name"
            className="text-input"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            disabled={formLoading}
          />
        </div>
        
        {/* ¡NUEVO WIDGET DE SUBIDA DE IMAGEN! */}
        <ImageUploadWidget
          label="Subir Imagen de Categoría:"
          currentImageUrl={newCategoryImageUrl}
          onImageUploadSuccess={handleImageUploadSuccess}
          onError={handleImageUploadError}
          disabled={formLoading}
        />
        {/* Eliminamos el input de texto de URL de imagen */}
        
        {formError && <p className="error-message">{formError}</p>}
        <div className="form-buttons-container">
          <button type="submit" className="button-primary btn" disabled={formLoading}>
            <span>{formLoading ? 'Guardando...' : (isEditing ? 'Guardar Cambios' : 'Crear Categoría')}</span>
          </button>
        </div>
      </form>
    </div>
  );
};