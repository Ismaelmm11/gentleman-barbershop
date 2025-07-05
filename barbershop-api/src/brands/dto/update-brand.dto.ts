// barbershop-api/src/brands/dto/update-brand.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateBrandDto } from './create-brand.dto';

/**
 * DTO para actualizar una marca existente.
 * Al usar PartialType, todos los campos del CreateBrandDto se vuelven opcionales.
 */
export class UpdateBrandDto extends PartialType(CreateBrandDto) {}
