import { useState, useEffect } from 'react';
import { ClientAutocomplete } from './ClientAutocomplete';
import { CreateClientPanel } from './CreateClientPanel';

// Definimos los tipos para las props que el panel recibirá
interface EventPanelProps {
    panelState: {
        isOpen: boolean;
        mode: 'CREATE' | 'EDIT' | null;
        data: any | null;
    };
    services: any[]; // La lista de servicios para el desplegable
    editingClientName: string;
    onClose: () => void;
    onSave: (formData: any, formType: 'CITA' | 'DESCANSO') => void;
    onDelete: (eventId: number) => void;
    onClientCreated: (newClient: any) => void; // Para notificar al padre del nuevo cliente
}

export const EventPanel = ({ panelState, services, editingClientName, onClose, onSave, onDelete, onClientCreated }: EventPanelProps) => {
    // Estado interno para manejar los datos del formulario
    const [formData, setFormData] = useState(panelState.data);

    // Estado para controlar si se muestra el formulario de Cita o de Descanso
    const [formType, setFormType] = useState<'CITA' | 'DESCANSO'>(
        panelState.data?.estado === 'DESCANSO' ? 'DESCANSO' : 'CITA'
    );

    // Estado para controlar la visibilidad del panel de creación de cliente
    const [isClientPanelOpen, setClientPanelOpen] = useState(false);

    // useEffect para sincronizar el estado del formulario si los datos iniciales cambian
    useEffect(() => {
        setFormData(panelState.data);
        // Resetea el tipo de formulario si es un descanso al editar
        if (panelState.mode === 'EDIT') {
            setFormType(panelState.data?.estado === 'DESCANSO' ? 'DESCANSO' : 'CITA');
        }
    }, [panelState.data]);

    // Manejador genérico para los cambios en los inputs del formulario
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // 👇 CORRECCIÓN: Un manejador específico para el servicio que también actualiza el precio
    const handleServiceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const serviceId = parseInt(e.target.value);
        const selectedService = services.find(s => s.id === serviceId);
        
        setFormData({
            ...formData,
            id_servicio: serviceId,
            precio_final: selectedService ? selectedService.precio_base : 0,
        });
    };

    // Cuando se selecciona un cliente del autocompletado
    const handleClientSelect = (client: { id: number }) => {
        setFormData({ ...formData, id_cliente: client.id });
    };

    // Cuando se crea un nuevo cliente en el panel anidado
    const handleClientCreated = (newClient: any) => {
        // Notificamos al padre para que pueda actualizar el nombre en el autocompletado
        onClientCreated(newClient);
        // Actualizamos el ID del cliente en nuestro formulario
        setFormData({ ...formData, id_cliente: newClient.id });
    };

    // Título dinámico para el panel
    const getTitle = () => {
        if (panelState.mode === 'EDIT') {
            return formType === 'CITA' ? 'Editar Cita' : 'Editar Descanso';
        }
        return formType === 'CITA' ? 'Crear Cita' : 'Crear Descanso';
    };

    return (
        <div className="panel-overlay" onClick={onClose}>
            <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
                <button className="close-panel-button" onClick={onClose}>×</button>

                {/* Selector CITA / DESCANSO (solo en modo CREAR) */}
                {panelState.mode === 'CREATE' && (
                    <div className="view-mode-selector margin-view" style={{ marginBottom: '20px' }}>
                        <button onClick={() => setFormType('CITA')} className={formType === 'CITA' ? 'active' : ''}>Cita</button>
                        <button onClick={() => setFormType('DESCANSO')} className={formType === 'DESCANSO' ? 'active' : ''}>Descanso</button>
                    </div>
                )}

                <h2>{getTitle()}</h2>

                {/* FORMULARIO DE CITA */}
                {formType === 'CITA' && (
                    <form>
                        <div className="form-group">
                            <label htmlFor="appointment-date">Fecha</label>
                            <input type="date" id="appointment-date" name="appointmentDate" value={formData?.appointmentDate || ''} onChange={handleChange} />
                        </div>
                        <div className="time-inputs-group">
                            <div className="div-time">
                                <label htmlFor="start-time">Hora Inicio</label>
                                <input type="time" id="start-time" name="startTime" value={formData?.startTime || ''} onChange={handleChange} step="300" />
                            </div>
                            <div className="div-time">
                                <label htmlFor="end-time">Hora Fin</label>
                                <input type="time" id="end-time" name="endTime" value={formData?.endTime || ''} onChange={handleChange} step="300" />
                            </div>
                        </div>
                        <div className="form-group">
                            <label htmlFor="service-select">Servicio</label>
                            <select id="service-select" name="id_servicio" value={formData?.id_servicio || ''} onChange={handleServiceChange}>
                                <option value="" disabled>Selecciona un servicio...</option>
                                {services.map(service => <option key={service.id} value={service.id}>{service.nombre}</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <label htmlFor="price-input">Precio Final (€)</label>
                            <input type="number" id="price-input" name="precio_final" value={formData?.precio_final || ''} onChange={handleChange} step="0.50" />
                        </div>
                        <div className="form-group">
                            <label>Cliente</label>
                            <ClientAutocomplete onClientSelect={handleClientSelect} initialClientName={editingClientName} />
                            <button type="button" className="button-link" onClick={() => setClientPanelOpen(true)}>+ Crear nuevo cliente</button>
                        </div>
                    </form>
                )}

                {/* FORMULARIO DE DESCANSO */}
                {formType === 'DESCANSO' && (
                    <form>
                        <div className="form-group">
                            <label htmlFor="break-title">Título del Descanso</label>
                            <input type="text" id="break-title" name="titulo" value={formData?.titulo || ''} onChange={handleChange} placeholder="Ej: Comida, Cita médica..." />
                        </div>
                        <div className="form-group">
                            <label htmlFor="appointment-date">Fecha</label>
                            <input type="date" id="appointment-date" name="appointmentDate" value={formData?.appointmentDate || ''} onChange={handleChange} />
                        </div>
                        <div className="time-inputs-group">
                            <div className="div-time">
                                <label htmlFor="start-time">Hora Inicio</label>
                                <input type="time" id="start-time" name="startTime" value={formData?.startTime || ''} onChange={handleChange} step="300" />
                            </div>
                            <div className="div-time">
                                <label htmlFor="end-time">Hora Fin</label>
                                <input type="time" id="end-time" name="endTime" value={formData?.endTime || ''} onChange={handleChange} step="300" />
                            </div>
                        </div>
                    </form>
                )}

                {/* BOTONES DE ACCIÓN */}
                <div className="panel-actions">
                    <button onClick={() => onSave(formData, formType)} className="button-primary">
                        {panelState.mode === 'CREATE' ? 'Guardar' : 'Actualizar'}
                    </button>
                    {panelState.mode === 'EDIT' && (
                        <button onClick={() => onDelete(formData.id)} className="button-danger">Eliminar</button>
                    )}
                    <button onClick={onClose} className="button-secondary">Cancelar</button>
                </div>

                {/* PANEL ANIDADO PARA CREAR CLIENTE */}
                {isClientPanelOpen && (
                    <CreateClientPanel
                        onClose={() => setClientPanelOpen(false)}
                        onClientCreated={handleClientCreated}
                    />
                )}
            </div>
        </div>
    );
};