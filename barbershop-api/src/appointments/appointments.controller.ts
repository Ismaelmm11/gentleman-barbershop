// barbershop-api/src/appointments/appointments.controller.ts
import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ParseIntPipe, HttpCode, HttpStatus } from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { RequestReturningAppointmentDto } from './dto/request-returning-appointment.dto';
import { RequestNewAppointmentDto } from './dto/request-new-appointment.dto';
import { ConfirmAppointmentDto } from './dto/confirm-appointment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Public } from '../auth/decorators/public.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { GetUser } from '../auth/decorators/get-user.decorator';

/**
 * @Controller('appointments') - Define esta clase como el controlador para la ruta base '/appointments'.
 * @UseGuards(JwtAuthGuard, RolesGuard) - Aplica nuestros guardias de seguridad a TODAS las rutas
 * de este controlador por defecto. Esto asegura que solo usuarios autenticados y con los roles
 * correctos puedan acceder, a menos que una ruta se marque explícitamente como pública.
 */
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('appointments')
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  /**
   * Endpoint para crear una nueva cita.
   * @Public() - Marcamos esta ruta como pública. Esto permite que cualquier persona,
   * incluyendo clientes nuevos no autenticados, pueda enviar una solicitud para crear una cita.
   * La lógica para gestionar si es un cliente nuevo o existente reside en el servicio.
   */
  // @Public()
  // @Post()
  // create(
  //   @Body() createAppointmentDto: CreateAppointmentDto,
  //   @GetUser() creator?: { userId: number; rol: string },
  // ) {
  //   return this.appointmentsService.create(createAppointmentDto, creator);
  // }

  // --- ENDPOINTS PÚBLICOS PARA EL FLUJO OTP DEL CLIENTE ---

  /**
   * Ruta para que un cliente existente solicite una cita.
   */
  @Public()
  @Post('request-returning')
  @HttpCode(HttpStatus.OK)
  requestForReturningClient(@Body() requestDto: RequestReturningAppointmentDto) {
    return this.appointmentsService.requestForReturningClient(requestDto);
  }

  /**
   * Ruta para que un cliente nuevo solicite una cita.
   */
  @Public()
  @Post('request-new')
  @HttpCode(HttpStatus.OK)
  requestForNewClient(@Body() requestDto: RequestNewAppointmentDto) {
    return this.appointmentsService.requestForNewClient(requestDto);
  }

  /**
   * Ruta para que un cliente confirme su cita con el código OTP.
   */
  @Public()
  @Post('confirm')
  @HttpCode(HttpStatus.OK)
  confirmAppointment(@Body() confirmDto: ConfirmAppointmentDto) {
    return this.appointmentsService.confirmAppointment(confirmDto);
  }

  // --- ENDPOINTS PROTEGIDOS PARA LA GESTIÓN INTERNA DEL PERSONAL ---

  /**
   * Endpoint para que el personal cree citas o descansos directamente,
   * saltándose el flujo de verificación OTP.
   */
  @Post('internal')
  @Roles('ADMIN', 'BARBERO', 'TATUADOR')
  createInternal(
    @GetUser() creator: { userId: number },
    @Body() createAppointmentDto: CreateAppointmentDto,
  ) {
    return this.appointmentsService.createInternal(creator.userId, createAppointmentDto);
  }

  /**
   * Endpoint para obtener todas las citas (pensado para el calendario de gestión).
   * @Roles('ADMIN', 'BARBERO') - Solo el personal interno puede acceder a la
   * lista completa de citas.
   */
  @Get()
  @Roles('ADMIN', 'BARBERO')
  findAll() {
    // En futuros hitos, este método aceptará filtros por fecha, barbero, etc.
    return this.appointmentsService.findAll();
  }

  /**
   * Endpoint para obtener los detalles de una cita específica.
   * @Roles('ADMIN', 'BARBERO') - Por ahora, solo el personal puede ver los
   * detalles de cualquier cita. En el futuro, podríamos añadir lógica para que el
   * cliente dueño de la cita también pueda acceder.
   */
  @Get(':id')
  @Roles('ADMIN', 'BARBERO')
  findOne(@Param('id') id: string) {
    return this.appointmentsService.findOne(+id);
  }

  /**
   * Endpoint para actualizar una cita (en esta fase, solo el estado).
   * @Roles('ADMIN', 'BARBERO') - Solo el personal puede modificar el estado
   * de una cita (ej: marcarla como 'CERRADO').
   */
  @Patch(':id')
  @Roles('ADMIN', 'BARBERO')
  update(@Param('id') id: string, @Body() updateAppointmentDto: UpdateAppointmentDto) {
    return this.appointmentsService.update(+id, updateAppointmentDto);
  }

  /**
   * Endpoint para eliminar una cita.
   * @Roles('ADMIN', 'BARBERO') - Definimos que los tatuadores no pueden eliminar citas,
   * solo los barberos y, por supuesto, el admin que tiene acceso a todo.
   */
  @Delete(':id')
  @Roles('ADMIN', 'BARBERO')
  remove(@Param('id') id: string) {
    return this.appointmentsService.remove(+id);
  }
}
