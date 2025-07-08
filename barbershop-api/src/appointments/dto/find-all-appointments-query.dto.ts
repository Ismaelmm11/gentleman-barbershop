// src/appointments/dto/find-all-appointments-query.dto.ts
import { IsDateString, IsNotEmpty, IsNumberString, IsOptional } from 'class-validator';

export class FindAllAppointmentsQueryDto {
  @IsNotEmpty({ message: 'El id_barbero es obligatorio.' })
  @IsNumberString({}, { message: 'El id_barbero debe ser un número.' })
  id_barbero: string;

  @IsNotEmpty({ message: 'La fecha de inicio del rango es obligatoria.' })
  @IsDateString({}, { message: 'La fecha de inicio debe ser una fecha válida.' })
  fecha_desde: string; // Formato YYYY-MM-DD

  @IsNotEmpty({ message: 'La fecha de fin del rango es obligatoria.' })
  @IsDateString({}, { message: 'La fecha de fin debe ser una fecha válida.' })
  fecha_hasta: string; // Formato YYYY-MM-DD
}