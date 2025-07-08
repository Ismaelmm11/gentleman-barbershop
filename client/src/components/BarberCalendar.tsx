import { useState, useEffect } from 'react';
import { CalendarHeader } from '../components/CalendarHeader';
import { CalendarView } from '../components/CalendarView';
import { getAllServices } from '../services/services.service';
import { getAppointmentsService, createAppointmentService, updateAppointmentService, deleteAppointmentService } from '../services/appointments.service';
import { findUserByIdService, findUsersByRole } from '../services/users.service'; // Necesitaremos este servicio
import { BarberFabMenu } from '../components/BarberFabMenu';
import { EventPanel } from '../components/EventPanel';
import { useAuth } from '../context/AuthContext';
import { type EventClickArg } from '@fullcalendar/core/index.js';
import { CreateAppointmentButton } from './BtnCrear';

interface Barber {
    id: number;
    nombre: string;
    apellidos: string;
}

interface PanelState {
    isOpen: boolean;
    mode: 'CREATE' | 'EDIT' | null;
    data: any | null;
}

interface Appointment {
    id: string;
    titulo: string;
    fecha_hora_inicio: string;
    fecha_hora_fin: string;
}

// --- INTERFAZ PARA EL EVENTO POSICIONADO ---
interface PositionedEvent {
    id: string;
    title: string;
    start: Date;
    end: Date;
    extendedProps: {
        layout: {
            width: number;
            left: number;
        };
        [key: string]: any;
    };
}

interface Service {
    id: number;
    nombre: string;
    precio_base: number;
    // ...otras propiedades del servicio
}

// --- ALGORITMO DE CÁLCULO DE LAYOUT ---
// Lo ponemos fuera del componente porque es una función pura y no necesita recrearse
const calculateEventLayout = (events: any[]): PositionedEvent[] => {
    const sortedEvents = [...events].sort((a, b) => a.start.getTime() - b.start.getTime());
    const positionedEvents: PositionedEvent[] = [];

    while (sortedEvents.length > 0) {
        const currentEvent = sortedEvents.shift()!;
        let overlappingGroup = [currentEvent];
        let i = 0;
        while (i < sortedEvents.length) {
            const nextEvent = sortedEvents[i];
            const groupEndTime = Math.max(...overlappingGroup.map(e => e.end.getTime()));
            if (nextEvent.start.getTime() < groupEndTime) {
                overlappingGroup.push(sortedEvents.splice(i, 1)[0]);
                i = 0;
            } else {
                i++;
            }
        }

        let maxColumns = 0;
        for (const event of overlappingGroup) {
            let concurrent = 1;
            for (const other of overlappingGroup) {
                if (event !== other && event.start < other.end && event.end > other.start) {
                    concurrent++;
                }
            }
            if (concurrent > maxColumns) {
                maxColumns = concurrent;
            }
        }
        maxColumns = Math.max(maxColumns, 1);

        for (const event of overlappingGroup) {
            const columns = new Array(maxColumns).fill(false);
            for (const positioned of positionedEvents) {
                if (event.start < positioned.end && event.end > positioned.start) {
                    const columnIndex = Math.round(positioned.extendedProps.layout.left / (100 / maxColumns));
                    if (columns[columnIndex] === false) {
                        columns[columnIndex] = true;
                    }
                }
            }
            let columnIndex = 0;
            for (let j = 0; j < columns.length; j++) {
                if (!columns[j]) {
                    columnIndex = j;
                    break;
                }
            }

            positionedEvents.push({
                ...event,
                extendedProps: {
                    ...event.extendedProps,
                    layout: {
                        width: 100 / maxColumns,
                        left: columnIndex * (100 / maxColumns),
                    },
                },
            });
        }
    }
    return positionedEvents;
};

// Pequeña función auxiliar para extraer la hora en formato HH:mm
const formatTimeToHHMM = (date: Date): string => {
    return date.toTimeString().substring(0, 5);
};

// Pequeña función auxiliar para extraer la fecha en formato YYYY-MM-DD
const formatDateToYYYYMMDD = (date: Date): string => {
    return date.toISOString().split('T')[0];
};

