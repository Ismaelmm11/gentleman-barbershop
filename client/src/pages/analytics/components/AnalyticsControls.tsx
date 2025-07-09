import React, { useState } from 'react';
import { type Metrica, type TipoGrafico } from '../types';

interface AnalyticsControlsProps {
    metricaActual: Metrica;
    tipoGraficoActual: TipoGrafico;
    onMetricaChange: (metrica: Metrica) => void;
    onTipoGraficoChange: (tipo: TipoGrafico) => void;
}

export const AnalyticsControls: React.FC<AnalyticsControlsProps> = ({ metricaActual, tipoGraficoActual, onMetricaChange, onTipoGraficoChange }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="fab-controls-container">
            <div className={`fab-options ${isOpen ? 'open' : ''}`}>
                <button title="Cambiar a Gráfico de Líneas" onClick={() => onTipoGraficoChange('lineas')} disabled={tipoGraficoActual === 'lineas'}>📈</button>
                <button title="Cambiar a Gráfico de Barras" onClick={() => onTipoGraficoChange('barras')} disabled={tipoGraficoActual === 'barras'}>📊</button>
                <div className="fab-separator" />
                <button title="Ver Ingresos" onClick={() => onMetricaChange('total_ingresos')} disabled={metricaActual === 'total_ingresos'}>💰</button>
                <button title="Ver Nº de Citas" onClick={() => onMetricaChange('total_citas')} disabled={metricaActual === 'total_citas'}>✂️</button>
            </div>
            <button className="fab-main" onClick={() => setIsOpen(!isOpen)}>
                {isOpen ? '✕' : '⚙️'}
            </button>
        </div>
    );
};