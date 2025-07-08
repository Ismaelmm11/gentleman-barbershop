// barbershop-api/src/appointments/appointments.service.ts
import { Inject, Injectable, NotFoundException, ForbiddenException, BadRequestException, UnauthorizedException, ConflictException } from '@nestjs/common';
import { Kysely } from 'kysely';
import { DB } from '../database/db.types';
import { DATABASE_TOKEN } from '../database/database.provider';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { RequestReturningAppointmentDto } from './dto/request-returning-appointment.dto';
import { RequestNewAppointmentDto } from './dto/request-new-appointment.dto';
import { ConfirmAppointmentDto } from './dto/confirm-appointment.dto';
import { FindAllAppointmentsQueryDto } from './dto/find-all-appointments-query.dto';
import { ServicesService } from '../services/services.service';
import { UsersService } from '../users/users.service';
import { RecurringBlocksService } from '../recurring-blocks/recurring-blocks.service';
import { MessagingService } from 'src/messaging/messaging.service';
import { randomInt } from 'crypto';

@Injectable()
export class AppointmentsService {
  constructor(
    @Inject(DATABASE_TOKEN) private readonly db: Kysely<DB>,
    private readonly servicesService: ServicesService,
    private readonly usersService: UsersService,
    private readonly recurringBlocksService: RecurringBlocksService,
    private readonly messagingService: MessagingService,
  ) { }

