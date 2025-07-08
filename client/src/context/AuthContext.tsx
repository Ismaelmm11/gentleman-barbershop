// src/context/AuthContext.tsx
import { createContext, useState, useContext, type ReactNode } from 'react';
import { logoutService } from '../services/auth.service'; // Importamos el nuevo servicio

// Define la forma que tendrán los datos del usuario y el contexto
interface User {
  id: number;
  nombre: string;
  apellidos: string;
  fecha_nacimiento: string;
  telefono: string;
  rol: string;

  // ...puedes añadir más campos del usuario aquí
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (userData: User, token: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

// Creamos el contexto con un valor inicial
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Creamos el "Proveedor" que envolverá nuestra aplicación
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  const login = (userData: User, token: string) => {
    setUser(userData);
    setToken(token);
    // Guardamos el token en localStorage para mantener la sesión
    localStorage.setItem('authToken', token);
  };

  const logout = async () => {
    if (token) {
      // Primero, intentamos invalidar el token en el backend
      await logoutService(token);
    }
    
    // Después, SIEMPRE limpiamos el estado local y el localStorage,
    // haya funcionado o no la llamada a la API.
    setUser(null);
    setToken(null);
    localStorage.removeItem('authToken');
  };

  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

// Creamos un "hook" personalizado para usar el contexto fácilmente
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};