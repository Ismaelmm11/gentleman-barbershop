// src/services/auth.service.ts

// La URL base de nuestra API. Ajústala si es necesario.
const API_URL = import.meta.env.VITE_API_URL;

export const loginService = async (username: string, password: string) => {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, password }),
  });

  if (!response.ok) {
    // Si la respuesta no es 2xx, lanzamos un error
    const errorData = await response.json();
    throw new Error(errorData.message || 'Error al iniciar sesión');
  }

  return response.json();
};

// --- AÑADE ESTA NUEVA FUNCIÓN ---
export const logoutService = async (token: string) => {
  // No necesitamos esperar la respuesta, pero sí manejar errores
  try {
    await fetch(`${API_URL}/auth/logout`, {
      method: 'POST',
      headers: {
        // Así es como se envían los tokens para autenticación
        'Authorization': `Bearer ${token}`,
      },
    });
    // Si la petición tiene éxito, no hacemos nada.
  } catch (error) {
    // Si hay un error de red, lo mostramos en la consola.
    // No lanzamos un error al usuario, porque el logout en el frontend
    // se debe completar de todas formas.
    console.error('Error al intentar cerrar la sesión en el servidor:', error);
  }
};