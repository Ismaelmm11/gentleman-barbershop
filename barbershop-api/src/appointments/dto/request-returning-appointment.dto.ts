// barbershop-api/src/appointments/dto/request-returning-appointment.dto.ts
import { IsInt, IsPositive, IsDateString, IsNotEmpty, IsString, IsPhoneNumber } from 'class-validator';
import { IsTimeIn30MinuteIntervals } from '../../common/decorators/time-validation.decorator';

/**
 * DTO para solicitar una cita como cliente existente.
 * Solo requiere el número de teléfono para la identificación.
 */
export class RequestReturningAppointmentDto {
  // --- Datos de la Cita ---
  @IsInt()
  @IsPositive()
  id_barbero: number;

  @IsInt()
  @IsPositive()
  id_servicio: number;

  @IsDateString()
  @IsTimeIn30MinuteIntervals()
  fecha_hora_inicio: string;

  // --- Datos de Identificación del Cliente ---
  @IsPhoneNumber('ES')
  telefono_cliente: string;

  // Para las pruebas con Telegram, aquí se pasará el chat_id del usuario.
  @IsString()
  @IsNotEmpty()
  canal_contacto_cliente: string;
}
