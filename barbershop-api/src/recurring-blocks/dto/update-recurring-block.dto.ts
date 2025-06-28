// barbershop-api/src/recurring-blocks/dto/update-recurring-block.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateRecurringBlockDto } from './create-recurring-block.dto';
/**
 * Este DTO se utiliza para actualizar un bloqueo recurrente existente.
 *
 * Utiliza `PartialType`, una utilidad mágica de NestJS que toma todas
 * las reglas de validación de `CreateRecurringBlockDto` y las hace
 * opcionales. Esto es perfecto para una operación de tipo PATCH, donde
 * el cliente puede enviar solo los campos que desea cambiar (por ejemplo,
 * solo la `hora_fin` o solo el `titulo`).
 */
export class UpdateRecurringBlockDto extends PartialType(CreateRecurringBlockDto) {}
