import { useState, useEffect } from 'react';
import { findUsersByTerm } from '../services/users.service.ts';
import { useAuth } from '../context/AuthContext';

interface Client {
    id: number;
    nombre: string;
    apellidos: string;
    telefono: string;
}

interface ClientAutocompleteProps {
    onClientSelect: (client: Client) => void;
    initialClientName?: string
}

export const ClientAutocomplete = ({ onClientSelect, initialClientName = '' }: ClientAutocompleteProps) => {
    const { token } = useAuth();
    const [searchTerm, setSearchTerm] = useState(initialClientName);
    const [results, setResults] = useState<Client[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    
    useEffect(() => {
        setSearchTerm(initialClientName);
    }, [initialClientName]);

    useEffect(() => {
        // Usamos un "debounce" para no llamar a la API en cada tecla
        const timer = setTimeout(() => {
            if (searchTerm && token) {
                setIsLoading(true);
                findUsersByTerm(token, searchTerm)
                    .then(response => setResults(response.data))
                    .catch(error => console.error(error))
                    .finally(() => setIsLoading(false));
            } else {
                setResults([]); // Limpiamos los resultados si la búsqueda está vacía
            }
        }, 300); // Espera 300ms después de que el usuario deje de teclear

        return () => clearTimeout(timer); // Limpiamos el temporizador
    }, [searchTerm, token]);

    const handleSelect = (client: Client) => {
        setSearchTerm(`${client.nombre} ${client.apellidos}`);
        setResults([]);
        onClientSelect(client);
    };
    
    return (
        <div className="autocomplete-container">
            <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar cliente por nombre, apellidos o teléfono..."
            />
            {isLoading && <div>Buscando...</div>}
            {results.length > 0 && (
                <ul className="results-list">
                    {results.map(client => (
                        <li key={client.id} onClick={() => handleSelect(client)}>
                        {/* 2. Mostramos el nombre, apellidos y el teléfono */}
                        {client.nombre} {client.apellidos}; Tlf: ({client.telefono})
                    </li>
                    ))}
                </ul>
            )}
        </div>
    );
};