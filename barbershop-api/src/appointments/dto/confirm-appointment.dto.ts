// barbershop-api/src/appointments/dto/confirm-appointment.dto.ts
import { IsInt, IsPositive, IsString, IsNotEmpty, Length } from 'class-validator';

/**
 * DTO para el segundo paso del flujo de reserva: la confirmación con el código OTP.
 */
export class ConfirmAppointmentDto {
  /**
   * El ID de la cita en estado 'PENDIENTE_CONFIRMACION' que se quiere confirmar.
   */
  @IsInt()
  @IsPositive()
  id_cita_provisional: number;

  /**
   * El código de 6 dígitos que el usuario ha recibido por Telegram.
   */
  @IsString()
  @IsNotEmpty()
  @Length(6, 6, { message: 'El código debe tener exactamente 6 dígitos.' })
  codigo: string;
}
