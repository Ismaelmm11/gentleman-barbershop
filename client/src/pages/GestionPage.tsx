// src/pages/GestionPage.tsx
import { type CSSProperties } from 'react';
import { BarberCalendar } from '../components/BarberCalendar'; // 1. Importamos el nuevo componente

const styles: { [key: string]: CSSProperties } = {
  container: {
    padding: '20px 40px', // Ajustamos el padding
  },
  title: {
    fontSize: '2.5rem',
    textTransform: 'uppercase',
    textAlign: 'center',
    marginBottom: '30px',
  },
};

export const CalendarPage = () => {

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>
        Calendario
      </h1>
      
      {/* 2. Renderizamos el componente del calendario */}
      <BarberCalendar />
    </div>
  );
};
