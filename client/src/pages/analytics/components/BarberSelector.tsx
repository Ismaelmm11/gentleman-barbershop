// src/pages/analytics/components/BarberSelector.tsx

import React from 'react';
import { type Barber } from '../types'; // Importamos el tipo 'Barber'

// 1. ACTUALIZAMOS LAS PROPS: ahora recibe 'barbers' y 'loading' desde el padre
interface BarberSelectorProps {
  barbers: Barber[];
  loading: boolean;
  selectedItems: (number | string)[];
  onSelectionChange: (selectedItems: (number | string)[]) => void;
}

export const BarberSelector: React.FC<BarberSelectorProps> = ({ barbers, loading, selectedItems, onSelectionChange }) => {

  // 2. HEMOS QUITADO el useState y el useEffect de aquí. Ahora es un componente más simple.

  const handleCheckboxChange = (item: number | string) => {
    const newSelection = selectedItems.includes(item)
      ? selectedItems.filter(id => id !== item)
      : [...selectedItems, item];
    onSelectionChange(newSelection);
    console.log(selectedItems);
  };

  if (loading) {
    return <div className="loading-sidebar">Cargando barberos...</div>;
  }

  return (
    <div className="barber-selector-container">
      <h3 className="barber-selector-title">Comparar Barberos</h3>
      <ul className="barber-list">
        {barbers.map(barber => (
          <li key={barber.id} className="barber-item">
            <label>
              <input 
                type="checkbox" 
                className="hidden-checkbox"
                checked={selectedItems.includes(barber.id)}
                onChange={() => handleCheckboxChange(barber.id)}
              />
              <span className="custom-checkbox"></span>
              {barber.nombre} {barber.apellidos}
            </label>
          </li>
        ))}
        <hr className="separator" />
        <li className="barber-item">
          <label>
            <input
              type="checkbox"
              className="hidden-checkbox"
              checked={selectedItems.includes('GENTLEMAN')}
              onChange={() => handleCheckboxChange('GENTLEMAN')}
            />
            <span className="custom-checkbox"></span>
            Gentleman (Total)
          </label>
        </li>
      </ul>
    </div>
  );
};