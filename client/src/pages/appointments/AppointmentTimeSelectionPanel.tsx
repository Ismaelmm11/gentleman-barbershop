// src/pages/appointments/AppointmentTimeSelectionPanel.tsx
import React, { useState, useEffect } from 'react';
import { DayPicker } from 'react-day-picker'; // <-- Importación corregida: eliminamos DayContent
import { format, isSameDay, isBefore, startOfDay, addMonths } from 'date-fns';
import { es } from 'date-fns/locale';
import { getDailyAvailabilityService } from '../../services/appointments.service';

interface AppointmentTimeSelectionPanelProps {
  selectedBarberId: number;
  selectedServiceId: number;
  onTimeSelectionComplete: (date: Date, time: string) => void;
  onGoBack: () => void;
  initialSelectedDate?: Date | null;
  initialSelectedTime?: string | null;
}

export const AppointmentTimeSelectionPanel: React.FC<AppointmentTimeSelectionPanelProps> = ({
  selectedBarberId,
  selectedServiceId,
  onTimeSelectionComplete,
  onGoBack,
  initialSelectedDate,
  initialSelectedTime,
}) => {
  const [selectedDay, setSelectedDay] = useState<Date | undefined>(initialSelectedDate || undefined);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [loadingAvailability, setLoadingAvailability] = useState(false);
  const [availabilityError, setAvailabilityError] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(initialSelectedTime || null);

  const today = new Date();
  today.setHours(0, 0, 0, 0); // Resetear horas para comparación de días

  // Cargar disponibilidad cuando cambie el día seleccionado, barbero o servicio
  useEffect(() => {
    const fetchAvailability = async () => {
      if (!selectedDay || !selectedBarberId || !selectedServiceId) {
        setAvailableSlots([]);
        return;
      }

      setLoadingAvailability(true);
      setAvailabilityError(null);
      setSelectedSlot(null); // Resetear hora seleccionada al cambiar de día

      try {
        const formattedDate = format(selectedDay, 'yyyy-MM-dd');
        const data = await getDailyAvailabilityService(
          selectedBarberId,
          selectedServiceId,
          formattedDate
        );

        let filteredSlots = data.availableSlots;

        // Si es el día actual, filtrar las horas pasadas
        if (isSameDay(selectedDay, new Date())) {
          const now = new Date(); // Hora actual, incluyendo minutos y segundos

          filteredSlots = data.availableSlots.filter((slot: string) => {
            const [slotHourStr, slotMinuteStr] = slot.split(':');
            const slotHour = parseInt(slotHourStr, 10);
            const slotMinute = parseInt(slotMinuteStr, 10);

            // Crear un objeto Date para el FIN del slot.
            // Un slot que empieza a las X:00 y dura 30 minutos, termina a las X:30.
            const slotEndTime = new Date(); // Usar la fecha actual
            slotEndTime.setHours(slotHour, slotMinute + 30, 0, 0); // Establecer la hora de fin del slot

            // El slot es válido si su hora de fin es posterior a la hora actual.
            return slotEndTime.getTime() > now.getTime();
          });
        }
        setAvailableSlots(filteredSlots);
      } catch (err: any) {
        setAvailabilityError(err.message || 'Error al cargar la disponibilidad.');
        setAvailableSlots([]);
      } finally {
        setLoadingAvailability(false);
      }
    };

    fetchAvailability();
  }, [selectedDay, selectedBarberId, selectedServiceId]);


  const handleDaySelect = (day: Date | undefined) => {
    if (day) {
      // No permitir seleccionar días cuyo inicio ya pasó.
      if (isBefore(startOfDay(day), startOfDay(today))) {
        return; // No hacer nada si el día es anterior al día actual
      }
      setSelectedDay(day);
    } else {
      setSelectedDay(undefined);
      setAvailableSlots([]);
      setSelectedSlot(null);
    }
  };

  const handleSlotSelect = (slot: string) => {
    setSelectedSlot(slot);
    setAvailabilityError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDay || !selectedSlot) {
      setAvailabilityError('Por favor, selecciona un día y una hora.');
      return;
    }
    onTimeSelectionComplete(selectedDay, selectedSlot);
  };

  return (
    <div className="selection-panel">
      <h2>Paso 2: Selecciona Día y Hora</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group calendar-group">
          <label>Selecciona un día:</label>
          <DayPicker
            mode="single"
            selected={selectedDay}
            onSelect={handleDaySelect}
            showOutsideDays
            fromMonth={today} // No permite meses anteriores al actual
            toDate={addMonths(today, 6)} // Limita la selección a 6 meses en el futuro
            locale={es} // Establece el idioma a español
            // ¡ELIMINADO render={renderDay} porque ya no es necesario ni válido para esta personalización!
            disabled={(day) => isBefore(startOfDay(day), startOfDay(today))} // Deshabilita días anteriores al día actual
          />
        </div>

        {selectedDay && (
          <div className="form-group time-slots-group">
            <label>Horas disponibles para {format(selectedDay, 'PPPP', { locale: es })}:</label>
            {loadingAvailability ? (
              <div className="loading-spinner small-spinner">Cargando horas...</div>
            ) : availabilityError ? (
              <p className="error-message">{availabilityError}</p>
            ) : availableSlots.length > 0 ? (
              <div className="time-slots-grid">
                {availableSlots.map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    className={`time-slot-button ${selectedSlot === slot ? 'active' : ''}`}
                    onClick={() => handleSlotSelect(slot)}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            ) : (
              <p className="no-availability">No hay horas disponibles para este día.</p>
            )}
          </div>
        )}

        {availabilityError && <p className="error-message">{availabilityError}</p>}

        <div className="form-actions">
          <button type="button" onClick={onGoBack} className="button-secondary">
            Anterior
          </button>
          <button type="submit" className="button-primary" disabled={!selectedDay || !selectedSlot}>
            Siguiente
          </button>
        </div>
      </form>
    </div>
  );
};