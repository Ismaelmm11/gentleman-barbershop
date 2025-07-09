// src/pages/analytics/components/AnalyticsChart.tsx (VERSIÓN SUPER DEBUG)
import React from 'react';
import { ResponsiveBar } from '@nivo/bar';
import { ResponsiveLine } from '@nivo/line';
import { type Metrica, type TipoGrafico, type NivoDataPoint, type NivoLineData } from '../types';

interface AnalyticsChartProps {
  data: NivoDataPoint[] | NivoLineData[];
  tipoGrafico: TipoGrafico;
  metrica: Metrica;
  seriesKeys: string[];
}

export const AnalyticsChart: React.FC<AnalyticsChartProps> = ({ data, tipoGrafico, metrica, seriesKeys }) => {
    console.log("%c[AnalyticsChart] Props recibidas:", "color: purple; font-weight: bold;", { data, tipoGrafico, metrica, seriesKeys });
    
    if (!data || data.length === 0) {
        return <div className="chart-placeholder">Selecciona un barbero para ver las estadísticas.</div>;
    }

    // ... (el resto del componente no cambia)
    const commonProps = {
        data,
        margin: { top: 50, right: 140, bottom: 50, left: 60 },
        axisBottom: { legend: 'Periodo', legendPosition: 'middle' as const, legendOffset: 40 },
        axisLeft: { legend: metrica === 'total_ingresos' ? 'Ingresos (€)' : 'Nº de Citas', legendPosition: 'middle' as const, legendOffset: -50 },
        legends: [{
            dataFrom: 'keys' as const, anchor: 'bottom-right' as const, direction: 'column' as const,
            justify: false, translateX: 120, translateY: 0, itemsSpacing: 2,
            itemWidth: 100, itemHeight: 20, itemDirection: 'left-to-right' as const,
            itemOpacity: 0.85, symbolSize: 12, symbolShape: 'circle' as const,
        }],
    };
    if (tipoGrafico === 'lineas') return <ResponsiveLine {...commonProps} data={data as NivoLineData[]} xScale={{ type: 'point' }} yScale={{ type: 'linear', min: 'auto', max: 'auto' }} pointSize={8} useMesh={true} />;
    return <ResponsiveBar {...commonProps} data={data as NivoDataPoint[]} keys={seriesKeys} indexBy="index" groupMode="grouped" padding={0.3} />;
};