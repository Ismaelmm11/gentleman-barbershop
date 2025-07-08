// src/pages/HomePage.tsx
import { type CSSProperties, } from 'react';
import { useAuth } from '../context/AuthContext';

// Estilos para la página de bienvenida
const styles: { [key: string]: CSSProperties } = {
  container: {
    padding: '40px',
    textAlign: 'center',
  },
  welcomeMessage: {
    fontSize: '2rem',
  },
  userInfo: {
    marginTop: '30px',
    padding: '20px',
    backgroundColor: 'var(--color-white)',
    borderRadius: '8px',
    display: 'inline-block',
    textAlign: 'left',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
  },
  infoItem: {
    fontSize: '1.1rem',
    marginBottom: '10px',
  },
  logoutButton: {
    marginTop: '30px',
    padding: '10px 20px',
    border: '1px solid var(--color-primary)',
    borderRadius: '4px',
    backgroundColor: 'transparent',
    color: 'var(--color-primary)',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
  }
};

export const HomePage = () => {
  const { isAuthenticated, user, logout } = useAuth();

  if (isAuthenticated && user) {

    const fechaFormateada = new Date(user.fecha_nacimiento).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    // --- VISTA PARA USUARIO AUTENTICADO ---
    return (
      <div style={styles.container}>
        <h1 style={styles.welcomeMessage}>¡Hola, {user.nombre}!</h1>
        <div style={styles.userInfo}>
          <p style={styles.infoItem}><strong>ID:</strong> {user.id}</p>
          <p style={styles.infoItem}><strong>Nombre:</strong> {user.nombre}</p>
          <p style={styles.infoItem}><strong>Apellidos:</strong> {user.apellidos}</p>
          <p style={styles.infoItem}><strong>Fecha Nacimiento:</strong> {fechaFormateada}</p>
          <p style={styles.infoItem}><strong>Telefono:</strong> {user.telefono}</p>
          <p style={styles.infoItem}><strong>Rol:</strong> {user.rol}</p>
          {/* Puedes añadir más datos del usuario aquí */}
        </div>
        <div>
          <button onClick={logout} style={styles.logoutButton}>Cerrar Sesión</button>
        </div>
      </div>
    );
  } else {
    // --- VISTA PARA INVITADO ---
    return (
      <div style={styles.container}>
        <h1>Bienvenido a Gentleman Barbershop</h1>
        <p>La página de inicio pública.</p>
        <div>
        </div>
        {/* Aquí iría el contenido principal para los visitantes */}
      </div>
    );
  }
};
