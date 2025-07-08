// src/pages/LoginPage.tsx
import { useState, type CSSProperties} from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { loginService } from '../services/auth.service';

// Estilos en línea para el componente (puedes moverlos a un .css si prefieres)
const styles: { [key: string]: CSSProperties } = {
    container: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '80vh',
      padding: '20px',
    },
    form: {
      padding: '40px',
      borderRadius: '8px',
      backgroundColor: 'var(--color-white)',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
      width: '100%',
      maxWidth: '400px',
    },
    title: {
      textAlign: 'center', // Ahora TypeScript entiende que esto es válido
      marginBottom: '30px',
    },
    // ...el resto de los estilos no cambian...
    error: {
      color: 'var(--color-primary)',
      textAlign: 'center', // Y que esto también es válido
      marginTop: '15px',
    }
  };


export const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const data = await loginService(username, password);
      // El backend devuelve el usuario y el token
      // El 'user' que viene del login del backend debe tener id, nombre, rol, etc.
      login(data.user, data.access_token);
      // Redirigimos al usuario a la página de inicio
      navigate('/');
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div style={styles.container}>
      <form onSubmit={handleSubmit} style={styles.form}>
        <h2 style={styles.title}>Acceso Personal</h2>
        <div style={styles.inputGroup}>
          <label htmlFor="username" style={styles.label}>Usuario</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            style={styles.input}
          />
        </div>
        <div style={styles.inputGroup}>
          <label htmlFor="password" style={styles.label}>Contraseña</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={styles.input}
          />
        </div>
        <button type="submit" style={styles.button}>Iniciar Sesión</button>
        {error && <p style={styles.error}>{error}</p>}
      </form>
    </div>
  );
};