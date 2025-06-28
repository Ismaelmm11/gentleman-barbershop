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

    const { endTime, finalPrice } = await this.calculatePriceAndDurationForStaff(createDto);

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
  
  private async calculatePriceAndDurationForStaff(dto: CreateAppointmentDto) {
    const startTime = new Date(dto.fecha_hora_inicio);
    let endTime: Date;
    let finalPrice: number | null = null;

    if (dto.fecha_hora_fin) {
        endTime = new Date(dto.fecha_hora_fin);
        if (endTime <= startTime) throw new BadRequestException('La hora de fin debe ser posterior a la hora de inicio.');
    } else if (dto.id_servicio) {
        const service = await this.servicesService.findOne(dto.id_servicio);
        endTime = new Date(startTime.getTime() + service.duracion_minutos * 60000);
    } else {
        endTime = new Date(startTime.getTime() + 30 * 60000); // Descanso por defecto para el personal
    }
    
    if (dto.estado === 'PENDIENTE' && dto.id_servicio) {
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
        .where('estado', 'in', ['PENDIENTE', 'CERRADO', 'DESCANSO'])
        .where('fecha_hora_inicio', '<', endTime)
        .where('fecha_hora_fin', '>', startTime)
        .executeTakeFirst();

      if (existingAppointment) {
          throw new ConflictException('El horario seleccionado ya no está disponible.');
      }
  }

  // /**
  //  * Método principal para crear una cita. Actúa como un orquestador
  //  * que llama a funciones privadas para validar, calcular y guardar.
  //  */
  // async create(
  //   createAppointmentDto: CreateAppointmentDto,
  //   creator?: { userId: number; rol: string },
  // ) {
  //   // 1. Validar TODA la lógica de negocio y permisos en un solo lugar.
  //   await this.validateAppointmentCreation(createAppointmentDto, creator);

  //   // 2. Calcular la hora de fin. Este método ahora asume que los permisos ya están validados.
  //   const fecha_hora_fin = await this.calculateEndTime(createAppointmentDto);

  //   // 3. Preparar el objeto final para la base de datos.
  //   const dataToInsert = this.prepareAppointmentData(createAppointmentDto, fecha_hora_fin);

  //   // 4. Insertar en la base de datos.
  //   const result = await this.db.insertInto('cita').values(dataToInsert).executeTakeFirstOrThrow();
  //   const newAppointmentId = Number(result.insertId);

  //   // 5. Devolver la cita recién creada.
  //   return this.findOne(newAppointmentId);
  // }

  // // --- MÉTODOS PRIVADOS DE AYUDA (HELPERS) ---

  // /**
  //  * NUEVO MÉTODO CENTRALIZADO: Valida todas las reglas de negocio y permisos ANTES de proceder.
  //  * Es el único "guardia de seguridad" para la lógica de creación.
  //  * @private
  //  */
  // private async validateAppointmentCreation(dto: CreateAppointmentDto, creator?: { rol: string }) {
  //   // --- Validaciones de Existencia de Entidades ---
  //   // 1. Validamos que el 'id_barbero' corresponda a un proveedor de servicios.
  //   const barbero = await this.usersService.findOne(dto.id_barbero);
  //   if (!['ADMIN', 'BARBERO'].includes(barbero.rol)) {
  //     throw new BadRequestException('El ID de barbero proporcionado no existe.');
  //   }

  //   if (dto.estado === 'PENDIENTE') {
  //     if (!dto.id_cliente || !dto.id_servicio) {
  //       throw new BadRequestException('Las citas pendientes deben tener cliente y servicio.');
  //     }
  //     await this.usersService.findOne(dto.id_cliente);
  //     await this.servicesService.findOne(dto.id_servicio);
  //   }

  //   const isAllowedToManage = creator && ['ADMIN', 'BARBERO'].includes(creator.rol);

  //   // Regla 1: Para crear un DESCANSO, se necesita ser ADMIN, BARBERO o TATUADOR.
  //   if (dto.estado === 'DESCANSO' && !isAllowedToManage) {
  //     throw new ForbiddenException('No tienes permisos para crear un descanso.');
  //   }

  //   // Regla 2: Para establecer una fecha de fin MANUAL, se necesita ser ADMIN, BARBERO o TATUADOR.
  //   if (dto.fecha_hora_fin && !isAllowedToManage) {
  //     throw new ForbiddenException('No tienes permisos para establecer una hora de fin manual.');
  //   }

  //   // Si la persona que crea la cita NO es personal (es un cliente o no está logueada),
  //   // entonces comprobamos si la hora choca con un descanso recurrente.
  //   if (!isAllowedToManage) {
  //     await this.checkAgainstRecurringBlocks(dto.id_barbero, new Date(dto.fecha_hora_inicio));
  //   }
  // }

  // /**
  //  * NUEVO HELPER: Comprueba si una hora de inicio de cita colisiona con un descanso recurrente.
  //  */
  // private async checkAgainstRecurringBlocks(barberoId: number, startTime: Date) {
  //   // getDay() devuelve 0 para Domingo, 1 para Lunes, etc.
  //   // Lo ajustamos a nuestro formato donde 7 es Domingo.
  //   const dayOfWeek = startTime.getDay() === 0 ? 7 : startTime.getDay();

  //   // Obtenemos la hora en formato HH:MM para poder compararla.
  //   const time = startTime.toTimeString().slice(0, 5);

  //   // Pedimos al RecurringBlocksService todos los descansos para ese barbero.
  //   const blocks = await this.recurringBlocksService.findAllForUser(barberoId);

  //   // Buscamos si alguno de los descansos de ese día de la semana contiene la hora de la cita.
  //   const isBlocked = blocks.some(block => 
  //       block.dia_semana === dayOfWeek &&
  //       time >= block.hora_inicio &&
  //       time < block.hora_fin
  //   );

  //   if (isBlocked) {
  //       throw new ConflictException('El horario solicitado no está disponible debido a un descanso programado.');
  //   }
  // }

  // /**
  //  * MÉTODO SIMPLIFICADO: Ahora solo se preocupa del cálculo,
  //  * asumiendo que los permisos ya fueron validados.
  //  * @private
  //  */
  // private async calculateEndTime(dto: CreateAppointmentDto): Promise<Date> {
  //   const fechaInicio = new Date(dto.fecha_hora_inicio);

  //   if (dto.fecha_hora_fin) {
  //     const fechaFinManual = new Date(dto.fecha_hora_fin);
  //     if (fechaFinManual <= fechaInicio) {
  //       throw new BadRequestException('La hora de fin debe ser posterior a la hora de inicio.');
  //     }
  //     return fechaFinManual;
  //   }

  //   if (dto.id_servicio) {
  //     const servicio = await this.servicesService.findOne(dto.id_servicio);
  //     return new Date(fechaInicio.getTime() + servicio.duracion_minutos * 60000);
  //   }

  //   // Duración por defecto para descansos si no se especifica una hora de fin manual.
  //   return new Date(fechaInicio.getTime() + 30 * 60000);
  // }

  // /**
  //  * Prepara el objeto de datos final y limpio para ser insertado en la base de datos.
  //  * @private
  //  */
  // private prepareAppointmentData(dto: CreateAppointmentDto, fecha_hora_fin: Date) {
  //   const fecha_hora_inicio = new Date(dto.fecha_hora_inicio);
  //   return {
  //     id_barbero: dto.id_barbero,
  //     estado: dto.estado,
  //     fecha_hora_inicio,
  //     fecha_hora_fin,
  //     precio_final: null,
  //     id_cliente: dto.estado === 'PENDIENTE' ? dto.id_cliente : null,
  //     id_servicio: dto.estado === 'PENDIENTE' ? dto.id_servicio : null,
  //   };
  // }


  /**
   * Devuelve todas las citas. (Sin filtros por ahora).
   */
  async findAll() {
    return this.db.selectFrom('cita').selectAll().execute();
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
  async update(id: number, updateAppointmentDto: UpdateAppointmentDto) {
    await this.db
      .updateTable('cita')
      .set({ estado: updateAppointmentDto.estado })
      .where('id', '=', id)
      .executeTakeFirstOrThrow();

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
