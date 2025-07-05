// src/products/dto/create-product.dto.ts
import { IsArray, IsNotEmpty, IsNumber, IsPositive, IsString, ValidateNested, } from 'class-validator';
import { Type } from 'class-transformer';
import { ProductMediaDto } from './product-media.dto';

export class CreateProductDto {
    @IsString({ message: 'El nombre debe ser un texto.' })
    @IsNotEmpty({ message: 'El nombre no puede estar vacío.' })
    nombre: string;

    @IsString({ message: 'La descripción debe ser un texto.' })
    @IsNotEmpty({ message: 'La descripción no puede estar vacía.' })
    descripcion: string;

    @IsNumber({}, { message: 'El precio debe ser un número.' })
    @IsPositive({ message: 'El precio debe ser un número positivo.' })
    precio: number;

    @IsNumber({}, { message: 'El ID de la marca debe ser un número.' })
    id_marca: number;

    @IsNumber({}, { message: 'El ID de la categoría debe ser un número.' })
    id_categoria: number;

    @IsArray({ message: 'Los medios deben ser un array.' })
    @ValidateNested({ each: true })
    @Type(() => ProductMediaDto)
    media: ProductMediaDto[];
}