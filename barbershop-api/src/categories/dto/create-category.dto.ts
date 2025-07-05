// barbershop-api/src/categories/dto/create-category.dto.ts
import { IsString, IsNotEmpty, IsOptional, IsUrl, MaxLength } from 'class-validator';

export class CreateCategoryDto {
  /**
   * El nombre de la categoría.
   * @example "Cuidado de Barba"
   */
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  nombre: string;

  /**
   * La URL de la imagen representativa de la categoría.
   * @example "https://res.cloudinary.com/.../cuidado_barba.jpg"
   */
  @IsUrl({}, { message: 'La URL de la imagen no es válida.' })
  @IsOptional()
  url_imagen?: string;
}
