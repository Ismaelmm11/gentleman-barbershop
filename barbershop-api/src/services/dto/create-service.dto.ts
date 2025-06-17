// barbershop-api/src/services/dto/create-service.dto.ts
import { IsString, IsNotEmpty, IsNumber, IsPositive, IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateServiceDto {
  /**
   * El nombre del servicio.
   * @example "Corte de Pelo Clásico"
   */
  @IsString()
  @IsNotEmpty()
  nombre: string;

  /**
   * Una descripción detallada de lo que incluye el servicio.
   */
  @IsString()
  @IsNotEmpty()
  descripcion: string;

  /**
   * La duración estimada del servicio en minutos.
   */
  @IsInt({ message: 'La duración debe ser un número entero de minutos.' })
  @IsPositive()
  @Type(() => Number)
  duracion_minutos: number;

  /**
   * El precio base del servicio.
   */
  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  precio_base: number;
}
