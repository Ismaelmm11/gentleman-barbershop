// src/products/dto/update-product.dto.ts
import { IsArray, IsNumber, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { PartialType } from '@nestjs/mapped-types';
import { CreateProductDto } from './create-product.dto';
import { ProductMediaDto } from './product-media.dto';

// Creamos un DTO base solo con los campos del producto, sin los medios.
class ProductDataDto extends PartialType(CreateProductDto) {
  @IsOptional()
  @IsArray() // Sobrescribimos para que 'media' no esté aquí
  media?: never; // Nos aseguramos de que no se pueda pasar 'media' aquí
}

export class UpdateProductDto extends ProductDataDto {
  @IsOptional()
  @IsArray({ message: 'Los medios a añadir deben ser un array.' })
  @ValidateNested({ each: true })
  @Type(() => ProductMediaDto)
  media_a_anadir?: ProductMediaDto[];

  @IsOptional()
  @IsArray({ message: 'Los IDs a eliminar deben ser un array.' })
  @IsNumber({}, { each: true, message: 'Cada ID a eliminar debe ser un número.' })
  media_ids_a_eliminar?: number[];
}