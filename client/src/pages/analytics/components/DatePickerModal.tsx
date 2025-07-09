// src/pages/analytics/components/DatePickerModal.tsx

import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { es } from 'date-fns/locale'; // Importamos el idioma español

type Periodo = 'DIA' | 'SEMANA' | 'MES' | 'AÑO';

interface DatePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectDate: (date: Date) => void;
  initialDate: Date;
  periodo: Periodo; // <-- Nueva prop para saber el modo
}

// --- Componente interno para la selección de Mes ---
const MonthSelectorView = ({ currentDate, onSelect }: { currentDate: Date, onSelect: (date: Date) => void }) => {
  const months = Array.from({ length: 12 }, (_, i) => new Date(currentDate.getFullYear(), i, 1));
  
  const handleMonthSelect = (monthIndex: number) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(monthIndex);
    onSelect(newDate);
  };

  return (
    <div className="month-year-grid">
      {months.map((month, index) => (
        <button
          key={index}
          className={`grid-button ${index === currentDate.getMonth() ? 'active' : ''}`}
          onClick={() => handleMonthSelect(index)}
        >
          {month.toLocaleDateString('es-ES', { month: 'long' })}
        </button>
      ))}
    </div>
  );
};

// --- Componente interno para la selección de Año ---
const YearSelectorView = ({ currentDate, onSelect }: { currentDate: Date, onSelect: (date: Date) => void }) => {
  const currentYear = currentDate.getFullYear();
  const years = Array.from({ length: 9 }, (_, i) => currentYear - 4 + i); // Mostramos 9 años alrededor del actual

  const handleYearSelect = (year: number) => {
    const newDate = new Date(currentDate);
    newDate.setFullYear(year);
    onSelect(newDate);
  };
  
  return (
    <div className="month-year-grid">
      {years.map(year => (
        <button
          key={year}
          className={`grid-button ${year === currentYear ? 'active' : ''}`}
          onClick={() => handleYearSelect(year)}
        >
          {year}
        </button>
      ))}
    </div>
  );
};


export const DatePickerModal = ({ isOpen, onClose, onSelectDate, initialDate, periodo }: DatePickerModalProps) => {
  if (!isOpen) {
    return null;
  }

  const handleDateSelection = (date: Date) => {
    onSelectDate(date);
    onClose();
  };

  const renderContent = () => {
    switch (periodo) {
      case 'MES':
        return <MonthSelectorView currentDate={initialDate} onSelect={handleDateSelection} />;
      case 'AÑO':
        return <YearSelectorView currentDate={initialDate} onSelect={handleDateSelection} />;
      case 'DIA':
      case 'SEMANA':
      default:
        return (
          <DayPicker
            mode="single"
            selected={initialDate}
            onSelect={(date) => date && handleDateSelection(date)}
            month={initialDate}
            locale={es} // Usamos el locale importado
            showOutsideDays
            fixedWeeks
            footer={
              <button className="rdp-footer-button" onClick={() => handleDateSelection(new Date())}>
                Ir a Hoy
              </button>
            }
          />
        );
    }
  };

  return (
    <div className="datepicker-overlay" onClick={onClose}>
      <div className="datepicker-container" onClick={(e) => e.stopPropagation()}>
        {renderContent()}
      </div>
    </div>
  );
};