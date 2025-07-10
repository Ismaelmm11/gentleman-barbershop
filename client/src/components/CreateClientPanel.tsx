import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { createClientService } from '../services/users.service';

interface CreateClientPanelProps {
    onClose: () => void;
    onClientCreated: (newClient: any) => void;
}

export const CreateClientPanel = ({ onClose, onClientCreated }: CreateClientPanelProps) => {
    const { token } = useAuth();
    const [formData, setFormData] = useState({
        nombre: '',
        apellidos: '',
        telefono: '',
        fecha_nacimiento: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!token) return;
        try {
            const newClient = await createClientService(token, formData);
            alert('Cliente creado con éxito');
            onClientCreated(newClient); // Devolvemos el nuevo cliente al panel anterior
            onClose(); // Cerramos este panel
        } catch (error) {
            if (error instanceof Error) {
                alert(`Error: ${error.message}`);
            } else {
                alert('Ocurrió un error inesperado.');
            }
        }
    };

    // En src/components/CreateClientPanel.tsx

return (
    <div className="panel-overlay" onClick={onClose}>
        <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
            <button className="close-panel-button" onClick={onClose}>×</button>
            <h2>Crear Nuevo Cliente</h2>
            
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="nombre">Nombre</label>
                    <input type="text" id="nombre" name="nombre" value={formData.nombre} onChange={handleChange} required />
                </div>
                <div className="form-group">
                    <label htmlFor="apellidos">Apellidos</label>
                    <input type="text" id="apellidos" name="apellidos" value={formData.apellidos} onChange={handleChange} required />
                </div>
                <div className="form-group">
                    <label htmlFor="telefono">Teléfono</label>
                    <input type="tel" id="telefono" name="telefono" value={formData.telefono} onChange={handleChange} required />
                </div>
                <div className="form-group">
                    <label htmlFor="fecha_nacimiento">Fecha de Nacimiento</label>
                    <input type="date" id="fecha_nacimiento" name="fecha_nacimiento" value={formData.fecha_nacimiento} onChange={handleChange} required />
                </div>

                <div className="panel-actions">
                    <button type="submit" className="button-primary btn"> <span>Guardar Cliente</span></button>
                    <button type="button" onClick={onClose} className="button-secondary">Cancelar</button>
                </div>
            </form>
        </div>
    </div>
);
};