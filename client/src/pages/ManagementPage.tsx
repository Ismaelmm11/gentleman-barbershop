// src/pages/ManagementPage.tsx
import { useState } from 'react';
import { Sidebar } from '../components/Sidebar';
import { CalendarPage } from './CalendarPage';
import { AnalyticsByBarber } from './analytics/AnalyticsByBarber';
import { StoreManagementPage } from './StoreManagementPage';
import { UserManagementPanel } from './UserManegementPanel';


export const ManagementPage: React.FC = () => {
  // Estado para la sección activa, por defecto 'Calendario'
  const [activeSection, setActiveSection] = useState('Calendario');

  const handleSectionChange = (section: string) => {
    setActiveSection(section);
  };

  return (
    <div className="management-layout">
      <Sidebar activeSection={activeSection} onSectionChange={handleSectionChange} />
      <main className="main-content">
        {activeSection === 'Calendario' && <CalendarPage />}
        {activeSection === 'Análisis' && <AnalyticsByBarber />}
        {activeSection === 'Descansos' && <div>Página de Descansos (Pendiente de implementar)</div>}
        {activeSection === 'Tienda' && <StoreManagementPage />}
        {activeSection === 'Usuarios' && <UserManagementPanel />}  {/* <-- NUEVA SECCIÓN */}
        {/* Aquí puedes añadir más secciones de gestión según las necesites */}
      </main>
    </div>
  );
};