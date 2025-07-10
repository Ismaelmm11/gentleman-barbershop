// src/pages/appointments/BarberServiceSelectionPanel.tsx
import React, { useState, useEffect } from 'react';
import '../../index.css'; // Asegúrate de que tus estilos estén importados

interface BarberServiceSelectionPanelProps {
  barbers: any[];
  services: any[];
  onSelectionComplete: (barber: any, service: any) => void;
  initialSelectedBarber?: any;
  initialSelectedService?: any;
}

export const BarberServiceSelectionPanel: React.FC<BarberServiceSelectionPanelProps> = ({
  barbers,
  services,
  onSelectionComplete,
  initialSelectedBarber,
  initialSelectedService,
}) => {
  const [selectedBarberId, setSelectedBarberId] = useState<number | null>(
    initialSelectedBarber?.id || null
  );
  const [selectedServiceId, setSelectedServiceId] = useState<number | null>(
    initialSelectedService?.id || null
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Si se proporcionan valores iniciales, actualizar el estado local
    if (initialSelectedBarber) setSelectedBarberId(initialSelectedBarber.id);
    if (initialSelectedService) setSelectedServiceId(initialSelectedService.id);
  }, [initialSelectedBarber, initialSelectedService]);

  const handleBarberChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedBarberId(Number(e.target.value));
    setError(null);
  };

  const handleServiceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedServiceId(Number(e.target.value));
    setError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedBarberId === null || selectedServiceId === null) {
      setError('Por favor, selecciona un barbero y un servicio.');
      return;
    }

    const barber = barbers.find((b) => b.id === selectedBarberId);
    const service = services.find((s) => s.id === selectedServiceId);

    if (barber && service) {
      onSelectionComplete(barber, service);
    } else {
      setError('Las selecciones no son válidas. Por favor, inténtalo de nuevo.');
    }
  };

  return (
    <div className="selection-panel">
      <h2>Paso 1: Selecciona tu Barbero y Servicio</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="barber-select">Barbero:</label>
          <select
            id="barber-select"
            value={selectedBarberId || ''}
            onChange={handleBarberChange}
            className="select-input"
          >
            <option value="">Selecciona un barbero</option>
            {barbers.map((barber) => (
              <option key={barber.id} value={barber.id}>
                {barber.nombre} {barber.apellidos}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="service-select">Servicio:</label>
          <select
            id="service-select"
            value={selectedServiceId || ''}
            onChange={handleServiceChange}
            className="select-input"
          >
            <option value="">Selecciona un servicio</option>
            {services.map((service) => (
              <option key={service.id} value={service.id}>
                {service.nombre} ({service.duracion_minutos} min) - {service.precio_base}€
              </option>
            ))}
          </select>
        </div>

        {error && <p className="error-message">{error}</p>}

        <button type="submit" className="button-primary btn">
          <span>Siguiente</span>
        </button>
      </form>
    </div>
  );
};