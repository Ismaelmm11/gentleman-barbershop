// src/components/Sidebar.tsx
import React from 'react';
import { useAuth } from '../context/AuthContext'; // Para la función de logout

// Definimos los elementos de navegación
const navItems = [
    { id: 'Calendario', name: 'Calendario', icon: '/icons/calendario.gif' },
    { id: 'Análisis', name: 'Análisis', icon: '/icons/analisis.gif' },
    { id: 'Descansos', name: 'Descansos', icon: '/icons/descanso.gif' },
];

interface SidebarProps {
    activeSection: string;
    onSectionChange: (section: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeSection, onSectionChange }) => {
    const { logout } = useAuth(); // Obtenemos la función logout del contexto

    return (
        <aside className="sidebar">
            <nav className="sidebar-nav">
                <ul>
                    {navItems.map((item) => (
                        <li key={item.id}>
                            <button
                                className={`sidebar-link ${activeSection === item.id ? 'active' : ''}`}
                                onClick={() => onSectionChange(item.id)}
                                title={item.name}
                            >
                                <img src={item.icon} alt={item.name} className="sidebar-icon" />
                                <span className="sidebar-text">{item.name}</span>
                            </button>
                        </li>
                    ))}
                    <li>
                        <button className="sidebar-link" onClick={logout} title="Cerrar Sesión">
                            <img src="/icons/cerrar-sesion.gif" alt="Cerrar Sesión" className="sidebar-icon" />
                            <span className="sidebar-text">Cerrar Sesión</span>
                        </button>
                    </li>
                </ul>
            </nav>

            {/* Elemento de Logout al final */}
            <div className="sidebar-footer">

            </div>
        </aside>
    );
};