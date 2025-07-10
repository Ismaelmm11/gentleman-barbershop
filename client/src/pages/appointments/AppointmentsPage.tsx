// src/pages/appointments/AppointmentsPage.tsx
import React, { useState, useEffect } from 'react';
import { BarberServiceSelectionPanel } from './BarberServiceSelectionPanel';
import { AppointmentTimeSelectionPanel } from './AppointmentTimeSelectionPanel';
import { ClientInformationPanel } from './ClientInformationPanel'; // <-- Nueva importación
import { getAllServices } from '../../services/services.service';
import { getPublicBarbers } from '../../services/users.service';
import { formatDate } from '@fullcalendar/core/index.js';

export const AppointmentsPage: React.FC = () => {
    const [currentPanel, setCurrentPanel] = useState(1);
    const [selectedBarber, setSelectedBarber] = useState<any>(null);
    const [selectedService, setSelectedService] = useState<any>(null);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [selectedTime, setSelectedTime] = useState<string | null>(null);

    // Nuevos estados para el flujo OTP
    const [provisionalAppointmentId, setProvisionalAppointmentId] = useState<number | null>(null);
    const [showOtpInput, setShowOtpInput] = useState(false);
    const [bookingSuccessMessage, setBookingSuccessMessage] = useState<string | null>(null);


    const [barbers, setBarbers] = useState<any[]>([]);
    const [services, setServices] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const barbersData = await getPublicBarbers();
                setBarbers(barbersData.data);

                const servicesData = await getAllServices();
                setServices(servicesData);
            } catch (err: any) {
                setError(err.message || 'Error al cargar los datos iniciales.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleNextPanel = () => {
        setCurrentPanel(prev => prev + 1);
    };

    const handlePreviousPanel = () => {
        setCurrentPanel(prev => prev - 1);
        // Al volver, si estábamos en el paso 3 y se había solicitado cita, resetear estados OTP
        if (currentPanel === 3) {
            setProvisionalAppointmentId(null);
            setShowOtpInput(false);
            setBookingSuccessMessage(null);
        }
    };

    const handleBarberServiceSelectionComplete = (barber: any, service: any) => {
        setSelectedBarber(barber);
        setSelectedService(service);
        handleNextPanel();
    };

    const handleTimeSelectionComplete = (date: Date, time: string) => {
        setSelectedDate(date);
        setSelectedTime(time);
        handleNextPanel();
    };

    // Función que se llama cuando la solicitud de cita provisional es exitosa
    const handleBookingRequestSuccess = (id: number) => {
        setProvisionalAppointmentId(id);
        setShowOtpInput(true); // Mostrar el campo para introducir el OTP
    };

    // Función que se llama cuando la confirmación OTP es exitosa
    const handleOtpConfirmationSuccess = () => {
        setBookingSuccessMessage('¡Cita confirmada con éxito! Recibirás una notificación.');
        // Podrías redirigir al usuario a una página de confirmación o al inicio
        setCurrentPanel(4); // Un panel final de éxito
    };


    if (loading) {
        return <div className="loading-spinner">Cargando barberos y servicios...</div>;
    }

    if (error) {
        return <div className="error-message">Error: {error}</div>;
    }

    return (
        <div className="appointments-page main-content">
            <h1 className="analytics-title">Reservar Cita</h1>

            {/* Sección de resumen de la reserva */}
            <div className="booking-summary">
                {selectedBarber && (
                    <p>
                        <strong>Barbero:</strong> {selectedBarber.nombre} {selectedBarber.apellidos}
                    </p>
                )}
                {selectedService && (
                    <p>
                        <strong>Servicio:</strong> {selectedService.nombre} ({selectedService.duracion_minutos} min)
                    </p>
                )}
                {selectedDate && selectedTime && (
                    <p>
                        <strong>Fecha y Hora:</strong> {formatDate(selectedDate)} a las {selectedTime}
                    </p>
                )}
            </div>

            {currentPanel === 1 && (
                <BarberServiceSelectionPanel
                    barbers={barbers}
                    services={services}
                    onSelectionComplete={handleBarberServiceSelectionComplete}
                    initialSelectedBarber={selectedBarber}
                    initialSelectedService={selectedService}
                />
            )}

            {currentPanel === 2 && selectedBarber && selectedService && (
                <AppointmentTimeSelectionPanel
                    selectedBarberId={selectedBarber.id}
                    selectedServiceId={selectedService.id}
                    onTimeSelectionComplete={handleTimeSelectionComplete}
                    onGoBack={handlePreviousPanel}
                    initialSelectedDate={selectedDate}
                    initialSelectedTime={selectedTime}
                />
            )}

            {console.log('Estado de renderizado del Panel 3:', {
                currentPanel,
                selectedBarber: !!selectedBarber, // Convierte a boolean para fácil lectura
                selectedService: !!selectedService,
                selectedDate: !!selectedDate,
                selectedTime: !!selectedTime,
            })}

            {currentPanel === 3 && selectedBarber && selectedService && selectedDate && selectedTime && (
                <ClientInformationPanel
                    selectedBarber={selectedBarber}
                    selectedService={selectedService}
                    selectedDate={selectedDate}
                    selectedTime={selectedTime}
                    onGoBack={handlePreviousPanel}
                    onBookingRequestSuccess={handleBookingRequestSuccess}
                    onOtpConfirmationSuccess={handleOtpConfirmationSuccess}
                    provisionalAppointmentId={provisionalAppointmentId}
                    showOtpInput={showOtpInput}
                />
            )}

            {currentPanel === 4 && bookingSuccessMessage && (
                <div className="selection-panel success-panel">
                    <h2>¡Reserva Completada!</h2>
                    <p>{bookingSuccessMessage}</p>
                    <button onClick={() => setCurrentPanel(1)} className="button-primary btn">
                        <span>Hacer otra reserva</span>
                    </button>
                </div>
            )}
        </div>
    );
};