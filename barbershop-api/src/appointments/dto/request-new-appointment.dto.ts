// barbershop-api/src/appointments/dto/request-new-appointment.dto.ts
import { IsInt, IsPositive, IsDateString, IsNotEmpty, IsString, IsPhoneNumber } from 'class-validator';
import { IsTimeIn5MinuteIntervals } from '../../common/decorators/time-validation.decorator';

/**
 * DTO para solicitar una cita como cliente nuevo.
 * Requiere todos los datos personales para crear el perfil del cliente.
 */
export class RequestNewAppointmentDto {
  // --- Datos de la Cita ---
  @IsInt()
  @IsPositive()
  id_barbero: number;

  @IsInt()
  @IsPositive()
  id_servicio: number;

  @IsDateString()
  @IsTimeIn5MinuteIntervals()
  fecha_hora_inicio: string;

  // --- Datos del Nuevo Cliente (Obligatorios) ---
  @IsString()
  @IsNotEmpty()
  nombre_cliente: string;

  @IsString()
  @IsNotEmpty()
  apellidos_cliente: string;
  
  @IsDateString({}, { message: 'La fecha de nacimiento debe tener el formato YYYY-MM-DD.' })
  @IsNotEmpty()
  fecha_nacimiento_cliente: string;

  @IsPhoneNumber('ES')
  telefono_cliente: string;

  // Para las pruebas con Telegram, aquí se pasará el chat_id del usuario.
  @IsString()
  @IsNotEmpty()
  canal_contacto_cliente: string;
}
