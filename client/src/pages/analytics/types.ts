// src/pages/analytics/types.ts

// Tipos para los filtros y controles
export type Periodo = 'DIA' | 'SEMANA' | 'MES' | 'AÑO';
export type Metrica = 'total_citas' | 'total_ingresos';
export type TipoGrafico = 'barras' | 'lineas';

// Tipos para las entidades
export interface Barber {
  id: number;
  nombre: string;
  apellidos: string;
}

export type ApiAnalyticsData = {
    group_key: string;
    profesional_id: number;
    profesional_nombre: string;
    total_citas: string;
    total_ingresos: string;
    ticket_promedio: number;
    periodo: Periodo;
    [key: string]: any; 
  };

// Tipos para la respuesta de la API
export interface StatsProfesional {
  fecha: string;
  profesional_id: number;
  profesional_nombre: string;
  total_citas_dia: number;
  ingresos_diarios: number;
}

export interface ApiAnalyticsSummary {
  stats_por_profesional: StatsProfesional[];
  // Aquí podrían ir más datos en el futuro
}

// Tipos para los datos del gráfico (Nivo)
export interface NivoDataPoint {
    index: string;
    // --- AÑADE ESTA LÍNEA ---
    // Esto le dice a TypeScript: "además de 'index', este objeto puede tener
    // cualquier número de propiedades donde la clave es un string y el valor un string o un número".
    [key: string]: string | number;
  }

export interface NivoLineData {
    id: string;
    data: {
      x: string;
      y: number;
    }[];
  }