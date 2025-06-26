// barbershop-api/src/appointments/appointments.service.ts
import { Inject, Injectable, NotFoundException, ForbiddenException, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { Kysely } from 'kysely';
import { DB } from '../database/db.types';
import { DATABASE_TOKEN } from '../database/database.provider';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { ServicesService } from '../services/services.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class AppointmentsService {
  constructor(
    @Inject(DATABASE_TOKEN) private readonly db: Kysely<DB>,
    private readonly servicesService: ServicesService,
    private readonly usersService: UsersService,
  ) { }

  /**
   * Método principal para crear una cita. Actúa como un orquestador
   * que llama a funciones privadas para validar, calcular y guardar.
   */
  async create(
    createAppointmentDto: CreateAppointmentDto,
    creator?: { userId: number; rol: string },
  ) {
    // 1. Validar TODA la lógica de negocio y permisos en un solo lugar.
    await this.validateAppointmentCreation(createAppointmentDto, creator);

    // 2. Calcular la hora de fin. Este método ahora asume que los permisos ya están validados.
    const fecha_hora_fin = await this.calculateEndTime(createAppointmentDto);

    // 3. Preparar el objeto final para la base de datos.
    const dataToInsert = this.prepareAppointmentData(createAppointmentDto, fecha_hora_fin);

    // 4. Insertar en la base de datos.
    const result = await this.db.insertInto('cita').values(dataToInsert).executeTakeFirstOrThrow();
    const newAppointmentId = Number(result.insertId);

    // 5. Devolver la cita recién creada.
    return this.findOne(newAppointmentId);
  }

  // --- MÉTODOS PRIVADOS DE AYUDA (HELPERS) ---

  /**
   * NUEVO MÉTODO CENTRALIZADO: Valida todas las reglas de negocio y permisos ANTES de proceder.
   * Es el único "guardia de seguridad" para la lógica de creación.
   * @private
   */
  private async validateAppointmentCreation(dto: CreateAppointmentDto, creator?: { rol: string }) {
    // --- Validaciones de Existencia de Entidades ---
    // 1. Validamos que el 'id_barbero' corresponda a un proveedor de servicios.
    const barbero = await this.usersService.findOne(dto.id_barbero);
    if (!['ADMIN', 'BARBERO', 'TATUADOR'].includes(barbero.rol)) {
      throw new BadRequestException('El ID de barbero proporcionado no existe.');
    }

    if (dto.estado === 'PENDIENTE') {
      if (!dto.id_cliente || !dto.id_servicio) {
        throw new BadRequestException('Las citas pendientes deben tener cliente y servicio.');
      }
      await this.usersService.findOne(dto.id_cliente);
      await this.servicesService.findOne(dto.id_servicio);
    }

    const isAllowedToManage = creator && ['ADMIN', 'BARBERO'].includes(creator.rol);

    // Regla 1: Para crear un DESCANSO, se necesita ser ADMIN, BARBERO o TATUADOR.
    if (dto.estado === 'DESCANSO' && !isAllowedToManage) {
      throw new ForbiddenException('No tienes permisos para crear un descanso.');
    }

    // Regla 2: Para establecer una fecha de fin MANUAL, se necesita ser ADMIN, BARBERO o TATUADOR.
    if (dto.fecha_hora_fin && !isAllowedToManage) {
      throw new ForbiddenException('No tienes permisos para establecer una hora de fin manual.');
    }
  }

  /**
   * MÉTODO SIMPLIFICADO: Ahora solo se preocupa del cálculo,
   * asumiendo que los permisos ya fueron validados.
   * @private
   */
  private async calculateEndTime(dto: CreateAppointmentDto): Promise<Date> {
    const fechaInicio = new Date(dto.fecha_hora_inicio);

    if (dto.fecha_hora_fin) {
      const fechaFinManual = new Date(dto.fecha_hora_fin);
      if (fechaFinManual <= fechaInicio) {
        throw new BadRequestException('La hora de fin debe ser posterior a la hora de inicio.');
      }
      return fechaFinManual;
    }

    if (dto.id_servicio) {
      const servicio = await this.servicesService.findOne(dto.id_servicio);
      return new Date(fechaInicio.getTime() + servicio.duracion_minutos * 60000);
    }

    // Duración por defecto para descansos si no se especifica una hora de fin manual.
    return new Date(fechaInicio.getTime() + 30 * 60000);
  }

  /**
   * Prepara el objeto de datos final y limpio para ser insertado en la base de datos.
   * @private
   */
  private prepareAppointmentData(dto: CreateAppointmentDto, fecha_hora_fin: Date) {
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
