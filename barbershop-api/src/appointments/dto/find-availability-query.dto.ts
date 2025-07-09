import { IsDateString, IsNotEmpty, IsNumberString } from 'class-validator';

export class FindAvailabilityQueryDto {
  @IsNotEmpty({ message: 'El id_barbero es obligatorio.' })
  @IsNumberString({}, { message: 'El id_barbero debe ser un número.' })
  id_barbero: string;

  @IsNotEmpty({ message: 'El id_servicio es obligatorio.' })
  @IsNumberString({}, { message: 'El id_servicio debe ser un número.' })
  id_servicio: string;

  @IsNotEmpty({ message: 'La fecha es obligatoria.' })
  @IsDateString({}, { message: 'La fecha debe ser válida con formato YYYY-MM-DD.' })
  fecha: string; 
}