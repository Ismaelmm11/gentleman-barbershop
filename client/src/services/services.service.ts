const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Esta función pide todos los servicios a la API.
// La dejamos pública (sin token) porque los clientes también necesitan verla.
export const getAllServices = async () => {
    const response = await fetch(`${API_URL}/services`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        throw new Error('Error al obtener los servicios');
    }

    return response.json();
};