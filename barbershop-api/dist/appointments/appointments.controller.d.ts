import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { RequestReturningAppointmentDto } from './dto/request-returning-appointment.dto';
import { RequestNewAppointmentDto } from './dto/request-new-appointment.dto';
import { ConfirmAppointmentDto } from './dto/confirm-appointment.dto';
export declare class AppointmentsController {
    private readonly appointmentsService;
    constructor(appointmentsService: AppointmentsService);
    requestForReturningClient(requestDto: RequestReturningAppointmentDto): Promise<{
        id_cita_provisional: number;
    }>;
    requestForNewClient(requestDto: RequestNewAppointmentDto): Promise<{
        id_cita_provisional: number;
    }>;
    confirmAppointment(confirmDto: ConfirmAppointmentDto): Promise<{
        message: string;
    }>;
    createInternal(creator: {
        userId: number;
    }, createAppointmentDto: CreateAppointmentDto): Promise<{
        id: number;
        id_barbero: number;
        id_cliente: number | null;
        id_servicio: number | null;
        fecha_hora_inicio: Date;
        fecha_hora_fin: Date;
        estado: "PENDIENTE_CONFIRMACION" | "PENDIENTE" | "CERRADO" | "CANCELADO" | "DESCANSO";
        precio_final: number | null;
    }>;
    findAll(): Promise<{
        id: number;
        id_barbero: number;
        id_cliente: number | null;
        id_servicio: number | null;
        fecha_hora_inicio: Date;
        fecha_hora_fin: Date;
        estado: "PENDIENTE_CONFIRMACION" | "PENDIENTE" | "CERRADO" | "CANCELADO" | "DESCANSO";
        precio_final: number | null;
    }[]>;
    findOne(id: string): Promise<{
        id: number;
        id_barbero: number;
        id_cliente: number | null;
        id_servicio: number | null;
        fecha_hora_inicio: Date;
        fecha_hora_fin: Date;
        estado: "PENDIENTE_CONFIRMACION" | "PENDIENTE" | "CERRADO" | "CANCELADO" | "DESCANSO";
        precio_final: number | null;
    }>;
    update(id: string, updateAppointmentDto: UpdateAppointmentDto): Promise<{
        id: number;
        id_barbero: number;
        id_cliente: number | null;
        id_servicio: number | null;
        fecha_hora_inicio: Date;
        fecha_hora_fin: Date;
        estado: "PENDIENTE_CONFIRMACION" | "PENDIENTE" | "CERRADO" | "CANCELADO" | "DESCANSO";
        precio_final: number | null;
    }>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