  // =======================================================================
  // === FLUJO DE CREACIÓN PARA PERSONAL (ADMINS, BARBEROS, TATUADORES) ===
  // =======================================================================
  async createInternal(creatorId: number, createDto: CreateAppointmentDto) {
    await this.validateEntities(createDto);

    const { endTime, finalPrice } = await this.calculatePriceForStaff(createDto);

    // NOTA: No hay `checkAvailability` aquí. El personal puede sobreescribir el calendario.

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



  // =======================================================================
  // === FLUJO PARA CLIENTES (CON VERIFICACIÓN OTP) ========================
  // =======================================================================

  /**
   * PASO 1a: Cliente existente solicita una cita.
   */
  async requestForReturningClient(requestDto: RequestReturningAppointmentDto) {
    const user = await this.usersService.findOneByPhone(requestDto.telefono_cliente);
    if (!user) {
      throw new NotFoundException('No se ha encontrado ningún cliente con ese número de teléfono. Por favor, regístrese usando el formulario para nuevos clientes.');
    }
    return this.createProvisionalAppointmentAndSendOtp(user.id, requestDto);
  }

  /**
   * PASO 1b: Cliente nuevo solicita una cita.
   */
  async requestForNewClient(requestDto: RequestNewAppointmentDto) {
    const existingUser = await this.usersService.findOneByPhone(requestDto.telefono_cliente);
    if (existingUser) {
      throw new ConflictException('El número de teléfono ya está en uso. Por favor, utilice el formulario para clientes existentes.');
    }
    // Pasamos un `userId` de null para indicar que el usuario aún no existe.
    return this.createProvisionalAppointmentAndSendOtp(null, requestDto);
  }

  /**
   * PASO 2: Cliente (nuevo o existente) confirma la cita.
   */
  async confirmAppointment(confirmDto: ConfirmAppointmentDto) {
    const { id_cita_provisional, codigo } = confirmDto;

    return this.db.transaction().execute(async (trx) => {
      const otpRecord = await trx.selectFrom('otp_codes').selectAll().where('id_cita_provisional', '=', id_cita_provisional).executeTakeFirst();

      if (!otpRecord) throw new NotFoundException('Solicitud de cita no encontrada.');
      if (otpRecord.codigo !== codigo) {
        await trx.updateTable('otp_codes').set({ intentos: otpRecord.intentos + 1 }).where('id', '=', otpRecord.id).execute();
        if (otpRecord.intentos >= 2) {
          await trx.deleteFrom('otp_codes').where('id', '=', otpRecord.id).execute();
          await trx.deleteFrom('cita').where('id', '=', id_cita_provisional).execute();
          throw new UnauthorizedException('Código incorrecto. La solicitud ha sido cancelada por demasiados intentos.');
        }
        throw new UnauthorizedException('Código incorrecto.');
      }
      if (new Date() > otpRecord.fecha_expiracion) throw new UnauthorizedException('El código ha expirado.');

      // Si el OTP tenía datos de un nuevo cliente, lo creamos AHORA.
      if (otpRecord.datos_cliente_json) {
        const clientData = JSON.parse(otpRecord.datos_cliente_json);
        const newUser = await this.usersService.create(clientData);
        // Actualizamos la cita provisional para enlazarla al nuevo usuario.
        await trx.updateTable('cita').set({ id_cliente: newUser.id }).where('id', '=', id_cita_provisional).execute();
      }

      const result = await trx.updateTable('cita').set({ estado: 'PENDIENTE' }).where('id', '=', id_cita_provisional).where('estado', '=', 'PENDIENTE_CONFIRMACION').executeTakeFirst();

      if (result.numUpdatedRows === 0n) throw new ConflictException('Esta cita ya ha sido confirmada o cancelada.');

      await trx.deleteFrom('otp_codes').where('id', '=', otpRecord.id).execute();
      return { message: 'Cita confirmada correctamente.' };
    });
  }


  // ===============================================================
  // === MÉTODOS DE GESTIÓN Y HELPERS ==============================
  // ===============================================================

  /**
   * Lógica centralizada para crear citas provisionales y enviar OTP.
   * @private
   */
  private async createProvisionalAppointmentAndSendOtp(
    userId: number | null,
    requestDto: RequestNewAppointmentDto | RequestReturningAppointmentDto
  ) {
    const service = await this.servicesService.findOne(requestDto.id_servicio);
    await this.checkAvailabilityForClient(requestDto.id_barbero, new Date(requestDto.fecha_hora_inicio));

    return this.db.transaction().execute(async (trx) => {
      const endTime = new Date(new Date(requestDto.fecha_hora_inicio).getTime() + 30 * 60000);

      const provisionalAppointmentResult = await trx
        .insertInto('cita')
        .values({
          id_barbero: requestDto.id_barbero,
          id_servicio: requestDto.id_servicio,
          id_cliente: userId, // Puede ser null si el cliente es nuevo
          fecha_hora_inicio: new Date(requestDto.fecha_hora_inicio),
          fecha_hora_fin: endTime,
          estado: 'PENDIENTE_CONFIRMACION',
          precio_final: service.precio_base,
        })
        .executeTakeFirstOrThrow();

      const provisionalAppointmentId = Number(provisionalAppointmentResult.insertId);

      const otpCode = randomInt(100000, 999999).toString();
      const expirationDate = new Date(Date.now() + 10 * 60 * 1000);

      // Si es un cliente nuevo, guardamos sus datos junto al OTP.
      let newClientDataJson: string | null = null;
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

      await this.messagingService.sendOtp(
        requestDto.canal_contacto_cliente,
        `Tu código de confirmación para Gentleman Barbershop es: ${otpCode}`
      );

      return { id_cita_provisional: provisionalAppointmentId };
    });
  }

  private async validateEntities(dto: Pick<CreateAppointmentDto, 'id_barbero' | 'id_cliente' | 'id_servicio'>) {
    const barbero = await this.usersService.findOne(dto.id_barbero);
    if (!['ADMIN', 'BARBERO', 'TATUADOR'].includes(barbero.rol)) {
      throw new BadRequestException('El ID proporcionado no corresponde a un proveedor de servicios.');
    }
    if (dto.id_cliente) await this.usersService.findOne(dto.id_cliente);
    if (dto.id_servicio) await this.servicesService.findOne(dto.id_servicio);
  }

  private async calculatePriceForStaff(dto: CreateAppointmentDto) {
    const startTime = new Date(dto.fecha_hora_inicio);
    const endTime = new Date(dto.fecha_hora_fin);
    let finalPrice: number | null = null;

    // 1. Validar que la hora de fin es posterior a la de inicio.
    if (endTime <= startTime) {
      throw new BadRequestException('La hora de fin debe ser posterior a la hora de inicio.');
    }

    // 2. Calcular el precio si se ha proporcionado un servicio.
    if (dto.id_servicio) {
      const service = await this.servicesService.findOne(dto.id_servicio);
      finalPrice = service.precio_base;
    }

    return { endTime, finalPrice };
  }

  private async checkAvailabilityForClient(barberoId: number, startTime: Date) {
    const dayOfWeek = startTime.getDay() === 0 ? 7 : startTime.getDay();
    const time = startTime.toTimeString().slice(0, 5);
    const blocks = await this.recurringBlocksService.findAllForUser(barberoId);
    const isBlockedByRecurrence = blocks.some(b => b.dia_semana === dayOfWeek && time >= b.hora_inicio && time < b.hora_fin);

    if (isBlockedByRecurrence) {
      throw new ConflictException('El horario no está disponible (descanso programado).');
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
      throw new ConflictException('El horario seleccionado ya no está disponible.');
    }
  }


  /**
   * Devuelve todas las citas para un barbero dentro de un rango de fechas.
   */
  async findAll(query: FindAllAppointmentsQueryDto) {
    const { id_barbero, fecha_desde, fecha_hasta } = query;

    const fechaHastaCompleta = new Date(fecha_hasta);
    fechaHastaCompleta.setHours(23, 59, 59, 999);

    return this.db
      .selectFrom('cita')
      // Unimos con la tabla de servicios para obtener el nombre del servicio
      .leftJoin('servicio', 'servicio.id', 'cita.id_servicio')
      // Unimos con la tabla de usuarios para obtener el nombre del cliente
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
        // Seleccionamos el nombre del servicio y lo llamamos 'titulo'
        'servicio.nombre as titulo',
        // Seleccionamos el nombre y apellidos del cliente
        'cliente.nombre as nombre_cliente',
        'cliente.apellidos as apellidos_cliente'
      ])
      .where('cita.id_barbero', '=', Number(id_barbero))
      .where('cita.fecha_hora_inicio', '>=', new Date(fecha_desde))
      .where('cita.fecha_hora_inicio', '<=', fechaHastaCompleta)
      .orderBy('cita.fecha_hora_inicio', 'asc')
      .execute();
  }

  /**
   * Busca y devuelve una cita por su ID.
   */
  async findOne(id: number) {
    const appointment = await this.db
      .selectFrom('cita')
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst();

    if (!appointment) {
      throw new NotFoundException(`Cita con ID ${id} no encontrada.`);
    }
    return appointment;
  }

  /**
   * Actualiza el estado de una cita.
   */
  async update(id: number, updateDto: UpdateAppointmentDto) {
    // Primero, nos aseguramos de que la cita exista
    const appointment = await this.findOne(id);
    if (!appointment) {
      throw new NotFoundException(`Cita con ID ${id} no encontrada.`);
    }

    // Creamos un objeto que contendrá solo los campos a actualizar
    const updatePayload: any = {};

    // Añadimos los campos al payload solo si vienen en el DTO
    if (updateDto.id_cliente) updatePayload.id_cliente = updateDto.id_cliente;
    if (updateDto.id_servicio) updatePayload.id_servicio = updateDto.id_servicio;
    if (updateDto.fecha_hora_inicio) updatePayload.fecha_hora_inicio = new Date(updateDto.fecha_hora_inicio);
    if (updateDto.fecha_hora_fin) updatePayload.fecha_hora_fin = new Date(updateDto.fecha_hora_fin);
    if (updateDto.estado) updatePayload.estado = updateDto.estado;
    if (updateDto.precio_final !== undefined) updatePayload.precio_final = updateDto.precio_final;

    // Lógica de negocio: si el nuevo estado es DESCANSO, borramos los datos de la cita
    if (updateDto.estado === 'DESCANSO') {
      updatePayload.id_cliente = null;
      updatePayload.id_servicio = null;
      updatePayload.precio_final = null;
    }

    // Si no hay nada que actualizar, devolvemos la cita actual
    if (Object.keys(updatePayload).length === 0) {
      return appointment;
    }

    // Ejecutamos la actualización en la base de datos
    await this.db
      .updateTable('cita')
      .set(updatePayload) // Kysely usará solo los campos que hay en updatePayload
      .where('id', '=', id)
      .execute();

    // Devolvemos la cita actualizada para confirmar los cambios
    return this.findOne(id);
  }

  /**
   * Elimina una cita.
   */
  async remove(id: number) {
    const result = await this.db
      .deleteFrom('cita')
      .where('id', '=', id)
      .executeTakeFirst();

    if (result.numDeletedRows === 0n) {
      throw new NotFoundException(`No se pudo eliminar. Cita con ID ${id} no encontrada.`);
    }
    return { message: `Cita con ID ${id} eliminada correctamente.` };
  }
}
