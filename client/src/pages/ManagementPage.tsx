// src/pages/ManagementPage.tsx
import { useState } from 'react';
import { Sidebar } from '../components/Sidebar';
import { CalendarPage } from './CalendarPage';
import { AnalyticsByBarber } from './analytics/AnalyticsByBarber';

// Componentes de relleno para las nuevas secciones
const RecurringBreaksPage = () => <div style={{ padding: '40px' }}><h1>Gestión de Descansos Recurrentes</h1><p>Aquí irá el gestor de horarios semanales...</p></div>;


export const ManagementPage = () => {
  const [activeSection, setActiveSection] = useState('Calendario');

  const renderContent = () => {
    switch (activeSection) {
      case 'Calendario':
        return <CalendarPage />;
      case 'Análisis':
        return <AnalyticsByBarber />;
      case 'Descansos':
        return <RecurringBreaksPage />;
      default:
        return <CalendarPage />;
    }
  };

  return (
    <div className="management-layout">
      <Sidebar 
        activeSection={activeSection}
        onSectionChange={setActiveSection}
      />
      <main className="main-content">
        {renderContent()}
      </main>
    </div>
  );
};