// src/components/ProductDetailModal.tsx
import React, { useState } from 'react';

interface ProductDetailModalProps {
  product: any;
  brands: any[]; // Para obtener el nombre de la marca
  categories: any[]; // Para obtener el nombre de la categoría
  onClose: () => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  brands,
  categories,
  onClose,
}) => {
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);

  // Encontrar la marca y categoría por ID
  const brandName = brands.find(b => b.id === product.id_marca)?.nombre || 'Desconocida';
  const categoryName = categories.find(c => c.id === product.id_categoria)?.nombre || 'Desconocida';

  // Ordenar los medios: principal primero, luego el resto
  const sortedMedia = [...product.media || []].sort((a, b) => (b.es_principal ? 1 : a.es_principal ? -1 : 0));

  const handleNextMedia = () => {
    setCurrentMediaIndex((prevIndex) => (prevIndex + 1) % sortedMedia.length);
  };

  const handlePrevMedia = () => {
    setCurrentMediaIndex((prevIndex) =>
      prevIndex === 0 ? sortedMedia.length - 1 : prevIndex - 1
    );
  };

  const currentMedia = sortedMedia[currentMediaIndex];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}> {/* Evitar que el click en el contenido cierre el modal */}
        <button className="modal-close-button" onClick={onClose}>✕</button>

        <div className="product-detail-header">
          <h2>{product.nombre}</h2>
        </div>

        {/* Carrusel de medios */}
        <div className="media-carousel">
          {sortedMedia.length > 0 ? (
            <>
              {currentMedia.tipo === 'IMAGEN' ? (
                <img src={currentMedia.url} alt={product.nombre} className="carousel-media" />
              ) : (
                <video src={currentMedia.url} controls className="carousel-media" />
              )}
              {sortedMedia.length > 1 && (
                <>
                  <button className="carousel-nav-button prev" onClick={handlePrevMedia}>&larr;</button>
                  <button className="carousel-nav-button next" onClick={handleNextMedia}>&rarr;</button>
                  <div className="carousel-dots">
                    {sortedMedia.map((_, index) => (
                      <span
                        key={index}
                        className={`dot ${index === currentMediaIndex ? 'active' : ''}`}
                        onClick={() => setCurrentMediaIndex(index)}
                      ></span>
                    ))}
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="no-media-available">No hay medios disponibles para este producto.</div>
          )}
        </div>

        {/* Información del producto */}
        <div className="product-detail-info">
          <p><strong>Marca:</strong> {brandName}</p>
          <p><strong>Categoría:</strong> {categoryName}</p>
          <p className="product-detail-description">{product.descripcion}</p>
          <p className="product-detail-price"><strong>Precio:</strong> {product.precio}€</p>
        </div>
      </div>
    </div>
  );
};