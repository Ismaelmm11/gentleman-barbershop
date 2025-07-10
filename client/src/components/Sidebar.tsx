// src/components/Sidebar.tsx
import React from 'react';
import { useAuth } from '../context/AuthContext'; // Para la función de logout

// Definimos los elementos de navegación
const navItems = [
    { id: 'Calendario', name: 'Calendario', icon: '/icons/calendario.gif', roles: ['ADMIN', 'BARBERO', 'TATUADOR'] },
    { id: 'Análisis', name: 'Análisis', icon: '/icons/analisis.gif', roles: ['ADMIN', 'BARBERO', 'TATUADOR'] },
    { id: 'Descansos', name: 'Descansos', icon: '/icons/descanso.gif', roles: ['ADMIN', 'BARBERO', 'TATUADOR'] },
    // ¡NUEVA ENTRADA para la tienda!
    { id: 'Tienda', name: 'Tienda', icon: '/icons/tienda.gif', roles: ['ADMIN'] }, // Solo ADMIN
    { id: 'Usuarios', name: 'Usuarios', icon: '/icons/usuarios.gif', roles: ['ADMIN'] }, // Solo ADMIN
];

interface SidebarProps {
    activeSection: string;
    onSectionChange: (section: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeSection, onSectionChange }) => {
    const { logout, user } = useAuth(); // Obtenemos la función logout y el usuario del contexto

    // Función para verificar si el usuario tiene permiso para ver un item del sidebar
    const hasPermission = (itemRoles: string[] | undefined) => {
        if (!itemRoles) return true; // Si no hay roles definidos, es visible para todos (o públicos)
        if (!user || !user.rol) return false; // Si no hay usuario o rol, no tiene acceso a roles específicos
        return itemRoles.includes(user.rol);
    };

    return (
        <aside className="sidebar">
            <nav className="sidebar-nav">
                <ul>
                    {navItems.map((item) => (
                        // Solo renderiza el item si el usuario tiene los roles adecuados
                        hasPermission(item.roles) && (
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
                        )
                    ))}
                    {/* El botón de cerrar sesión siempre está visible para usuarios autenticados */}
                    <li>
                        <button className="sidebar-link" onClick={logout} title="Cerrar Sesión">
                            <img src="/icons/cerrar-sesion.gif" alt="Cerrar Sesión" className="sidebar-icon" />
                            <span className="sidebar-text">Cerrar Sesión</span>
                        </button>
                    </li>
                </ul>
            </nav>

            <div className="sidebar-footer">
                {/* Puedes añadir más elementos al footer si es necesario */}
            </div>
        </aside>
    );
};