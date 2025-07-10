// src/pages/LoginPage.tsx
import { useState } from 'react'; // Eliminamos 'type CSSProperties'
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { loginService } from '../services/auth.service';

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
      login(data.user, data.access_token);
      navigate('/'); // Redirigimos al usuario a la página de inicio
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="login-container"> {/* Usamos la clase CSS */}
      <form onSubmit={handleSubmit} className="login-form"> {/* Usamos la clase CSS */}
        <h2 className="login-title">Acceso Personal</h2> {/* Usamos la clase CSS */}
        <div className="input-group"> {/* Usamos la clase CSS */}
          <label htmlFor="username" className="login-label">Usuario</label> {/* Usamos la clase CSS */}
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="login-input" // Usamos la clase CSS
          />
        </div>
        <div className="input-group"> {/* Usamos la clase CSS */}
          <label htmlFor="password" className="login-label">Contraseña</label> {/* Usamos la clase CSS */}
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="login-input" // Usamos la clase CSS
          />
        </div>
        <button className="login-button button-primary btn" type="submit"> {/* Usamos clase CSS y tus clases existentes */}
          <span>Iniciar Sesión</span>
        </button>
        {error && <p className="login-error">{error}</p>} {/* Usamos la clase CSS */}
      </form>
    </div>
  );
};