// src/services/appointments.service.ts

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

interface FindAppointmentsParams {
  id_barbero: number;
  fecha_desde: string; // Formato YYYY-MM-DD
  fecha_hasta: string; // Formato YYYY-MM-DD
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