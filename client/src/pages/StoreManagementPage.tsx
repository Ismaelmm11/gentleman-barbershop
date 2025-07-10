// src/management/StoreManagementPage.tsx
import React, { useState } from 'react';
import { BrandManagementPanel } from './BrandManagementPanel';
import { CategoryManagementPanel } from './CategoryManagementPanel';
import { ProductManagementPanel } from './ProductManagementPanel'; // <-- NUEVA IMPORTACIÓN

export const StoreManagementPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('products'); // Por defecto, mostramos productos

  return (
    <div className="store-management-page">
      <h2 className="management-title">Gestión de la Tienda</h2>

      <div className="tab-navigation">
        <button
          className={`tab-button ${activeTab === 'products' ? 'active' : ''}`}
          onClick={() => setActiveTab('products')}
        >
          Productos
        </button>
        <button
          className={`tab-button ${activeTab === 'brands' ? 'active' : ''}`}
          onClick={() => setActiveTab('brands')}
        >
          Marcas
        </button>
        <button
          className={`tab-button ${activeTab === 'categories' ? 'active' : ''}`}
          onClick={() => setActiveTab('categories')}
        >
          Categorías
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'products' && <ProductManagementPanel />} {/* <-- NUEVA SECCIÓN */}
        {activeTab === 'brands' && <BrandManagementPanel />}
        {activeTab === 'categories' && <CategoryManagementPanel />}
      </div>
    </div>
  );
};