// barbershop-api/src/recurring-blocks/dto/create-recurring-block.dto.ts
import { IsInt, IsString, IsOptional, Matches, MaxLength, IsNotEmpty, IsArray, ArrayMinSize, ArrayMaxSize, Min, Max } from 'class-validator';

/**
 * DTO para crear nuevos bloqueos recurrentes.
 * Define la estructura para crear uno o más descansos en una sola operación.
 */
export class CreateRecurringBlockDto {
  /**
   * Un array con los días de la semana para el bloqueo. 1=Lunes, 7=Domingo.
   * @example [1, 2, 3]
   */
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(7)
  @IsInt({ each: true })
  @Min(1, { each: true })
  @Max(7, { each: true })
  @IsNotEmpty()
  dias_semana: number[];

  /**
   * La hora de inicio del bloqueo en formato HH:MM.
   * @example "09:00"
   */
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: 'La hora de inicio debe tener el formato HH:MM.' })
  @IsNotEmpty()
  hora_inicio: string;

  /**
   * La hora de fin del bloqueo en formato HH:MM.
   * @example "10:00"
   */
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: 'La hora de fin debe tener el formato HH:MM.' })
  @IsNotEmpty()
  hora_fin: string;

  /**
   * Un título opcional para describir el bloqueo.
   * @example "Pausa para comer"
   */
  @IsString()
  @IsOptional()
  @MaxLength(100)
  titulo?: string;
}
