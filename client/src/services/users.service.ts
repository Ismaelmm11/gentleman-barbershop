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

// DTOs e Interfaces para el Frontend
interface UserData {
    nombre: string;
    apellidos: string;
    telefono: string;
    fecha_nacimiento: string; // YYYY-MM-DD
    username?: string;
    password?: string;
    tipo_perfil: 'ADMIN' | 'BARBERO' | 'TATUADOR' | 'CLIENTE';
}

interface UpdateUserData {
    nombre?: string;
    apellidos?: string;
    telefono?: string;
    fecha_nacimiento?: string;
    username?: string | null; // username puede ser null si es cliente
    password?: string; // Aunque no se actualizará por esta ruta
}

interface FindAllUsersQueryFrontend {
    limit?: number;
    page?: number;
    searchTerm?: string;
    rol?: 'ADMIN' | 'BARBERO' | 'TATUADOR' | 'CLIENTE';
}

/**
 * Obtiene todos los usuarios con paginación, filtros de búsqueda y por rol.
 * Accesible solo por ADMIN.
 */
export const getAllUsers = async (token: string, query: FindAllUsersQueryFrontend) => {
    const params = new URLSearchParams();
    if (query.limit) params.append('limit', String(query.limit));
    if (query.page) params.append('page', String(query.page));
    if (query.searchTerm) params.append('searchTerm', query.searchTerm);
    if (query.rol) params.append('rol', query.rol);

    const response = await fetch(`${API_URL}/users?${params.toString()}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al cargar usuarios.');
    }
    return response.json(); // Esperamos { data: [], meta: { total, page, limit, last_page } }
};

/**
 * Crea un nuevo usuario. Solo ADMIN puede crear roles que no sean CLIENTE.
 */
export const createUser = async (token: string, userData: UserData) => {
    const response = await fetch(`${API_URL}/users`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(userData),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al crear el usuario.');
    }
    return response.json();
};

/**
 * Actualiza los datos personales de un usuario (no rol ni contraseña).
 */
export const updateUser = async (token: string, id: number, userData: UpdateUserData) => {
    const response = await fetch(`${API_URL}/users/${id}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(userData),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al actualizar el usuario.');
    }
    return response.json();
};

/**
 * Actualiza el rol de un usuario. Solo ADMIN.
 */
export const updateUserRole = async (token: string, userId: number, newRole: UserData['tipo_perfil']) => {
    const response = await fetch(`${API_URL}/users/${userId}/profile`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ tipo_perfil: newRole }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al actualizar el rol del usuario.');
    }
    return response.json();
};

/**
 * Elimina un usuario.
 */
export const deleteUser = async (token: string, id: number) => {
    const response = await fetch(`${API_URL}/users/${id}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al eliminar el usuario.');
    }
    return response.json();
};