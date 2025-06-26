// barbershop-api/src/appointments/appointments.controller.ts
import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
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
  @Public()
  @Post()
  create(
    @Body() createAppointmentDto: CreateAppointmentDto,
    @GetUser() creator?: { userId: number; rol: string },
  ) {
    return this.appointmentsService.create(createAppointmentDto, creator);
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
