// src/App.tsx
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { useAuth } from './context/AuthContext';
import { CalendarPage } from './pages/CalendarPage'; // 1. Importar la nueva página
import { ProtectedRoute } from './routes/ProtectedRoute'; // 2. Importar la ruta protegida

// Estilos para la barra de navegación
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
      <nav style={navStyles.nav}>
        <div>
          <Link to="/" style={navStyles.logo}>Gentleman Barbershop</Link>
        </div>
        <div>
          <Link to="/" style={navStyles.link}>Inicio</Link>
          
          {/* 3. Añadir el enlace al calendario si el rol es correcto */}
          {isAuthenticated && user && ['ADMIN', 'BARBERO', 'TATUADOR'].includes(user.rol) && (
            <Link to="/calendario" style={navStyles.link}>Calendario</Link>
          )}

          {!isAuthenticated && <Link to="/login" style={navStyles.link}>Login</Link>}
        </div>
      </nav>

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        
        {/* 4. Añadir la nueva ruta protegida */}
        <Route
          path="/calendario"
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'BARBERO', 'TATUADOR']}>
              <CalendarPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;