export const BarberCalendar = () => {
    // El estado se mantiene, pero sin refs ni viewRange
    const { user, token } = useAuth();
    const [minTime, setMinTime] = useState<string>('09:00:00');
    const [maxTime, setMaxTime] = useState<string>('21:00:00');
    const [view, setView] = useState<'timeGridWeek' | 'timeGridDay' | 'dayGridMonth'>('timeGridWeek');
    const [calendarKey, setCalendarKey] = useState<number>(1);
    const [events, setEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [services, setServices] = useState<Service[]>([]);
    const [editingClientName, setEditingClientName] = useState('');
    const [barbers, setBarbers] = useState<Barber[]>([]);
    const [panelState, setPanelState] = useState<PanelState>({
        isOpen: false,
        mode: null,
        data: null
    });

    const [selectedBarberId, setSelectedBarberId] = useState<number | null>(null);


    useEffect(() => {
        const loadBarbers = async () => {
            if (!token) return;
            try {
                // NOTA: Asumimos que podemos buscar usuarios con rol 'BARBERO'.
                // Si no, necesitarás un endpoint específico en el backend para esto.
                // Por ahora, buscaremos por un término genérico.
                const response = await findUsersByRole(token, 'BARBERO'); // Esto puede necesitar ajuste
                setBarbers(response.data);
            } catch (error) {
                console.error("Error al cargar los barberos", error);
            }
        };
        loadBarbers();
    }, [token]);

    useEffect(() => {
        if (user && barbers.length > 0) {
            // Si el usuario logueado es un barbero, lo seleccionamos por defecto.
            // Si es un admin, puede empezar sin nadie seleccionado.
            const userIsBarber = barbers.some(b => b.id === user.id);
            if (user.rol === 'BARBERO' && userIsBarber) {
                setSelectedBarberId(user.id);
            }
        }
    }, [user, barbers]);

    // Este useEffect ahora solo se ejecuta una vez al montar el componente
    useEffect(() => {
        const fetchAppointments = async () => {
            if (!token || !user || !selectedBarberId) {
                setEvents([]); // Limpiamos los eventos si no hay barbero
                setLoading(false);
                return;
            }

            setLoading(true);

            // Calcula el rango de fechas a pedir según la vista actual
            const startDate = new Date(currentDate);
            const endDate = new Date(startDate);

            const minimumDelayPromise = new Promise(resolve => setTimeout(resolve, 750));

            if (view === 'timeGridWeek') {
                const dayOfWeek = startDate.getDay();
                const diffToMonday = startDate.getDay() === 0 ? -6 : 1 - dayOfWeek;
                startDate.setDate(startDate.getDate() + diffToMonday);
                endDate.setDate(startDate.getDate() + 6); // Ahora esto funciona correctamente
            } else if (view === 'dayGridMonth') {
                startDate.setDate(1);
                endDate.setMonth(endDate.getMonth() + 1);
                endDate.setDate(0);
            }

            try {
                const data: Appointment[] = await getAppointmentsService(token, {
                    id_barbero: selectedBarberId,
                    fecha_desde: startDate.toISOString().split('T')[0],
                    fecha_hasta: endDate.toISOString().split('T')[0]
                });

                console.log(data);

                const formattedEvents = data.map(item => ({
                    id: item.id,
                    title: item.titulo,
                    start: new Date(item.fecha_hora_inicio),
                    end: new Date(item.fecha_hora_fin),


                    extendedProps: item
                }));

                const positionedEvents = calculateEventLayout(formattedEvents);
                setEvents(positionedEvents);

            } catch (error) {
                console.error("Error al cargar las citas:", error);
                setEvents([]); // En caso de error, mostrar el calendario vacío
            } finally {

                await Promise.all([minimumDelayPromise]);

                setLoading(false);
            }
        };

        fetchAppointments();
    }, [currentDate, view, token, user, calendarKey, selectedBarberId]);// Depende del token y el usuario para que se cargue cuando estén listos

    useEffect(() => {
        if (!panelState.isOpen) return;

        const loadServices = async () => {
            try {
                const data = await getAllServices();
                setServices(data);
            } catch (error) {
                console.error("Error al cargar los servicios:", error);
            }
        };
        loadServices();
    }, [panelState.isOpen]);

    useEffect(() => {
        if (panelState.mode === 'EDIT' && panelState.data?.id_cliente && token) {
            // Hacemos una llamada a la API para obtener los datos del cliente por su ID
            // NOTA: Necesitarás una función `findUserByIdService` en tu users.service.ts
            // que llame a `GET /users/:id`. Suponiendo que la tienes:

            findUserByIdService(token, panelState.data.id_cliente).then(client => {
                setEditingClientName(`${client.nombre} ${client.apellidos}`);
            });
        } else {
            setEditingClientName(''); // Limpiamos el nombre al crear o cerrar
        }
    }, [panelState, token]);

    

    const handlePanelDataChange = (field: string, value: any) => {
        setPanelState(prevState => ({
            ...prevState,
            data: { ...prevState.data, [field]: value },
        }));
    };

    const handleBarberChange = (barberId: string) => {
        setSelectedBarberId(parseInt(barberId));
    };

    const refreshCalendarAndClosePanel = () => {
        closePanel();
        // Cambiamos la key para forzar la recarga de eventos en el calendario
        setCalendarKey(prevKey => prevKey + 1);
    };

    const handleSubmit = async (formData: any, formType: 'CITA' | 'DESCANSO') => {
        const { mode } = panelState;
        if (!formData || !token) return;

        // Construimos el DTO que espera el backend
        const appointmentDto = {
            id_barbero: selectedBarberId,
            id_cliente: formData.id_cliente,
            id_servicio: formData.id_servicio,
            fecha_hora_inicio: `${formData.appointmentDate}T${formData.startTime}`,
            fecha_hora_fin: `${formData.appointmentDate}T${formData.endTime}`,
            precio_final: formData.precio_final,
            // 👇 CORRECCIÓN CLAVE: El estado ahora es dinámico
            estado: formType === 'CITA' ? 'PENDIENTE' : 'DESCANSO',
            // Añadimos el título para el descanso (el backend debe ignorarlo si no es un descanso)
            titulo: formData.titulo
        };

        if (formType === 'CITA') {
            appointmentDto.id_cliente = formData.id_cliente;
            appointmentDto.id_servicio = formData.id_servicio;
            appointmentDto.precio_final = formData.precio_final;
        } else { // Si es un DESCANSO, nos aseguramos de que estos campos sean nulos
            appointmentDto.id_cliente = null;
            appointmentDto.id_servicio = null;
            appointmentDto.precio_final = null;
            // NOTA: Tu backend debe estar preparado para recibir 'titulo' para los descansos
            // appointmentDto.titulo = formData.titulo; 
        }

        try {
            if (mode === 'CREATE') {
                await createAppointmentService(token, appointmentDto);
                alert(`${formType === 'CITA' ? 'Cita' : 'Descanso'} creado con éxito`);
                console.log(appointmentDto);
            } else if (mode === 'EDIT') {
                await updateAppointmentService(token, panelState.data.id, appointmentDto);
                alert('Cita actualizada con éxito');
            }
            refreshCalendarAndClosePanel();
        } catch (error) {
            console.error("Error al guardar la cita:", error);
            if (error instanceof Error) {
                alert(`Hubo un error al guardar la cita: ${error.message}`);
            } else {
                alert('Ocurrió un error inesperado.');
            } 
        }
    };

    const handleDelete = async () => {
        const { mode, data } = panelState;
        if (mode !== 'EDIT' || !data?.id || !token) return;

        // Pedimos confirmación antes de una acción destructiva
        if (window.confirm('¿Estás seguro de que quieres eliminar esta cita?')) {
            try {
                await deleteAppointmentService(token, data.id);
                alert('Cita eliminada con éxito');
                refreshCalendarAndClosePanel();
            } catch (error) {
                console.error("Error al eliminar la cita:", error);
                alert('Hubo un error al eliminar la cita.');
            }
        }
    };

    // 👇 3. Función para abrir el panel en modo CREAR
    const openCreatePanel = (clickedDate: Date) => {
        const endDate = new Date(clickedDate.getTime() + 30 * 60000);

        setPanelState({
            isOpen: true,
            mode: 'CREATE',
            data: {
                // Usamos la nueva función en lugar de .toISOString()
                appointmentDate: formatDateToYYYYMMDD(clickedDate),
                startTime: formatTimeToHHMM(clickedDate),
                endTime: formatTimeToHHMM(endDate),

                id_servicio: '',
                precio_final: 0,
                id_cliente: null,
            }
        });
    };

    // 👇 4. Función para abrir el panel en modo EDITAR
    const openEditPanel = (clickInfo: EventClickArg) => {
        const { event } = clickInfo;
        const extendedData = event.extendedProps;

        if (!event.start || !event.end) {
            return;
        }

        setPanelState({
            isOpen: true,
            mode: 'EDIT',
            data: {
                // Datos del evento de FullCalendar
                id: parseInt(event.id),
                appointmentDate: formatDateToYYYYMMDD(event.start),
                startTime: formatTimeToHHMM(event.start),
                endTime: formatTimeToHHMM(event.end),
                // Datos que guardamos en extendedProps
                id_cliente: extendedData.id_cliente,
                id_servicio: extendedData.id_servicio,
                precio_final: extendedData.precio_final,
                estado: extendedData.estado,
            }
        });
    };

    // 👇 5. Función para cerrar el panel
    const closePanel = () => {
        setPanelState({ isOpen: false, mode: null, data: null });
    };
    

    const refreshCalendar = (newMinTime: string, newMaxTime: string): void => {
        setLoading(true);
        setMinTime(newMinTime);
        setMaxTime(newMaxTime);
        setCalendarKey(prevKey => prevKey + 1);
        // Pequeño truco para quitar el 'loading' después del remonte
        setTimeout(() => setLoading(false), 100);
    };

    const handleViewChange = (newView: 'timeGridWeek' | 'timeGridDay' | 'dayGridMonth') => {
        setView(newView);
        setCalendarKey(prevKey => prevKey + 1); // Forzamos el remonte del calendario
    };

    const handleNavigation = (direction: 'prev' | 'next') => {
        const newDate = new Date(currentDate);
        const amount = direction === 'next' ? 1 : -1;

        switch (view) {
            case 'timeGridDay':
                newDate.setDate(newDate.getDate() + amount);
                break;
            case 'timeGridWeek':
                newDate.setDate(newDate.getDate() + (7 * amount));
                break;
            case 'dayGridMonth':
                newDate.setMonth(newDate.getMonth() + amount);
                break;
        }
        setCurrentDate(newDate);
        setCalendarKey(prevKey => prevKey + 1);
    };

    const handleClientCreated = (newClient: { id: number; nombre: string; apellidos: string; }) => {
        // 1. Actualizamos el estado del panel con el ID del nuevo cliente.
        // Usamos la función que ya teníamos para mantener el código limpio.
        handlePanelDataChange('id_cliente', newClient.id);

        // 2. Actualizamos el estado que guarda el nombre del cliente para que
        // se refleje en el componente de autocompletado.
        setEditingClientName(`${newClient.nombre} ${newClient.apellidos}`);
    };

    return (
        <div className="calendar-page-container">
            <CalendarHeader

                initialMinTime={minTime}
                initialMaxTime={maxTime}
                onRefresh={refreshCalendar}
                currentView={view}
                onViewChange={handleViewChange}
                onPrev={() => handleNavigation('prev')}
                onNext={() => handleNavigation('next')}
            />

            <div className="calendar-wrapper">

                {/* 👇 2. La capa de carga se muestra condicionalmente SOBRE el calendario */}
                {loading && (
                    <div className="loading-overlay">
                        <img src="/barbero.gif" alt="Cargando..." width="160" />
                    </div>
                )}

                {/* 👇 3. El CalendarView ahora siempre está renderizado, evitando el salto */}
                <CalendarView
                    calendarKey={calendarKey}
                    events={view === 'dayGridMonth' ? [] : events}
                    minTime={minTime}
                    maxTime={maxTime}
                    initialView={view}
                    initialDate={currentDate}
                    onDateClick={openCreatePanel} // Conectamos el clic de fecha
                    onEventClick={openEditPanel}   // Conectamos el clic de evento
                />
            </div>
            <BarberFabMenu
                barbers={barbers}
                selectedBarberId={selectedBarberId}
                onBarberChange={handleBarberChange}
                
            />
            <CreateAppointmentButton
                onClick={() => openCreatePanel(new Date())}
                disabled={!selectedBarberId} // El botón se deshabilita si no hay un barbero seleccionado
            />
            <div>
                {/* Ahora renderizamos el nuevo componente de panel */}
                {panelState.isOpen && (
                    <EventPanel
                        panelState={panelState}
                        services={services}                 // Prop de servicios que faltaba
                        editingClientName={editingClientName} // Prop del nombre que faltaba
                        onClose={closePanel}
                        onSave={handleSubmit}
                        onDelete={handleDelete}
                        onClientCreated={handleClientCreated} // Prop del cliente creado que faltaba
                    />
                )}
            </div>

        </div>
    );
};