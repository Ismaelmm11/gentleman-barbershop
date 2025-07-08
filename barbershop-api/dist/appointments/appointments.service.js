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
const recurring_blocks_service_1 = require("../recurring-blocks/recurring-blocks.service");
const messaging_service_1 = require("../messaging/messaging.service");
const crypto_1 = require("crypto");
let AppointmentsService = class AppointmentsService {
    db;
    servicesService;
    usersService;
    recurringBlocksService;
    messagingService;
    constructor(db, servicesService, usersService, recurringBlocksService, messagingService) {
        this.db = db;
        this.servicesService = servicesService;
        this.usersService = usersService;
        this.recurringBlocksService = recurringBlocksService;
        this.messagingService = messagingService;
    }
    async createInternal(creatorId, createDto) {
        await this.validateEntities(createDto);
        const { endTime, finalPrice } = await this.calculatePriceForStaff(createDto);
        const result = await this.db
            .insertInto('cita')
            .values({
            id_barbero: createDto.id_barbero,
            id_cliente: createDto.id_cliente,
            id_servicio: createDto.id_servicio,
            estado: createDto.estado,
            fecha_hora_inicio: new Date(createDto.fecha_hora_inicio),
            fecha_hora_fin: endTime,
            precio_final: finalPrice,
        })
            .executeTakeFirstOrThrow();
        return this.findOne(Number(result.insertId));
    }
    async requestForReturningClient(requestDto) {
        const user = await this.usersService.findOneByPhone(requestDto.telefono_cliente);
        if (!user) {
            throw new common_1.NotFoundException('No se ha encontrado ningún cliente con ese número de teléfono. Por favor, regístrese usando el formulario para nuevos clientes.');
        }
        return this.createProvisionalAppointmentAndSendOtp(user.id, requestDto);
    }
    async requestForNewClient(requestDto) {
        const existingUser = await this.usersService.findOneByPhone(requestDto.telefono_cliente);
        if (existingUser) {
            throw new common_1.ConflictException('El número de teléfono ya está en uso. Por favor, utilice el formulario para clientes existentes.');
        }
        return this.createProvisionalAppointmentAndSendOtp(null, requestDto);
    }
    async confirmAppointment(confirmDto) {
        const { id_cita_provisional, codigo } = confirmDto;
        return this.db.transaction().execute(async (trx) => {
            const otpRecord = await trx.selectFrom('otp_codes').selectAll().where('id_cita_provisional', '=', id_cita_provisional).executeTakeFirst();
            if (!otpRecord)
                throw new common_1.NotFoundException('Solicitud de cita no encontrada.');
            if (otpRecord.codigo !== codigo) {
                await trx.updateTable('otp_codes').set({ intentos: otpRecord.intentos + 1 }).where('id', '=', otpRecord.id).execute();
                if (otpRecord.intentos >= 2) {
                    await trx.deleteFrom('otp_codes').where('id', '=', otpRecord.id).execute();
                    await trx.deleteFrom('cita').where('id', '=', id_cita_provisional).execute();
                    throw new common_1.UnauthorizedException('Código incorrecto. La solicitud ha sido cancelada por demasiados intentos.');
                }
                throw new common_1.UnauthorizedException('Código incorrecto.');
            }
            if (new Date() > otpRecord.fecha_expiracion)
                throw new common_1.UnauthorizedException('El código ha expirado.');
            if (otpRecord.datos_cliente_json) {
                const clientData = JSON.parse(otpRecord.datos_cliente_json);
                const newUser = await this.usersService.create(clientData);
                await trx.updateTable('cita').set({ id_cliente: newUser.id }).where('id', '=', id_cita_provisional).execute();
            }
            const result = await trx.updateTable('cita').set({ estado: 'PENDIENTE' }).where('id', '=', id_cita_provisional).where('estado', '=', 'PENDIENTE_CONFIRMACION').executeTakeFirst();
            if (result.numUpdatedRows === 0n)
                throw new common_1.ConflictException('Esta cita ya ha sido confirmada o cancelada.');
            await trx.deleteFrom('otp_codes').where('id', '=', otpRecord.id).execute();
            return { message: 'Cita confirmada correctamente.' };
        });
    }
    async createProvisionalAppointmentAndSendOtp(userId, requestDto) {
        const service = await this.servicesService.findOne(requestDto.id_servicio);
        await this.checkAvailabilityForClient(requestDto.id_barbero, new Date(requestDto.fecha_hora_inicio));
        return this.db.transaction().execute(async (trx) => {
            const endTime = new Date(new Date(requestDto.fecha_hora_inicio).getTime() + 30 * 60000);
            const provisionalAppointmentResult = await trx
                .insertInto('cita')
                .values({
                id_barbero: requestDto.id_barbero,
                id_servicio: requestDto.id_servicio,
                id_cliente: userId,
                fecha_hora_inicio: new Date(requestDto.fecha_hora_inicio),
                fecha_hora_fin: endTime,
                estado: 'PENDIENTE_CONFIRMACION',
                precio_final: service.precio_base,
            })
                .executeTakeFirstOrThrow();
            const provisionalAppointmentId = Number(provisionalAppointmentResult.insertId);
            const otpCode = (0, crypto_1.randomInt)(100000, 999999).toString();
            const expirationDate = new Date(Date.now() + 10 * 60 * 1000);
            let newClientDataJson = null;
            if (userId === null && 'nombre_cliente' in requestDto) {
                newClientDataJson = JSON.stringify({
                    nombre: requestDto.nombre_cliente,
                    apellidos: requestDto.apellidos_cliente,
                    telefono: requestDto.telefono_cliente,
                    fecha_nacimiento: requestDto.fecha_nacimiento_cliente,
                    tipo_perfil: 'CLIENTE',
                });
            }
            await trx.insertInto('otp_codes').values({
                id_cita_provisional: provisionalAppointmentId,
                codigo: otpCode,
                fecha_expiracion: expirationDate,
                datos_cliente_json: newClientDataJson,
            }).execute();
            await this.messagingService.sendOtp(requestDto.canal_contacto_cliente, `Tu código de confirmación para Gentleman Barbershop es: ${otpCode}`);
            return { id_cita_provisional: provisionalAppointmentId };
        });
    }
    async validateEntities(dto) {
        const barbero = await this.usersService.findOne(dto.id_barbero);
        if (!['ADMIN', 'BARBERO', 'TATUADOR'].includes(barbero.rol)) {
            throw new common_1.BadRequestException('El ID proporcionado no corresponde a un proveedor de servicios.');
        }
        if (dto.id_cliente)
            await this.usersService.findOne(dto.id_cliente);
        if (dto.id_servicio)
            await this.servicesService.findOne(dto.id_servicio);
    }
    async calculatePriceForStaff(dto) {
        const startTime = new Date(dto.fecha_hora_inicio);
        const endTime = new Date(dto.fecha_hora_fin);
        let finalPrice = null;
        if (endTime <= startTime) {
            throw new common_1.BadRequestException('La hora de fin debe ser posterior a la hora de inicio.');
        }
        if (dto.id_servicio) {
            const service = await this.servicesService.findOne(dto.id_servicio);
            finalPrice = service.precio_base;
        }
        return { endTime, finalPrice };
    }
    async checkAvailabilityForClient(barberoId, startTime) {
        const dayOfWeek = startTime.getDay() === 0 ? 7 : startTime.getDay();
        const time = startTime.toTimeString().slice(0, 5);
        const blocks = await this.recurringBlocksService.findAllForUser(barberoId);
        const isBlockedByRecurrence = blocks.some(b => b.dia_semana === dayOfWeek && time >= b.hora_inicio && time < b.hora_fin);
        if (isBlockedByRecurrence) {
            throw new common_1.ConflictException('El horario no está disponible (descanso programado).');
        }
        const endTime = new Date(startTime.getTime() + 30 * 60000);
        const existingAppointment = await this.db
            .selectFrom('cita')
            .select('id')
            .where('id_barbero', '=', barberoId)
            .where('estado', 'in', ['PENDIENTE_CONFIRMACION', 'PENDIENTE', 'CERRADO', 'DESCANSO'])
            .where('fecha_hora_inicio', '<', endTime)
            .where('fecha_hora_fin', '>', startTime)
            .executeTakeFirst();
        if (existingAppointment) {
            throw new common_1.ConflictException('El horario seleccionado ya no está disponible.');
        }
    }
    async findAll(query) {
        const { id_barbero, fecha_desde, fecha_hasta } = query;
        const fechaHastaCompleta = new Date(fecha_hasta);
        fechaHastaCompleta.setHours(23, 59, 59, 999);
        return this.db
            .selectFrom('cita')
            .leftJoin('servicio', 'servicio.id', 'cita.id_servicio')
            .leftJoin('usuario as cliente', 'cliente.id', 'cita.id_cliente')
            .select([
            'cita.id',
            'cita.id_barbero',
            'cita.id_cliente',
            'cita.id_servicio',
            'cita.fecha_hora_inicio',
            'cita.fecha_hora_fin',
            'cita.precio_final',
            'cita.estado',
            'servicio.nombre as titulo',
            'cliente.nombre as nombre_cliente',
            'cliente.apellidos as apellidos_cliente'
        ])
            .where('cita.id_barbero', '=', Number(id_barbero))
            .where('cita.fecha_hora_inicio', '>=', new Date(fecha_desde))
            .where('cita.fecha_hora_inicio', '<=', fechaHastaCompleta)
            .orderBy('cita.fecha_hora_inicio', 'asc')
            .execute();
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
    async update(id, updateDto) {
        const appointment = await this.findOne(id);
        if (!appointment) {
            throw new common_1.NotFoundException(`Cita con ID ${id} no encontrada.`);
        }
        const updatePayload = {};
        if (updateDto.id_cliente)
            updatePayload.id_cliente = updateDto.id_cliente;
        if (updateDto.id_servicio)
            updatePayload.id_servicio = updateDto.id_servicio;
        if (updateDto.fecha_hora_inicio)
            updatePayload.fecha_hora_inicio = new Date(updateDto.fecha_hora_inicio);
        if (updateDto.fecha_hora_fin)
            updatePayload.fecha_hora_fin = new Date(updateDto.fecha_hora_fin);
        if (updateDto.estado)
            updatePayload.estado = updateDto.estado;
        if (updateDto.precio_final !== undefined)
            updatePayload.precio_final = updateDto.precio_final;
        if (updateDto.estado === 'DESCANSO') {
            updatePayload.id_cliente = null;
            updatePayload.id_servicio = null;
            updatePayload.precio_final = null;
        }
        if (Object.keys(updatePayload).length === 0) {
            return appointment;
        }
        await this.db
            .updateTable('cita')
            .set(updatePayload)
            .where('id', '=', id)
            .execute();
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
        users_service_1.UsersService,
        recurring_blocks_service_1.RecurringBlocksService,
        messaging_service_1.MessagingService])
], AppointmentsService);
//# sourceMappingURL=appointments.service.js.map