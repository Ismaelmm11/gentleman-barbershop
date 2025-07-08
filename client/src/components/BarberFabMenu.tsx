import { useState, useMemo } from 'react';

interface Barber {
    id: number;
    nombre: string;
    apellidos: string;
}

interface BarberFabMenuProps {
    barbers: Barber[];
    selectedBarberId: number | null;
    onBarberChange: (barberId: string) => void;
}

export const BarberFabMenu = ({ barbers, selectedBarberId, onBarberChange }: BarberFabMenuProps) => {
    const [isOpen, setIsOpen] = useState(false);

    // Buscamos el nombre del barbero seleccionado para mostrarlo en el botón principal
    const selectedBarber = useMemo(
        () => barbers.find(b => b.id === selectedBarberId),
        [barbers, selectedBarberId]
    );

    const handleSelect = (barberId: number) => {
        onBarberChange(String(barberId));
        setIsOpen(false); // Cerramos el menú al seleccionar
    };

    // Función para obtener las iniciales (ej: Ismael Mohamed -> IM)
    const getInitials = (name: string) => {
        return `${name}`.toUpperCase();
    };

    return (
        <div className="fab-container">
            {/* Botón principal */}
            <div className={`fab ${isOpen ? 'open' : ''}`} onClick={() => setIsOpen(!isOpen)}>
                {isOpen ? '×' : (selectedBarber ? getInitials(selectedBarber.nombre) : '?')}
            </div>

            {/* Items del menú que se despliegan */}
            <div className="fab-items">
                {barbers.map((barber, index) => {
                    const angle = -90 - (index * 45); // Calculamos un ángulo para cada botón
                    const transform = isOpen 
                        ? `rotate(${angle}deg) translate(80px) rotate(${-angle}deg)` 
                        : 'scale(0)';

                    return (
                        <div
                            key={barber.id}
                            className={`fab-item ${barber.id === selectedBarberId ? 'active' : ''}`}
                            style={{ transitionDelay: `${index * 0.05}s`, transform }}
                            onClick={() => handleSelect(barber.id)}
                            title={`${barber.nombre} ${barber.apellidos}`} // Tooltip con el nombre completo
                        >
                            <span>{getInitials(barber.nombre)}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};