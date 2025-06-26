// barbershop-api/src/schedules/dto/create-schedule.dto.ts
import { IsInt, IsString, Min, Max, Matches, IsNotEmpty } from 'class-validator';

export class CreateScheduleBlockDto {
  /**
   * El día de la semana para el bloqueo (1=Lunes, 7=Domingo).
   */
  @IsInt()
  @Min(1)
  @Max(7)
  dia_semana: number;

  /**
   * La hora de inicio del bloqueo en formato 'HH:MM'.
   */
  @IsString()
  @IsNotEmpty()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    // CORRECCIÓN: El mensaje ahora refleja el formato correcto.
    message: 'La hora_inicio debe tener el formato HH:MM',
  })
  hora_inicio: string;

  /**
   * La hora de fin del bloqueo en formato 'HH:MM'.
   */
  @IsString()
  @IsNotEmpty()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    // CORRECCIÓN: El mensaje ahora refleja el formato correcto.
    message: 'La hora_fin debe tener el formato HH:MM',
  })
  hora_fin: string;
}
