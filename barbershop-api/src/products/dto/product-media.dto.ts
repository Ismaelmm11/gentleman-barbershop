// src/products/dto/product-media.dto.ts
import { IsBoolean, IsEnum, IsUrl } from 'class-validator';

export class ProductMediaDto {
  @IsUrl({}, { message: 'La URL proporcionada no es válida.' })
  url: string;

  @IsBoolean({ message: 'El campo es_principal debe ser un valor booleano.' })
  es_principal: boolean;

  @IsEnum(['IMAGEN', 'VIDEO'], {
    message: 'El tipo de medio debe ser IMAGEN o VIDEO.',
  })
  tipo: 'IMAGEN' | 'VIDEO';
}