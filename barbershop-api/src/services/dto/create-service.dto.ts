// barbershop-api/src/services/dto/create-service.dto.ts
import { IsString, IsNotEmpty, IsNumber, IsPositive, IsInt } from 'class-validator';
import { Type } from 'class-transformer';
import { IsMultipleOf } from '../../common/decorators/is-multiple-of.decorator';

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
  @IsMultipleOf(5) 
  duracion_minutos: number;

  /**
   * El precio base del servicio.
   */
  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  precio_base: number;
}
