import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { type DayHeaderContentArg, type EventMountArg, type EventClickArg} from '@fullcalendar/core'; // Importamos EventMountArg
import { type DateClickArg } from '@fullcalendar/interaction';
import { useEffect, useCallback } from 'react';

// Importamos su hoja de estilos dedicada, donde está todo el CSS.
import './CalendarView.css';

// Esta función se queda aquí porque define la ESTRUCTURA del header, no su estilo.
const renderDayHeader = (headerInfo: DayHeaderContentArg) => {
    const dayName = headerInfo.date.toLocaleDateString('es-ES', { weekday: 'short' }).toUpperCase().replace('.', '');
    const dayNumber = headerInfo.date.getDate();
    return (
        <>
            <span className="calendar-header-day-name">{dayName}</span>
            <span className="calendar-header-day-number">{dayNumber}</span>
        </>
    );
};

// Definimos los tipos de las props que el componente espera recibir del padre.
interface CalendarViewProps {
    calendarKey: number;
    events: any[];
    minTime: string;
    maxTime: string;
    initialView: 'timeGridWeek' | 'timeGridDay' | 'dayGridMonth';
    initialDate: Date;
    onDateClick: (date: Date) => void;
    onEventClick: (eventInfo: EventClickArg) => void;
}

export const CalendarView = ({ calendarKey, events, minTime, maxTime, initialView, initialDate, onDateClick, onEventClick }: CalendarViewProps) => {
    

    const handleEventDidMount = (arg: EventMountArg) => {
        const { layout } = arg.event.extendedProps;

        if (layout) {
            // Siempre aplicar estos al <a> (evento)
            arg.el.style.width = `${layout.width}%`;
            arg.el.style.left = `${layout.left}%`;
            arg.el.style.right = 'auto';

        }
    };
    
    
    // 👇 2. Movemos la llamada a applyStylesToSlots a un useEffect
    useEffect(() => {
        // Usamos un pequeño retraso para darle a FullCalendar un instante para pintar todo
        const timer = setTimeout(() => {
            applyStylesToSlots();
        }, 50);

        // Limpiamos el temporizador al desmontar o re-renderizar
        return () => clearTimeout(timer);

    }, [events, calendarKey]);



    const handleDateClick = useCallback((clickInfo: DateClickArg) => {
        // Solo notificamos si no es la vista de mes
        if (clickInfo.view.type !== 'dayGridMonth') {
            onDateClick(clickInfo.date);
        }
    }, [onDateClick]);

    const handleEventClick = useCallback((clickInfo: EventClickArg) => {
        onEventClick(clickInfo);
    }, [onEventClick]);

    return (
        <FullCalendar
            key={calendarKey}
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView={initialView}
            initialDate={initialDate}
            headerToolbar={false}
            allDaySlot={false}
            events={events}
            slotMinTime={minTime}
            slotMaxTime={maxTime}

            dayHeaderContent={renderDayHeader}
            eventDidMount={handleEventDidMount}

            dateClick={handleDateClick}
            eventClick={handleEventClick}

            locale="es"
            firstDay={1}
            contentHeight="700px"
            eventContent={(arg) => {
                const props = arg.event.extendedProps;
                let clientText = '';

                // 1. Primero, comprobamos si el estado es 'DESCANSO'
                if (props.estado === 'DESCANSO') {
                    clientText = 'Descanso';
                } 
                // 2. Si no es un descanso, entonces comprobamos si tiene un cliente
                else if (props.nombre_cliente) {
                    clientText = `${props.nombre_cliente} ${props.apellidos_cliente || ''}`;
                }
                // 3. Si no es descanso y no tiene cliente, lo indicamos
                else {
                    clientText = 'Cliente sin asignar';
                }

                const html = `
                    <div class="custom-event-content">
                        <div class="event-time">${arg.timeText}</div>
                        <div class="event-title">${arg.event.title || ''}</div>
                        <div class="event-client">${clientText}</div>
                    </div>
                `;
                return { html };
            }}
            slotDuration="00:30:00"
            slotLabelInterval="01:00:00"
            expandRows={true}
            slotLabelFormat={{
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
            }}
        />
    );
};

const applyStylesToSlots = () => {
    let filas = document.getElementsByClassName("fc-timegrid-slot") as HTMLCollectionOf<HTMLElement>;
    // Corregir el bucle para iterar sobre los elementos
    for (let fila of Array.from(filas)) {
        // Aplicar estilos a cada elemento con la clase fc-timegrid-slot
        fila.style.height = '4em'; // Ejemplo: aumentar la altura de las filas
        // Puedes añadir más estilos aquí, por ejemplo:
        fila.style.borderTop = '2px solid #c6bdbd';
    }
    let filinhas = document.getElementsByClassName("fc-timegrid-slot-minor") as HTMLCollectionOf<HTMLElement>;
    // Corregir el bucle para iterar sobre los elementos
    for (let fila of Array.from(filinhas)) {
        // Aplicar estilos a cada elemento con la clase fc-timegrid-slot
        fila.style.height = '4em'; // Ejemplo: aumentar la altura de las filas
        // Puedes añadir más estilos aquí, por ejemplo:
        fila.style.borderTop = '2px dotted #c6bdbd';
    }

    let eventos = document.getElementsByClassName("fc-timegrid-event-harness-inset") as HTMLCollectionOf<HTMLElement>;
    // Corregir el bucle para iterar sobre los elementos
    for (let evento of Array.from(eventos)) {
        evento.style.right = '0%';
        evento.style.left = '0%';
    }
};