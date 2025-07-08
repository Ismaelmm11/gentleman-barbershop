interface CalendarHeaderProps {
    initialMinTime: string;
    initialMaxTime: string;
    onRefresh: (newMinTime: string, newMaxTime: string) => void;
    currentView: string;
    onViewChange: (view: 'timeGridWeek' | 'timeGridDay' | 'dayGridMonth') => void;
    onPrev: () => void;
    onNext: () => void;
}

export const CalendarHeader = ({ initialMinTime, initialMaxTime, onRefresh, currentView, onViewChange, onPrev, onNext}: CalendarHeaderProps) => {
    
    // --- Generación dinámica de opciones ---
    const minTimeOptions: string[] = [];
    const endHourLimit = parseInt(initialMaxTime.split(':')[0]);
    for (let i = 0; i < endHourLimit; i++) {
        minTimeOptions.push(`${i.toString().padStart(2, '0')}:00:00`);
    }

    const maxTimeOptions: string[] = [];
    const startHourLimit = parseInt(initialMinTime.split(':')[0]);
    for (let i = startHourLimit + 1; i <= 24; i++) {
        maxTimeOptions.push(`${i.toString().padStart(2, '0')}:00:00`);
    }

    // --- Manejadores de eventos (ahora no necesitan cambiar el estado de edición) ---
    const handleMinTimeChange = (newMinTime: string) => {
        onRefresh(newMinTime, initialMaxTime);
    };

    const handleMaxTimeChange = (newMaxTime: string) => {
        onRefresh(initialMinTime, newMaxTime);
    };

    return (
        <div className="custom-calendar-header">
            <div className="header-title-container">
                <div className="view-mode-selector">
                    <button
                        className={currentView === 'timeGridDay' ? 'active' : ''}
                        onClick={() => onViewChange('timeGridDay')}
                    >
                        Día
                    </button>
                    <button
                        className={currentView === 'timeGridWeek' ? 'active' : ''}
                        onClick={() => onViewChange('timeGridWeek')}
                    >
                        Semana
                    </button>
                    {/* <button
                        className={currentView === 'dayGridMonth' ? 'active' : ''}
                        onClick={() => onViewChange('dayGridMonth')}
                    >
                        Mes
                    </button> */}
                </div>
                <h2 className="header-title">Today</h2>
                <div className="center-header">
                    <button className="nav-button" onClick={onPrev}>Anterior</button>
                    <div className="time-select-wrapper">
                        <select
                            className="time-select-camouflaged"
                            value={initialMinTime}
                            onChange={(e) => handleMinTimeChange(e.target.value)}
                        >
                            {minTimeOptions.map(time => <option key={`min-${time}`} value={time}>{time.substring(0, 5)}</option>)}
                        </select>

                        <span className="time-separator">:</span>

                        <select
                            className="time-select-camouflaged"
                            value={initialMaxTime}
                            onChange={(e) => handleMaxTimeChange(e.target.value)}
                        >
                            {maxTimeOptions.map(time => <option key={`max-${time}`} value={time}>{time.substring(0, 5)}</option>)}
                        </select>
                    </div>
                    <button className="nav-button" onClick={onNext}>Siguiente</button>
                </div>
            </div>
        </div>
    );
};