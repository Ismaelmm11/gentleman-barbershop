// barbershop-api/src/categories/dto/update-category.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateCategoryDto } from './create-category.dto';

/**
 * DTO para actualizar una categoría existente.
 */
export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {}
