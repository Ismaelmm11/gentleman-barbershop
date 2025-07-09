import { useState, useEffect } from 'react';

// Importación de Componentes
import { PeriodSelector } from './components/PeriodSelector';
import { DateNavigator } from './components/DateNavigator';
import { DatePickerModal } from './components/DatePickerModal';
import { BarberSelector } from './components/BarberSelector';
import { AnalyticsChart } from './components/AnalyticsChart';
import { AnalyticsControls } from './components/AnalyticsControls';

// Importación de Servicios y Contexto
import { getAnalyticsSummary } from '../../services/analytics.service';
import { findUsersByRole } from '../../services/users.service';
import { useAuth } from '../../context/AuthContext';

// Importación de Utilidades y Tipos
import { transformDataForNivo } from './utils/data-transformer';
import { getDateRange } from './utils/dateRangeFromPeriod';
import { 
  type Periodo, type Metrica, type TipoGrafico, type NivoDataPoint, 
  type NivoLineData, type ApiAnalyticsData, type Barber 
} from './types';


export const AnalyticsByBarber = () => {
  const { token } = useAuth();
  
  // =================================================================
  // GESTIÓN DE ESTADO (El cerebro del componente)
  // =================================================================
  
  // --- Estados de los filtros del usuario ---
  const [periodo, setPeriodo] = useState<Periodo>('SEMANA');
  const [fechaActual, setFechaActual] = useState(new Date());
  const [isDatePickerOpen, setDatePickerOpen] = useState(false);
  const [seleccion, setSeleccion] = useState<(number | string)[]>([]);

  // --- Estados de la visualización del gráfico ---
  const [metricaSeleccionada, setMetricaSeleccionada] = useState<Metrica>('total_ingresos');
  const [tipoGrafico, setTipoGrafico] = useState<TipoGrafico>('barras');

  // --- Estados para los datos ---
  const [barbers, setBarbers] = useState<Barber[]>([]); // Lista completa de barberos
  const [datosApi, setDatosApi] = useState<ApiAnalyticsData[] | null>(null); // Datos brutos de la API
  const [datosParaGrafico, setDatosParaGrafico] = useState<NivoDataPoint[] | NivoLineData[]>([]); // Datos listos para Nivo
  const [loading, setLoading] = useState(true); // Estado de carga

  // =================================================================
  // EFECTOS (Lógica que se ejecuta cuando algo cambia)
  // =================================================================

  // Efecto 1: Cargar la lista de barberos una sola vez al inicio.
  useEffect(() => {
    if (token) {
      findUsersByRole(token, 'BARBERO')
        .then(response => {
          setBarbers(response.data || []);
        })
        .catch(error => {
          console.error("Error al cargar los barberos:", error);
          setBarbers([]); // En caso de error, dejamos el array vacío
        });
    }
  }, [token]);

  // Efecto 2: Cargar los datos de analíticas cuando cambian los filtros de fecha.
  useEffect(() => {
    if (!token) return;

    setLoading(true);
    const { fecha_desde, fecha_hasta } = getDateRange(fechaActual, periodo);
    
    // El backend ahora agrupa según el 'periodo' que le pasamos.
    const params = {
      fecha_desde,
      fecha_hasta,
      periodo: periodo.toLowerCase() as 'DIA' | 'SEMANA' | 'MES' | 'AÑO',
    };

    getAnalyticsSummary(token, params)
      .then(apiData => {
        setDatosApi(apiData);
      })
      .catch(error => {
        console.error("Error al obtener las analíticas:", error);
        setDatosApi(null); // Limpiamos los datos si hay un error
      })
      .finally(() => {
        setLoading(false);
      });

  }, [periodo, fechaActual, token]);

  // Efecto 3: Transformar los datos para Nivo cada vez que los datos de la API o la selección cambian.
  useEffect(() => {
    const nivoData = transformDataForNivo(datosApi, seleccion, periodo, metricaSeleccionada, tipoGrafico, barbers, fechaActual);
    setDatosParaGrafico(nivoData);
  }, [datosApi, seleccion, metricaSeleccionada, tipoGrafico, periodo, barbers, fechaActual]);


  // =================================================================
  // RENDERIZADO DEL COMPONENTE
  // =================================================================
  
  // Preparamos los nombres de las series para la leyenda del gráfico
  const nombresSeries = seleccion.map(s => {
    if (s === 'GENTLEMAN') return 'Gentleman (Total)';
    const barber = barbers.find(b => b.id === s);
    return barber ? `${barber.nombre} ${barber.apellidos}` : 'Desconocido';
  });
  
  return (
    <div className="analytics-page">
      <h1 className="analytics-title">ESTADÍSTICAS POR BARBERO</h1>
      
      <div className="top-controls-container">
        <PeriodSelector periodoActual={periodo} onPeriodoChange={setPeriodo} />
        <DateNavigator fechaActual={fechaActual} periodo={periodo} onDateChange={setFechaActual} onDisplayClick={() => setDatePickerOpen(true)} />
      </div>

      <div className="main-content-area">
        <aside className="left-sidebar">
          <BarberSelector 
            barbers={barbers}
            loading={barbers.length === 0 && loading}
            selectedItems={seleccion}
            onSelectionChange={setSeleccion}
          />
        </aside>
        
        <main className="chart-area">
          {loading ? (
            <div className="loading-spinner">Cargando datos...</div>
          ) : (
            <AnalyticsChart
              data={datosParaGrafico}
              tipoGrafico={tipoGrafico}
              metrica={metricaSeleccionada}
              seriesKeys={nombresSeries}
            />
          )}
        </main>
        
        <aside className="right-fab-controls">
           <AnalyticsControls
            metricaActual={metricaSeleccionada}
            tipoGraficoActual={tipoGrafico}
            onMetricaChange={setMetricaSeleccionada}
            onTipoGraficoChange={setTipoGrafico}
          />
        </aside>
      </div>

      <DatePickerModal 
        isOpen={isDatePickerOpen} 
        onClose={() => setDatePickerOpen(false)} 
        onSelectDate={setFechaActual} 
        initialDate={fechaActual} 
        periodo={periodo} 
      />
    </div>
  );
};