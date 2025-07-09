export type Periodo = 'DIA' | 'SEMANA' | 'MES' | 'AÑO';

export const getDateRange = (fechaActual: Date, periodo: Periodo) => {
  const desde = new Date(fechaActual);
  const hasta = new Date(fechaActual);

  switch (periodo) {
    case 'DIA':
      // mismo día
      break;

    case 'SEMANA': {
      const day = fechaActual.getDay();
      const diffToMonday = day === 0 ? -6 : 1 - day;
      desde.setDate(fechaActual.getDate() + diffToMonday);
      hasta.setDate(desde.getDate() + 6);
      break;
    }

    case 'MES':
      desde.setDate(1);
      hasta.setMonth(fechaActual.getMonth() + 1);
      hasta.setDate(0); // último día del mes
      break;

    case 'AÑO':
      desde.setMonth(0, 1);
      hasta.setMonth(11, 31);
      break;
  }

  return {
    fecha_desde: desde.toISOString().split('T')[0],
    fecha_hasta: hasta.toISOString().split('T')[0],
  };
};
