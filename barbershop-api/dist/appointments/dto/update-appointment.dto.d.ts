export declare class UpdateAppointmentDto {
    id_barbero?: number;
    id_cliente?: number;
    id_servicio?: number;
    fecha_hora_inicio?: string;
    fecha_hora_fin?: string;
    estado?: 'PENDIENTE' | 'CERRADO' | 'CANCELADO' | 'DESCANSO';
    precio_final?: number;
    titulo?: string;
}
