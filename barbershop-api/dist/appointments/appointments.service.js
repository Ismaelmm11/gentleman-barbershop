"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppointmentsService = void 0;
const common_1 = require("@nestjs/common");
const kysely_1 = require("kysely");
const database_provider_1 = require("../database/database.provider");
const services_service_1 = require("../services/services.service");
const users_service_1 = require("../users/users.service");
let AppointmentsService = class AppointmentsService {
    db;
    servicesService;
    usersService;
    constructor(db, servicesService, usersService) {
        this.db = db;
        this.servicesService = servicesService;
        this.usersService = usersService;
    }
    async create(createAppointmentDto, creator) {
        await this.validateAppointmentCreation(createAppointmentDto, creator);
        const fecha_hora_fin = await this.calculateEndTime(createAppointmentDto);
        const dataToInsert = this.prepareAppointmentData(createAppointmentDto, fecha_hora_fin);
        const result = await this.db.insertInto('cita').values(dataToInsert).executeTakeFirstOrThrow();
        const newAppointmentId = Number(result.insertId);
        return this.findOne(newAppointmentId);
    }
    async validateAppointmentCreation(dto, creator) {
        const barbero = await this.usersService.findOne(dto.id_barbero);
        if (!['ADMIN', 'BARBERO', 'TATUADOR'].includes(barbero.rol)) {
            throw new common_1.BadRequestException('El ID de barbero proporcionado no existe.');
        }
        if (dto.estado === 'PENDIENTE') {
            if (!dto.id_cliente || !dto.id_servicio) {
                throw new common_1.BadRequestException('Las citas pendientes deben tener cliente y servicio.');
            }
            await this.usersService.findOne(dto.id_cliente);
            await this.servicesService.findOne(dto.id_servicio);
        }
        const isAllowedToManage = creator && ['ADMIN', 'BARBERO'].includes(creator.rol);
        if (dto.estado === 'DESCANSO' && !isAllowedToManage) {
            throw new common_1.ForbiddenException('No tienes permisos para crear un descanso.');
        }
        if (dto.fecha_hora_fin && !isAllowedToManage) {
            throw new common_1.ForbiddenException('No tienes permisos para establecer una hora de fin manual.');
        }
    }
    async calculateEndTime(dto) {
        const fechaInicio = new Date(dto.fecha_hora_inicio);
        if (dto.fecha_hora_fin) {
            const fechaFinManual = new Date(dto.fecha_hora_fin);
            if (fechaFinManual <= fechaInicio) {
                throw new common_1.BadRequestException('La hora de fin debe ser posterior a la hora de inicio.');
            }
            return fechaFinManual;
        }
        if (dto.id_servicio) {
            const servicio = await this.servicesService.findOne(dto.id_servicio);
            return new Date(fechaInicio.getTime() + servicio.duracion_minutos * 60000);
        }
        return new Date(fechaInicio.getTime() + 30 * 60000);
    }
    prepareAppointmentData(dto, fecha_hora_fin) {
        const fecha_hora_inicio = new Date(dto.fecha_hora_inicio);
        return {
            id_barbero: dto.id_barbero,
            estado: dto.estado,
            fecha_hora_inicio,
            fecha_hora_fin,
            precio_final: null,
            id_cliente: dto.estado === 'PENDIENTE' ? dto.id_cliente : null,
            id_servicio: dto.estado === 'PENDIENTE' ? dto.id_servicio : null,
        };
    }
    async findAll() {
        return this.db.selectFrom('cita').selectAll().execute();
    }
    async findOne(id) {
        const appointment = await this.db
            .selectFrom('cita')
            .selectAll()
            .where('id', '=', id)
            .executeTakeFirst();
        if (!appointment) {
            throw new common_1.NotFoundException(`Cita con ID ${id} no encontrada.`);
        }
        return appointment;
    }
    async update(id, updateAppointmentDto) {
        await this.db
            .updateTable('cita')
            .set({ estado: updateAppointmentDto.estado })
            .where('id', '=', id)
            .executeTakeFirstOrThrow();
        return this.findOne(id);
    }
    async remove(id) {
        const result = await this.db
            .deleteFrom('cita')
            .where('id', '=', id)
            .executeTakeFirst();
        if (result.numDeletedRows === 0n) {
            throw new common_1.NotFoundException(`No se pudo eliminar. Cita con ID ${id} no encontrada.`);
        }
        return { message: `Cita con ID ${id} eliminada correctamente.` };
    }
};
exports.AppointmentsService = AppointmentsService;
exports.AppointmentsService = AppointmentsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(database_provider_1.DATABASE_TOKEN)),
    __metadata("design:paramtypes", [kysely_1.Kysely,
        services_service_1.ServicesService,
        users_service_1.UsersService])
], AppointmentsService);
//# sourceMappingURL=appointments.service.js.map