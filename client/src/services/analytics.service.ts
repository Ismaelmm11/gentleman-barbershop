const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

type Periodo = 'DIA' | 'SEMANA' | 'MES' | 'AÑO';

interface SummaryParams {
  fecha_desde: string;
  fecha_hasta: string;
  profesional_id?: string;
  periodo: Periodo; // nuevo
}

const mapPeriodoToGroupBy = (periodo: Periodo): string => {
  switch (periodo) {
    case 'DIA':
      return 'dia';
    case 'SEMANA':
      return 'semana';
    case 'MES':
      return 'mes';
    case 'AÑO':
      return 'anio';
    default:
      return 'dia';
  }
};

export const getAnalyticsSummary = async (token: string, params: SummaryParams) => {
  const queryParams: Record<string, string> = {
    fecha_desde: params.fecha_desde,
    fecha_hasta: params.fecha_hasta,
    group_by: mapPeriodoToGroupBy(params.periodo),
  };

  if (params.profesional_id) {
    queryParams.profesional_id = params.profesional_id;
  }

  const query = new URLSearchParams(queryParams).toString();

  const response = await fetch(`${API_URL}/analytics/summary?${query}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    throw new Error('Error al obtener el resumen de analíticas');
  }

  return response.json();
};
