// src/routes/ProtectedRoute.tsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { type ReactNode } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles: string[];
}

export const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    // Si el usuario no está autenticado, lo redirigimos al login
    return <Navigate to="/login" replace />;
  }

  if (!user || !allowedRoles.includes(user.rol)) {
    // Si el usuario está autenticado pero no tiene el rol permitido,
    // lo redirigimos a la página de inicio.
    return <Navigate to="/" replace />;
  }

  // Si todo está en orden, mostramos el contenido de la página
  return <>{children}</>;
};
