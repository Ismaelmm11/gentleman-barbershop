// src/pages/analytics/utils/data-transformer.ts

import { getDay, getMonth, getDate, getDaysInMonth } from 'date-fns';
import { type ApiAnalyticsData, type NivoDataPoint, type Periodo, type Metrica, type TipoGrafico, type Barber, type NivoLineData } from '../types';

const getIndexKeys = (periodo: Periodo, fechaActual: Date): string[] => {
  if (periodo === 'SEMANA' || periodo === 'DIA') {
    return ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
  }
  if (periodo === 'AÑO') {
    return ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  }
  if (periodo === 'MES') {
    const daysInMonth = getDaysInMonth(fechaActual);
    return Array.from({ length: daysInMonth }, (_, i) => String(i + 1));
  }
  return [];
};

export const transformDataForNivo = (
  apiData: ApiAnalyticsData[] | null,
  seleccion: (number | string)[],
  periodo: Periodo,
  metrica: Metrica,
  tipoGrafico: TipoGrafico,
  barberos: Barber[],
  fechaActual: Date
): NivoDataPoint[] | NivoLineData[] => {
  if (!apiData || apiData.length === 0 || seleccion.length === 0) {
    return [];
  }

  const barberosMap = new Map(barberos.map(b => [b.id, `${b.nombre} ${b.apellidos}`]));
  const seriesNombres = seleccion.map(s => {
    if (s === 'GENTLEMAN') return 'Gentleman (Total)';
    return barberosMap.get(s as number) || 'Desconocido';
  });

  const indexKeys = getIndexKeys(periodo, fechaActual);

  const dataMap = indexKeys.reduce((acc, key) => {
    acc[key] = { index: key };
    seriesNombres.forEach(nombre => {
      acc[key][nombre] = 0;
    });
    return acc;
  }, {} as Record<string, NivoDataPoint>);

  apiData.forEach(stat => {
    // --- LA CORRECCIÓN ESTÁ AQUÍ ---
    // Creamos la fecha directamente desde el string de la API, sin añadirle nada.
    const date = new Date(stat.fecha);
    
    const nombreBarbero = barberosMap.get(stat.profesional_id);
    if (!nombreBarbero) return;

    let key: string;
    if (periodo === 'SEMANA' || periodo === 'DIA') {
        // getDay() devuelve 0 para Domingo. Lo mapeamos al final del array (índice 6).
        key = indexKeys[getDay(date) === 0 ? 6 : getDay(date) - 1];
    } else if (periodo === 'AÑO') {
        key = indexKeys[getMonth(date)];
    } else { // MES
        key = String(getDate(date));
    }
    
    if (dataMap[key]) {
      const valorMetrica = metrica === 'total_ingresos' ? stat.total_ingresos : stat.total_citas;
      
      if (seriesNombres.includes(nombreBarbero)) {
        (dataMap[key][nombreBarbero] as number) += parseFloat(String(valorMetrica));
      }
      if (seriesNombres.includes('Gentleman (Total)')) {
        (dataMap[key]['Gentleman (Total)'] as number) += parseFloat(String(valorMetrica));
      }
    }
  });

  const nivoData = Object.values(dataMap);
  
  if (tipoGrafico === 'lineas') {
    return seriesNombres.map(serie => ({
      id: serie,
      data: nivoData.map(dp => ({ x: dp.index, y: Number(dp[serie] || 0) }))
    }));
  }

  return nivoData;
};