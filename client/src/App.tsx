// src/App.tsx
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { useAuth } from './context/AuthContext';
import { ProtectedRoute } from './routes/ProtectedRoute';
// Aquí solo necesitas importar la página principal de gestión
import { ManagementPage } from './pages/ManagementPage';
// Importamos la nueva página de reserva de citas
import { AppointmentsPage } from './pages/appointments/AppointmentsPage';

// Estilos para la barra de navegación (sin cambios)
const navStyles = {
  nav: {
    padding: '15px 30px',
    backgroundColor: 'var(--color-white)',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  link: {
    textDecoration: 'none',
    color: 'var(--color-text)',
    fontWeight: 'bold',
    margin: '0 15px',
    fontSize: '18px',
  },
  logo: {
    fontFamily: 'var(--font-heading)',
    fontSize: '24px',
    textDecoration: 'none',
    color: 'var(--color-primary)',
  }
};

function App() {
  const { isAuthenticated, user } = useAuth();

  return (
    <BrowserRouter>
      <nav style={navStyles.nav} className="border-b-4 border-red-500">
        <div>
          <Link to="/" style={navStyles.logo}>Gentleman Barbershop</Link>
        </div>
        <div>
          <Link to="/" style={navStyles.link}>Inicio</Link>
          {/* Añadimos el enlace a la página de reservar citas */}
          <Link to="/reservar-cita" style={navStyles.link}>Reservar Cita</Link>

          {/* El enlace a /gestion ya es correcto */}
          {isAuthenticated && user && ['ADMIN', 'BARBERO', 'TATUADOR'].includes(user.rol) && (
            <Link to="/gestion" style={navStyles.link}>Gestión</Link>
          )}

          {!isAuthenticated && <Link to="/login" style={navStyles.link}>Login</Link>}
        </div>
      </nav>

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />

        {/* Ruta para la página de reservar citas (PÚBLICA) */}
        <Route path="/reservar-cita" element={<AppointmentsPage />} />

        {/* --- CORRECCIÓN --- */}
        {/* Esta es AHORA la ÚNICA ruta que necesitas para toda la sección */}
        <Route
          path="/gestion"
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'BARBERO', 'TATUADOR']}>
              <ManagementPage />
            </ProtectedRoute>
          }
        />
        
        {/* Ya no necesitamos la ruta /calendario, por lo que la eliminamos */}
        
      </Routes>
    </BrowserRouter>
  );
}

export default App;