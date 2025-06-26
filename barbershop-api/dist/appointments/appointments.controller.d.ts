import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
export declare class AppointmentsController {
    private readonly appointmentsService;
    constructor(appointmentsService: AppointmentsService);
    create(createAppointmentDto: CreateAppointmentDto, creator?: {
        userId: number;
        rol: string;
    }): Promise<{
        id: number;
        id_barbero: number;
        id_cliente: number | null;
        id_servicio: number | null;
        fecha_hora_inicio: Date;
        fecha_hora_fin: Date;
        precio_final: number | null;
        estado: "PENDIENTE" | "CERRADO" | "CANCELADO" | "DESCANSO";
    }>;
    findAll(): Promise<{
        id: number;
        id_barbero: number;
        id_cliente: number | null;
        id_servicio: number | null;
        fecha_hora_inicio: Date;
        fecha_hora_fin: Date;
        precio_final: number | null;
        estado: "PENDIENTE" | "CERRADO" | "CANCELADO" | "DESCANSO";
    }[]>;
    findOne(id: string): Promise<{
        id: number;
        id_barbero: number;
        id_cliente: number | null;
        id_servicio: number | null;
        fecha_hora_inicio: Date;
        fecha_hora_fin: Date;
        precio_final: number | null;
        estado: "PENDIENTE" | "CERRADO" | "CANCELADO" | "DESCANSO";
    }>;
    update(id: string, updateAppointmentDto: UpdateAppointmentDto): Promise<{
        id: number;
        id_barbero: number;
        id_cliente: number | null;
        id_servicio: number | null;
        fecha_hora_inicio: Date;
        fecha_hora_fin: Date;
        precio_final: number | null;
        estado: "PENDIENTE" | "CERRADO" | "CANCELADO" | "DESCANSO";
    }>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
