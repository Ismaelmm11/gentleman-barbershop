// src/App.tsx
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { useAuth } from './context/AuthContext';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { ManagementPage } from './pages/ManagementPage';
import { AppointmentsPage } from './pages/appointments/AppointmentsPage';
import { ProductCatalogPage } from './pages/ProductCatalogPage'; // <-- NUEVA IMPORTACIÓN

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
          <Link to="/reservar-cita" style={navStyles.link}>Reservar Cita</Link>
          <Link to="/catalogo" style={navStyles.link}>Catálogo</Link> {/* <-- NUEVO ENLACE */}

          {isAuthenticated && user && ['ADMIN', 'BARBERO', 'TATUADOR'].includes(user.rol) && (
            <Link to="/gestion" style={navStyles.link}>Gestión</Link>
          )}

          {!isAuthenticated && <Link to="/login" style={navStyles.link}>Login</Link>}
        </div>
      </nav>

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/reservar-cita" element={<AppointmentsPage />} />
        <Route path="/catalogo" element={<ProductCatalogPage />} /> {/* <-- NUEVA RUTA */}
        <Route
          path="/gestion"
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'BARBERO', 'TATUADOR']}>
              <ManagementPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;