// src/products/dto/query-product.dto.ts
import { IsNumber, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class FindAllProductsQueryDto {
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  limit?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  page?: number;

  @IsOptional()
  @IsString()
  nombre?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  id_marca?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  id_categoria?: number;
}