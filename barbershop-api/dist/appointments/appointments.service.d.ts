import { Kysely } from 'kysely';
import { DB } from '../database/db.types';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { RequestReturningAppointmentDto } from './dto/request-returning-appointment.dto';
import { RequestNewAppointmentDto } from './dto/request-new-appointment.dto';
import { ConfirmAppointmentDto } from './dto/confirm-appointment.dto';
import { ServicesService } from '../services/services.service';
import { UsersService } from '../users/users.service';
import { RecurringBlocksService } from '../recurring-blocks/recurring-blocks.service';
import { MessagingService } from 'src/messaging/messaging.service';
export declare class AppointmentsService {
    private readonly db;
    private readonly servicesService;
    private readonly usersService;
    private readonly recurringBlocksService;
    private readonly messagingService;
    constructor(db: Kysely<DB>, servicesService: ServicesService, usersService: UsersService, recurringBlocksService: RecurringBlocksService, messagingService: MessagingService);
    createInternal(creatorId: number, createDto: CreateAppointmentDto): Promise<{
        id: number;
        id_barbero: number;
        id_cliente: number | null;
        id_servicio: number | null;
        fecha_hora_inicio: Date;
        fecha_hora_fin: Date;
        estado: "PENDIENTE_CONFIRMACION" | "PENDIENTE" | "CERRADO" | "CANCELADO" | "DESCANSO";
        precio_final: number | null;
    }>;
    requestForReturningClient(requestDto: RequestReturningAppointmentDto): Promise<{
        id_cita_provisional: number;
    }>;
    requestForNewClient(requestDto: RequestNewAppointmentDto): Promise<{
        id_cita_provisional: number;
    }>;
    confirmAppointment(confirmDto: ConfirmAppointmentDto): Promise<{
        message: string;
    }>;
    private createProvisionalAppointmentAndSendOtp;
    private validateEntities;
    private calculatePriceAndDurationForStaff;
    private checkAvailabilityForClient;
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
    findOne(id: number): Promise<{
        id: number;
        id_barbero: number;
        id_cliente: number | null;
        id_servicio: number | null;
        fecha_hora_inicio: Date;
        fecha_hora_fin: Date;
        estado: "PENDIENTE_CONFIRMACION" | "PENDIENTE" | "CERRADO" | "CANCELADO" | "DESCANSO";
        precio_final: number | null;
    }>;
    update(id: number, updateAppointmentDto: UpdateAppointmentDto): Promise<{
        id: number;
        id_barbero: number;
        id_cliente: number | null;
        id_servicio: number | null;
        fecha_hora_inicio: Date;
        fecha_hora_fin: Date;
        estado: "PENDIENTE_CONFIRMACION" | "PENDIENTE" | "CERRADO" | "CANCELADO" | "DESCANSO";
        precio_final: number | null;
    }>;
    remove(id: number): Promise<{
        message: string;
    }>;
}
