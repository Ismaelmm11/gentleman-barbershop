// barbershop-api/src/appointments/dto/create-appointment.dto.ts
import { IsInt, IsPositive, IsDateString, IsNumber, IsOptional, IsEnum, ValidateIf, IsNotEmpty, IsString } from 'class-validator';
import { IsTimeIn5MinuteIntervals } from '../../common/decorators/time-validation.decorator';
import { Type } from 'class-transformer';

export class CreateAppointmentDto {
  @IsInt()
  @IsPositive()
  id_barbero: number;

  /**
   * ID del cliente. Opcional en general, pero obligatorio si el 'estado' es 'PENDIENTE'.
   */
  @ValidateIf((o) => o.estado === 'PENDIENTE')
  @IsNotEmpty({ message: 'El id_cliente es obligatorio para las citas pendientes.' })
  @IsInt()
  @IsPositive()
  id_cliente: number;

  /**
   * ID del servicio. Opcional en general, pero obligatorio si el 'estado' es 'PENDIENTE'.
   */
  @ValidateIf((o) => o.estado === 'PENDIENTE')
  @IsNotEmpty({ message: 'El id_servicio es obligatorio para las citas pendientes.' })
  @IsInt()
  @IsPositive()
  id_servicio: number;

  @IsDateString()
  @IsTimeIn5MinuteIntervals()
  fecha_hora_inicio: string;

  @IsDateString()
  @IsTimeIn5MinuteIntervals()
  fecha_hora_fin: string;

  /**
   * El estado del evento a crear. Puede ser una cita 'PENDIENTE'
   * o un bloqueo de tiempo para un 'DESCANSO'.
   */
  @IsEnum(['PENDIENTE', 'DESCANSO'])
  estado: 'PENDIENTE' | 'DESCANSO';

  @ValidateIf((o) => o.estado === 'PENDIENTE')
  @IsNotEmpty({ message: 'El id_servicio es obligatorio para las citas pendientes.' })
  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  precio_final: number;

  @IsOptional()
  @IsString()
  titulo: string;
}
