const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// DTO para el frontend, simplificado para crear solo clientes
interface CreateClientData {
    nombre: string;
    apellidos: string;
    telefono: string;
    fecha_nacimiento: string; // YYYY-MM-DD
}

/**
 * FUNCIÓN 1: Para el autocompletado de clientes.
 * Busca usuarios por un término de búsqueda en nombre, apellidos o teléfono.
 */
export const findUsersByTerm = async (token: string, searchTerm: string) => {
    if (!searchTerm.trim()) {
        return { data: [] };
    }

    const query = new URLSearchParams({ searchTerm, limit: '10' }).toString();
    const response = await fetch(`${API_URL}/users?${query}`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` },
    });

    if (!response.ok) throw new Error('Error al buscar usuarios');
    return response.json();
};

/**
 * FUNCIÓN 2: Para cargar listas de usuarios por su rol (ej: todos los barberos).
 */
export const findUsersByRole = async (token: string, rol: 'BARBERO' | 'CLIENTE' | 'ADMIN') => {
    // Ponemos un límite alto para asegurarnos de traer todos los barberos de una vez.
    const query = new URLSearchParams({ rol, limit: '100' }).toString();

    const response = await fetch(`${API_URL}/users?${query}`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` },
    });

    if (!response.ok) throw new Error(`Error al buscar usuarios con el rol ${rol}`);
    return response.json();
};

export const findUserByIdService = async (token: string, userId: number) => {
    // Si no nos pasan un ID válido, lanzamos un error.
    if (!userId) {
        throw new Error('ID de usuario no proporcionado');
    }

    // La URL correcta para buscar un usuario por su ID
    const response = await fetch(`${API_URL}/users/${userId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al buscar el usuario');
    }

    // Esta llamada debería devolver el objeto de un solo usuario
    return response.json();
};

export const createClientService = async (token: string, clientData: CreateClientData) => {
    const response = await fetch(`${API_URL}/users`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        // Hardcodeamos el tipo de perfil a 'CLIENTE' como pediste
        body: JSON.stringify({ ...clientData, tipo_perfil: 'CLIENTE' }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al crear el cliente');
    }
    return response.json();
};


export const getPublicBarbers = async () => {
    const response = await fetch(`${API_URL}/users/barbers`, { // Llama al nuevo endpoint
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al obtener la lista de barberos.');
    }
    return response.json();
};