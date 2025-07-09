// src/pages/appointments/ClientInformationPanel.tsx
import React, { useState } from 'react';
import { format } from 'date-fns';
import {
    requestNewAppointmentService,
    requestReturningAppointmentService,
    confirmAppointmentService,
} from '../../services/appointments.service'; // Asegúrate de que estas funciones existan

interface ClientInformationPanelProps {
    selectedBarber: any;
    selectedService: any;
    selectedDate: Date;
    selectedTime: string;
    onGoBack: () => void;
    onBookingRequestSuccess: (id: number) => void;
    onOtpConfirmationSuccess: () => void;
    provisionalAppointmentId: number | null;
    showOtpInput: boolean;
}

export const ClientInformationPanel: React.FC<ClientInformationPanelProps> = ({
    selectedBarber,
    selectedService,
    selectedDate,
    selectedTime,
    onGoBack,
    onBookingRequestSuccess,
    onOtpConfirmationSuccess,
    provisionalAppointmentId,
    showOtpInput,
}) => {
    // Estados para el formulario de nuevo cliente
    const [newClientName, setNewClientName] = useState('');
    const [newClientLastNames, setNewClientLastNames] = useState('');
    const [newClientBirthDate, setNewClientBirthDate] = useState(''); // YYYY-MM-DD
    const [newClientPhone, setNewClientPhone] = useState('');
    const [newClientFormError, setNewClientFormError] = useState<string | null>(null);
    const [newClientLoading, setNewClientLoading] = useState(false);

    // Estados para el formulario de cliente recurrente
    const [returningClientPhone, setReturningClientPhone] = useState('');
    const [returningClientFormError, setReturningClientFormError] = useState<string | null>(null);
    const [returningClientLoading, setReturningClientLoading] = useState(false);

    // Estados para la confirmación OTP
    const [otpCode, setOtpCode] = useState('');
    const [otpError, setOtpError] = useState<string | null>(null);
    const [otpLoading, setOtpLoading] = useState(false);

    // Canal de contacto (hardcodeado para pruebas)
    const CANAL_CONTACTO = 'telegram'; // O el valor que corresponda a tu configuración de Telegram

    const fullDateTime = `${format(selectedDate, 'yyyy-MM-dd')}T${selectedTime}:00.000Z`;

    const handleNewClientSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setNewClientFormError(null);
        setNewClientLoading(true);

        // Validaciones básicas en el frontend (el backend hará las más robustas)
        if (!newClientName || !newClientLastNames || !newClientBirthDate || !newClientPhone) {
            setNewClientFormError('Por favor, rellena todos los campos.');
            setNewClientLoading(false);
            return;
        }

        try {
            const response = await requestNewAppointmentService({
                id_barbero: selectedBarber.id,
                id_servicio: selectedService.id,
                fecha_hora_inicio: fullDateTime,
                nombre_cliente: newClientName,
                apellidos_cliente: newClientLastNames,
                fecha_nacimiento_cliente: newClientBirthDate,
                telefono_cliente: newClientPhone,
                canal_contacto_cliente: CANAL_CONTACTO,
            });
            onBookingRequestSuccess(response.id_cita_provisional);
        } catch (err: any) {
            setNewClientFormError(err.message || 'Error al solicitar la cita para nuevo cliente.');
        } finally {
            setNewClientLoading(false);
        }
    };

    const handleReturningClientSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setReturningClientFormError(null);
        setReturningClientLoading(true);

        if (!returningClientPhone) {
            setReturningClientFormError('Por favor, introduce tu número de teléfono.');
            setReturningClientLoading(false);
            return;
        }

        try {
            const response = await requestReturningAppointmentService({
                id_barbero: selectedBarber.id,
                id_servicio: selectedService.id,
                fecha_hora_inicio: fullDateTime,
                telefono_cliente: returningClientPhone,
                canal_contacto_cliente: CANAL_CONTACTO,
            });
            onBookingRequestSuccess(response.id_cita_provisional);
        } catch (err: any) {
            setReturningClientFormError(err.message || 'Error al solicitar la cita para cliente existente.');
        } finally {
            setReturningClientLoading(false);
        }
    };

    const handleOtpConfirm = async (e: React.FormEvent) => {
        e.preventDefault();
        setOtpError(null);
        setOtpLoading(true);

        if (!otpCode || otpCode.length !== 6) {
            setOtpError('Por favor, introduce el código de 6 dígitos.');
            setOtpLoading(false);
            return;
        }
        if (provisionalAppointmentId === null) {
            setOtpError('No hay una solicitud de cita provisional para confirmar.');
            setOtpLoading(false);
            return;
        }

        try {
            await confirmAppointmentService({
                id_cita_provisional: provisionalAppointmentId,
                codigo: otpCode,
            });
            onOtpConfirmationSuccess(); // Notificar al padre que la cita ha sido confirmada
        } catch (err: any) {
            setOtpError(err.message || 'Error al confirmar la cita. Código incorrecto o expirado.');
        } finally {
            setOtpLoading(false);
        }
    };

    return (
        <div>
            <div className="selection-panel client-info-panel">
                <h2>Paso 3: Tus Datos</h2>

                {!showOtpInput ? (
                    <div className="client-forms-container">
                        <div className="client-form new-client-form">
                            <h3>¿Primera vez?</h3>
                            <form onSubmit={handleNewClientSubmit}>
                                <div className="form-group">
                                    <label htmlFor="new-name">Nombre:</label>
                                    <input
                                        type="text"
                                        id="new-name"
                                        className="text-input"
                                        value={newClientName}
                                        onChange={(e) => setNewClientName(e.target.value)}
                                        disabled={newClientLoading}
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="new-lastnames">Apellidos:</label>
                                    <input
                                        type="text"
                                        id="new-lastnames"
                                        className="text-input"
                                        value={newClientLastNames}
                                        onChange={(e) => setNewClientLastNames(e.target.value)}
                                        disabled={newClientLoading}
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="new-birthdate">Fecha de Nacimiento:</label>
                                    <input
                                        type="date"
                                        id="new-birthdate"
                                        className="text-input"
                                        value={newClientBirthDate}
                                        onChange={(e) => setNewClientBirthDate(e.target.value)}
                                        disabled={newClientLoading}
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="new-phone">Teléfono:</label>
                                    <input
                                        type="tel"
                                        id="new-phone"
                                        className="text-input"
                                        value={newClientPhone}
                                        onChange={(e) => setNewClientPhone(e.target.value)}
                                        placeholder="Ej: 612345678"
                                        disabled={newClientLoading}
                                    />
                                </div>
                                {newClientFormError && <p className="error-message">{newClientFormError}</p>}
                                <button type="submit" className="button-primary" disabled={newClientLoading}>
                                    {newClientLoading ? 'Solicitando...' : 'Solicitar Cita'}
                                </button>
                            </form>
                        </div>

                        <div className="client-form returning-client-form">
                            <h3>¿De vuelta por aquí?</h3>
                            <form onSubmit={handleReturningClientSubmit}>
                                <div className="form-group">
                                    <label htmlFor="returning-phone">Teléfono:</label>
                                    <input
                                        type="tel"
                                        id="returning-phone"
                                        className="text-input"
                                        value={returningClientPhone}
                                        onChange={(e) => setReturningClientPhone(e.target.value)}
                                        placeholder="Ej: 612345678"
                                        disabled={returningClientLoading}
                                    />
                                </div>
                                {returningClientFormError && <p className="error-message">{returningClientFormError}</p>}
                                <button type="submit" className="button-primary" disabled={returningClientLoading}>
                                    {returningClientLoading ? 'Solicitando...' : 'Solicitar Cita'}
                                </button>
                            </form>
                        </div>
                    </div>
                ) : (
                    <div className="otp-confirmation-section">
                        <h3>Confirma tu Cita</h3>
                        <p>Hemos enviado un código de 6 dígitos a tu teléfono. Por favor, introdúcelo para confirmar tu cita.</p>
                        <form onSubmit={handleOtpConfirm}>
                            <div className="form-group">
                                <label htmlFor="otp-code">Código OTP:</label>
                                <input
                                    type="text"
                                    id="otp-code"
                                    className="text-input otp-input"
                                    value={otpCode}
                                    onChange={(e) => setOtpCode(e.target.value)}
                                    maxLength={6}
                                    disabled={otpLoading}
                                />
                            </div>
                            {otpError && <p className="error-message">{otpError}</p>}
                            <button type="submit" className="button-primary" disabled={otpLoading}>
                                {otpLoading ? 'Confirmando...' : 'Confirmar Cita'}
                            </button>
                        </form>
                    </div>
                )}
            </div>
            <div className="form-actions">
                <button type="button" onClick={onGoBack} className="button-secondary" disabled={showOtpInput}>
                    Anterior
                </button>
                {/* El botón Siguiente se reemplaza por los botones de solicitar/confirmar */}
            </div>
        </div>
    );
};