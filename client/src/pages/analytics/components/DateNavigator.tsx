// src/pages/analytics/components/DateNavigator.tsx
import React from 'react';
import { getDateRange, type Periodo } from '../utils/dateRangeFromPeriod';

interface DateNavigatorProps {
  fechaActual: Date;
  periodo: Periodo;
  onDateChange: (newDate: Date) => void;
  onDisplayClick: () => void;
}

const formatDisplayDate = (date: Date, periodo: Periodo): string => {
  const { fecha_desde, fecha_hasta } = getDateRange(date, periodo);
  const desde = new Date(fecha_desde);
  const hasta = new Date(fecha_hasta);

  const options: Intl.DateTimeFormatOptions = { month: 'long', year: 'numeric' };

  switch (periodo) {
    case 'DIA':
      return desde.toLocaleDateString('es-ES', { day: 'numeric', ...options });

    case 'SEMANA':
      return `${desde.getDate()} ${desde.toLocaleDateString('es-ES', { month: 'short' })} - ` +
             `${hasta.getDate()} ${hasta.toLocaleDateString('es-ES', { month: 'short' })} ${desde.getFullYear()}`;

    case 'MES':
      return desde.toLocaleDateString('es-ES', options).replace(' de','');

    case 'AÑO':
      return desde.getFullYear().toString();

    default:
      return '';
  }
};

export const DateNavigator: React.FC<DateNavigatorProps> = ({ fechaActual, periodo, onDateChange, onDisplayClick }) => {
  const handleNavigation = (direction: 'prev' | 'next') => {
    const newDate = new Date(fechaActual);
    const amount = direction === 'prev' ? -1 : 1;

    switch (periodo) {
      case 'DIA':
        newDate.setDate(newDate.getDate() + amount);
        break;
      case 'SEMANA':
        newDate.setDate(newDate.getDate() + (7 * amount));
        break;
      case 'MES':
        newDate.setMonth(newDate.getMonth() + amount);
        break;
      case 'AÑO':
        newDate.setFullYear(newDate.getFullYear() + amount);
        break;
    }

    onDateChange(newDate);
  };

  return (
    <div className="date-navigator">
      <button className="date-navigator__arrow" onClick={() => handleNavigation('prev')}>‹</button>
      <button className="date-navigator__display" onClick={onDisplayClick}>
        {formatDisplayDate(fechaActual, periodo)}
      </button>
      <button className="date-navigator__arrow" onClick={() => handleNavigation('next')}>›</button>
    </div>
  );
};
