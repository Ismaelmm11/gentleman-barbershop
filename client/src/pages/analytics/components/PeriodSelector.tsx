// src/pages/analytics/components/PeriodSelector.tsx
import React from 'react';

type Periodo = 'DIA' | 'SEMANA' | 'MES' | 'AÑO';

interface PeriodSelectorProps {
  periodoActual: Periodo;
  onPeriodoChange: (periodo: Periodo) => void;
}

const periodos: Periodo[] = ['DIA', 'SEMANA', 'MES', 'AÑO'];

export const PeriodSelector: React.FC<PeriodSelectorProps> = ({ periodoActual, onPeriodoChange }) => {
  return (
    <div className="period-selector">
      {periodos.map((p) => (
        <button
          key={p}
          className={`period-selector__button ${periodoActual === p ? 'active' : ''}`}
          onClick={() => onPeriodoChange(p)}
        >
          {p}
        </button>
      ))}
    </div>
  );
};