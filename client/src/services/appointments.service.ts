// src/services/appointments.service.ts

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const MY_CONTACT_CHANNEL = '1241849910';

interface FindAppointmentsParams {
  id_barbero: number;
  fecha_desde: string; // Formato YYYY-MM-DD
  fecha_hasta: string; // Formato YYYY-MM-DD
}

// Interfaces para los DTOs del frontend (para consistencia)
interface RequestNewAppointmentDtoFrontend {
  id_barbero: number;
  id_servicio: number;
  fecha_hora_inicio: string; // Formato ISO string
  nombre_cliente: string;
  apellidos_cliente: string;
  fecha_nacimiento_cliente: string; // Formato YYYY-MM-DD
  telefono_cliente: string;
  canal_contacto_cliente: string;
}

interface RequestReturningAppointmentDtoFrontend {
  id_barbero: number;
  id_servicio: number;
  fecha_hora_inicio: string; // Formato ISO string
  telefono_cliente: string;
  canal_contacto_cliente: string;
}

interface ConfirmAppointmentDtoFrontend {
  id_cita_provisional: number;
  codigo: string;
}

export const getAppointmentsService = async (token: string, params: FindAppointmentsParams) => {
  // Construimos los query params para la URL
  const query = new URLSearchParams({
    id_barbero: String(params.id_barbero),
    fecha_desde: params.fecha_desde,
    fecha_hasta: params.fecha_hasta,
  }).toString();
  

  const response = await fetch(`${API_URL}/appointments?${query}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Error al obtener las citas');
  }

  return response.json();
};

/**
 * Crea una nueva cita o descanso desde el panel interno.
 */
export const createAppointmentService = async (token: string, appointmentDto: any) => {
    const response = await fetch(`${API_URL}/appointments/internal`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(appointmentDto),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al crear la cita');
    }
    return response.json();
};

/**
 * Actualiza una cita existente.
 */
export const updateAppointmentService = async (token: string, appointmentId: number, updateDto: any) => {
    const response = await fetch(`${API_URL}/appointments/${appointmentId}`, {
        method: 'PATCH', // Usamos PATCH para actualizaciones parciales
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updateDto),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al actualizar la cita');
    }
    return response.json();
};

/**
 * Elimina una cita existente.
 */
export const deleteAppointmentService = async (token: string, appointmentId: number) => {
    const response = await fetch(`${API_URL}/appointments/${appointmentId}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al eliminar la cita');
    }
    return response.json();
};

/**
 * Obtiene la disponibilidad diaria para un barbero y servicio específicos.
 */
export const getDailyAvailabilityService = async (
  barberId: number,
  serviceId: number,
  date: string // Formato 'YYYY-MM-DD'
) => {
  const query = new URLSearchParams({
    id_barbero: String(barberId),
    id_servicio: String(serviceId), // Aunque el backend no lo use en la lógica de slots, lo pasamos
    fecha: date,
  }).toString();

  const response = await fetch(`${API_URL}/appointments/availability/day?${query}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Error al obtener la disponibilidad.');
  }

  return response.json();
};

/**
 * Solicita una cita para un cliente nuevo.
 */
export const requestNewAppointmentService = async (appointmentData: RequestNewAppointmentDtoFrontend) => {
  const response = await fetch(`${API_URL}/appointments/request-new`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ...appointmentData,
      canal_contacto_cliente: MY_CONTACT_CHANNEL, // <-- Se añade aquí
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Error al solicitar la cita para nuevo cliente.');
  }
  return response.json();
};

/**
 * Solicita una cita para un cliente existente.
 */
export const requestReturningAppointmentService = async (appointmentData: RequestReturningAppointmentDtoFrontend) => {
  const response = await fetch(`${API_URL}/appointments/request-returning`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ...appointmentData,
      canal_contacto_cliente: MY_CONTACT_CHANNEL, // <-- Se añade aquí
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Error al solicitar la cita para cliente existente.');
  }
  return response.json();
};

/**
 * Confirma una cita provisional con un código OTP.
 */
export const confirmAppointmentService = async (confirmData: ConfirmAppointmentDtoFrontend) => {
  const response = await fetch(`${API_URL}/appointments/confirm`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(confirmData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Error al confirmar la cita.');
  }
  return response.json();
};