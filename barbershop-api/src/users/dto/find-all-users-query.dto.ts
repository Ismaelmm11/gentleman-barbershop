// barbershop-api/src/users/dto/find-all-users-query.dto.ts
import { IsOptional, IsString, IsNumber, Min, IsPositive } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * Define los parámetros de consulta (query params) opcionales
 * para el endpoint de obtener todos los usuarios.
 */
export class FindAllUsersQueryDto {
  /**
   * Filtra los usuarios cuyo nombre contenga este texto.
   */
  @IsOptional()
  @IsString()
  nombre?: string;

  /**
   * Define cuántos resultados devolver por página.
   * @default 10
   */
  @IsOptional()
  @Type(() => Number) // Transforma el parámetro de la URL (que es string) a número.
  @IsNumber()
  @IsPositive() // El límite debe ser un número positivo.
  limit?: number;

  /**
   * Define qué página de resultados devolver.
   * @default 1
   */
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1) // La página mínima es la 1.
  page?: number;
}
