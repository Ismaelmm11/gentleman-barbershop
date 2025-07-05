// barbershop-api/src/brands/dto/create-brand.dto.ts
import { IsString, IsNotEmpty, IsOptional, IsUrl, MaxLength } from 'class-validator';

export class CreateBrandDto {
  /**
   * El nombre de la marca.
   * @example "Proraso"
   */
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  nombre: string;

  /**
   * La URL de la imagen representativa de la marca.
   * Debe ser una URL válida.
   * @example "https://res.cloudinary.com/.../proraso_logo.jpg"
   */
  @IsUrl({}, { message: 'La URL de la imagen no es válida.' })
  @IsOptional()
  url_imagen?: string;
}
