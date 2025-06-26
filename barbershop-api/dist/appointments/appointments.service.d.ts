import { Kysely } from 'kysely';
import { DB } from '../database/db.types';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { ServicesService } from '../services/services.service';
import { UsersService } from '../users/users.service';
export declare class AppointmentsService {
    private readonly db;
    private readonly servicesService;
    private readonly usersService;
    constructor(db: Kysely<DB>, servicesService: ServicesService, usersService: UsersService);
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
    private validateAppointmentCreation;
    private calculateEndTime;
    private prepareAppointmentData;
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
    findOne(id: number): Promise<{
        id: number;
        id_barbero: number;
        id_cliente: number | null;
        id_servicio: number | null;
        fecha_hora_inicio: Date;
        fecha_hora_fin: Date;
        precio_final: number | null;
        estado: "PENDIENTE" | "CERRADO" | "CANCELADO" | "DESCANSO";
    }>;
    update(id: number, updateAppointmentDto: UpdateAppointmentDto): Promise<{
        id: number;
        id_barbero: number;
        id_cliente: number | null;
        id_servicio: number | null;
        fecha_hora_inicio: Date;
        fecha_hora_fin: Date;
        precio_final: number | null;
        estado: "PENDIENTE" | "CERRADO" | "CANCELADO" | "DESCANSO";
    }>;
    remove(id: number): Promise<{
        message: string;
    }>;
}
