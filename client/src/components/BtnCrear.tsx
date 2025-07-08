// src/components/CreateAppointmentButton.tsx

import React from 'react';

/**
 * Props para el componente CreateAppointmentButton.
 * @param onClick - La función que se ejecuta cuando se hace clic en el botón.
 * @param disabled - Un booleano para deshabilitar el botón, por ejemplo, si no se ha seleccionado un barbero.
 */
interface CreateAppointmentButtonProps {
  onClick: () => void;
  disabled: boolean;
}

export const CreateAppointmentButton: React.FC<CreateAppointmentButtonProps> = ({ onClick, disabled }) => {
  // Añadimos una clase CSS para poder darle estilos al botón cuando está deshabilitado
  const buttonClassName = `create-event-btn ${disabled ? 'disabled' : ''}`;

  return (
    <div className="create-event-container">
      <button
        onClick={onClick}
        disabled={disabled}
        className={buttonClassName}
        // El 'title' ofrece feedback al usuario sobre por qué el botón está deshabilitado
        title={disabled ? "Selecciona un barbero para poder crear un evento" : "Crear una nueva cita o descanso"}
      >
        ✚ Crear Evento
      </button>
    </div>
  );
};